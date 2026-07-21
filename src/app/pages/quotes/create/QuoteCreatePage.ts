import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useCompanyStore } from "@/app/stores/company"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useContactStore } from "@/app/stores/contact"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import { useExchangeRateStore } from "@/app/stores/exchange-rates"
import type { CompanyReferenceSequence } from "@/app/types/company"
import type { Contact } from "@/app/types/contact"
import type { GlobalReferenceDataRow } from "@/app/types/globalReferenceData"
import type { ReferenceDataOption } from "@/app/types/referenceData"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type {
  QuoteAddressOption,
  QuoteAddressSourceType,
  QuoteChargeLine as ChargeLine,
  QuoteCreateTransportMode as TransportMode,
  QuoteCreateType as QuoteType,
  QuoteCustomerContact as CustomerContact,
  QuoteCustomerOption as CustomerOption,
  QuoteDestinationAddressOwner as DestinationAddressOwner,
  QuoteDimensionRow as DimensionRow,
  QuoteLocationField as LocationField,
  QuoteSelectOption as SelectOption,
  TransportQuote,
  TransportQuotePayload,
} from "@/app/types/transportQuote"
import { getPackageStackOption, setPackageStackOption } from "@/app/utils/packageStacking"
import { buildReferenceNumber } from "@/app/utils/reference-sequence"
import { useToast } from "primevue/usetoast"

const FALLBACK_CONDITIONS: Record<string, string> = {
  standard:
    "1. All rates quoted are subject to space and equipment availability.\n2. Rates are valid for the period stated and subject to change without notice thereafter.\n3. All charges are exclusive of applicable taxes unless otherwise stated.\n4. Claims for loss or damage must be submitted within 14 days of delivery.",
  air: "1. Air freight rates are based on chargeable weight.\n2. Rates do not include customs duties, taxes or government levies.\n3. Transit times are estimated and not guaranteed.\n4. Fuel and security surcharges are subject to change.",
  sea: "1. Ocean freight rates are subject to space and equipment availability.\n2. Port congestion surcharges may apply and will be charged at cost.\n3. Transit times are approximate and not guaranteed.\n4. Demurrage and detention charges will be charged as per carrier tariff.",
  hazardous:
    "1. All hazardous goods must be declared at time of booking with full MSDS documentation.\n2. DG surcharges apply and are in addition to standard freight rates.\n3. Proper shipping name, UN Number and Packing Group must be provided.",
}

const GLOBAL_REFERENCE_OPTION_LIMIT = 150
const NEW_QUOTE_RECOVERY_KEY = "orbis:quote-draft:new"

