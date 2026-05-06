import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

type SelectorItem = {
  key: string
  title: string
  subtitle: string
}

type Option<T = string> = {
  label: string
  value: T
}

type CustomerContact = {
  name: string
  email: string
  phone: string
}

type CustomerOption = {
  id: number
  company_name: string
  account_number: string
  contacts: CustomerContact[]
}

type DimensionRow = {
  id: number
  pieces: number
  length: number
  width: number
  height: number
  weight: number
  container_type: string
}

type ChargeLine = {
  id: number
  description: string
  qty: number
  uom: string
  cost: number
  markup_percent: number
}

type QuoteForm = {
  quote_ref: string
  quote_date: Date | null
  follow_up_date: Date | null
  valid_until: Date | null

  customer_id: number | null
  customer_ref: string
  contact_person: string
  contact_email: string
  contact_phone: string

  quote_type: string
  mode_of_transport: string
  currency: string
  incoterm: string

  origin: string
  destination: string
  etd: Date | null
  eta: Date | null

  commodity: string
  vehicle_type: string
  cargo_class: string
  container_type: string
  load_type: string

  goods_description: string
  is_hazardous: boolean
  hazardous_class: string
  un_number: string
  packing_group: string

  conditions_preset: string
  terms_conditions: string
  validity_period: string
  note: string

  discount: number
  tax_rate: number
}

const CONDITIONS_PRESETS: Record<string, string> = {
  std: `1. All rates quoted are subject to space and equipment availability.
2. Rates are valid for the period stated and subject to change without notice thereafter.
3. All charges are exclusive of applicable taxes unless otherwise stated.
4. Claims for loss or damage must be submitted within 14 days of delivery.
5. These services are subject to our Standard Trading Conditions available on request.`,
  air: `1. Air freight rates are based on Chargeable Weight.
2. Rates do not include customs duties, taxes or government levies.
3. Transit times are estimated and not guaranteed.
4. All goods subject to IATA Dangerous Goods Regulations where applicable.
5. Fuel and security surcharges subject to change.`,
  sea: `1. Ocean freight rates subject to space and equipment availability.
2. Port congestion surcharges may apply and will be charged at cost.
3. Transit times are approximate and not guaranteed.
4. Demurrage and detention charges will be applied as per carrier tariff.
5. All LCL rates are per Revenue Tonne.`,
  haz: `1. All hazardous goods must be declared at time of booking with full MSDS documentation.
2. DG surcharges apply and are in addition to standard freight rates.
3. Proper shipping name, UN Number and Packing Group must be provided.
4. Goods must be packed and labelled in accordance with regulations.
5. Additional compliance surcharges may apply.`,
}

