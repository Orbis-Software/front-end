import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import http from "@/api/http"
import { useCompanyStore } from "@/app/stores/company"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type { CompanyReferenceSequence } from "@/app/types/company"
import type { GlobalReferenceDataRow } from "@/app/types/globalReferenceData"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportQuote, TransportQuotePayload } from "@/app/types/transportQuote"
import { getPackageStackOption, setPackageStackOption } from "@/app/utils/packageStacking"
import { buildReferenceNumber } from "@/app/utils/reference-sequence"
import { useToast } from "primevue/usetoast"

type QuoteType = "import" | "export" | "domestic" | "cross_trade" | "multi_modal"
type TransportMode = "air" | "road" | "rail" | "sea"

type SelectOption<T = string> = {
  label: string
  value: T
  icon?: string
  subLabel?: string
  searchText?: string
}

type CustomerContact = {
  name: string
  email: string
  phone: string
}

type CustomerOption = {
  id: number
  name: string
  account_number: string
  contacts: CustomerContact[]
}

type DimensionRow = {
  id: number
  package_type: string
  pieces: number
  length: number
  width: number
  height: number
  stackable: boolean
  atTheTop: boolean
  weight: number
  adr: boolean
  container_type: string
}

type ChargeLine = {
  id: number
  type: "buy" | "sell"
  description: string
  qty: number
  uom: string
  unit_cost?: number
  unit_price?: number
  currency: string
  exchange_rate: number
  vat_rate?: number
}

const CONDITIONS: Record<string, string> = {
  standard:
    "1. All rates quoted are subject to space and equipment availability.\n2. Rates are valid for the period stated and subject to change without notice thereafter.\n3. All charges are exclusive of applicable taxes unless otherwise stated.\n4. Claims for loss or damage must be submitted within 14 days of delivery.",
  air: "1. Air freight rates are based on chargeable weight.\n2. Rates do not include customs duties, taxes or government levies.\n3. Transit times are estimated and not guaranteed.\n4. Fuel and security surcharges are subject to change.",
  sea: "1. Ocean freight rates are subject to space and equipment availability.\n2. Port congestion surcharges may apply and will be charged at cost.\n3. Transit times are approximate and not guaranteed.\n4. Demurrage and detention charges will be charged as per carrier tariff.",
  hazardous:
    "1. All hazardous goods must be declared at time of booking with full MSDS documentation.\n2. DG surcharges apply and are in addition to standard freight rates.\n3. Proper shipping name, UN Number and Packing Group must be provided.",
}

