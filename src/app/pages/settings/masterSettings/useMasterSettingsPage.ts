import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useCompanyStore } from "@/app/stores/company"
import type {
  Company,
  CompanyAddress,
  CompanyReferenceType,
  CompanyUpdatePayload,
} from "@/app/types/company"
import { useToast } from "primevue/usetoast"

type RefForm = {
  type: CompanyReferenceType
  title: string
  prefix: string
  year_digits: number | null

  start_number: string
  min_width: number
  use_system: boolean
}

const refCatalog: Array<{ type: CompanyReferenceType; title: string; defaultPrefix: string }> = [
  { type: "job", title: "Job Number", defaultPrefix: "JOB" },
  { type: "invoice", title: "Invoice Number", defaultPrefix: "INV" },
  { type: "quote", title: "Quote Number", defaultPrefix: "QUO" },
  { type: "purchase_order", title: "Purchase Order", defaultPrefix: "PO" },
  { type: "collection_order", title: "Collection Order", defaultPrefix: "COL" },
  { type: "transport_order", title: "Transport Order", defaultPrefix: "TRN" },
  { type: "booking_reference", title: "Booking Reference", defaultPrefix: "BR" },
  { type: "account", title: "Account Numbers", defaultPrefix: "ACC" },
]

export function useMasterSettingsPage() {
  const router = useRouter()
  const companyStore = useCompanyStore()

  const company = computed(() => companyStore.item)
  const loading = computed(() => companyStore.loading)
  const saving = computed(() => companyStore.saving)

  const timeZones = ["Europe/London", "Europe/Paris", "Asia/Manila", "Asia/Singapore", "UTC"]
  const currencies = ["GBP", "EUR", "USD", "AUD", "CAD"]

  const addCurrencyInput = ref("")
  const toast = useToast()

  const form = reactive({
    legal_name: "",
    trading_name: "",
    registration_number: "",
    vat_number: "",
    eori_number: "",
    iata_code: "",

    trading_building: "",
    trading_address_line_1: "",
    trading_address_line_2: "",
    trading_address_line_3: "",
    trading_city: "",
    trading_state: "",
    trading_postcode: "",
    trading_country_code: "GB",

    contact_name: "",
    contact_email: "",
    contact_mobile: "",
    contact_telephones: [] as string[],
    new_phone: "",

    settings_time_zone: "",
    settings_main_currency_code: "",
    settings_start_period: "",
    settings_invoicing_period: "monthly" as "monthly" | "weekly" | "quarterly" | "annually",

    additional_currencies: [] as string[],

    refs: [] as RefForm[],
  })

  function digitsMax9(v: string) {
    return (v ?? "").replace(/\D/g, "").slice(0, 9)
  }

  function year2(v: number | null) {
    if (v === null || v === undefined) return ""
    return String(v).padStart(2, "0").slice(-2)
  }

  function padLeft(v: string, width: number) {
    const s = v ?? ""
    if (s.length >= width) return s
    return "0".repeat(width - s.length) + s
  }

  function getAddress(c: Company, type: "trading" | "registered" | "operational") {
    return c.addresses?.find((a) => a.type === type) ?? null
  }

  function hydrateFromCompany(c: Company) {
    form.legal_name = c.legal_name ?? ""
    form.trading_name = c.trading_name ?? ""
    form.registration_number = c.registration_number ?? ""
    form.vat_number = c.vat_number ?? ""
    form.eori_number = c.eori_number ?? ""
    form.iata_code = c.iata_code ?? ""

    const trading = getAddress(c, "trading")
    form.trading_building = trading?.building ?? ""
    form.trading_address_line_1 = trading?.address_line_1 ?? ""
    form.trading_address_line_2 = trading?.address_line_2 ?? ""
    form.trading_address_line_3 = trading?.address_line_3 ?? ""
    form.trading_city = trading?.city ?? ""
    form.trading_state = trading?.state ?? ""
    form.trading_postcode = trading?.postcode ?? ""
    form.trading_country_code = trading?.country_code ?? "GB"

    form.contact_name = c.primary_contact?.name ?? ""
    form.contact_email = c.primary_contact?.email ?? ""
    form.contact_mobile = c.primary_contact?.mobile ?? ""
    form.contact_telephones = Array.isArray(c.primary_contact?.telephones)
      ? [...c.primary_contact!.telephones]
      : []

    form.settings_time_zone = c.settings?.time_zone ?? c.time_zone ?? ""
    form.settings_main_currency_code = c.settings?.main_currency_code ?? c.default_currency_code ?? ""
    form.settings_start_period = c.settings?.start_period ?? ""
    form.settings_invoicing_period = (c.settings?.invoicing_period ?? "monthly") as any

    form.additional_currencies = Array.isArray(c.additional_currencies) ? [...c.additional_currencies] : []

    const byType = new Map<string, any>()
    for (const r of c.reference_sequences ?? []) byType.set(r.type, r)

    form.refs = refCatalog.map((cfg) => {
      const seq = byType.get(cfg.type)

      const yearDigits = seq?.year_digits ?? Number(new Date().getFullYear().toString().slice(-2))

      const startRaw = digitsMax9(seq?.next_number_formatted ?? "000000001")
      const width = Math.max(1, Number(seq?.min_width ?? startRaw.length ?? 1))
      const startDisplay = padLeft(startRaw || "1", width)

      return {
        type: cfg.type,
        title: cfg.title,
        prefix: seq?.prefix ?? cfg.defaultPrefix,
        year_digits: yearDigits,
        start_number: startDisplay,
        min_width: width,
        use_system: Boolean(seq?.use_system ?? true),
      }
    })
  }

  const globalUseSystem = computed({
    get() {
      if (!form.refs.length) return true
      return form.refs.every((r) => r.use_system)
    },
    set(v: boolean) {
      for (const r of form.refs) r.use_system = v
    },
  })

  function sampleFor(r: RefForm) {
    const prefix = (r.prefix ?? "").trim()
    const raw = digitsMax9(r.start_number || "")
    const width = Math.max(1, Number(r.min_width ?? raw.length ?? 1))
    const num = padLeft(raw || "1", width)

    // ✅ account numbers: NO year, NO dash
    if (r.type === "account") {
      return `${prefix}${num}`
    }

    // ✅ others: prefix + YY + "-" + number
    const yy = year2(r.year_digits)
    return `${prefix}${yy}-${num}`
  }

  function onStartNumberInput(r: RefForm) {
    r.start_number = digitsMax9(r.start_number || "")
    r.min_width = Math.max(1, r.start_number.length || 1)
  }

  function copyToAll() {
    const src = form.refs.find((x) => x.type === "job") ?? form.refs[0]
    if (!src) return

    for (const r of form.refs) {
      if (r.type === src.type) continue

      // copy these
      r.prefix = src.prefix
      r.start_number = src.start_number
      r.min_width = src.min_width
      r.use_system = src.use_system

      // ✅ do NOT copy year (it’s display-only anyway, and account doesn't use it)
      // r.year_digits stays as-is
    }
  }

  function addPhone() {
    const v = form.new_phone.trim()
    if (!v) return
    form.contact_telephones.push(v)
    form.new_phone = ""
  }

  function removePhone(i: number) {
    form.contact_telephones.splice(i, 1)
  }

  function addCurrency() {
    const v = addCurrencyInput.value.trim().toUpperCase()
    if (!v) return
    if (v.length !== 3) return
    if (form.additional_currencies.includes(v)) return
    form.additional_currencies.push(v)
    addCurrencyInput.value = ""
  }

  function removeCurrency(code: string) {
    form.additional_currencies = form.additional_currencies.filter((c) => c !== code)
  }

  function buildPayload(): CompanyUpdatePayload {
    const addresses: Partial<CompanyAddress>[] = [
      {
        type: "trading",
        building: form.trading_building || null,
        address_line_1: form.trading_address_line_1 || null,
        address_line_2: form.trading_address_line_2 || null,
        address_line_3: form.trading_address_line_3 || null,
        address_line_4: null,
        city: form.trading_city || null,
        state: form.trading_state || null,
        postcode: form.trading_postcode || null,
        country_code: form.trading_country_code || null,
      },
    ]

    return {
      legal_name: form.legal_name || undefined,

      trading_name: form.trading_name || null,
      registration_number: form.registration_number || null,
      vat_number: form.vat_number || null,
      eori_number: form.eori_number || null,
      iata_code: form.iata_code || null,

      time_zone: form.settings_time_zone || null,

      addresses,

      primary_contact: {
        name: form.contact_name,
        email: form.contact_email,
        mobile: form.contact_mobile || null,
        telephones: [...form.contact_telephones],
      },

      settings: {
        time_zone: form.settings_time_zone,
        main_currency_code: form.settings_main_currency_code,
        start_period: form.settings_start_period || null,
        invoicing_period: form.settings_invoicing_period,
      },

      additional_currencies: [...form.additional_currencies],

      reference_sequences: form.refs.map((r) => ({
        type: r.type,
        prefix: r.prefix,
        year_digits: r.type === "account" ? null : (r.year_digits ?? null), // ✅ account has no year
        start_number: digitsMax9(r.start_number || "") || null,
        use_system: r.use_system,
      })),
    }
  }

  async function onRefresh() {
    const c = await companyStore.fetch()
    if (c) hydrateFromCompany(c)
  }

  async function onSave(_isFinal: boolean) {
    try {
      const payload = buildPayload()
      const updated = await companyStore.update(payload)
      hydrateFromCompany(updated)

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Master settings updated successfully.",
        life: 2500,
      })
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Save failed",
        detail: e?.response?.data?.message ?? "Something went wrong while saving.",
        life: 4000,
      })
      throw e
    }
  }

  onMounted(async () => {
    await onRefresh()
  })

  return {
    router,
    company,
    loading,
    saving,

    timeZones,
    currencies,

    addCurrencyInput,
    form,

    globalUseSystem,

    digitsMax9,
    year2,
    sampleFor,
    onStartNumberInput,
    copyToAll,

    addPhone,
    removePhone,
    addCurrency,
    removeCurrency,

    onRefresh,
    onSave,
  }
}