export function useQuoteCreatePage() {
  const router = useRouter()

  const QUOTE_TYPES: SelectorItem[] = [
    { key: "import", title: "Import", subtitle: "Create an Import quote" },
    { key: "export", title: "Export", subtitle: "Create an Export quote" },
    { key: "domestic", title: "Domestic", subtitle: "Create a Domestic quote" },
    { key: "cross_trade", title: "Cross-Trade", subtitle: "Create a Cross-Trade quote" },
    { key: "multi_modal", title: "Multi Modal", subtitle: "Create a Multi Modal quote" },
  ]

  const BASE_MODE_ITEMS: SelectorItem[] = [
    { key: "air", title: "Air Freight", subtitle: "Choose Air Freight" },
    { key: "road", title: "Road Freight", subtitle: "Choose Road Freight" },
    { key: "rail", title: "Rail Freight", subtitle: "Choose Rail Freight" },
    { key: "sea", title: "Sea Freight", subtitle: "Choose Sea Freight" },
  ]

  const quoteType = ref<string | null>(null)
  const mode = ref<string | null>(null)

  const selectedCustomer = ref<CustomerOption | null>(null)
  const selectedContactIndex = ref<number | null>(null)
  const customerSuggestions = ref<CustomerOption[]>([])

  const customerOptions = ref<CustomerOption[]>([
    {
      id: 1,
      company_name: "Acme Logistics Ltd",
      account_number: "ACC-0001",
      contacts: [
        { name: "James Thornton", email: "j.thornton@acme.com", phone: "+44 20 7123 4500" },
        { name: "Sarah Mitchell", email: "s.mitchell@acme.com", phone: "+44 20 7123 4501" },
      ],
    },
    {
      id: 2,
      company_name: "Blueline Shipping Co.",
      account_number: "ACC-0002",
      contacts: [
        { name: "David Okafor", email: "d.okafor@blueline.co.uk", phone: "+44 161 234 5678" },
        { name: "Priya Sharma", email: "p.sharma@blueline.co.uk", phone: "+44 161 234 5679" },
      ],
    },
    {
      id: 3,
      company_name: "Globex International",
      account_number: "ACC-0003",
      contacts: [{ name: "Michael Chen", email: "m.chen@globex.com", phone: "+1 212 555 0100" }],
    },
  ])

  const form = ref<QuoteForm>({
    quote_ref: buildQuoteRef(),
    quote_date: new Date(),
    follow_up_date: null,
    valid_until: null,

    customer_id: null,
    customer_ref: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",

    quote_type: "",
    mode_of_transport: "",
    currency: "GBP",
    incoterm: "EXW",

    origin: "",
    destination: "",
    etd: null,
    eta: null,

    commodity: "General",
    vehicle_type: "FTL",
    cargo_class: "",
    container_type: "",
    load_type: "FCL",

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

  const dimensionRows = ref<DimensionRow[]>([createDimensionRow()])
  const chargeLines = ref<ChargeLine[]>([createChargeLine("Freight Charge")])

  const currencyOptions: Option[] = [
    { label: "GBP – British Pound", value: "GBP" },
    { label: "USD – US Dollar", value: "USD" },
    { label: "EUR – Euro", value: "EUR" },
    { label: "AED – UAE Dirham", value: "AED" },
    { label: "AUD – Australian Dollar", value: "AUD" },
    { label: "SGD – Singapore Dollar", value: "SGD" },
    { label: "CHF – Swiss Franc", value: "CHF" },
  ]

  const incotermOptions: Option[] = [
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
  ].map(value => ({ label: value, value }))

  const containerOptions: Option[] = [
    "20' GP",
    "40' GP",
    "40' HC",
    "20' RF",
    "40' RF",
    "20' OT",
  ].map(value => ({ label: value, value }))

  const uomOptions: Option[] = [
    "Per Shipment",
    "Per KG",
    "Per CBM",
    "Per Unit",
    "Per Day",
    "Per Container",
    "Flat Rate",
    "Per AWB",
    "Per BL",
    "Percent",
  ].map(value => ({ label: value, value }))

  const chargeDescriptionOptions: Option[] = [
    "Origin Handling Charge",
    "Freight Charge",
    "Destination Handling Charge",
    "Fuel Surcharge (FSC)",
    "Security Surcharge (SSC)",
    "Customs Clearance – Origin",
    "Customs Clearance – Destination",
    "Port Handling Fee",
    "Delivery / Cartage",
    "Documentation Fee",
    "Inspection Fee",
    "Storage / Demurrage",
    "Dangerous Goods Surcharge",
    "Oversize Cargo Surcharge",
    "Insurance Premium",
    "Terminal Handling Charge (THC)",
    "Bill of Lading Fee",
  ].map(value => ({ label: value, value }))

  const hazardousClassOptions: Option[] = [
    "Class 1 – Explosives",
    "Class 2.1 – Flammable Gas",
    "Class 2.2 – Non-Flammable Gas",
    "Class 2.3 – Toxic Gas",
    "Class 3 – Flammable Liquids",
    "Class 4.1 – Flammable Solids",
    "Class 4.2 – Spontaneous Combustibles",
    "Class 4.3 – Dangerous When Wet",
    "Class 5.1 – Oxidising Substances",
    "Class 5.2 – Organic Peroxides",
    "Class 6.1 – Toxic Substances",
    "Class 6.2 – Infectious Substances",
    "Class 7 – Radioactive Material",
    "Class 8 – Corrosives",
    "Class 9 – Misc. Dangerous Goods",
  ].map(value => ({ label: value, value }))

  const packingGroupOptions: Option[] = ["PG I", "PG II", "PG III"].map(value => ({
    label: value,
    value,
  }))

  const conditionsOptions: Option[] = [
    { label: "Standard Freight Terms", value: "std" },
    { label: "Air Freight Conditions", value: "air" },
    { label: "Sea Freight Conditions", value: "sea" },
    { label: "Hazardous Goods Terms", value: "haz" },
  ]

  const validityOptions: Option[] = [
    { label: "Valid for 7 days", value: "7" },
    { label: "Valid for 14 days", value: "14" },
    { label: "Valid for 30 days", value: "30" },
    { label: "Valid for 60 days", value: "60" },
    { label: "Custom", value: "custom" },
  ]

  const taxRateOptions: Option<number>[] = [
    { label: "0% – Zero Rate", value: 0 },
    { label: "5% – Reduced Rate", value: 5 },
    { label: "12.5% – Reduced Rate", value: 12.5 },
    { label: "20% – Standard Rate", value: 20 },
    { label: "23% – IE Standard", value: 23 },
    { label: "25% – DK / SE Standard", value: 25 },
    { label: "27% – HU Standard", value: 27 },
  ]

  const availableModes = computed(() => BASE_MODE_ITEMS)

  const showModeSelector = computed(() => !!quoteType.value)

  const canShowForm = computed(() => !!quoteType.value && !!mode.value)

  const quoteTypeLabel = computed(() => {
    return QUOTE_TYPES.find(item => item.key === quoteType.value)?.title ?? ""
  })

  const modeLabel = computed(() => {
    return BASE_MODE_ITEMS.find(item => item.key === mode.value)?.title ?? ""
  })

  const accountNumberPreview = computed(() => selectedCustomer.value?.account_number ?? "")

  const contactOptions = computed<Option<number>[]>(() => {
    return (
      selectedCustomer.value?.contacts.map((contact, index) => ({
        label: contact.name,
        value: index,
      })) ?? []
    )
  })

  const totalPieces = computed(() => {
    return dimensionRows.value.reduce((sum, row) => sum + Number(row.pieces || 0), 0)
  })

  const totalActualWeight = computed(() => {
    return dimensionRows.value.reduce((sum, row) => sum + Number(row.weight || 0), 0)
  })

  const totalCbm = computed(() => {
    return dimensionRows.value.reduce((sum, row) => sum + getRowCbm(row), 0)
  })

  const totalVolumetricWeight = computed(() => totalCbm.value * 167)

  const chargeableWeight = computed(() => {
    if (mode.value === "air") return Math.max(totalActualWeight.value, totalVolumetricWeight.value)
    return totalActualWeight.value
  })

  const totalLdm = computed(() => {
    return dimensionRows.value.reduce((sum, row) => sum + getRowLdm(row), 0)
  })

  const revenueTonne = computed(() => {
    return Math.max(totalActualWeight.value / 1000, totalCbm.value)
  })

  const subtotalSell = computed(() => {
    return chargeLines.value.reduce((sum, line) => sum + getChargeSellTotal(line), 0)
  })

  const subtotalCost = computed(() => {
    return chargeLines.value.reduce(
      (sum, line) => sum + Number(line.qty || 0) * Number(line.cost || 0),
      0,
    )
  })

  const totalExclTax = computed(() => {
    return Math.max(subtotalSell.value - Number(form.value.discount || 0), 0)
  })

  const taxAmount = computed(() => {
    return totalExclTax.value * (Number(form.value.tax_rate || 0) / 100)
  })

  const totalInclTax = computed(() => {
    return totalExclTax.value + taxAmount.value
  })

  const profitTotal = computed(() => {
    return totalExclTax.value - subtotalCost.value
  })

  const profitPercent = computed(() => {
    if (totalExclTax.value <= 0) return 0
    return (profitTotal.value / totalExclTax.value) * 100
  })

  const subtotalSellDisplay = computed(() => formatMoney(subtotalSell.value, form.value.currency))
  const subtotalCostDisplay = computed(() => formatMoney(subtotalCost.value, form.value.currency))
  const totalExclTaxDisplay = computed(() => formatMoney(totalExclTax.value, form.value.currency))
  const taxAmountDisplay = computed(() => formatMoney(taxAmount.value, form.value.currency))
  const totalInclTaxDisplay = computed(() => formatMoney(totalInclTax.value, form.value.currency))
  const profitTotalDisplay = computed(() => formatMoney(profitTotal.value, form.value.currency))
  const profitPercentDisplay = computed(() => `${profitPercent.value.toFixed(2)}%`)

  function selectQuoteType(value: string) {
    quoteType.value = value
    mode.value = null
    form.value.quote_type = value
    form.value.mode_of_transport = ""
  }

  function selectMode(value: string) {
    mode.value = value
    form.value.mode_of_transport = value
    dimensionRows.value = [createDimensionRow()]
    chargeLines.value = [createChargeLine("Freight Charge")]
  }

  function customerOptionLabel(option: CustomerOption) {
    return option?.company_name ?? ""
  }

  function onCustomerComplete(event: { query: string }) {
    const query = String(event.query ?? "")
      .trim()
      .toLowerCase()

    customerSuggestions.value = !query
      ? [...customerOptions.value]
      : customerOptions.value.filter(item => {
          return (
            item.company_name.toLowerCase().includes(query) ||
            item.account_number.toLowerCase().includes(query)
          )
        })
  }

  function onCustomerSelect() {
    form.value.customer_id = selectedCustomer.value?.id ?? null
    selectedContactIndex.value = null
    clearContact()
  }

  function onCustomerClear() {
    selectedCustomer.value = null
    selectedContactIndex.value = null
    form.value.customer_id = null
    clearContact()
  }

  function onContactChange() {
    const contact =
      selectedContactIndex.value !== null
        ? selectedCustomer.value?.contacts[selectedContactIndex.value]
        : null

    form.value.contact_person = contact?.name ?? ""
    form.value.contact_email = contact?.email ?? ""
    form.value.contact_phone = contact?.phone ?? ""
  }

  function addDimensionRow() {
    dimensionRows.value.push(createDimensionRow())
  }

  function removeDimensionRow(id: number) {
    if (dimensionRows.value.length === 1) return
    dimensionRows.value = dimensionRows.value.filter(row => row.id !== id)
  }

  function addChargeLine(description = "Freight Charge") {
    chargeLines.value.push(createChargeLine(description))
  }

  function removeChargeLine(id: number) {
    if (chargeLines.value.length === 1) return
    chargeLines.value = chargeLines.value.filter(line => line.id !== id)
  }

  function getRowCbm(row: DimensionRow) {
    return (
      (Number(row.length || 0) *
        Number(row.width || 0) *
        Number(row.height || 0) *
        Number(row.pieces || 0)) /
      1_000_000
    )
  }

  function getRowVolumetricWeight(row: DimensionRow) {
    return getRowCbm(row) * 167
  }

  function getRowLdm(row: DimensionRow) {
    return (
      (Number(row.length || 0) * Number(row.width || 0) * Number(row.pieces || 0)) / 10_000 / 0.24
    )
  }

  function getChargeSellTotal(line: ChargeLine) {
    const qty = Number(line.qty || 0)
    const cost = Number(line.cost || 0)
    const markup = Number(line.markup_percent || 0)
    return qty * cost * (1 + markup / 100)
  }

  function onConditionsPresetChange() {
    const preset = form.value.conditions_preset
    if (preset && CONDITIONS_PRESETS[preset]) {
      form.value.terms_conditions = CONDITIONS_PRESETS[preset]
    }
  }

  function onBrowseQuotes() {
    router.push("/quotes")
  }

  function onFindQuote() {
    router.push("/quotes")
  }

  function onSave() {
    const payload = {
      ...form.value,
      customer_id: selectedCustomer.value?.id ?? null,
      quote_type: quoteType.value,
      mode_of_transport: mode.value,
      dimensions: dimensionRows.value,
      charges: chargeLines.value,
      totals: {
        subtotal_sell: subtotalSell.value,
        subtotal_cost: subtotalCost.value,
        discount: form.value.discount,
        tax_rate: form.value.tax_rate,
        tax_amount: taxAmount.value,
        total_excl_tax: totalExclTax.value,
        total_incl_tax: totalInclTax.value,
        profit_total: profitTotal.value,
        profit_percent: profitPercent.value,
      },
    }

    console.log("Create quote payload:", payload)
  }

  function onCancel() {
    router.push("/quotes")
  }

  function clearContact() {
    form.value.contact_person = ""
    form.value.contact_email = ""
    form.value.contact_phone = ""
  }

  watch(selectedContactIndex, onContactChange)

  return {
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

    dimensionRows,
    chargeLines,

    totalPieces,
    totalActualWeight,
    totalVolumetricWeight,
    chargeableWeight,
    totalCbm,
    totalLdm,
    revenueTonne,

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
    addChargeLine,
    removeChargeLine,
    getRowCbm,
    getRowVolumetricWeight,
    getRowLdm,
    getChargeSellTotal,
    onConditionsPresetChange,
    onBrowseQuotes,
    onFindQuote,
    onSave,
    onCancel,
  }
}

let dimensionId = 0
let chargeId = 0

function createDimensionRow(): DimensionRow {
  dimensionId += 1

  return {
    id: dimensionId,
    pieces: 1,
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    container_type: "20' GP",
  }
}

function createChargeLine(description = "Freight Charge"): ChargeLine {
  chargeId += 1

  return {
    id: chargeId,
    description,
    qty: 1,
    uom: "Per Shipment",
    cost: 0,
    markup_percent: 25,
  }
}

function buildQuoteRef(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `QTE-${year}-${random}`
}

function formatMoney(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    AED: "AED ",
    AUD: "A$",
    SGD: "S$",
    CHF: "CHF ",
  }

  return `${symbols[currency] ?? `${currency} `}${Number(value || 0).toFixed(2)}`
}