export function useQuoteCreatePage() {
  const route = useRoute()
  const router = useRouter()
  const quoteStore = useTransportQuoteStore()
  const companyStore = useCompanyStore()
  const globalReferenceDataStore = useGlobalReferenceDataStore()
  const referenceDataStore = useReferenceDataStore()
  const { data: globalReferenceData } = storeToRefs(globalReferenceDataStore)
  const toast = useToast()

  const loadingCustomers = ref(false)
  const customerSuggestions = ref<CustomerOption[]>([])
  const selectedCustomer = ref<CustomerOption | null>(null)
  const selectedContactIndex = ref<number | null>(null)
  const localError = ref<string | null>(null)

  const quoteId = computed(() => {
    const id = route.params.id
    if (!id) return null

    const parsed = Number(id)
    return Number.isFinite(parsed) ? parsed : null
  })

  const isEditMode = computed(() => Boolean(quoteId.value))
  const saving = computed(() => quoteStore.saving || quoteStore.loading)
  const error = computed(() => localError.value || quoteStore.error)

  const pageTitle = computed(() =>
    isEditMode.value ? "Edit Freight Quotation" : "New Freight Quotation",
  )
  const pageStatusLabel = computed(() => quoteStore.selectedQuote?.status ?? "Draft")
  const saveButtonLabel = computed(() => (isEditMode.value ? "Update Quote" : "Submit Quote"))

  const QUOTE_TYPES = [
    { key: "import", title: "Import", subtitle: "Inbound shipment", icon: "pi pi-download" },
    { key: "export", title: "Export", subtitle: "Outbound shipment", icon: "pi pi-upload" },
    { key: "domestic", title: "Domestic", subtitle: "Local movement", icon: "pi pi-home" },
    {
      key: "cross_trade",
      title: "Cross Trade",
      subtitle: "Third-country shipment",
      icon: "pi pi-sync",
    },
    {
      key: "multi_modal",
      title: "Multi Modal",
      subtitle: "Multiple transport modes",
      icon: "pi pi-share-alt",
    },
  ]

  const MODE_OPTIONS = [
    {
      key: "air",
      title: "Air Freight",
      subtitle: "Fast international movement",
      icon: "pi pi-send",
    },
    {
      key: "road",
      title: "Road Freight",
      subtitle: "Domestic or cross-border trucking",
      icon: "pi pi-truck",
    },
    {
      key: "rail",
      title: "Rail Freight",
      subtitle: "Rail-based cargo movement",
      icon: "pi pi-minus",
    },
    { key: "sea", title: "Sea Freight", subtitle: "Ocean freight movement", icon: "pi pi-globe" },
  ]

  const quoteType = ref<QuoteType | null>(null)
  const mode = ref<TransportMode | null>(null)

  const form = reactive({
    quote_ref: "",
    customer_id: null as number | null,
    customer_ref: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    quote_date: new Date() as Date | null,
    follow_up_date: null as Date | null,
    valid_until: null as Date | null,
    currency: "GBP",
    incoterm: "DAP",
    origin: "",
    destination: "",
    etd: null as Date | null,
    eta: null as Date | null,
    commodity: "",
    vehicle_type: "",
    cargo_class: "",
    container_type: "",
    load_type: "",
    goods_description: "",
    is_hazardous: false,
    hazardous_class: "",
    un_number: "",
    packing_group: "",
    conditions_preset: "",
    terms_conditions: "",
    validity_period: "30",
    note: "",
    discount: 0,
    tax_rate: 20,
  })

  const dimensionRows = ref<DimensionRow[]>([])
  const buyCostLines = ref<ChargeLine[]>([])
  const sellChargeLines = ref<ChargeLine[]>([])

  const availableModes = computed(() => MODE_OPTIONS)
  const showModeSelector = computed(() => Boolean(quoteType.value))
  const canShowForm = computed(() => Boolean(quoteType.value && mode.value))

  const quoteTypeLabel = computed(
    () => QUOTE_TYPES.find(item => item.key === quoteType.value)?.title ?? "",
  )
  const modeLabel = computed(() => MODE_OPTIONS.find(item => item.key === mode.value)?.title ?? "")

  const formTitle = computed(() => {
    const prefix = isEditMode.value ? "Edit" : "New"
    const type = quoteTypeLabel.value || "Freight"

    return `${prefix} ${type} Quote`
  })

  const accountNumberPreview = computed(() => selectedCustomer.value?.account_number ?? "")

  const quoteSequence = computed<CompanyReferenceSequence | null>(() => {
    const seqs = companyStore.item?.reference_sequences ?? []
    if (!Array.isArray(seqs) || seqs.length === 0) return null

    return seqs.find(sequence => sequence.type === "quote") ?? null
  })

  const originLocationOptions = computed<SelectOption[]>(() => getLocationOptions())
  const destinationLocationOptions = computed<SelectOption[]>(() => getLocationOptions())

  const contactOptions = computed<SelectOption<number>[]>(() => {
    if (!selectedCustomer.value) return []

    return selectedCustomer.value.contacts.map((contact, index) => ({
      label: contact.name || selectedCustomer.value?.name || `Contact ${index + 1}`,
      value: index,
    }))
  })

  const currencyOptions: SelectOption[] = [
    { label: "GBP – British Pound", value: "GBP" },
    { label: "USD – US Dollar", value: "USD" },
    { label: "EUR – Euro", value: "EUR" },
    { label: "AED – UAE Dirham", value: "AED" },
    { label: "AUD – Australian Dollar", value: "AUD" },
    { label: "SGD – Singapore Dollar", value: "SGD" },
  ]

  const incotermOptions: SelectOption[] = [
    "EXW",
    "FCA",
    "FAS",
    "FOB",
    "CFR",
    "CIF",
    "CPT",
    "CIP",
    "DAP",
    "DPU",
    "DDP",
  ].map(item => ({
    label: item,
    value: item,
  }))

  const containerOptions: SelectOption[] = [
    { label: "20' GP", value: "20GP" },
    { label: "40' GP", value: "40GP" },
    { label: "40' HC", value: "40HC" },
    { label: "20' RF", value: "20RF" },
    { label: "40' RF", value: "40RF" },
  ]

  const uomOptions: SelectOption[] = [
    { label: "Per Shipment", value: "Per Shipment" },
    { label: "Per KG", value: "Per KG" },
    { label: "Per CBM", value: "Per CBM" },
    { label: "Per Unit", value: "Per Unit" },
    { label: "Per Day", value: "Per Day" },
    { label: "Per Container", value: "Per Container" },
    { label: "Flat Rate", value: "Flat Rate" },
  ]

  const chargeDescriptionOptions: SelectOption[] = [
    "Origin Handling Charge",
    "Freight Charge",
    "Destination Handling Charge",
    "Fuel Surcharge",
    "Security Surcharge",
    "Customs Clearance",
    "Documentation Fee",
    "Delivery / Cartage",
    "Insurance Premium",
  ].map(item => ({ label: item, value: item }))

  const hazardousClassOptions: SelectOption[] = [
    "Class 1 – Explosives",
    "Class 2 – Gases",
    "Class 3 – Flammable Liquids",
    "Class 4 – Flammable Solids",
    "Class 5 – Oxidising Substances",
    "Class 6 – Toxic Substances",
    "Class 7 – Radioactive Material",
    "Class 8 – Corrosives",
    "Class 9 – Miscellaneous Dangerous Goods",
  ].map(item => ({ label: item, value: item }))

  const packingGroupOptions: SelectOption[] = [
    { label: "PG I", value: "PG I" },
    { label: "PG II", value: "PG II" },
    { label: "PG III", value: "PG III" },
  ]

  const conditionsOptions: SelectOption[] = [
    { label: "Standard Freight Terms", value: "standard" },
    { label: "Air Freight Conditions", value: "air" },
    { label: "Sea Freight Conditions", value: "sea" },
    { label: "Hazardous Goods Terms", value: "hazardous" },
  ]

  const validityOptions: SelectOption[] = [
    { label: "Valid for 7 days", value: "7" },
    { label: "Valid for 14 days", value: "14" },
    { label: "Valid for 30 days", value: "30" },
    { label: "Valid for 60 days", value: "60" },
  ]

  const taxRateOptions: SelectOption<number>[] = [
    { label: "0% – Zero Rate", value: 0 },
    { label: "5% – Reduced", value: 5 },
    { label: "20% – Standard", value: 20 },
  ]

  const packageTypeOptions = computed<SelectOption[]>(() => {
    const category =
      referenceDataStore.getByKey("package_types") ?? referenceDataStore.getByKey("packaging_types")

    const options = (category?.options ?? [])
      .map((option: any) => cleanReferenceName(option.name))
      .filter(Boolean)
      .map(name => ({ label: name, value: name }))

    if (options.length) return options

    return ["Pallet", "Carton", "Crate", "Bundle", "Box", "Piece"].map(name => ({
      label: name,
      value: name,
    }))
  })

  function getLocationOptions(): SelectOption[] {
    if (mode.value === "air") return terminalOptions(row => row.type === "Airport")
    if (mode.value === "sea") return terminalOptions(row => row.type === "Seaport")
    if (mode.value === "rail") return terminalOptions(row => row.type === "Rail Freight")
    if (mode.value === "road") {
      return [...terminalOptions(row => row.type === "Road Freight"), ...cityOptions()]
    }

    return [...terminalOptions(() => true), ...cityOptions()]
  }

  function terminalOptions(filter: (row: GlobalReferenceDataRow) => boolean): SelectOption[] {
    return globalReferenceData.value.terminals
      .filter(filter)
      .map(row => {
        const terminalName = firstValue(row, [
          "terminalName",
          "terminal_name",
          "airportName",
          "airport_name",
          "portName",
          "port_name",
          "name",
        ])
        const code = firstValue(row, ["code", "iata", "iataCode", "iata_code", "unlocode"])
        const city = firstValue(row, ["city", "location", "municipality"])
        const country = firstValue(row, ["country", "countryName", "country_name"])
        const value = terminalName || city || code
        const label = labelWithCode(terminalName || city, code)
        const subLabel = [city, country, code].filter(Boolean).join(" | ")

        return {
          label,
          value,
          subLabel,
          searchText: searchText(row, [label, value, subLabel]),
        }
      })
      .filter(option => option.value)
  }

  function cityOptions(): SelectOption[] {
    return globalReferenceData.value.cities
      .map(row => {
        const city = firstValue(row, ["fullName", "full_name", "city", "location", "name"])
        const code = firstValue(row, ["code", "iata", "iataCode", "iata_code", "unlocode"])
        const country = firstValue(row, ["country", "countryName", "country_name"])
        const value = city || code
        const label = labelWithCode(city, code)
        const subLabel = [country, code].filter(Boolean).join(" | ")

        return {
          label,
          value,
          subLabel,
          searchText: searchText(row, [label, value, subLabel]),
        }
      })
      .filter(option => option.value)
  }

  function firstValue(row: GlobalReferenceDataRow, keys: string[]): string {
    for (const key of keys) {
      const value = row[key]?.trim()

      if (value) return value
    }

    return ""
  }

  function cleanReferenceName(value: string): string {
    return String(value ?? "")
      .replace(/\*$/, "")
      .trim()
  }

  function labelWithCode(name: string, code: string): string {
    if (!name) return code
    if (!code || name.toLowerCase().includes(code.toLowerCase())) return name

    return `${code} - ${name}`
  }

  function searchText(row: GlobalReferenceDataRow, values: string[]): string {
    return [...values, ...Object.values(row)].filter(Boolean).join(" ")
  }

  const totalPieces = computed(() =>
    dimensionRows.value.reduce((total, row) => total + Number(row.pieces || 0), 0),
  )
  const totalActualWeight = computed(() =>
    dimensionRows.value.reduce((total, row) => total + Number(row.weight || 0), 0),
  )
  const totalVolumetricWeight = computed(() =>
    dimensionRows.value.reduce((total, row) => total + getRowVolumetricWeight(row), 0),
  )
  const chargeableWeight = computed(() =>
    mode.value === "air"
      ? Math.max(totalActualWeight.value, totalVolumetricWeight.value)
      : totalActualWeight.value,
  )
  const totalCbm = computed(() =>
    dimensionRows.value.reduce((total, row) => total + getRowCbm(row), 0),
  )
  const totalLdm = computed(() =>
    dimensionRows.value.reduce((total, row) => total + getRowLdm(row), 0),
  )
  const revenueTonne = computed(() => Math.max(totalActualWeight.value / 1000, totalCbm.value))
  const loadPlannerPackages = computed(() =>
    dimensionRows.value.map((row, index) => ({
      id: row.id,
      type:
        row.package_type || (mode.value === "road" ? "Pallet" : row.container_type || "Package"),
      desc: `${row.package_type || "Package"} ${index + 1}`,
      length: row.length,
      width: row.width,
      height: row.height,
      qty: row.pieces,
      weight: row.weight,
      stackable: getPackageStackOption(row) === "stackable",
      adr: Boolean(row.adr || form.is_hazardous),
    })),
  )
  const loadPlannerReference = computed(() => form.quote_ref || "Quote Load Plan")

  const subtotalSell = computed(() =>
    sellChargeLines.value.reduce((total, line) => total + getChargeLineTotal(line), 0),
  )
  const subtotalCost = computed(() =>
    buyCostLines.value.reduce((total, line) => total + getChargeLineTotal(line), 0),
  )
  const totalExclTax = computed(() => Math.max(subtotalSell.value, 0))
  const taxAmount = computed(() => totalExclTax.value * (Number(form.tax_rate || 0) / 100))
  const totalInclTax = computed(() => totalExclTax.value + taxAmount.value)
  const profitTotal = computed(() => totalExclTax.value - subtotalCost.value)
  const profitPercent = computed(() =>
    totalExclTax.value <= 0 ? 0 : (profitTotal.value / totalExclTax.value) * 100,
  )

  const subtotalSellDisplay = computed(() => money(subtotalSell.value))
  const subtotalCostDisplay = computed(() => money(subtotalCost.value))
  const totalExclTaxDisplay = computed(() => money(totalExclTax.value))
  const taxAmountDisplay = computed(() => money(taxAmount.value))
  const totalInclTaxDisplay = computed(() => money(totalInclTax.value))
  const profitTotalDisplay = computed(() => money(profitTotal.value))
  const profitPercentDisplay = computed(() => `${profitPercent.value.toFixed(2)}%`)

  function selectQuoteType(value: string) {
    if (!isQuoteType(value)) return

    quoteType.value = value

    if (value === "multi_modal" && !mode.value) {
      mode.value = "road"
    }
  }

  function selectMode(value: string) {
    if (!isTransportMode(value)) return

    mode.value = value

    if (!dimensionRows.value.length) addDimensionRow()
    if (!buyCostLines.value.length) addBuyCostLine("Freight Charge")
    if (!sellChargeLines.value.length) addSellChargeLine("Freight Charge")
  }

  function isQuoteType(value: string): value is QuoteType {
    return ["import", "export", "domestic", "cross_trade", "multi_modal"].includes(value)
  }

  function isTransportMode(value: string): value is TransportMode {
    return ["air", "road", "rail", "sea"].includes(value)
  }

  function customerOptionLabel(customer: CustomerOption) {
    return customer?.name ?? ""
  }

  async function onCustomerComplete(event: { query: string }) {
    await fetchCustomers(event.query)
  }

  function onCustomerSelect(event: { value: CustomerOption }) {
    selectedCustomer.value = event.value
    form.customer_id = event.value.id
    selectedContactIndex.value = event.value.contacts.length ? 0 : null
  }

  function onCustomerClear() {
    selectedCustomer.value = null
    selectedContactIndex.value = null
    form.customer_id = null
    form.contact_name = ""
    form.contact_email = ""
    form.contact_phone = ""
  }

  watch(selectedContactIndex, index => {
    if (index === null || !selectedCustomer.value) return

    const contact = selectedCustomer.value.contacts[index]
    if (!contact) return

    form.contact_name = contact.name
    form.contact_email = contact.email
    form.contact_phone = contact.phone
  })

  function addDimensionRow() {
    dimensionRows.value.push({
      id: Date.now() + Math.random(),
      package_type: packageTypeOptions.value[0]?.value ?? "Pallet",
      pieces: 1,
      length: 0,
      width: 0,
      height: 0,
      stackable: true,
      atTheTop: false,
      weight: 0,
      adr: false,
      container_type: "",
    })
  }

  function removeDimensionRow(id: number) {
    dimensionRows.value = dimensionRows.value.filter(row => row.id !== id)
  }

  function getRowCbm(row: DimensionRow) {
    return (
      (Number(row.length || 0) *
        Number(row.width || 0) *
        Number(row.height || 0) *
        Number(row.pieces || 0)) /
      1000000
    )
  }

  function getRowVolumetricWeight(row: DimensionRow) {
    return getRowCbm(row) * 167
  }

  function getRowLdm(row: DimensionRow) {
    return (
      (Number(row.length || 0) * Number(row.width || 0) * Number(row.pieces || 0)) / 10000 / 0.24
    )
  }

  function addBuyCostLine(description = "Freight Charge") {
    buyCostLines.value.push({
      id: Date.now() + Math.random(),
      type: "buy",
      description,
      qty: 1,
      uom: "Per Shipment",
      unit_cost: 0,
      currency: form.currency || "GBP",
      exchange_rate: 1,
    })
  }

  function addSellChargeLine(description = "Freight Charge") {
    sellChargeLines.value.push({
      id: Date.now() + Math.random(),
      type: "sell",
      description,
      qty: 1,
      uom: "Per Shipment",
      unit_price: 0,
      currency: form.currency || "GBP",
      exchange_rate: 1,
      vat_rate: 0,
    })
  }

  function removeBuyCostLine(id: number) {
    buyCostLines.value = buyCostLines.value.filter(line => line.id !== id)
  }

  function removeSellChargeLine(id: number) {
    sellChargeLines.value = sellChargeLines.value.filter(line => line.id !== id)
  }

  function getChargeLineTotal(line: ChargeLine) {
    const amount = line.type === "buy" ? line.unit_cost : line.unit_price

    return Number(line.qty || 0) * Number(amount || 0) * Number(line.exchange_rate || 1)
  }

  function refreshQuoteRefPreview(force = false) {
    if (isEditMode.value) return

    const sequence = quoteSequence.value

    if (!sequence?.use_system) {
      if (force || !form.quote_ref) form.quote_ref = ""
      return
    }

    const preview = buildReferenceNumber(sequence, form.quote_date ?? new Date(), {
      separator: "-",
    })
    if (preview && (force || !form.quote_ref)) form.quote_ref = preview
  }

  function onConditionsPresetChange() {
    form.terms_conditions = CONDITIONS[form.conditions_preset] ?? ""
  }

  function onBrowseQuotes() {
    router.push({ name: "tms.quotes.index" })
  }

  function onFindQuote() {
    router.push({ name: "tms.quotes.index" })
  }

  async function onSave() {
    localError.value = null

    if (!quoteType.value) {
      localError.value = "Please select a quote type."

      toast.add({
        severity: "warn",
        summary: "Quote Type Required",
        detail: "Please select a quote type.",
        life: 3000,
      })

      return
    }

    if (!mode.value) {
      localError.value = "Please select a mode of transport."

      toast.add({
        severity: "warn",
        summary: "Mode Required",
        detail: "Please select a mode of transport.",
        life: 3000,
      })

      return
    }

    try {
      const payload = buildPayload()

      const quote =
        isEditMode.value && quoteId.value
          ? await quoteStore.updateQuote(quoteId.value, payload as TransportQuotePayload)
          : await quoteStore.createQuote(payload as TransportQuotePayload)

      toast.add({
        severity: "success",
        summary: isEditMode.value ? "Quotation Updated" : "Quotation Created",
        detail: `${quote.quote_ref || `QUOTE-${quote.id}`} saved successfully.`,
        life: 3000,
      })

      setTimeout(() => {
        router.push({
          name: "tms.quotes.show",
          params: { id: quote.id },
        })
      }, 700)
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Unable to save quotation."

      localError.value = message

      toast.add({
        severity: "error",
        summary: "Save Failed",
        detail: message,
        life: 4000,
      })
    }
  }

  function onCancel() {
    if (isEditMode.value && quoteId.value) {
      router.push({
        name: "tms.quotes.show",
        params: { id: quoteId.value },
      })
      return
    }

    router.push({ name: "tms.quotes.index" })
  }

  function buildPayload() {
    return {
      customer_id: form.customer_id,
      quote_ref: quoteSequence.value?.use_system ? null : form.quote_ref || null,
      quote_type: quoteType.value,
      mode_of_transport: mode.value,
      status: "draft",

      account_number: accountNumberPreview.value || null,
      customer_ref: form.customer_ref || null,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,

      quote_date: toApiDate(form.quote_date),
      follow_up_date: toApiDate(form.follow_up_date),
      valid_until: toApiDate(form.valid_until),
      currency: form.currency || null,
      incoterm: form.incoterm || null,

      origin: form.origin || null,
      destination: form.destination || null,
      etd: toApiDate(form.etd),
      eta: toApiDate(form.eta),

      commodity: form.commodity || null,
      vehicle_type: form.vehicle_type || null,
      cargo_class: form.cargo_class || null,
      container_type: form.container_type || null,
      load_type: form.load_type || null,
      goods_description: form.goods_description || null,

      is_hazardous: Boolean(form.is_hazardous),
      hazardous_class: form.is_hazardous ? form.hazardous_class || null : null,
      un_number: form.is_hazardous ? form.un_number || null : null,
      packing_group: form.is_hazardous ? form.packing_group || null : null,

      conditions_preset: form.conditions_preset || null,
      terms_conditions: form.terms_conditions || null,
      validity_period: form.validity_period ? Number(form.validity_period) : null,
      note: form.note || null,

      discount: 0,
      tax_rate: Number(form.tax_rate || 0),

      totals: {
        subtotal_sell: subtotalSell.value,
        subtotal_cost: subtotalCost.value,
        total_excl_tax: totalExclTax.value,
        tax_amount: taxAmount.value,
        total_incl_tax: totalInclTax.value,
        profit_total: profitTotal.value,
        profit_percent: profitPercent.value,
      },

      dimensions: dimensionRows.value.map(row => ({
        package_type: row.package_type || null,
        pieces: Number(row.pieces || 0) || null,
        length: Number(row.length || 0),
        width: Number(row.width || 0),
        height: Number(row.height || 0),
        stackable: row.stackable ?? true,
        at_the_top: row.atTheTop ?? false,
        weight: Number(row.weight || 0),
        adr: Boolean(row.adr),
        container_type: row.container_type || null,
      })),

      charges: [...buyCostLines.value, ...sellChargeLines.value].map(line => ({
        type: line.type,
        description: line.description || null,
        qty: Number(line.qty || 0),
        uom: line.uom || null,
        cost: Number(line.unit_cost ?? line.unit_price ?? 0),
        unit_cost: line.type === "buy" ? Number(line.unit_cost || 0) : null,
        unit_price: line.type === "sell" ? Number(line.unit_price || 0) : null,
        currency: line.currency || form.currency || null,
        exchange_rate: Number(line.exchange_rate || 1),
        vat_rate: line.type === "sell" ? Number(line.vat_rate || 0) : null,
      })),
    } as any
  }

  async function fetchCustomers(query = "") {
    loadingCustomers.value = true

    try {
      const response = await http.get("/contacts", {
        params: {
          q: query || undefined,
          per_page: 20,
        },
      })

      const rows = response.data?.data ?? response.data ?? []
      customerSuggestions.value = Array.isArray(rows) ? rows.map(mapContactToCustomerOption) : []
    } catch {
      customerSuggestions.value = []
    } finally {
      loadingCustomers.value = false
    }
  }

  function mapContactToCustomerOption(item: any): CustomerOption {
    const companyName = item.company_name ?? item.name ?? item.full_name ?? "Unnamed Customer"
    const contactName = item.contact_name ?? item.name ?? companyName

    return {
      id: Number(item.id),
      name: companyName,
      account_number: item.account_number ?? "",
      contacts: [
        {
          name: contactName,
          email: item.email ?? "",
          phone: item.phone ?? item.mobile ?? "",
        },
      ],
    }
  }

  async function loadQuoteForEdit(id: number) {
    const quote = await quoteStore.fetchQuote(id)

    fillFormFromQuote(quote)
  }

  function fillFormFromQuote(quote: TransportQuote) {
    quoteType.value = isQuoteType(String(quote.quote_type)) ? (quote.quote_type as QuoteType) : null
    mode.value = isTransportMode(String(quote.mode_of_transport))
      ? (quote.mode_of_transport as TransportMode)
      : null

    form.quote_ref = quote.quote_ref ?? ""
    form.customer_id = quote.customer_id
    form.customer_ref = quote.customer_ref ?? ""
    form.contact_name = quote.contact_name ?? ""
    form.contact_email = quote.contact_email ?? ""
    form.contact_phone = quote.contact_phone ?? ""
    form.quote_date = fromApiDate(quote.quote_date)
    form.follow_up_date = fromApiDate(quote.follow_up_date)
    form.valid_until = fromApiDate(quote.valid_until)
    form.currency = quote.currency ?? "GBP"
    form.incoterm = quote.incoterm ?? "DAP"
    form.origin = quote.origin ?? ""
    form.destination = quote.destination ?? ""
    form.etd = fromApiDate(quote.etd)
    form.eta = fromApiDate(quote.eta)
    form.commodity = quote.commodity ?? ""
    form.vehicle_type = quote.vehicle_type ?? ""
    form.cargo_class = quote.cargo_class ?? ""
    form.container_type = quote.container_type ?? ""
    form.load_type = quote.load_type ?? ""
    form.goods_description = quote.goods_description ?? ""
    form.is_hazardous = Boolean(quote.is_hazardous)
    form.hazardous_class = quote.hazardous_class ?? ""
    form.un_number = quote.un_number ?? ""
    form.packing_group = quote.packing_group ?? ""
    form.conditions_preset = quote.conditions_preset ?? ""
    form.terms_conditions = quote.terms_conditions ?? ""
    form.validity_period = String(quote.validity_period ?? "30")
    form.note = quote.note ?? ""
    form.discount = 0
    form.tax_rate = Number(quote.tax_rate || 0)

    if (quote.customer_contact) {
      selectedCustomer.value = {
        id: quote.customer_contact.id,
        name: quote.customer_contact.company_name ?? "",
        account_number: quote.customer_contact.account_number ?? "",
        contacts: [
          {
            name: quote.contact_name ?? quote.customer_contact.company_name ?? "",
            email: quote.contact_email ?? quote.customer_contact.email ?? "",
            phone:
              quote.contact_phone ??
              quote.customer_contact.phone ??
              quote.customer_contact.mobile ??
              "",
          },
        ],
      }

      selectedContactIndex.value = 0
    }

    dimensionRows.value = quote.dimensions.length
      ? quote.dimensions.map(row => ({
          id: row.id ?? Date.now() + Math.random(),
          package_type: row.package_type ?? "Pallet",
          pieces: Number(row.pieces || 1),
          length: Number(row.length || 0),
          width: Number(row.width || 0),
          height: Number(row.height || 0),
          stackable: row.stackable ?? true,
          atTheTop: row.at_the_top ?? false,
          weight: Number(row.weight || 0),
          adr: Boolean(row.adr),
          container_type: row.container_type ?? "",
        }))
      : []

    const rawCharges = Array.isArray(quote.charges) ? quote.charges : []

    buyCostLines.value = rawCharges
      .filter((line: any) => (line.type ?? "buy") === "buy")
      .map((line: any) => mapChargeLine(line, "buy"))

    sellChargeLines.value = rawCharges
      .filter((line: any) => (line.type ?? "sell") === "sell")
      .map((line: any) => mapChargeLine(line, "sell"))

    const legacyCharges = rawCharges.filter((line: any) => !line.type)
    if (legacyCharges.length) {
      buyCostLines.value = legacyCharges.map((line: any) => mapChargeLine(line, "buy"))
      sellChargeLines.value = legacyCharges.map((line: any) => mapChargeLine(line, "sell"))
    }

    if (!buyCostLines.value.length && rawCharges.length) {
      buyCostLines.value = rawCharges.map((line: any) => mapChargeLine(line, "buy"))
    }

    if (!dimensionRows.value.length) addDimensionRow()
    if (!buyCostLines.value.length) addBuyCostLine()
    if (!sellChargeLines.value.length) addSellChargeLine()
  }

  function mapChargeLine(line: any, type: "buy" | "sell"): ChargeLine {
    const qty = Number(line.qty || 1)
    const cost = Number(line.unit_cost ?? line.cost ?? 0)
    const sellTotal = Number(line.sell_total ?? line.total_sell ?? 0)
    const legacyUnitPrice = qty > 0 ? sellTotal / qty : 0

    return {
      id: line.id ?? Date.now() + Math.random(),
      type,
      description: line.description ?? "Freight Charge",
      qty,
      uom: line.uom ?? "Per Shipment",
      unit_cost: type === "buy" ? cost : undefined,
      unit_price: type === "sell" ? Number(line.unit_price ?? legacyUnitPrice) : undefined,
      currency: line.currency ?? form.currency ?? "GBP",
      exchange_rate: Number(line.exchange_rate || 1),
      vat_rate: type === "sell" ? Number(line.vat_rate || 0) : undefined,
    }
  }

  function money(value: number) {
    return `${form.currency} ${new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)}`
  }

  function toApiDate(value: Date | string | null) {
    if (!value) return null
    if (typeof value === "string") return value

    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, "0")
    const day = String(value.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  function fromApiDate(value: string | null) {
    if (!value) return null

    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  onMounted(async () => {
    companyStore.hydrateFromAuth()

    const hasSeq =
      Array.isArray(companyStore.item?.reference_sequences) &&
      companyStore.item.reference_sequences.length > 0

    await Promise.allSettled([
      fetchCustomers(),
      globalReferenceDataStore.fetchAll(),
      referenceDataStore.categories.length ? Promise.resolve() : referenceDataStore.fetchAll(),
      hasSeq ? Promise.resolve() : companyStore.fetch(),
    ])

    if (isEditMode.value && quoteId.value) {
      await loadQuoteForEdit(quoteId.value)
    } else {
      refreshQuoteRefPreview(true)
      addDimensionRow()
      addBuyCostLine("Freight Charge")
      addSellChargeLine("Freight Charge")
    }
  })

  watch(
    () => form.quote_date,
    () => refreshQuoteRefPreview(true),
  )

  watch(
    () => quoteSequence.value?.next_number,
    () => refreshQuoteRefPreview(true),
  )

  watch(
    dimensionRows,
    rows => {
      if (rows.some(row => row.adr)) form.is_hazardous = true
    },
    { deep: true },
  )

  return {
    pageTitle,
    pageStatusLabel,
    formTitle,
    saveButtonLabel,
    saving,
    error,

    QUOTE_TYPES,
    availableModes,
    quoteType,
    mode,
    quoteTypeLabel,
    modeLabel,
    showModeSelector,
    canShowForm,

    form,
    selectedCustomer,
    selectedContactIndex,
    customerSuggestions,
    contactOptions,
    accountNumberPreview,
    originLocationOptions,
    destinationLocationOptions,

    currencyOptions,
    incotermOptions,
    containerOptions,
    uomOptions,
    chargeDescriptionOptions,
    hazardousClassOptions,
    packingGroupOptions,
    conditionsOptions,
    validityOptions,
    taxRateOptions,
    packageTypeOptions,

    dimensionRows,
    buyCostLines,
    sellChargeLines,

    totalPieces,
    totalActualWeight,
    totalVolumetricWeight,
    chargeableWeight,
    totalCbm,
    totalLdm,
    revenueTonne,
    loadPlannerPackages,
    loadPlannerReference,

    subtotalSellDisplay,
    subtotalCostDisplay,
    totalExclTaxDisplay,
    taxAmountDisplay,
    totalInclTaxDisplay,
    profitTotalDisplay,
    profitPercentDisplay,

    selectQuoteType,
    selectMode,
    customerOptionLabel,
    onCustomerComplete,
    onCustomerSelect,
    onCustomerClear,
    addDimensionRow,
    removeDimensionRow,
    getPackageStackOption,
    setPackageStackOption,
    addBuyCostLine,
    addSellChargeLine,
    removeBuyCostLine,
    removeSellChargeLine,
    getRowCbm,
    getRowVolumetricWeight,
    getRowLdm,
    getChargeLineTotal,
    onConditionsPresetChange,
    onBrowseQuotes,
    onFindQuote,
    onSave,
    onCancel,
  }
}
