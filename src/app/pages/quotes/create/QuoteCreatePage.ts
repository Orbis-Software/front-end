import { computed, ref } from "vue"
import { useRouter } from "vue-router"

type SelectorItem = {
  key: string
  title: string
  subtitle: string
}

type CustomerOption = {
  id: number
  company_name: string
  account_number: string
  contact_person?: string
}

type Option<T> = {
  label: string
  value: T
}

type QuoteForm = {
  quote_ref: string
  quote_date: Date | null
  valid_until: Date | null

  customer_id: number | null
  contact_person: string

  quote_type: string
  mode_of_transport: string
  currency: string

  origin: string
  destination: string
  incoterm: string
  pieces: number | null
  weight: number | null
  volume: number | null
  commodity: string
  etd: Date | null
  eta: Date | null

  goods_description: string
  sell_rate: number | null
  cost_rate: number | null
  markup_percent: number | null
  note: string
}

export function useQuoteCreatePage() {
  const router = useRouter()

  const QUOTE_TYPES: SelectorItem[] = [
    { key: "import", title: "Import", subtitle: "Create an Import quote" },
    { key: "export", title: "Export", subtitle: "Create an Export quote" },
    { key: "domestic", title: "Domestic", subtitle: "Create a Domestic quote" },
    { key: "courier", title: "Courier", subtitle: "Create a Courier quote" },
    { key: "multi_modal", title: "Multi Modal", subtitle: "Create a Multi Modal quote" },
    { key: "consolidation", title: "Consolidation", subtitle: "Create a Consolidation quote" },
  ]

  const BASE_MODE_ITEMS: SelectorItem[] = [
    { key: "air", title: "Air", subtitle: "Choose Air" },
    { key: "rail", title: "Rail", subtitle: "Choose Rail" },
    { key: "road", title: "Road", subtitle: "Choose Road" },
    { key: "sea", title: "Sea", subtitle: "Choose Sea" },
  ]

  const quoteType = ref<string | null>(null)
  const mode = ref<string | null>(null)

  const customerOptions = ref<CustomerOption[]>([
    {
      id: 1,
      company_name: "ABC Logistics",
      account_number: "ACC-0001",
      contact_person: "John Smith",
    },
    {
      id: 2,
      company_name: "Global Freight",
      account_number: "ACC-0002",
      contact_person: "Jane Doe",
    },
    {
      id: 3,
      company_name: "Pacific Cargo",
      account_number: "ACC-0003",
      contact_person: "Mark Lee",
    },
  ])

  const customerSuggestions = ref<CustomerOption[]>([])
  const selectedCustomer = ref<CustomerOption | null>(null)

  const form = ref<QuoteForm>({
    quote_ref: buildQuoteRef(),
    quote_date: new Date(),
    valid_until: null,

    customer_id: null,
    contact_person: "",

    quote_type: "",
    mode_of_transport: "",
    currency: "GBP",

    origin: "",
    destination: "",
    incoterm: "EXW",
    pieces: null,
    weight: null,
    volume: null,
    commodity: "",
    etd: null,
    eta: null,

    goods_description: "",
    sell_rate: null,
    cost_rate: null,
    markup_percent: null,
    note: "",
  })

  const currencyOptions: Option<string>[] = [
    { label: "GBP", value: "GBP" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
  ]

  const incotermOptions: Option<string>[] = [
    { label: "EXW", value: "EXW" },
    { label: "FCA", value: "FCA" },
    { label: "FOB", value: "FOB" },
    { label: "CIF", value: "CIF" },
    { label: "DAP", value: "DAP" },
    { label: "DDP", value: "DDP" },
  ]

  const showModeSelector = computed(() => {
    return !!quoteType.value && !isNoModeQuoteType(quoteType.value)
  })

  const canShowForm = computed(() => {
    if (!quoteType.value) return false
    if (!showModeSelector.value) return true
    return !!mode.value
  })

  const availableModes = computed<SelectorItem[]>(() => {
    if (!quoteType.value) return []

    if (quoteType.value === "courier") {
      return [{ key: "courier", title: "Courier", subtitle: "Choose Courier" }]
    }

    if (quoteType.value === "multi_modal" || quoteType.value === "consolidation") {
      return []
    }

    return BASE_MODE_ITEMS
  })

  const quoteTypeLabel = computed(() => {
    return QUOTE_TYPES.find(item => item.key === quoteType.value)?.title ?? ""
  })

  const modeLabel = computed(() => {
    if (isNoModeQuoteType(quoteType.value)) {
      return quoteTypeLabel.value
    }

    return availableModes.value.find(item => item.key === mode.value)?.title ?? ""
  })

  const accountNumberPreview = computed(() => {
    return selectedCustomer.value?.account_number ?? ""
  })

  const customerOptionLabel = (option: CustomerOption) => {
    return option?.company_name ?? ""
  }

  const subtotal = computed(() => {
    const sell = Number(form.value.sell_rate ?? 0)
    return sell
  })

  const profit = computed(() => {
    const sell = Number(form.value.sell_rate ?? 0)
    const cost = Number(form.value.cost_rate ?? 0)
    return sell - cost
  })

  const total = computed(() => {
    const sell = Number(form.value.sell_rate ?? 0)
    return sell
  })

  const subtotalDisplay = computed(() => {
    return formatMoney(subtotal.value, form.value.currency)
  })

  const profitDisplay = computed(() => {
    return formatMoney(profit.value, form.value.currency)
  })

  const totalDisplay = computed(() => {
    return formatMoney(total.value, form.value.currency)
  })

  function selectQuoteType(value: string) {
    quoteType.value = value
    mode.value = null

    form.value.quote_type = value
    form.value.mode_of_transport = ""

    if (value === "courier") {
      mode.value = "courier"
      form.value.mode_of_transport = "courier"
    }

    if (value === "multi_modal") {
      mode.value = "multi_modal"
      form.value.mode_of_transport = "multi_modal"
    }

    if (value === "consolidation") {
      mode.value = "consolidation"
      form.value.mode_of_transport = "consolidation"
    }
  }

  function selectMode(value: string) {
    mode.value = value
    form.value.mode_of_transport = value
  }

  function onCustomerComplete(event: { query: string }) {
    const query = String(event.query ?? "")
      .trim()
      .toLowerCase()

    if (!query) {
      customerSuggestions.value = [...customerOptions.value]
      return
    }

    customerSuggestions.value = customerOptions.value.filter(item => {
      return (
        item.company_name.toLowerCase().includes(query) ||
        item.account_number.toLowerCase().includes(query)
      )
    })
  }

  function onCustomerSelect() {
    form.value.customer_id = selectedCustomer.value?.id ?? null
    form.value.contact_person = selectedCustomer.value?.contact_person ?? ""
  }

  function onCustomerClear() {
    selectedCustomer.value = null
    form.value.customer_id = null
    form.value.contact_person = ""
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
      quote_type: quoteType.value ?? form.value.quote_type,
      mode_of_transport: mode.value ?? form.value.mode_of_transport,
    }

    console.log("Create quote payload:", payload)
  }

  function onCancel() {
    router.push("/quotes")
  }

  return {
    QUOTE_TYPES,
    availableModes,
    quoteType,
    mode,
    quoteTypeLabel,
    modeLabel,
    showModeSelector,
    canShowForm,
    selectQuoteType,
    selectMode,

    form,
    selectedCustomer,
    customerSuggestions,
    customerOptionLabel,
    accountNumberPreview,

    currencyOptions,
    incotermOptions,

    subtotalDisplay,
    profitDisplay,
    totalDisplay,

    onCustomerComplete,
    onCustomerSelect,
    onCustomerClear,
    onBrowseQuotes,
    onFindQuote,
    onSave,
    onCancel,
  }
}

function isNoModeQuoteType(value: string | null): boolean {
  return value === "multi_modal" || value === "consolidation"
}

function buildQuoteRef(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `QTE-${year}-${random}`
}

function formatMoney(value: number, currency: string): string {
  const amount = Number.isFinite(value) ? value : 0
  return `${currency} ${amount.toFixed(2)}`
}