export function useQuoteCreatePage() {
  const route = useRoute()
  const router = useRouter()
  const quoteStore = useTransportQuoteStore()
  const companyStore = useCompanyStore()
  const chargeCodeStore = useChargeCodeStore()
  const contactStore = useContactStore()
  const globalReferenceDataStore = useGlobalReferenceDataStore()
  const referenceDataStore = useReferenceDataStore()
  const exchangeRateStore = useExchangeRateStore()
  const { data: globalReferenceData } = storeToRefs(globalReferenceDataStore)
  const toast = useToast()

  const loadingCustomers = ref(false)
  const customerSuggestions = ref<CustomerOption[]>([])
  const selectedCustomer = ref<CustomerOption | null>(null)
  const loadingDestinationCustomers = ref(false)
  const destinationCustomerSuggestions = ref<CustomerOption[]>([])
  const selectedDestinationCustomer = ref<CustomerOption | null>(null)
  const destinationAddressOwner = ref<DestinationAddressOwner>("selected_customer")
  const destinationAddressModalVisible = ref(false)
  const selectedContactIndex = ref<number | null>(null)
  const localError = ref<string | null>(null)
  const globalReferenceSearchTerm = ref("")
  const remoteGlobalReferenceRows = ref<Array<{ row: GlobalReferenceDataRow; category: string }>>(
    [],
  )
  let globalReferenceFetchTimer: number | null = null
  let globalReferenceFetchToken = 0
  let draftSavePromise: Promise<TransportQuote | null> | null = null
  let leaveDecisionPromise: Promise<boolean> | null = null
  let resolveLeaveDecision: ((allow: boolean) => void) | null = null
  let formReady = false
  let allowNavigation = false
  let changeVersion = 0

  const quoteId = computed(() => {
    const id = route.params.id
    if (!id) return null

    const parsed = Number(id)
    return Number.isFinite(parsed) ? parsed : null
  })

  const isEditMode = computed(() => Boolean(quoteId.value))
  const initializingEdit = ref(isEditMode.value)
  const activeDraftId = ref<number | null>(quoteId.value)
  const hasUnsavedChanges = ref(false)
  const hasQuoteActivity = ref(false)
  const autosaveState = ref<"idle" | "pending" | "saving" | "saved" | "error">("idle")
  const lastDraftSavedAt = ref<Date | null>(null)
  const leaveDraftDialogVisible = ref(false)
  const leaveDraftDialogSaving = ref(false)
  const copying = ref(false)
  const previewing = ref(false)
  const sellingCurrencyToBaseRate = ref(1)
  let sellingCurrencyRateToken = 0
  const saving = computed(() => quoteStore.saving || quoteStore.loading)
  const error = computed(() => localError.value || quoteStore.error)

  const pageTitle = computed(() =>
    isEditMode.value ? "Edit Freight Quotation" : "New Freight Quotation",
  )
  const pageStatusLabel = computed(() => quoteStore.selectedQuote?.status ?? "Draft")
  const saveButtonLabel = computed(() => (isEditMode.value ? "Update Quote" : "Submit Quote"))
  const autosaveStatus = computed(() => {
    if (autosaveState.value === "saving") return "Saving draft…"
    if (autosaveState.value === "pending") return "Unsaved changes"
    if (autosaveState.value === "error") return "Draft save failed — changes kept locally"
    if (lastDraftSavedAt.value) {
      return `Draft saved at ${lastDraftSavedAt.value.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    return "Draft saves only when requested"
  })

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
    origin_address_source_type: null as QuoteAddressSourceType | null,
    origin_address_source_id: null as number | null,
    destination_address_source_type: null as QuoteAddressSourceType | null,
    destination_address_source_id: null as number | null,
    etd: null as Date | null,
    eta: null as Date | null,
    commodity: "",
    insurance_level: "",
    vehicle_type: "",
    cargo_class: "",
    container_type: "",
    load_type: "",
    load_planner_enabled: true,
    goods_description: "",
    is_hazardous: false,
    hazardous_class: "",
    un_number: "",
    packing_group: "",
    conditions_preset: "",
    terms_conditions: "",
    validity_period: 30 as number | null,
    note: "",
    discount: 0,
    tax_rate: 20,
  })
  const validityInputValue = ref<number | string | null>(form.validity_period)
  const validityInputFocused = ref(false)

  const dimensionRows = ref<DimensionRow[]>([])
  const buyCostLines = ref<ChargeLine[]>([])
  const sellChargeLines = ref<ChargeLine[]>([])
  const supplierContacts = ref<Contact[]>([])
  const suppliersLoading = ref(false)

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

  const globalReferenceRows = computed(() => {
    const rows = [
      ...remoteGlobalReferenceRows.value,
      ...globalReferenceData.value.locations.map(row => ({
        row,
        category: "Delivery Location",
      })),
      ...globalReferenceData.value.terminals.map(row => ({ row, category: "Terminal" })),
      ...globalReferenceData.value.cities.map(row => ({ row, category: "City" })),
    ]

    return uniqueReferenceRows(rows)
  })

  const visibleGlobalReferenceOptions = computed<SelectOption[]>(() => {
    const query = normalizeSearch(globalReferenceSearchTerm.value)
    const options: SelectOption[] = []
    const usedValues = new Set<string>()

    for (const entry of globalReferenceRows.value) {
      if (options.length >= GLOBAL_REFERENCE_OPTION_LIMIT) break
      if (query && !rowMatchesSearch(entry.row, entry.category, query)) continue

      const option = referenceOption(entry.row, entry.category)

      if (!option.value || usedValues.has(option.value)) continue

      usedValues.add(option.value)
      options.push(option)
    }

    return options
  })

  const originLocationOptions = computed<SelectOption[]>(() => visibleGlobalReferenceOptions.value)
  const destinationLocationOptions = computed<SelectOption[]>(
    () => visibleGlobalReferenceOptions.value,
  )

  const destinationAddressOwnerOptions: SelectOption<DestinationAddressOwner>[] = [
    { label: "Selected customer", value: "selected_customer" },
    { label: "Other customer", value: "other_customer" },
  ]
  const destinationAddressCustomer = computed(() =>
    destinationAddressOwner.value === "other_customer"
      ? selectedDestinationCustomer.value
      : selectedCustomer.value,
  )
  const originAddressOptions = computed<QuoteAddressOption[]>(() =>
    customerAddressOptions(selectedCustomer.value, "origin"),
  )
  const destinationAddressOptions = computed<QuoteAddressOption[]>(() =>
    customerAddressOptions(destinationAddressCustomer.value, "destination"),
  )
  const destinationCustomerOptions = computed(() => {
    const customers = [
      selectedDestinationCustomer.value,
      ...destinationCustomerSuggestions.value,
    ].filter((customer): customer is CustomerOption => Boolean(customer))
    const unique = new Map<number, CustomerOption>()

    customers.forEach(customer => unique.set(Number(customer.id), customer))

    return Array.from(unique.values()).map(customer => ({
      label: customer.name,
      value: Number(customer.id),
    }))
  })
  const originAddressSelection = computed(() =>
    addressSourceValue(form.origin_address_source_type, form.origin_address_source_id),
  )
  const destinationAddressSelection = computed(() =>
    addressSourceValue(form.destination_address_source_type, form.destination_address_source_id),
  )
  const destinationAddressSelectionLabel = computed(() => {
    return (
      destinationAddressOptions.value.find(
        option => option.value === destinationAddressSelection.value,
      )?.label ?? "No destination address selected"
    )
  })

  function customerAddressOptions(
    customer: CustomerOption | null,
    target: LocationField,
  ): QuoteAddressOption[] {
    if (!customer || typeof customer !== "object") return []

    const collectionAddresses = (
      Array.isArray(customer.collection_addresses) ? customer.collection_addresses : []
    )
      .filter(address =>
        target === "origin" ? Boolean(address.is_collection) : Boolean(address.is_delivery),
      )
      .map(address =>
        addressOption("collection_address", address.id, address.label, [
          address.address_line_1,
          address.address_line_2,
          address.city,
          address.postal_code,
        ]),
      )
    const branches = (Array.isArray(customer.branches) ? customer.branches : []).map(branch =>
      addressOption("branch", branch.id, branch.name, [
        branch.delivery_address_line_1,
        branch.delivery_address_line_2,
        branch.delivery_city,
        branch.delivery_postal_code,
      ]),
    )

    return [...branches, ...collectionAddresses]
  }

  function addressOption(
    sourceType: QuoteAddressSourceType,
    sourceId: number,
    name: string | null | undefined,
    parts: Array<string | null | undefined>,
  ): QuoteAddressOption {
    const address = parts.filter(Boolean).join(", ")
    const sourceLabel = sourceType === "branch" ? "Branch" : "Saved address"

    return {
      label: [name || sourceLabel, address].filter(Boolean).join(" — "),
      value: `${sourceType}:${sourceId}`,
      sourceType,
      sourceId: Number(sourceId),
    }
  }

  function addressSourceValue(
    sourceType: QuoteAddressSourceType | null,
    sourceId: number | null,
  ): string | null {
    return sourceType && sourceId ? `${sourceType}:${sourceId}` : null
  }

  function updateAddressSource(target: LocationField, value: string | null) {
    const option = (
      target === "origin" ? originAddressOptions.value : destinationAddressOptions.value
    ).find(item => item.value === value)
    const typeKey = `${target}_address_source_type` as const
    const idKey = `${target}_address_source_id` as const

    form[typeKey] = option?.sourceType ?? null
    form[idKey] = option?.sourceId ?? null
  }

  const contactOptions = computed<SelectOption<number>[]>(() => {
    if (!selectedCustomer.value) return []

    return selectedCustomer.value.contacts.map((contact, index) => ({
      label: [
        contact.name || selectedCustomer.value?.name || `Contact ${index + 1}`,
        contact.location,
      ]
        .filter(Boolean)
        .join(" — "),
      value: index,
    }))
  })

  function referenceOptionsFor(categoryKey: string): SelectOption[] {
    return (referenceDataStore.getByKey(categoryKey)?.options ?? [])
      .filter(option => option.is_active !== false)
      .map(option => cleanReferenceName(option.name))
      .filter(Boolean)
      .map(name => ({ label: name, value: name }))
  }

  const baseCurrency = computed(() =>
    String(
      companyStore.item?.settings?.main_currency_code ??
        companyStore.item?.default_currency_code ??
        "GBP",
    ).toUpperCase(),
  )
  const currencyOptions = computed<SelectOption[]>(() => {
    const configured = [baseCurrency.value, ...(companyStore.item?.additional_currencies ?? [])]
      .map(value =>
        String(value || "")
          .trim()
          .toUpperCase(),
      )
      .filter(Boolean)
    const values = configured.length
      ? [...new Set(configured)]
      : referenceOptionsFor("currency").map(option => String(option.value).toUpperCase())

    return values.map(value => ({ label: value, value }))
  })
  const incotermOptions = computed<SelectOption[]>(() => referenceOptionsFor("incoterms"))
  const vehicleTypeOptions = computed<SelectOption[]>(() => referenceOptionsFor("vehicle_types"))
  const commodityTypeOptions = computed<SelectOption[]>(() =>
    referenceOptionsFor("commodity_types"),
  )
  const insuranceLevelOptions: SelectOption[] = [
    { label: "Standard Conditions", value: "Standard Conditions" },
    { label: "Enhanced Cover", value: "Enhanced Cover" },
    { label: "Full Declared Value", value: "Full Declared Value" },
    { label: "Customer's Own Insurance", value: "Customer's Own Insurance" },
  ]
  const validityOptions: SelectOption<number>[] = [7, 15, 30].map(value => ({
    label: `${value} days`,
    value,
  }))
  const goodsDescriptionOptions = computed<SelectOption[]>(() =>
    referenceOptionsFor("quote_goods_descriptions"),
  )

  const selectedVehicleLoadSpace = computed<Record<string, unknown> | null>(() => {
    const selectedName = normalizeSearch(form.vehicle_type)
    if (!selectedName) return null

    const option = referenceDataStore
      .getByKey("vehicle_types")
      ?.options.find(item => normalizeSearch(cleanReferenceName(item.name)) === selectedName)

    return (option as ReferenceDataOption | undefined)?.metadata ?? null
  })

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

  const chargeDescriptionOptions = computed<SelectOption[]>(() =>
    chargeCodeStore.chargeCodes.map(charge => ({
      label: charge.description,
      value: charge.description,
    })),
  )
  const chargeDescriptionsLoading = computed(() => chargeCodeStore.loading)
  const supplierOptions = computed<SelectOption<number>[]>(() =>
    supplierContacts.value.map(contact => ({
      label: contact.company_name || `Contact ${contact.id}`,
      value: Number(contact.id),
    })),
  )

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

  const conditionsOptions = computed<SelectOption[]>(() => {
    const configured = referenceDataStore.getByKey("quote_terms_conditions")?.options ?? []

    if (configured.length) {
      return configured
        .filter(option => option.is_active !== false)
        .map(option => ({ label: option.name, value: option.name }))
    }

    return [
      { label: "Standard Freight Terms", value: "standard" },
      { label: "Air Freight Conditions", value: "air" },
      { label: "Sea Freight Conditions", value: "sea" },
      { label: "Hazardous Goods Terms", value: "hazardous" },
    ]
  })

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

  function firstValue(row: GlobalReferenceDataRow, keys: string[]): string {
    for (const key of keys) {
      const value = row[key]?.trim()

      if (value) return value
    }

    return ""
  }

  function normalizeSearch(value: string): string {
    return value.trim().toLowerCase()
  }

  function referenceValue(row: GlobalReferenceDataRow): string {
    const name = firstValue(row, [
      "terminalName",
      "terminal_name",
      "airportName",
      "airport_name",
      "portName",
      "port_name",
      "fullName",
      "full_name",
      "city",
      "location",
      "name",
    ])
    const code = firstValue(row, [
      "code",
      "iata",
      "iataCode",
      "iata_code",
      "icao",
      "awb",
      "unlocode",
    ])

    return name || code
  }

  function referenceOption(row: GlobalReferenceDataRow, category: string): SelectOption {
    const name = referenceValue(row)
    const code = firstValue(row, [
      "code",
      "iata",
      "iataCode",
      "iata_code",
      "icao",
      "awb",
      "unlocode",
    ])
    const type = firstValue(row, ["type", "function"])
    const place = firstValue(row, ["location", "city", "state", "fleet", "municipality"])
    const country = firstValue(row, ["country", "countryName", "country_name"])
    const region = firstValue(row, ["region"])
    const value = name || code
    const label = labelWithCode(name, code)
    const subLabel = [category, type, place, country, region].filter(Boolean).join(" | ")

    return {
      label,
      value,
      subLabel,
      searchText: searchText(row, [category, label, value, subLabel]),
    }
  }

  function rowMatchesSearch(row: GlobalReferenceDataRow, category: string, query: string): boolean {
    return normalizeSearch(searchText(row, [category])).includes(query)
  }

  function onGlobalReferenceComplete(event: { query?: string }) {
    globalReferenceSearchTerm.value = event.query ?? ""
    void fetchGlobalReferenceOptions()
  }

  function updateLocationValue(field: LocationField, value: unknown) {
    const nextValue =
      value && typeof value === "object" && "value" in value
        ? String((value as SelectOption).value ?? "")
        : String(value ?? "")

    form[field] = nextValue
    globalReferenceSearchTerm.value = nextValue
  }

  async function fetchGlobalReferenceOptions(delay = 0) {
    if (globalReferenceFetchTimer) {
      window.clearTimeout(globalReferenceFetchTimer)
      globalReferenceFetchTimer = null
    }

    if (delay > 0) {
      globalReferenceFetchTimer = window.setTimeout(() => fetchGlobalReferenceOptions(), delay)
      return
    }

    const token = ++globalReferenceFetchToken

    try {
      const response = await globalReferenceDataStore.list({
        category: "locations",
        mode: mode.value || undefined,
        search: globalReferenceSearchTerm.value.trim() || undefined,
        per_page: GLOBAL_REFERENCE_OPTION_LIMIT,
        page: 1,
        compact: true,
      })

      if (token !== globalReferenceFetchToken) return

      remoteGlobalReferenceRows.value = response.rows.map(row => ({
        row,
        category: referenceCategoryLabel(row.category),
      }))
    } catch (error) {
      console.error("Unable to load quote global reference options", error)
    }
  }

  function cleanReferenceName(value: string): string {
    return String(value ?? "")
      .replace(/\*$/, "")
      .trim()
  }

  function selectQuoteChargeDescription(line: ChargeLine, value: unknown) {
    line.description = String(value ?? "").trim()

    if (line.type === "buy") syncBuyLineToSell(line)
  }

  function syncQuoteChargeDescriptionFilter(
    line: ChargeLine,
    event: { value?: unknown } | unknown,
  ) {
    const value =
      event && typeof event === "object" && "value" in event ? (event as any).value : event

    selectQuoteChargeDescription(line, value)
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
    dimensionRows.value.reduce((total, row) => total + getRowActualWeight(row), 0),
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
  const subtotalCostInSellCurrency = computed(() => {
    if (form.currency === baseCurrency.value) return subtotalCost.value
    if (sellingCurrencyToBaseRate.value <= 0) return null

    return subtotalCost.value / sellingCurrencyToBaseRate.value
  })
  const totalExclTax = computed(() => Math.max(subtotalSell.value, 0))
  const taxAmount = computed(() => totalExclTax.value * (Number(form.tax_rate || 0) / 100))
  const totalInclTax = computed(() => totalExclTax.value + taxAmount.value)
  const profitTotal = computed(() =>
    subtotalCostInSellCurrency.value === null
      ? 0
      : totalExclTax.value - subtotalCostInSellCurrency.value,
  )
  const profitPercent = computed(() =>
    totalExclTax.value <= 0 || subtotalCostInSellCurrency.value === null
      ? 0
      : (profitTotal.value / totalExclTax.value) * 100,
  )

  const subtotalSellDisplay = computed(() => money(subtotalSell.value))
  const subtotalCostDisplay = computed(() => money(subtotalCost.value, baseCurrency.value))
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
    remoteGlobalReferenceRows.value = []
    void fetchGlobalReferenceOptions()

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

  async function onDestinationCustomerComplete(event: { query: string }) {
    await fetchDestinationCustomers(event.query)
  }

  function onCustomerSelect(event: { value: CustomerOption }) {
    selectedCustomer.value = event.value
    form.customer_id = event.value.id
    selectedContactIndex.value = event.value.contacts.length ? 0 : null
    clearAddressSources()
  }

  function onCustomerClear() {
    selectedCustomer.value = null
    selectedContactIndex.value = null
    form.customer_id = null
    form.contact_name = ""
    form.contact_email = ""
    form.contact_phone = ""
    clearAddressSources()
  }

  function onDestinationAddressOwnerChange(value: DestinationAddressOwner) {
    destinationAddressOwner.value = value
    selectedDestinationCustomer.value = null
    destinationCustomerSuggestions.value = []
    clearDestinationAddressSource()
  }

  function openDestinationAddressModal() {
    destinationAddressModalVisible.value = true

    if (
      destinationAddressOwner.value === "other_customer" &&
      !destinationCustomerSuggestions.value.length
    ) {
      void fetchDestinationCustomers("")
    }
  }

  function onDestinationCustomerIdChange(customerId: number | null) {
    if (!customerId) {
      onDestinationCustomerClear()
      return
    }

    const customer = [
      selectedDestinationCustomer.value,
      ...destinationCustomerSuggestions.value,
    ].find(option => Number(option?.id) === Number(customerId))

    if (customer) onDestinationCustomerSelect({ value: customer })
  }

  function onDestinationCustomerSelect(event: { value: CustomerOption }) {
    selectedDestinationCustomer.value = event.value
    clearDestinationAddressSource()
  }

  function onDestinationCustomerClear() {
    selectedDestinationCustomer.value = null
    clearDestinationAddressSource()
  }

  function clearDestinationAddressSource() {
    form.destination_address_source_type = null
    form.destination_address_source_id = null
  }

  function clearAddressSources() {
    form.origin_address_source_type = null
    form.origin_address_source_id = null
    clearDestinationAddressSource()
    destinationAddressOwner.value = "selected_customer"
    selectedDestinationCustomer.value = null
    destinationCustomerSuggestions.value = []
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

  function getRowActualWeight(row: DimensionRow) {
    return Number(row.weight || 0) * Number(row.pieces || 0)
  }

  function getRowLdm(row: DimensionRow) {
    return (
      (Number(row.length || 0) * Number(row.width || 0) * Number(row.pieces || 0)) / 10000 / 2.4
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
      currency: baseCurrency.value,
      exchange_rate: 1,
      supplier_id: null,
      markup_percent: 0,
      add_to_sell: false,
      linked_sell_line_id: null,
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
      source_buy_line_id: null,
    })
  }

  function removeBuyCostLine(id: number) {
    const line = buyCostLines.value.find(item => item.id === id)
    if (line?.linked_sell_line_id) {
      sellChargeLines.value = sellChargeLines.value.filter(
        item => item.id !== line.linked_sell_line_id,
      )
    }

    buyCostLines.value = buyCostLines.value.filter(line => line.id !== id)
  }

  function removeSellChargeLine(id: number) {
    const line = sellChargeLines.value.find(item => item.id === id)
    const source = buyCostLines.value.find(
      item => item.id === line?.source_buy_line_id || item.linked_sell_line_id === id,
    )

    if (source) {
      source.add_to_sell = false
      source.linked_sell_line_id = null
    }

    sellChargeLines.value = sellChargeLines.value.filter(line => line.id !== id)
  }

  function linkedSellLine(line: ChargeLine): ChargeLine | undefined {
    return sellChargeLines.value.find(
      sellLine =>
        sellLine.id === line.linked_sell_line_id || sellLine.source_buy_line_id === line.id,
    )
  }

  function syncBuyLineToSell(line: ChargeLine) {
    if (!line.add_to_sell) return

    let sellLine = linkedSellLine(line)
    if (!sellLine) {
      const description = String(line.description || "")
        .trim()
        .toLowerCase()

      sellLine = sellChargeLines.value.find(
        item =>
          !item.source_buy_line_id &&
          Number(item.unit_price || 0) === 0 &&
          String(item.description || "")
            .trim()
            .toLowerCase() === description,
      )
    }

    if (!sellLine) {
      sellLine = {
        id: Date.now() + Math.random(),
        type: "sell",
        description: line.description,
        qty: Number(line.qty || 0),
        uom: line.uom,
        unit_price: 0,
        currency: form.currency || baseCurrency.value,
        exchange_rate: 1,
        vat_rate: 0,
        source_buy_line_id: line.id,
      }
      sellChargeLines.value.push(sellLine)
    }

    const unitCost = Number(line.unit_cost || 0)
    const markup = Math.max(0, Number(line.markup_percent || 0))
    const sellingCurrency = String(form.currency || baseCurrency.value).toUpperCase()
    const companyBaseCurrency = String(baseCurrency.value).toUpperCase()
    const buyToBaseRate = Number(line.exchange_rate || 0)
    const sellToBaseRate =
      sellingCurrency === companyBaseCurrency ? 1 : Number(sellingCurrencyToBaseRate.value || 0)

    sellLine.description = line.description
    sellLine.qty = Number(line.qty || 0)
    sellLine.uom = line.uom
    sellLine.currency = sellingCurrency
    sellLine.exchange_rate = 1
    sellLine.source_buy_line_id = line.id
    line.linked_sell_line_id = sellLine.id

    if (buyToBaseRate <= 0 || sellToBaseRate <= 0) {
      sellLine.unit_price = 0
      return
    }

    const markedUpBaseUnitCost = unitCost * buyToBaseRate * (1 + markup / 100)
    sellLine.unit_price = Math.round((markedUpBaseUnitCost / sellToBaseRate) * 100) / 100
  }

  function syncAllBuyLinesToSell() {
    buyCostLines.value.forEach(line => {
      if (line.add_to_sell) syncBuyLineToSell(line)
    })
  }

  function toggleBuyLineAddToSell(line: ChargeLine, checked: boolean) {
    line.add_to_sell = checked

    if (checked) {
      syncBuyLineToSell(line)
      return
    }

    const sellLine = linkedSellLine(line)
    if (sellLine) {
      sellChargeLines.value = sellChargeLines.value.filter(item => item.id !== sellLine.id)
    }
    line.linked_sell_line_id = null
  }

  function restoreBuySellLinks() {
    const claimedSellIds = new Set<number>()

    buyCostLines.value.forEach(buyLine => {
      if (!buyLine.add_to_sell) return

      const match = sellChargeLines.value.find(
        sellLine =>
          !claimedSellIds.has(sellLine.id) &&
          sellLine.description.trim().toLowerCase() === buyLine.description.trim().toLowerCase(),
      )

      if (match) {
        claimedSellIds.add(match.id)
        buyLine.linked_sell_line_id = match.id
        match.source_buy_line_id = buyLine.id
      } else {
        syncBuyLineToSell(buyLine)
      }
    })
  }

  function getChargeLineTotal(line: ChargeLine) {
    const amount = line.type === "buy" ? line.unit_cost : line.unit_price

    return Number(line.qty || 0) * Number(amount || 0) * Number(line.exchange_rate || 1)
  }

  async function updateChargeExchangeRate(line: ChargeLine, notify = true) {
    const source = String(line.currency || "").toUpperCase()
    const target = line.type === "buy" ? baseCurrency.value : String(form.currency).toUpperCase()

    if (!source || source === target) {
      line.exchange_rate = 1
      syncBuyLineToSell(line)
      return
    }

    try {
      const rate = await exchangeRateStore.fetchEffective({
        base: source,
        quote: target,
        date: toApiDate(form.quote_date) ?? new Date().toISOString().slice(0, 10),
      })

      line.exchange_rate = Number(rate?.rate || 0)
      syncBuyLineToSell(line)
    } catch {
      line.exchange_rate = 0
      if (notify) {
        toast.add({
          severity: "warn",
          summary: "Missing Exchange Rate",
          detail: `Add the ${source} to ${target} rate in Accounts > Exchange Rates before using this cost.`,
          life: 4500,
        })
      }
    }
  }

  async function updateSellingCurrencyExchangeRate(notify = true) {
    const source = String(form.currency || baseCurrency.value).toUpperCase()
    const target = baseCurrency.value
    const token = ++sellingCurrencyRateToken

    if (source === target) {
      sellingCurrencyToBaseRate.value = 1
      syncAllBuyLinesToSell()
      return
    }

    try {
      const rate = await exchangeRateStore.fetchEffective({
        base: source,
        quote: target,
        date: toApiDate(form.quote_date) ?? new Date().toISOString().slice(0, 10),
      })

      if (token === sellingCurrencyRateToken) {
        sellingCurrencyToBaseRate.value = Number(rate?.rate || 0)
        syncAllBuyLinesToSell()
      }
    } catch {
      if (token !== sellingCurrencyRateToken) return

      sellingCurrencyToBaseRate.value = 0
      if (notify) {
        toast.add({
          severity: "warn",
          summary: "Missing Exchange Rate",
          detail: `Add the ${source} to ${target} rate in Accounts > Exchange Rates before using this selling currency.`,
          life: 4500,
        })
      }
    }
  }

  function onSellCurrencyChange(line: ChargeLine) {
    const currency = String(line.currency || form.currency || baseCurrency.value).toUpperCase()
    form.currency = currency
    sellChargeLines.value.forEach(item => {
      item.currency = currency
      item.exchange_rate = 1
    })
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
    const configured = referenceDataStore
      .getByKey("quote_terms_conditions")
      ?.options.find(option => option.name === form.conditions_preset)
    const content = configured?.metadata?.content

    form.terms_conditions =
      (typeof content === "string" ? content : null) ??
      FALLBACK_CONDITIONS[form.conditions_preset] ??
      ""
  }

  function recoveryKey(id = activeDraftId.value ?? quoteId.value): string {
    return id ? `orbis:quote-draft:${id}` : NEW_QUOTE_RECOVERY_KEY
  }

  function saveLocalRecovery() {
    if (!hasUnsavedChanges.value) return

    const formSnapshot = {
      ...form,
      quote_date: toApiDate(form.quote_date),
      follow_up_date: toApiDate(form.follow_up_date),
      valid_until: toApiDate(form.valid_until),
      etd: toApiDate(form.etd),
      eta: toApiDate(form.eta),
    }

    try {
      window.localStorage.setItem(
        recoveryKey(),
        JSON.stringify({
          saved_at: new Date().toISOString(),
          quote_type: quoteType.value,
          mode: mode.value,
          form: formSnapshot,
          selected_customer: selectedCustomer.value,
          destination_address_owner: destinationAddressOwner.value,
          selected_destination_customer: selectedDestinationCustomer.value,
          selected_contact_index: selectedContactIndex.value,
          dimensions: dimensionRows.value,
          buy_costs: buyCostLines.value,
          sell_charges: sellChargeLines.value,
        }),
      )
    } catch {
      // Browser recovery is optional and must never trigger a server save.
    }
  }

  function restoreLocalRecovery(): boolean {
    const key = quoteId.value ? recoveryKey(quoteId.value) : NEW_QUOTE_RECOVERY_KEY
    let raw: string | null = null

    try {
      raw = window.localStorage.getItem(key)
    } catch {
      return false
    }

    if (!raw) return false

    try {
      const snapshot = JSON.parse(raw)
      if (isQuoteType(snapshot.quote_type)) quoteType.value = snapshot.quote_type
      if (isTransportMode(snapshot.mode)) mode.value = snapshot.mode

      if (snapshot.form && typeof snapshot.form === "object") {
        Object.assign(form, snapshot.form)
        form.quote_date = fromApiDate(snapshot.form.quote_date) ?? new Date()
        form.follow_up_date = fromApiDate(snapshot.form.follow_up_date)
        form.valid_until = fromApiDate(snapshot.form.valid_until)
        form.validity_period = normaliseValidityPeriod(snapshot.form.validity_period)
        form.etd = fromApiDate(snapshot.form.etd)
        form.eta = fromApiDate(snapshot.form.eta)
      }

      selectedCustomer.value = snapshot.selected_customer ?? null
      destinationAddressOwner.value =
        snapshot.destination_address_owner === "other_customer"
          ? "other_customer"
          : "selected_customer"
      selectedDestinationCustomer.value = snapshot.selected_destination_customer ?? null
      selectedContactIndex.value = snapshot.selected_contact_index ?? null
      dimensionRows.value = Array.isArray(snapshot.dimensions) ? snapshot.dimensions : []
      buyCostLines.value = Array.isArray(snapshot.buy_costs) ? snapshot.buy_costs : []
      sellChargeLines.value = Array.isArray(snapshot.sell_charges) ? snapshot.sell_charges : []

      hasUnsavedChanges.value = true
      hasQuoteActivity.value = true
      autosaveState.value = "pending"
      return true
    } catch {
      try {
        window.localStorage.removeItem(key)
      } catch {
        // Ignore unavailable browser storage.
      }
      return false
    }
  }

  function removeLocalRecovery() {
    try {
      window.localStorage.removeItem(NEW_QUOTE_RECOVERY_KEY)
      const id = activeDraftId.value ?? quoteId.value
      if (id) window.localStorage.removeItem(recoveryKey(id))
    } catch {
      // Browser storage may be unavailable; navigation can still continue.
    }
  }

  function validateDraftRequired(notify = false): boolean {
    const missing = !quoteType.value
      ? {
          message: "Please select a quote type.",
          summary: "Quote Type Required",
        }
      : !mode.value
        ? {
            message: "Please select a mode of transport.",
            summary: "Mode Required",
          }
        : null

    if (!missing) return true
    if (!notify) return false

    localError.value = missing.message
    toast.add({
      severity: "warn",
      summary: missing.summary,
      detail: missing.message,
      life: 3000,
    })
    return false
  }

  async function saveDraft(options: { notify?: boolean; updateRoute?: boolean } = {}) {
    const notify = Boolean(options.notify)
    localError.value = null

    if (!validateDraftRequired(notify)) return null

    if (draftSavePromise) {
      try {
        await draftSavePromise
      } catch {
        // The active save reports its own error and keeps a local recovery copy.
      }
      if (!hasUnsavedChanges.value && quoteStore.selectedQuote) {
        if (notify) {
          toast.add({
            severity: "success",
            summary: "Draft Saved",
            detail: `${quoteStore.selectedQuote.quote_ref || `QUOTE-${quoteStore.selectedQuote.id}`} is safely saved as a draft.`,
            life: 3000,
          })
        }
        return quoteStore.selectedQuote
      }
    }

    const versionBeingSaved = changeVersion
    const existingId = activeDraftId.value ?? quoteId.value
    autosaveState.value = "saving"

    draftSavePromise = (async () => {
      const payload = buildPayload() as TransportQuotePayload
      return existingId
        ? quoteStore.updateQuote(existingId, payload)
        : quoteStore.createQuote(payload)
    })()

    try {
      const quote = await draftSavePromise
      if (!quote) return null

      activeDraftId.value = quote.id
      lastDraftSavedAt.value = new Date()
      autosaveState.value = "saved"

      try {
        window.localStorage.removeItem(NEW_QUOTE_RECOVERY_KEY)
        window.localStorage.removeItem(recoveryKey(quote.id))
      } catch {
        // The server draft is already saved even if browser storage cleanup fails.
      }

      if (versionBeingSaved === changeVersion) {
        hasUnsavedChanges.value = false
      } else {
        saveLocalRecovery()
        autosaveState.value = "pending"
      }

      if (!existingId && options.updateRoute && route.name === "tms.quotes.create") {
        allowNavigation = true
        try {
          await router.replace({ name: "tms.quotes.edit", params: { id: quote.id } })
        } finally {
          allowNavigation = false
        }
      }

      if (notify) {
        toast.add({
          severity: "success",
          summary: "Draft Saved",
          detail: `${quote.quote_ref || `QUOTE-${quote.id}`} is safely saved as a draft.`,
          life: 3000,
        })
      }

      return quote
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Unable to save quotation draft."
      autosaveState.value = "error"
      localError.value = notify ? message : null
      saveLocalRecovery()

      if (notify) {
        toast.add({
          severity: "error",
          summary: "Draft Save Failed",
          detail: `${message} Your changes are still kept locally in this browser.`,
          life: 5000,
        })
      }

      return null
    } finally {
      draftSavePromise = null
    }
  }

  function onBrowseQuotes() {
    router.push({ name: "tms.quotes.index" })
  }

  function onFindQuote() {
    router.push({ name: "tms.quotes.index" })
  }

  async function onCopyQuote() {
    if (copying.value) return

    copying.value = true

    try {
      let id = activeDraftId.value ?? quoteId.value

      if (!id) {
        const savedQuote = await saveDraft({ updateRoute: true })
        if (!savedQuote) return
        id = savedQuote.id
      }

      const copy = await quoteStore.duplicateQuote(id)
      allowNavigation = true
      await router.push({ name: "tms.quotes.edit", params: { id: copy.id } })
      toast.add({
        severity: "success",
        summary: "Quotation Copied",
        detail: `New draft ${copy.quote_ref} is ready to edit.`,
        life: 3000,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Copy Failed",
        detail: error?.response?.data?.message ?? "Unable to copy this quotation.",
        life: 4000,
      })
    } finally {
      copying.value = false
    }
  }

  async function onPreviewQuote() {
    if (previewing.value) return

    previewing.value = true

    try {
      const quote = await saveDraft({ updateRoute: true })
      if (!quote) return

      const blob = await quoteStore.quotePdf(quote.id)
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank", "noopener,noreferrer")
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Preview Failed",
        detail: error?.response?.data?.message ?? "Unable to generate the quotation preview.",
        life: 4000,
      })
    } finally {
      previewing.value = false
    }
  }

  async function onSave() {
    if (!validateDraftRequired(true)) return

    const wasExistingQuote = Boolean(activeDraftId.value ?? quoteId.value)
    const quote = await saveDraft({ updateRoute: false })
    if (!quote) return

    toast.add({
      severity: "success",
      summary: wasExistingQuote ? "Quotation Updated" : "Quotation Created",
      detail: `${quote.quote_ref || `QUOTE-${quote.id}`} saved successfully.`,
      life: 3000,
    })

    setTimeout(() => {
      allowNavigation = true
      router.push({
        name: "tms.quotes.show",
        params: { id: quote.id },
      })
    }, 700)
  }

  async function onSaveDraft() {
    await saveDraft({ notify: true, updateRoute: true })
  }

  function requestLeaveDecision(): Promise<boolean> {
    if (leaveDecisionPromise) return leaveDecisionPromise

    leaveDraftDialogVisible.value = true
    leaveDecisionPromise = new Promise<boolean>(resolve => {
      resolveLeaveDecision = resolve
    })

    return leaveDecisionPromise
  }

  function completeLeaveDecision(allow: boolean) {
    const resolve = resolveLeaveDecision
    resolveLeaveDecision = null
    leaveDecisionPromise = null
    leaveDraftDialogVisible.value = false
    resolve?.(allow)
  }

  async function saveDraftAndLeave() {
    leaveDraftDialogSaving.value = true

    try {
      const quote = await saveDraft({ notify: true, updateRoute: false })
      if (quote) completeLeaveDecision(true)
    } finally {
      leaveDraftDialogSaving.value = false
    }
  }

  function leaveWithoutSavingLatestChanges() {
    hasUnsavedChanges.value = false
    removeLocalRecovery()
    completeLeaveDecision(true)
  }

  function stayOnQuote() {
    completeLeaveDecision(false)
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
      origin_address_source_type: form.origin_address_source_type,
      origin_address_source_id: form.origin_address_source_id,
      destination_address_source_type: form.destination_address_source_type,
      destination_address_source_id: form.destination_address_source_id,
      etd: toApiDate(form.etd),
      eta: toApiDate(form.eta),

      commodity: form.commodity || null,
      insurance_level: form.insurance_level || null,
      vehicle_type: form.vehicle_type || null,
      cargo_class: form.cargo_class || null,
      container_type: form.container_type || null,
      load_type: form.load_type || null,
      load_planner_enabled: Boolean(form.load_planner_enabled),
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
        supplier_id: line.type === "buy" ? line.supplier_id || null : null,
        description: line.description || null,
        qty: Number(line.qty || 0),
        uom: line.uom || null,
        cost: Number(line.unit_cost ?? line.unit_price ?? 0),
        unit_cost: line.type === "buy" ? Number(line.unit_cost || 0) : null,
        unit_price: line.type === "sell" ? Number(line.unit_price || 0) : null,
        currency: line.currency || form.currency || null,
        exchange_rate: Number(line.exchange_rate || 1),
        vat_rate: line.type === "sell" ? Number(line.vat_rate || 0) : null,
        markup_percent: line.type === "buy" ? Number(line.markup_percent || 0) : 0,
        add_to_sell: line.type === "buy" && Boolean(line.add_to_sell),
      })),
    } as any
  }

  async function fetchCustomers(query = "") {
    loadingCustomers.value = true

    try {
      const response = await contactStore.query({
        q: query || undefined,
        per_page: 20,
        include_addresses: true,
      })

      const rows = response.data ?? []
      customerSuggestions.value = Array.isArray(rows) ? rows.map(mapContactToCustomerOption) : []
    } catch {
      customerSuggestions.value = []
    } finally {
      loadingCustomers.value = false
    }
  }

  async function fetchDestinationCustomers(query = "") {
    loadingDestinationCustomers.value = true

    try {
      const response = await contactStore.query({
        q: query || undefined,
        per_page: 20,
        include_addresses: true,
      })
      const rows = response.data ?? []

      destinationCustomerSuggestions.value = Array.isArray(rows)
        ? rows
            .map(mapContactToCustomerOption)
            .filter(customer => customer.id !== selectedCustomer.value?.id)
        : []
    } catch {
      destinationCustomerSuggestions.value = []
    } finally {
      loadingDestinationCustomers.value = false
    }
  }

  async function fetchSuppliers() {
    suppliersLoading.value = true

    try {
      const firstResponse = await contactStore.query({ page: 1, per_page: 500 })
      const contacts = [...(firstResponse.data ?? [])]
      const lastPage = Number(firstResponse.meta?.last_page ?? 1)

      for (let page = 2; page <= lastPage; page += 1) {
        const response = await contactStore.query({ page, per_page: 500 })
        contacts.push(...(response.data ?? []))
      }

      supplierContacts.value = contacts
    } catch {
      supplierContacts.value = []
    } finally {
      suppliersLoading.value = false
    }
  }

  function mapContactToCustomerOption(item: any): CustomerOption {
    const companyName = item.company_name ?? item.name ?? item.full_name ?? "Unnamed Customer"
    const contacts: CustomerContact[] = []

    const addContact = (person: any, location: any, email: any, phone: any) => {
      const name = String(person ?? "").trim()
      if (!name) return

      const normalizedEmail = String(email ?? "").trim()
      const normalizedPhone = String(phone ?? "").trim()
      const normalizedLocation = String(location ?? "").trim()
      const duplicate = contacts.some(
        contact =>
          contact.name.toLowerCase() === name.toLowerCase() &&
          contact.email.toLowerCase() === normalizedEmail.toLowerCase() &&
          contact.phone === normalizedPhone,
      )

      if (!duplicate) {
        contacts.push({
          name,
          email: normalizedEmail,
          phone: normalizedPhone,
          location: normalizedLocation,
        })
      }
    }

    ;(Array.isArray(item.branches) ? item.branches : []).forEach((branch: any) => {
      addContact(branch.contact_person, branch.name || "Branch", branch.email, branch.phone)
    })

    if (!contacts.length) {
      addContact(
        item.contact_name ?? item.name ?? companyName,
        "Main contact",
        item.email,
        item.phone ?? item.mobile,
      )
    }

    return {
      id: Number(item.id),
      name: companyName,
      account_number: item.account_number ?? "",
      contacts,
      branches: Array.isArray(item.branches) ? item.branches : [],
      collection_addresses: Array.isArray(item.collection_addresses)
        ? item.collection_addresses
        : [],
    }
  }

  async function loadQuoteForEdit(id: number) {
    const quote = await quoteStore.fetchQuote(id)

    fillFormFromQuote(quote)
    await restoreDestinationCustomerForQuote(quote)
    return quote
  }

  async function restoreDestinationCustomerForQuote(quote: TransportQuote) {
    const address = quote.destination_address
    const destinationContactId = Number(address?.contact_id || 0)

    if (!destinationContactId || destinationContactId === selectedCustomer.value?.id) {
      destinationAddressOwner.value = "selected_customer"
      selectedDestinationCustomer.value = null
      return
    }

    destinationAddressOwner.value = "other_customer"

    try {
      selectedDestinationCustomer.value = mapContactToCustomerOption(
        await contactStore.find(destinationContactId),
      )
    } catch {
      selectedDestinationCustomer.value = address
        ? customerOptionFromDestinationAddress(address)
        : null
    }
  }

  function customerOptionFromDestinationAddress(
    address: NonNullable<TransportQuote["destination_address"]>,
  ): CustomerOption {
    const contactId = Number(address.contact_id || 0)
    const commonAddress = {
      id: Number(address.id),
      contact_id: contactId,
      is_collection: Boolean(address.is_collection),
      is_delivery: Boolean(address.is_delivery),
    }

    return {
      id: contactId,
      name: address.label || "Destination customer",
      account_number: "",
      contacts: [],
      branches:
        address.source_type === "branch"
          ? [
              {
                ...commonAddress,
                name: address.label,
                contact_person: null,
                email: null,
                phone: null,
                delivery_address_line_1: address.address_line_1,
                delivery_address_line_2: address.address_line_2,
                delivery_address_line_3: address.address_line_3,
                delivery_city: address.city,
                delivery_county_state: address.county_state,
                delivery_postal_code: address.postal_code,
                delivery_country_id: address.country_id,
                billing_same_as_delivery: true,
                billing_address_line_1: address.address_line_1,
                billing_address_line_2: address.address_line_2,
                billing_address_line_3: address.address_line_3,
                billing_city: address.city,
                billing_county_state: address.county_state,
                billing_postal_code: address.postal_code,
                billing_country_id: address.country_id,
              },
            ]
          : [],
      collection_addresses:
        address.source_type === "collection_address"
          ? [
              {
                ...commonAddress,
                label: address.label,
                address_line_1: address.address_line_1,
                address_line_2: address.address_line_2,
                address_line_3: address.address_line_3,
                city: address.city,
                county_state: address.county_state,
                postal_code: address.postal_code,
                country_id: address.country_id,
                country_name: address.country_name,
              },
            ]
          : [],
    }
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
    form.origin_address_source_type = quote.origin_address_source_type ?? null
    form.origin_address_source_id = quote.origin_address_source_id ?? null
    form.destination_address_source_type = quote.destination_address_source_type ?? null
    form.destination_address_source_id = quote.destination_address_source_id ?? null
    form.etd = fromApiDate(quote.etd)
    form.eta = fromApiDate(quote.eta)
    form.commodity = quote.commodity ?? ""
    form.insurance_level = quote.insurance_level ?? ""
    form.vehicle_type = quote.vehicle_type ?? ""
    form.cargo_class = quote.cargo_class ?? ""
    form.container_type = quote.container_type ?? ""
    form.load_type = quote.load_type ?? ""
    form.load_planner_enabled = quote.load_planner_enabled !== false
    form.goods_description = quote.goods_description ?? ""
    form.is_hazardous = Boolean(quote.is_hazardous)
    form.hazardous_class = quote.hazardous_class ?? ""
    form.un_number = quote.un_number ?? ""
    form.packing_group = quote.packing_group ?? ""
    form.conditions_preset = quote.conditions_preset ?? ""
    form.terms_conditions = quote.terms_conditions ?? ""
    form.validity_period = normaliseValidityPeriod(quote.validity_period)
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
            location: "Saved quote contact",
          },
        ],
        branches: (quote.customer_contact.branches ?? []).map(branch => ({
          id: Number(branch.id),
          contact_id: branch.contact_id,
          name: branch.label,
          contact_person: null,
          email: null,
          phone: null,
          is_collection: branch.is_collection === undefined ? true : Boolean(branch.is_collection),
          is_delivery: branch.is_delivery === undefined ? true : Boolean(branch.is_delivery),
          delivery_address_line_1: branch.address_line_1,
          delivery_address_line_2: branch.address_line_2,
          delivery_address_line_3: branch.address_line_3,
          delivery_city: branch.city,
          delivery_county_state: branch.county_state,
          delivery_postal_code: branch.postal_code,
          delivery_country_id: branch.country_id,
          billing_same_as_delivery: true,
          billing_address_line_1: branch.address_line_1,
          billing_address_line_2: branch.address_line_2,
          billing_address_line_3: branch.address_line_3,
          billing_city: branch.city,
          billing_county_state: branch.county_state,
          billing_postal_code: branch.postal_code,
          billing_country_id: branch.country_id,
        })),
        collection_addresses: (quote.customer_contact.collection_addresses ?? []).map(address => ({
          ...address,
          label: address.label ?? null,
        })),
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

    sellChargeLines.value.forEach(line => {
      line.currency = form.currency || baseCurrency.value
      line.exchange_rate = 1
    })

    restoreBuySellLinks()

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
      supplier_id: type === "buy" ? Number(line.supplier_id || 0) || null : null,
      markup_percent: type === "buy" ? Number(line.markup_percent || 0) : 0,
      add_to_sell: type === "buy" && Boolean(line.add_to_sell),
      linked_sell_line_id: null,
      source_buy_line_id: null,
    }
  }

  function money(value: number, currency = form.currency) {
    return `${currency} ${new Intl.NumberFormat("en-GB", {
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

  function normaliseValidityPeriod(value: unknown): number {
    const days = Math.trunc(Number(value))

    return Number.isFinite(days) && days >= 1 ? days : 30
  }

  function onValidityPeriodChange(value: unknown) {
    const input = String(value ?? "").trim()

    if (!input) {
      validityInputValue.value = null
      form.validity_period = null
      return
    }

    const numericPrefix = input.match(/^\d+/)?.[0]
    const days = numericPrefix ? Math.trunc(Number(numericPrefix)) : Number.NaN

    validityInputValue.value = typeof value === "number" ? value : (numericPrefix ?? null)
    form.validity_period = Number.isFinite(days) && days >= 1 ? days : null
  }

  function onValidityInputFocus() {
    validityInputFocused.value = true
    validityInputValue.value = form.validity_period ? String(form.validity_period) : ""
  }

  function onValidityInputBlur() {
    validityInputFocused.value = false
    formatValidityInputValue(form.validity_period)
  }

  function formatValidityInputValue(value: unknown) {
    const days = Math.trunc(Number(value))

    if (!Number.isFinite(days) || days < 1) {
      validityInputValue.value = null
      return
    }

    validityInputValue.value = [7, 15, 30].includes(days) ? days : `${days} days`
  }

  function onValidityInputKeydown(event: KeyboardEvent) {
    const permittedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ]

    if (
      /^\d$/.test(event.key) ||
      permittedKeys.includes(event.key) ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return
    }

    event.preventDefault()
  }

  function addDays(value: Date, days: number): Date {
    const date = new Date(value)
    date.setDate(date.getDate() + days)

    return date
  }

  function syncFollowUpDate(overwrite = true) {
    if (!overwrite && form.follow_up_date) return

    form.follow_up_date = form.quote_date ? addDays(form.quote_date, 2) : null
  }

  function syncValidUntil(overwrite = true) {
    if (!overwrite && form.valid_until) return

    const validityDays = Math.trunc(Number(form.validity_period))
    const hasValidPeriod = Number.isFinite(validityDays) && validityDays >= 1

    form.valid_until =
      form.quote_date && hasValidPeriod ? addDays(form.quote_date, validityDays) : null
  }

  function syncAutomaticQuoteDates(overwrite = true) {
    syncFollowUpDate(overwrite)
    syncValidUntil(overwrite)
  }

  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!hasQuoteActivity.value || allowNavigation) return

    saveLocalRecovery()
    event.preventDefault()
    event.returnValue = ""
  }

  onMounted(async () => {
    try {
      companyStore.hydrateFromAuth()

      const hasSeq =
        Array.isArray(companyStore.item?.reference_sequences) &&
        companyStore.item.reference_sequences.length > 0

      await Promise.allSettled([
        fetchCustomers(),
        fetchSuppliers(),
        fetchGlobalReferenceOptions(),
        referenceDataStore.categories.length ? Promise.resolve() : referenceDataStore.fetchAll(),
        chargeCodeStore.fetchAll({ sort: "description", direction: "asc", perPage: 1000 }),
        hasSeq ? Promise.resolve() : companyStore.fetch(),
      ])

      if (isEditMode.value && quoteId.value) {
        const quote = await loadQuoteForEdit(quoteId.value)
        activeDraftId.value = quote.id
        lastDraftSavedAt.value = quote.updated_at ? new Date(quote.updated_at) : null
      } else {
        form.currency = baseCurrency.value
        const defaultTerms = referenceDataStore
          .getByKey("quote_terms_conditions")
          ?.options.find(option => option.is_default)
        if (defaultTerms) {
          form.conditions_preset = defaultTerms.name
          onConditionsPresetChange()
        }
        refreshQuoteRefPreview(true)
        addDimensionRow()
        addBuyCostLine("Freight Charge")
        addSellChargeLine("Freight Charge")
      }

      const recovered = restoreLocalRecovery()
      syncAutomaticQuoteDates(false)
      await Promise.all([
        ...buyCostLines.value.map(line => updateChargeExchangeRate(line, false)),
        updateSellingCurrencyExchangeRate(false),
      ])
      formReady = true
      window.addEventListener("beforeunload", handleBeforeUnload)

      if (recovered) {
        toast.add({
          severity: "info",
          summary: "Unsaved Quote Restored",
          detail: "Your browser-only recovery has been restored. Save it as a draft when ready.",
          life: 4500,
        })
      }
    } finally {
      initializingEdit.value = false
    }
  })

  watch(
    () => form.quote_date,
    () => {
      refreshQuoteRefPreview(true)
      if (formReady) syncAutomaticQuoteDates()
      if (formReady) {
        void Promise.all([
          ...buyCostLines.value.map(line => updateChargeExchangeRate(line, false)),
          updateSellingCurrencyExchangeRate(false),
        ])
      }
    },
  )

  watch(
    () => form.currency,
    currency => {
      const normalized = String(currency || baseCurrency.value).toUpperCase()
      sellChargeLines.value.forEach(line => {
        line.currency = normalized
        line.exchange_rate = 1
      })
      if (formReady) void updateSellingCurrencyExchangeRate()
    },
  )

  watch(
    () => form.validity_period,
    value => {
      if (formReady) syncValidUntil()
      if (!validityInputFocused.value) formatValidityInputValue(value)
    },
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

  watch(
    [quoteType, mode, form, dimensionRows, buyCostLines, sellChargeLines],
    () => {
      if (!formReady) return

      changeVersion += 1
      hasUnsavedChanges.value = true
      hasQuoteActivity.value = true
      autosaveState.value = "pending"
      saveLocalRecovery()
    },
    { deep: true },
  )

  onBeforeRouteLeave(async () => {
    if (allowNavigation || !hasQuoteActivity.value) return true

    saveLocalRecovery()

    return requestLeaveDecision()
  })

  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload)
  })

  return {
    pageTitle,
    pageStatusLabel,
    formTitle,
    saveButtonLabel,
    autosaveStatus,
    autosaveState,
    leaveDraftDialogVisible,
    leaveDraftDialogSaving,
    copying,
    previewing,
    saving,
    error,
    initializingEdit,

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
    loadingDestinationCustomers,
    destinationCustomerSuggestions,
    selectedDestinationCustomer,
    destinationAddressOwner,
    destinationAddressOwnerOptions,
    destinationAddressModalVisible,
    destinationCustomerOptions,
    contactOptions,
    accountNumberPreview,
    originLocationOptions,
    destinationLocationOptions,
    originAddressOptions,
    destinationAddressOptions,
    originAddressSelection,
    destinationAddressSelection,
    destinationAddressSelectionLabel,
    updateAddressSource,
    onDestinationAddressOwnerChange,
    openDestinationAddressModal,
    onDestinationCustomerIdChange,
    onDestinationCustomerComplete,
    onDestinationCustomerSelect,
    onDestinationCustomerClear,
    onGlobalReferenceComplete,
    updateLocationValue,
    onValidityPeriodChange,
    onValidityInputKeydown,
    onValidityInputFocus,
    onValidityInputBlur,

    currencyOptions,
    baseCurrency,
    incotermOptions,
    vehicleTypeOptions,
    commodityTypeOptions,
    insuranceLevelOptions,
    validityOptions,
    validityInputValue,
    goodsDescriptionOptions,
    selectedVehicleLoadSpace,
    containerOptions,
    uomOptions,
    chargeDescriptionOptions,
    chargeDescriptionsLoading,
    supplierOptions,
    suppliersLoading,
    hazardousClassOptions,
    packingGroupOptions,
    conditionsOptions,
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
    selectQuoteChargeDescription,
    syncQuoteChargeDescriptionFilter,
    syncBuyLineToSell,
    toggleBuyLineAddToSell,
    getRowCbm,
    getRowVolumetricWeight,
    getRowLdm,
    getChargeLineTotal,
    updateChargeExchangeRate,
    onSellCurrencyChange,
    onConditionsPresetChange,
    onBrowseQuotes,
    onFindQuote,
    onCopyQuote,
    onPreviewQuote,
    onSave,
    onSaveDraft,
    saveDraftAndLeave,
    leaveWithoutSavingLatestChanges,
    stayOnQuote,
    onCancel,
  }
}

function uniqueReferenceRows(
  rows: Array<{ row: GlobalReferenceDataRow; category: string }>,
): Array<{ row: GlobalReferenceDataRow; category: string }> {
  const uniqueRows: Array<{ row: GlobalReferenceDataRow; category: string }> = []
  const seen = new Set<string>()

  for (const entry of rows) {
    const key = [
      entry.category,
      entry.row.code,
      entry.row.iata,
      entry.row.icao,
      entry.row.awb,
      entry.row.fullName,
      entry.row.terminalName,
      entry.row.name,
      entry.row.city,
      entry.row.location,
    ]
      .filter(Boolean)
      .join("|")

    if (!key || seen.has(key)) continue

    seen.add(key)
    uniqueRows.push(entry)
  }

  return uniqueRows
}

function referenceCategoryLabel(category: string | undefined): string {
  if (category === "airlines") return "Airline"
  if (category === "locations") return "Delivery Location"
  if (category === "cities") return "City"

  return "Terminal"
}
