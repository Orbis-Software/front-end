import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useCompanyStore } from '@/app/stores/company'
import { useAuthStore } from '@/app/stores/auth'
import type { CompanyStatus } from '@/app/types/company'

export function useSettingsPage() {
  const store = useCompanyStore()
  const auth = useAuthStore()

  const company = computed(() => store.item)
  const loading = computed(() => store.loading)
  const saving = computed(() => store.saving)

  const statusOptions: Array<{ label: string; value: CompanyStatus }> = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]

  const form = reactive({
    legal_name: '',
    trading_name: null as string | null,
    registration_number: null as string | null,
    registered_address: null as string | null,
    operational_address: null as string | null,
    default_currency: 'USD',
    language: 'en',
    time_zone: 'UTC',
    status: 'active' as CompanyStatus,
  })

  const logoFile = ref<File | null>(null)
  const logoPreview = ref<string | null>(null)

  function hydrateFromCompany() {
    if (!company.value) return

    form.legal_name = company.value.legal_name ?? ''
    form.trading_name = company.value.trading_name ?? null
    form.registration_number = company.value.registration_number ?? null
    form.registered_address = company.value.registered_address ?? null
    form.operational_address = company.value.operational_address ?? null
    form.default_currency = company.value.default_currency ?? 'USD'
    form.language = company.value.language ?? 'en'
    form.time_zone = company.value.time_zone ?? 'UTC'
    form.status = company.value.status ?? 'active'

    // Prefer backend logo_url when available
    logoPreview.value =
      (company.value as any).logo_url ?? company.value.logo ?? null

    // reset local file selection after successful hydration
    logoFile.value = null
  }

  async function onRefresh() {
    await store.fetch()
    hydrateFromCompany()
  }

  /**
   * PrimeVue FileUpload emits: { files: File[] }
   */
  function onLogoSelect(event: any) {
    const file: File | undefined = event?.files?.[0]
    if (!file) return

    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }

    async function onSave() {
    const payload = new FormData()

    // 👇 THIS IS THE KEY LINE
    payload.append('_method', 'PATCH')

    payload.append('legal_name', form.legal_name)
    payload.append('default_currency', form.default_currency)
    payload.append('language', form.language)
    payload.append('time_zone', form.time_zone)
    payload.append('status', form.status)

    if (form.trading_name !== null) payload.append('trading_name', form.trading_name)
    if (form.registration_number !== null) payload.append('registration_number', form.registration_number)
    if (form.registered_address !== null) payload.append('registered_address', form.registered_address)
    if (form.operational_address !== null) payload.append('operational_address', form.operational_address)

    if (logoFile.value) payload.append('logo', logoFile.value)

    const updated = await store.update(payload as any)

    if (auth.user) auth.user.company = updated
    hydrateFromCompany()
    }


  watch(company, hydrateFromCompany)

  onMounted(async () => {
    // instant hydrate from auth user.company
    store.hydrateFromAuth()
    hydrateFromCompany()

    // if still none, fetch from API
    if (!company.value) {
      await onRefresh()
    }
  })

  return {
    store,
    company,
    loading,
    saving,
    statusOptions,
    form,
    logoPreview,
    onLogoSelect,
    onRefresh,
    onSave,
  }
}
