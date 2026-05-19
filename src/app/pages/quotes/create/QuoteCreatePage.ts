import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

type QuoteType = "import" | "export" | "domestic" | "cross_trade" | "multi_modal"
type TransportMode = "air" | "road" | "rail" | "sea"

type SelectOption<T = string> = {
  label: string
  value: T
  icon?: string
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

const CUSTOMERS: CustomerOption[] = [
  {
    id: 1,
    name: "Acme Logistics Ltd",
    account_number: "CUS-0001",
    contacts: [
      {
        name: "James Thornton",
        email: "j.thornton@acme.com",
        phone: "+44 20 7123 4500",
      },
      {
        name: "Sarah Mitchell",
        email: "s.mitchell@acme.com",
        phone: "+44 20 7123 4501",
      },
    ],
  },
  {
    id: 2,
    name: "Blueline Shipping Co.",
    account_number: "CUS-0002",
    contacts: [
      {
        name: "David Okafor",
        email: "d.okafor@blueline.co.uk",
        phone: "+44 161 234 5678",
      },
      {
        name: "Priya Sharma",
        email: "p.sharma@blueline.co.uk",
        phone: "+44 161 234 5679",
      },
    ],
  },
  {
    id: 3,
    name: "Globex International",
    account_number: "CUS-0003",
    contacts: [
      {
        name: "Michael Chen",
        email: "m.chen@globex.com",
        phone: "+1 212 555 0100",
      },
    ],
  },
]

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

  const quoteId = computed(() => {
    const id = route.params.id

    if (!id) return null

    return Number(id)
  })

  const isEditMode = computed(() => Boolean(quoteId.value))

  const pageTitle = computed(() => {
    return isEditMode.value ? "Edit Freight Quotation" : "New Freight Quotation"
  })

  const pageStatusLabel = computed(() => {
    return "Draft"
  })

  const saveButtonLabel = computed(() => {
    return isEditMode.value ? "Update Quote" : "Submit Quote"
  })

  const QUOTE_TYPES = [
    {
      key: "import",
      title: "Import",
      subtitle: "Inbound shipment",
      icon: "pi pi-download",
    },
    {
      key: "export",
      title: "Export",
      subtitle: "Outbound shipment",
      icon: "pi pi-upload",
    },
    {
      key: "domestic",
      title: "Domestic",
      subtitle: "Local movement",
      icon: "pi pi-home",
    },
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
    {
      key: "sea",
      title: "Sea Freight",
      subtitle: "Ocean freight movement",
      icon: "pi pi-globe",
    },
  ]

  const quoteType = ref<QuoteType | null>(null)
  const mode = ref<TransportMode | null>(null)

  const selectedCustomer = ref<CustomerOption | null>(null)
  const customerSuggestions = ref<CustomerOption[]>([])
  const selectedContactIndex = ref<number | null>(null)

  const form = reactive({
    quote_ref: generateQuoteRef(),
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
  const chargeLines = ref<ChargeLine[]>([])

  const availableModes = computed(() => MODE_OPTIONS)

  const showModeSelector = computed(() => {
    return Boolean(quoteType.value)
  })

  const canShowForm = computed(() => {
    return Boolean(quoteType.value && mode.value)
  })

  const quoteTypeLabel = computed(() => {
    return QUOTE_TYPES.find(item => item.key === quoteType.value)?.title ?? ""
  })

  const modeLabel = computed(() => {
    return MODE_OPTIONS.find(item => item.key === mode.value)?.title ?? ""
  })

  const formTitle = computed(() => {
    const prefix = isEditMode.value ? "Edit" : "New"
    const type = quoteTypeLabel.value || "Freight"

    return `${prefix} ${type} Quote`
  })

  const accountNumberPreview = computed(() => {
    return selectedCustomer.value?.account_number ?? ""
  })

  const contactOptions = computed<SelectOption<number>[]>(() => {
    if (!selectedCustomer.value) return []

    return selectedCustomer.value.contacts.map((contact, index) => ({
      label: contact.name,
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
  ].map(item => ({ label: item, value: item }))

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

  const totalPieces = computed(() => {
    return dimensionRows.value.reduce((total, row) => total + Number(row.pieces || 0), 0)
  })

  const totalActualWeight = computed(() => {
    return dimensionRows.value.reduce((total, row) => total + Number(row.weight || 0), 0)
  })

  const totalVolumetricWeight = computed(() => {
    return dimensionRows.value.reduce((total, row) => total + getRowVolumetricWeight(row), 0)
  })

  const chargeableWeight = computed(() => {
    if (mode.value === "air") {
      return Math.max(totalActualWeight.value, totalVolumetricWeight.value)
    }

    return totalActualWeight.value
  })

  const totalCbm = computed(() => {
    return dimensionRows.value.reduce((total, row) => total + getRowCbm(row), 0)
  })

  const totalLdm = computed(() => {
    return dimensionRows.value.reduce((total, row) => total + getRowLdm(row), 0)
  })

  const revenueTonne = computed(() => {
    return Math.max(totalActualWeight.value / 1000, totalCbm.value)
  })

  const subtotalSell = computed(() => {
    return chargeLines.value.reduce((total, line) => total + getChargeSellTotal(line), 0)
  })

  const subtotalCost = computed(() => {
    return chargeLines.value.reduce(
      (total, line) => total + Number(line.qty || 0) * Number(line.cost || 0),
      0,
    )
  })

  const totalExclTax = computed(() => {
    return Math.max(subtotalSell.value - Number(form.discount || 0), 0)
  })

  const taxAmount = computed(() => {
    return totalExclTax.value * (Number(form.tax_rate || 0) / 100)
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

    if (value === "multi_modal") {
      mode.value = "road"
    }
  }

  function selectMode(value: string) {
    if (!isTransportMode(value)) return

    mode.value = value

    if (!dimensionRows.value.length) {
      addDimensionRow()
    }

    if (!chargeLines.value.length) {
      addChargeLine("Freight Charge")
    }
  }

  function isQuoteType(value: string): value is QuoteType {
    return ["import", "export", "domestic", "cross_trade", "multi_modal"].includes(value)
  }

  function isTransportMode(value: string): value is TransportMode {
    return ["air", "road", "rail", "sea"].includes(value)
  }

  function customerOptionLabel(customer: CustomerOption) {
    return customer.name
  }

  function onCustomerComplete(event: { query: string }) {
    const query = event.query.trim().toLowerCase()

    if (!query) {
      customerSuggestions.value = [...CUSTOMERS]
      return
    }

    customerSuggestions.value = CUSTOMERS.filter(customer =>
      customer.name.toLowerCase().includes(query),
    )
  }

  function onCustomerSelect(event: { value: CustomerOption }) {
    selectedCustomer.value = event.value
    form.customer_id = event.value.id
    selectedContactIndex.value = null
    form.contact_name = ""
    form.contact_email = ""
    form.contact_phone = ""
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
      pieces: 1,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
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

  function addChargeLine(description = "Freight Charge") {
    chargeLines.value.push({
      id: Date.now() + Math.random(),
      description,
      qty: 1,
      uom: "Per Shipment",
      cost: 0,
      markup_percent: 25,
    })
  }

  function removeChargeLine(id: number) {
    chargeLines.value = chargeLines.value.filter(line => line.id !== id)
  }

  function getChargeSellTotal(line: ChargeLine) {
    return (
      Number(line.qty || 0) * Number(line.cost || 0) * (1 + Number(line.markup_percent || 0) / 100)
    )
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

  function onSave() {
    if (isEditMode.value) {
      console.log("Update quote", quoteId.value, buildPayload())
    } else {
      console.log("Create quote", buildPayload())
    }

    router.push({ name: "tms.quotes.index" })
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
      quote_type: quoteType.value,
      mode_of_transport: mode.value,
      ...form,
      dimensions: dimensionRows.value,
      charges: chargeLines.value,
      totals: {
        subtotal_sell: subtotalSell.value,
        subtotal_cost: subtotalCost.value,
        total_excl_tax: totalExclTax.value,
        tax_amount: taxAmount.value,
        total_incl_tax: totalInclTax.value,
        profit_total: profitTotal.value,
        profit_percent: profitPercent.value,
      },
    }
  }

  function loadQuoteForEdit(id: number) {
    const quote = {
      id,
      quote_ref: `QUO-2026-${String(id).padStart(4, "0")}`,
      quote_type: "export" as QuoteType,
      mode_of_transport: "air" as TransportMode,
      customer_id: 1,
      customer_ref: "PO-2026-001",
      contact_index: 0,
      currency: "GBP",
      incoterm: "DAP",
      origin: "London Heathrow",
      destination: "Dubai DXB",
      commodity: "Electronics",
      goods_description: "General Cargo - Electronic Components",
      terms_conditions: CONDITIONS.air,
      charges: [
        {
          id: 1,
          description: "Freight Charge",
          qty: 1,
          uom: "Per Shipment",
          cost: 850,
          markup_percent: 25,
        },
      ],
      dimensions: [
        {
          id: 1,
          pieces: 10,
          length: 60,
          width: 40,
          height: 30,
          weight: 120,
          container_type: "",
        },
      ],
    }

    quoteType.value = quote.quote_type
    mode.value = quote.mode_of_transport

    const customer = CUSTOMERS.find(item => item.id === quote.customer_id) ?? null
    selectedCustomer.value = customer
    form.customer_id = quote.customer_id

    if (customer) {
      selectedContactIndex.value = quote.contact_index
      const contact = customer.contacts[quote.contact_index]

      form.contact_name = contact?.name ?? ""
      form.contact_email = contact?.email ?? ""
      form.contact_phone = contact?.phone ?? ""
    }

    form.quote_ref = quote.quote_ref
    form.customer_ref = quote.customer_ref
    form.currency = quote.currency
    form.incoterm = quote.incoterm
    form.origin = quote.origin
    form.destination = quote.destination
    form.commodity = quote.commodity
    form.goods_description = quote.goods_description
    form.terms_conditions = quote.terms_conditions ?? ""

    dimensionRows.value = quote.dimensions
    chargeLines.value = quote.charges
  }

  function money(value: number) {
    return `${form.currency} ${new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)}`
  }

  function generateQuoteRef() {
    return `QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  }

  onMounted(() => {
    customerSuggestions.value = [...CUSTOMERS]

    if (isEditMode.value && quoteId.value) {
      loadQuoteForEdit(quoteId.value)
    }
  })

  return {
    pageTitle,
    pageStatusLabel,
    formTitle,
    saveButtonLabel,
    isEditMode,

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
