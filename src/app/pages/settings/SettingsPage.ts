// src/app/pages/settings/SettingsPage.ts
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useCompanyStore } from '@/app/stores/company'
import { useAuthStore } from '@/app/stores/auth'
import type { Company, CompanyAddress, CompanyStatus } from '@/app/types/company'

type AddressType = 'registered' | 'operational'

function getAddress(company: Company, type: AddressType): CompanyAddress | null {
  return company.addresses?.find((a) => a.type === type) ?? null
}

function addressToText(a: Partial<CompanyAddress> | null): string {
  if (!a) return ''
  const parts = [
    a.building,
    a.address_line_1,
    a.address_line_2,
    a.address_line_3,
    a.address_line_4,
    a.city,
    a.state,
    a.postcode,
    a.country_code,
  ]
    .map((x) => (x ?? '').toString().trim())
    .filter(Boolean)

  return parts.join('\n')
}

/**
 * Simple line-based parser:
 * 0: building
 * 1: address_line_1
 * 2: address_line_2
 * 3: address_line_3
 * 4: address_line_4
 * 5: city
 * 6: state
 * 7: postcode
 * 8: country_code
 */
function textToAddress(text: string): Partial<CompanyAddress> {
  const lines = (text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length)

  return {
    building: lines[0] ?? null,
    address_line_1: lines[1] ?? null,
    address_line_2: lines[2] ?? null,
    address_line_3: lines[3] ?? null,
    address_line_4: lines[4] ?? null,
    city: lines[5] ?? null,
    state: lines[6] ?? null,
    postcode: lines[7] ?? null,
    country_code: lines[8] ?? null,
  }
}

export function useSettingsPage() {
  const store = useCompanyStore()
  const auth = useAuthStore()

  const company = computed(() => store.item as Company | null)
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

    registered_address: {
      building: null as string | null,
      address_line_1: null as string | null,
      address_line_2: null as string | null,
      address_line_3: null as string | null,
      address_line_4: null as string | null,
      city: null as string | null,
      state: null as string | null,
      postcode: null as string | null,
      country_code: null as string | null,
    },

    operational_address: {
      building: null as string | null,
      address_line_1: null as string | null,
      address_line_2: null as string | null,
      address_line_3: null as string | null,
      address_line_4: null as string | null,
      city: null as string | null,
      state: null as string | null,
      postcode: null as string | null,
      country_code: null as string | null,
    },

    default_currency_code: 'USD',
    language: 'en',
    time_zone: 'UTC',
    status: 'active' as CompanyStatus,
  })

  // ✅ PrimeVue Textarea expects string, so use string proxies
  const registeredAddressText = computed<string>({
    get: () => addressToText(form.registered_address),
    set: (v) => Object.assign(form.registered_address, textToAddress(v)),
  })

  const operationalAddressText = computed<string>({
    get: () => addressToText(form.operational_address),
    set: (v) => Object.assign(form.operational_address, textToAddress(v)),
  })

  const logoFile = ref<File | null>(null)
  const logoPreview = ref<string | null>(null)

  function hydrateFromCompany() {
    if (!company.value) return

    form.legal_name = company.value.legal_name ?? ''
    form.trading_name = company.value.trading_name ?? null
    form.registration_number = company.value.registration_number ?? null

    const reg = getAddress(company.value, 'registered')
    form.registered_address.building = reg?.building ?? null
    form.registered_address.address_line_1 = reg?.address_line_1 ?? null
    form.registered_address.address_line_2 = reg?.address_line_2 ?? null
    form.registered_address.address_line_3 = reg?.address_line_3 ?? null
    form.registered_address.address_line_4 = reg?.address_line_4 ?? null
    form.registered_address.city = reg?.city ?? null
    form.registered_address.state = reg?.state ?? null
    form.registered_address.postcode = reg?.postcode ?? null
    form.registered_address.country_code = reg?.country_code ?? null

    const op = getAddress(company.value, 'operational')
    form.operational_address.building = op?.building ?? null
    form.operational_address.address_line_1 = op?.address_line_1 ?? null
    form.operational_address.address_line_2 = op?.address_line_2 ?? null
    form.operational_address.address_line_3 = op?.address_line_3 ?? null
    form.operational_address.address_line_4 = op?.address_line_4 ?? null
    form.operational_address.city = op?.city ?? null
    form.operational_address.state = op?.state ?? null
    form.operational_address.postcode = op?.postcode ?? null
    form.operational_address.country_code = op?.country_code ?? null

    form.default_currency_code = company.value.default_currency_code ?? 'USD'
    form.language = company.value.language ?? 'en'
    form.time_zone = company.value.time_zone ?? 'UTC'
    form.status = company.value.status ?? 'active'

    logoPreview.value = company.value.logo_url ?? null
    logoFile.value = null
  }

  async function onRefresh() {
    await store.fetch()
    hydrateFromCompany()
  }

  function onLogoSelect(event: any) {
    const file: File | undefined = event?.files?.[0]
    if (!file) return

    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  }

  async function onSave() {
    const payload = new FormData()
    payload.append('_method', 'PATCH')

    payload.append('legal_name', form.legal_name)
    payload.append('default_currency_code', form.default_currency_code)
    payload.append('language', form.language)
    payload.append('time_zone', form.time_zone)
    payload.append('status', form.status)

    if (form.trading_name !== null) payload.append('trading_name', form.trading_name)
    if (form.registration_number !== null) payload.append('registration_number', form.registration_number)

    const addresses: Array<Partial<CompanyAddress>> = [
      { type: 'registered', ...form.registered_address },
      { type: 'operational', ...form.operational_address },
    ]
    payload.append('addresses', JSON.stringify(addresses))

    if (logoFile.value) payload.append('logo', logoFile.value)

    const updated = await store.update(payload as any)

    if (auth.user) auth.user.company = updated
    hydrateFromCompany()
  }

  watch(company, hydrateFromCompany)

  onMounted(async () => {
    store.hydrateFromAuth()
    hydrateFromCompany()

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
    registeredAddressText,
    operationalAddressText,
    logoPreview,
    onLogoSelect,
    onRefresh,
    onSave,
  }
}
