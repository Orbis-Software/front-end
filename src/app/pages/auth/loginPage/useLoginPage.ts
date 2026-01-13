import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/app/stores/auth'

function isValidEmail(value: string): boolean {
  // Simple but solid email check for UI step gating
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function useLoginPage() {
  const email = ref('')
  const password = ref('')
  const loading = ref(false)

  const step = ref<1 | 2>(1)

  const emailError = ref<string>('')
  const passwordError = ref<string>('')

  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  async function nextFromEmail() {
    emailError.value = ''

    const value = email.value.trim().toLowerCase()
    email.value = value

    if (!value) {
      emailError.value = 'Email is required.'
      return
    }

    if (!isValidEmail(value)) {
      emailError.value = 'Please enter a valid email address.'
      return
    }

    step.value = 2

    // Optional: focus password after step change (works if you add ref later)
    await nextTick()
  }

  function backToEmail() {
    password.value = ''
    passwordError.value = ''
    step.value = 1
  }

  async function submit() {
    // Step guard
    if (step.value !== 2) {
      await nextFromEmail()
      return
    }

    passwordError.value = ''

    if (!password.value) {
      passwordError.value = 'Password is required.'
      return
    }

    loading.value = true

    try {
      await authStore.login(email.value, password.value)
      router.push('/')
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error?.response?.data?.message ?? 'Invalid email or password',
        life: 4000,
      })
    } finally {
      loading.value = false
    }
  }

  return {
    email,
    password,
    loading,
    step,
    emailError,
    passwordError,
    nextFromEmail,
    backToEmail,
    submit,
  }
}
