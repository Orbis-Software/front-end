import { computed, ref, nextTick } from "vue"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useAppLoaderStore } from "@/app/stores/app-loader"
import { useAuthStore } from "@/app/stores/auth"
import AuthService from "@/app/services/auth"

function isValidEmail(value: string): boolean {
  // Simple but solid email check for UI step gating
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function useLoginPage() {
  const email = ref("")
  const password = ref("")
  const mfaCode = ref("")
  const mfaMethod = ref<"authenticator" | "email" | "recovery">("authenticator")
  const loading = ref(false)
  const resending = ref(false)

  const step = ref<1 | 2 | 3>(1)

  const emailError = ref<string>("")
  const passwordError = ref<string>("")
  const mfaError = ref<string>("")

  const authStore = useAuthStore()
  const appLoader = useAppLoaderStore()
  const router = useRouter()
  const toast = useToast()
  const mfaChallenge = computed(() => authStore.mfaChallenge)
  const mfaMethods = computed(() => mfaChallenge.value?.methods ?? [])
  const mfaEmailHint = computed(() => mfaChallenge.value?.email_hint ?? email.value)

  async function nextFromEmail() {
    emailError.value = ""

    const value = email.value.trim().toLowerCase()
    email.value = value

    if (!value) {
      emailError.value = "Email is required."
      return
    }

    if (!isValidEmail(value)) {
      emailError.value = "Please enter a valid email address."
      return
    }

    step.value = 2

    // Optional: focus password after step change (works if you add ref later)
    await nextTick()
  }

  function backToEmail() {
    password.value = ""
    passwordError.value = ""
    mfaCode.value = ""
    mfaError.value = ""
    authStore.mfaChallenge = null
    step.value = 1
  }

  function backToPassword() {
    mfaCode.value = ""
    mfaError.value = ""
    authStore.mfaChallenge = null
    step.value = 2
  }

  async function submit() {
    // Step guard
    if (step.value !== 2) {
      await nextFromEmail()
      return
    }

    passwordError.value = ""

    if (!password.value) {
      passwordError.value = "Password is required."
      return
    }

    loading.value = true

    try {
      const result = await appLoader.withLoader(
        {
          title: "Signing you in",
          message: "Checking your account details...",
          messages: [
            "Checking your account details...",
            "Validating your secure session...",
            "Loading your company workspace...",
            "Almost ready...",
          ],
          iconClass: "pi pi-sign-in",
          footer: "Securely signing in to Orbis",
        },
        async () => {
          const result = await authStore.login(email.value, password.value)

          if (!("mfa_required" in result && result.mfa_required)) {
            await router.push("/")
          }

          return result
        },
      )

      if ("mfa_required" in result && result.mfa_required) {
        mfaMethod.value = result.methods.includes("authenticator")
          ? "authenticator"
          : (result.methods[0] ?? "email")
        mfaCode.value = ""
        step.value = 3
        return
      }
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Login Failed",
        detail: error?.response?.data?.message ?? "Invalid email or password",
        life: 4000,
      })
    } finally {
      loading.value = false
    }
  }

  async function verifyMfa() {
    mfaError.value = ""

    if (!mfaCode.value.trim()) {
      mfaError.value = "Security code is required."
      return
    }

    loading.value = true

    try {
      await appLoader.withLoader(
        {
          title: "Verifying security code",
          message: "Confirming your multi-factor code...",
          messages: [
            "Confirming your multi-factor code...",
            "Finalising your secure session...",
            "Opening your workspace...",
            "Almost ready...",
          ],
          iconClass: "pi pi-shield",
          footer: "Securely signing in to Orbis",
        },
        async () => {
          await authStore.verifyMfaLogin(mfaMethod.value, mfaCode.value)
          await router.push("/")
        },
      )
    } catch (error: any) {
      mfaError.value = error?.response?.data?.message ?? "Invalid security code."
      toast.add({
        severity: "error",
        summary: "MFA Failed",
        detail: mfaError.value,
        life: 4000,
      })
    } finally {
      loading.value = false
    }
  }

  async function resendEmailCode() {
    if (!mfaChallenge.value) return

    resending.value = true

    try {
      await AuthService.resendMfaEmail(mfaChallenge.value.challenge_id)
      toast.add({
        severity: "success",
        summary: "Code Sent",
        detail: `A new code was sent to ${mfaEmailHint.value}.`,
        life: 3000,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Code Not Sent",
        detail: error?.response?.data?.message ?? "Unable to send another code.",
        life: 4000,
      })
    } finally {
      resending.value = false
    }
  }

  return {
    email,
    password,
    mfaCode,
    mfaMethod,
    mfaMethods,
    mfaEmailHint,
    loading,
    resending,
    step,
    emailError,
    passwordError,
    mfaError,
    nextFromEmail,
    backToEmail,
    backToPassword,
    submit,
    verifyMfa,
    resendEmailCode,
  }
}
