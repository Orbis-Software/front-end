import { computed, ref } from 'vue'
import { useContactImportStore } from '@/app/stores/contactImport'
import { useAuthStore } from '@/app/stores/auth'

export function useContactsImportPage() {
  const auth = useAuthStore()
  const store = useContactImportStore()

  const file = ref<File | null>(null)

  const companyName = computed(() => {
    const c = auth.user?.company
    return c?.trading_name ?? c?.legal_name ?? 'Company'
  })

  const canImport = computed(() => {
    return !!file.value && !!auth.user?.company?.id && !store.importing
  })

  function onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    file.value = input.files?.[0] ?? null
    store.reset()
  }

  async function onImport() {
    if (!file.value) return
    await store.importCsv(file.value)
  }

  return {
    companyName,
    file,
    importing: computed(() => store.importing),
    result: computed(() => store.result),
    errorMessage: computed(() => store.errorMessage),
    canImport,
    onFileSelect,
    onImport,
  }
}
