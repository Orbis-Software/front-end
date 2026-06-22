import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAppLoaderStore } from "@/app/stores/app-loader"
import { useAuthStore } from "@/app/stores/auth"

export function useCustomerLoginPage() {
  const router = useRouter()
  const appLoader = useAppLoaderStore()
  const authStore = useAuthStore()

  const email = ref("")
  const password = ref("")

  const loading = ref(false)

  const emailError = ref("")
  const passwordError = ref("")

  function clearErrors() {
    emailError.value = ""
    passwordError.value = ""
  }

  function validate(): boolean {
    clearErrors()

    if (!email.value.trim()) {
      emailError.value = "Email is required."
    }

    if (!password.value.trim()) {
      passwordError.value = "Password is required."
    }

    return !emailError.value && !passwordError.value
  }

  async function submit() {
    if (!validate()) return

    loading.value = true
    clearErrors()

    try {
      await appLoader.withLoader(
        {
          title: "Signing you in",
          message: "Checking your customer portal access...",
          messages: [
            "Checking your customer portal access...",
            "Loading shipment and document access...",
            "Preparing your customer dashboard...",
            "Almost ready...",
          ],
          iconClass: "pi pi-sign-in",
          footer: "Securely signing in to Orbis Customer Portal",
        },
        async () => {
          await authStore.customerLogin(email.value, password.value)

          await router.push({
            name: "customer.dashboard",
          })
        },
      )
    } catch (error: any) {
      const errors = error?.response?.data?.errors

      if (errors?.email?.[0]) {
        emailError.value = errors.email[0]
      } else {
        emailError.value = "Invalid customer credentials."
      }
    } finally {
      loading.value = false
    }
  }

  return {
    email,
    password,
    loading,
    emailError,
    passwordError,
    submit,
  }
}
