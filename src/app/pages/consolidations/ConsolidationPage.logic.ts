import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useCompanyStore } from "@/app/stores/company"
import { useContactStore } from "@/app/stores/contact"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { CompanyReferenceSequence } from "@/app/types/company"
import type { ContactCollectionAddress } from "@/app/types/contact"
import type { GlobalReferenceDataRow } from "@/app/types/globalReferenceData"
import type {
  JobCharge,
  JobConsolidationCollectionOrder,
  JobConsolidationDetails,
  JobConsolidationGoodsRow,
  JobConsolidationInvoiceLine,
  JobPackage,
  JobTransportLeg,
  TransportJobCreatePayload,
} from "@/app/types/transport-job"
import { buildReferenceNumber } from "@/app/utils/reference-sequence"
import { getPackageStackOption, setPackageStackOption } from "@/app/utils/packageStacking"

type TabId = "overview" | "orders" | "collections" | "invoices" | "custinv" | "goodsin"
type Currency = "GBP" | "USD" | "EUR"
type TransportKey =
  | "bookingRef"
  | "carrier"
  | "originPort"
  | "destinationPort"
  | "finalDestination"
  | "etd"
  | "eta"
type OverviewDateKey = "jobDate" | "shipDate"

type SelectOption = {
  label: string
  value: string
}

type ReferenceOption = SelectOption & {
  subLabel?: string
  searchText: string
}

type PackageLine = {
  id: number
  packageType: string
  stackable: boolean
  atTheTop: boolean
  qty: number
  length: number
  width: number
  height: number
  netWeight: number
  grossWeight: number
  adr: boolean
}

type SupplierItem = {
  id: number
  packageType: string
  collie: number
  length: number
  width: number
  height: number
  stackable: boolean
  atTheTop: boolean
  net: number
  gross: number
  adr: "Yes" | "No"
}

type SupplierInvoice = {
  id: number
  supplierName: string
  customerPoRef: string
  supplierInvoiceNumber: string
  invoiceDate: string
  currency: Currency
  invoiceValue: number
  collectionRef: string
  label: string
  items: SupplierItem[]
}

type InvoiceChargeLine = {
  id: number
  description: string
  qty: number
  unit: string
  rate: number
  sourceType?: "domestic" | "export" | "manual"
  sourceId?: number | string
}

export function useConsolidationPage() {
  const router = useRouter()
  const toast = useToast()
  const companyStore = useCompanyStore()
  const contactStore = useContactStore()
  const globalReferenceDataStore = useGlobalReferenceDataStore()
  const referenceDataStore = useReferenceDataStore()
  const transportJobStore = useTransportJobStore()

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Supplier Invoices" },
    { id: "collections", label: "Collection Orders" },
    { id: "invoices", label: "Consolidated Invoices" },
    { id: "custinv", label: "Customer Invoice" },
    { id: "goodsin", label: "Goods In/Out (WMS)" },
  ]

  const activeTab = ref<TabId>("overview")
  const activeSupplierName = ref("")
  const selectedInvoiceCurrency = ref<Currency>("GBP")
  const collectionLineId = ref(2)
  const supplierInvoiceId = ref(1)
  const supplierItemId = ref(2)
  const collectionOrderId = ref(1)
  const goodsRowId = ref(1)
  const consolidatedLineId = ref(1)
  const domesticChargeId = ref(1)
  const exportChargeId = ref(1)
  const quoteLineId = ref(1)
  const taxRate = ref(20)
  const showQuotePanel = ref(false)
  const consolidatedFreightCharge = ref(0)
  const creatingJob = ref(false)
  const createError = ref("")
  const jobNumberAuto = ref(true)

  const showSupplierInvoiceModal = ref(false)
  const showCollectionOrderModal = ref(false)
  const showSupplierItemModal = ref(false)
  const showSupplierCollectionLinkModal = ref(false)
  const showCollectionLineModal = ref(false)
  const showConsolidatedItemModal = ref(false)
  const showChargeModal = ref(false)
  const showQuoteLineModal = ref(false)
  const chargeModalTarget = ref<"domestic" | "export">("domestic")

  const supplierItemDraft = reactive<SupplierItem>(emptySupplierItem())
  const supplierCollectionLinkDraft = reactive<{
    supplierInvoiceId: number | null
    collectionRef: string
  }>({
    supplierInvoiceId: null,
    collectionRef: "",
  })
  const collectionLineDraft = reactive<PackageLine>(emptyCollectionLine())
  const consolidatedLineDraft = reactive<JobConsolidationInvoiceLine>(emptyConsolidatedLine())
  const chargeOptions = [
    "Consolidation handling",
    "Export documentation",
    "Domestic collection",
    "Fuel surcharge",
    "Customs clearance",
    "Delivery",
  ]
  const chargeDraft = reactive<InvoiceChargeLine>(emptyChargeLine())
  const quoteLineDraft = reactive<InvoiceChargeLine>(emptyChargeLine())

  const modeOptions = ["Road", "Rail", "Air", "Sea", "Courier"].map(value => ({
    label: value,
    value,
  }))
  const fallbackCurrencyOptions = ["GBP", "USD", "EUR"].map(value => ({ label: value, value }))
  const fallbackIncotermOptions = ["EXW", "FCA", "FOB", "CIF", "DAP", "DDP"].map(value => ({
    label: value,
    value,
  }))
  const packageOptions = ["Carton", "Pallet", "Crate", "Jiffy", "Loose"]
  const unitOptions = ["Fixed", "Per kg", "Per CBM", "Per Piece", "Per Pallet", "Per Container"]
  const yesNoOptions = ["No", "Yes"]
  const vehicleOptions = ["Van", "7.5t", "18t", "Artic", "Container"]
  const addressOptions = [
    "PC Cargo UK Depot",
    "Customer Collection Address",
    "Supplier Warehouse",
    "Final Destination",
  ]
  const carrierOptions = ["DHL", "Kuehne+Nagel", "DSV", "FedEx", "Manual Entry"]
  const quoteStatusOptions = ["Draft", "Sent", "Accepted", "Declined"]
  const invoiceCurrencies: Currency[] = ["GBP", "USD", "EUR"]
  const adrClassOptions = [
    { label: "Class 1 - Explosives", value: "1" },
    { label: "Class 2.1 - Flammable Gas", value: "2.1" },
    { label: "Class 2.2 - Non-Flammable Gas", value: "2.2" },
    { label: "Class 3 - Flammable Liquid", value: "3" },
    { label: "Class 4.1 - Flammable Solid", value: "4.1" },
    { label: "Class 5.1 - Oxidising Substance", value: "5.1" },
    { label: "Class 6.1 - Toxic Substance", value: "6.1" },
    { label: "Class 8 - Corrosive Substance", value: "8" },
    { label: "Class 9 - Miscellaneous Dangerous Goods", value: "9" },
  ]

  function cleanReferenceName(value: string): string {
    return String(value ?? "")
      .replace(/\*$/, "")
      .trim()
  }

  function optionFromReference(option: any): SelectOption {
    const name = cleanReferenceName(option?.name ?? option?.label ?? option)

    return {
      label: name,
      value: name,
    }
  }

  function referenceOptions(categoryKey: string, fallback: SelectOption[]): SelectOption[] {
    const category = referenceDataStore.getByKey(categoryKey)
    const options = (category?.options ?? [])
      .map(optionFromReference)
      .filter(option => option.value)

    return options.length ? options : fallback
  }

  const currencyOptions = computed(() => referenceOptions("currency", fallbackCurrencyOptions))
  const incotermOptions = computed(() => referenceOptions("incoterms", fallbackIncotermOptions))

  function firstValue(row: GlobalReferenceDataRow, keys: string[]): string {
    for (const key of keys) {
      const value = row[key]?.trim()

      if (value) return value
    }

    return ""
  }

  function labelWithCode(name: string, code: string): string {
    if (!name) return code
    if (!code || name.toLowerCase().includes(code.toLowerCase())) return name

    return `${code} - ${name}`
  }

  function searchText(row: GlobalReferenceDataRow, values: string[]): string {
    return [...values, ...Object.values(row)].filter(Boolean).join(" ")
  }

  function terminalOptions(filter: (row: GlobalReferenceDataRow) => boolean): ReferenceOption[] {
    return globalReferenceDataStore.data.terminals
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

  const airportOptions = computed(() => terminalOptions(row => row.type === "Airport"))
  const seaportOptions = computed(() => terminalOptions(row => row.type === "Seaport"))
  const railTerminalOptions = computed(() => terminalOptions(row => row.type === "Rail Freight"))
  const roadTerminalOptions = computed(() => terminalOptions(row => row.type === "Road Freight"))

  const cityOptions = computed<ReferenceOption[]>(() => {
    return globalReferenceDataStore.data.cities
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
  })

  const airlineOptions = computed<ReferenceOption[]>(() => {
    return globalReferenceDataStore.data.airlines
      .map(row => {
        const name = firstValue(row, ["airlineName", "airline_name", "name"])
        const code = firstValue(row, ["iata", "iataCode", "iata_code", "icao", "code"])
        const country = firstValue(row, ["country", "countryName", "country_name"])
        const value = name || code
        const label = labelWithCode(name, code)
        const subLabel = [country, code].filter(Boolean).join(" | ")

        return {
          label,
          value,
          subLabel,
          searchText: searchText(row, [label, value, subLabel]),
        }
      })
      .filter(option => option.value)
  })

  function modeKey(value = overview.mode): string {
    return String(value ?? "")
      .trim()
      .toLowerCase()
  }

  function locationOptionsForMode(value = overview.mode): ReferenceOption[] {
    const key = modeKey(value)

    if (key === "air") return airportOptions.value
    if (key === "sea") return seaportOptions.value
    if (key === "rail") return railTerminalOptions.value
    if (key === "courier")
      return cityOptions.value.length ? cityOptions.value : roadTerminalOptions.value

    return roadTerminalOptions.value.length ? roadTerminalOptions.value : cityOptions.value
  }

  const transportLocationOptions = computed(() => locationOptionsForMode())
  const shipFromOptions = computed(() => cityOptions.value)

  function addressSummary(address: ContactCollectionAddress): string {
    return [
      address.address_line_1,
      address.address_line_2,
      address.address_line_3,
      address.city,
      address.county_state,
      address.postal_code,
    ]
      .filter(Boolean)
      .join(", ")
  }

  const deliveryAddressOptions = computed<ReferenceOption[]>(() => {
    return ((contactStore as any).items ?? []).flatMap((contact: any) =>
      (contact.collection_addresses ?? [])
        .filter((address: ContactCollectionAddress) => Boolean(address.is_delivery))
        .map((address: ContactCollectionAddress) => {
          const addressText = addressSummary(address)
          const siteLabel =
            address.label || address.city || addressText || "Unnamed Delivery Address"
          const reference = address.reference_code ? `${address.reference_code} - ` : ""
          const contactName = contact.company_name || contact.name || ""
          const label = `${reference}${siteLabel}`
          const subLabel = [contactName, addressText].filter(Boolean).join(" | ")

          return {
            label,
            value: addressText || label,
            subLabel,
            searchText: [label, subLabel].filter(Boolean).join(" "),
          }
        }),
    )
  })

  const overview = reactive({
    jobNo: "",
    jobDate: new Date().toISOString().slice(0, 10),
    mode: "Road",
    invoiceCurrency: "GBP" as Currency,
    shipDate: "",
    shipFrom: "",
    exitIncoterm: "EXW",
    entryIncoterm: "DAP",
    customer: "",
    notifyParty: "",
    shipper: "PC Cargo UK Depot",
    deliveryAddress: "",
    goodsDescription: "",
    instructions: "",
    exportCustomsRef: "",
    importCustomsRef: "",
  })

  const transport = reactive<Record<TransportKey, string>>({
    bookingRef: "",
    carrier: "",
    originPort: "",
    destinationPort: "",
    finalDestination: "",
    etd: "",
    eta: "",
  })

  const transportFields = computed<Array<{ key: TransportKey; label: string }>>(() => {
    const roadFields: Array<{ key: TransportKey; label: string }> = [
      { key: "bookingRef", label: "Transport Ref" },
      { key: "carrier", label: "Haulier" },
      { key: "originPort", label: "Collection Point" },
      { key: "destinationPort", label: "Delivery Point" },
      { key: "finalDestination", label: "Final Destination" },
      { key: "etd", label: "Pickup Date" },
      { key: "eta", label: "Delivery Date" },
    ]
    const labelsByMode: Record<string, Array<{ key: TransportKey; label: string }>> = {
      Air: [
        { key: "bookingRef", label: "AWB / Booking Ref" },
        { key: "carrier", label: "Airline" },
        { key: "originPort", label: "Origin Airport" },
        { key: "destinationPort", label: "Destination Airport" },
        { key: "finalDestination", label: "Final Destination" },
        { key: "etd", label: "Flight ETD" },
        { key: "eta", label: "Flight ETA" },
      ],
      Sea: [
        { key: "bookingRef", label: "Booking / Container Ref" },
        { key: "carrier", label: "Shipping Line" },
        { key: "originPort", label: "Port of Loading" },
        { key: "destinationPort", label: "Port of Discharge" },
        { key: "finalDestination", label: "Final Destination" },
        { key: "etd", label: "Vessel ETD" },
        { key: "eta", label: "Vessel ETA" },
      ],
      Rail: [
        { key: "bookingRef", label: "Rail Booking Ref" },
        { key: "carrier", label: "Rail Operator" },
        { key: "originPort", label: "Origin Terminal" },
        { key: "destinationPort", label: "Destination Terminal" },
        { key: "finalDestination", label: "Final Destination" },
        { key: "etd", label: "Departure" },
        { key: "eta", label: "Arrival" },
      ],
      Road: roadFields,
    }
    return labelsByMode[overview.mode] ?? roadFields
  })

  function transportFieldInputType(
    key: TransportKey,
  ): "calendar" | "location" | "text" | "dropdown" {
    if (key === "etd" || key === "eta") return "calendar"
    if (key === "originPort" || key === "destinationPort" || key === "finalDestination") {
      return "location"
    }
    if (key === "carrier" && modeKey() === "air" && airlineOptions.value.length) return "dropdown"

    return "text"
  }

  function transportFieldOptions(key: TransportKey): ReferenceOption[] {
    if (key === "originPort" || key === "destinationPort") return transportLocationOptions.value
    if (key === "finalDestination") return cityOptions.value
    if (key === "carrier" && modeKey() === "air") return airlineOptions.value

    return []
  }

  function transportFieldPlaceholder(key: TransportKey): string {
    if (key === "originPort")
      return `Select ${transportFields.value.find(field => field.key === key)?.label.toLowerCase() ?? "origin"}`
    if (key === "destinationPort")
      return `Select ${transportFields.value.find(field => field.key === key)?.label.toLowerCase() ?? "destination"}`
    if (key === "finalDestination") return "Select city"
    if (key === "carrier" && modeKey() === "air") return "Select airline"

    return ""
  }

  function calendarDate(value: string | null | undefined): Date | null {
    const normalized = normalizedDate(value)
    if (!normalized) return null

    const parts = normalized.split("-")
    const year = Number(parts[0])
    const month = Number(parts[1])
    const day = Number(parts[2])

    return new Date(year, month - 1, day)
  }

  function calendarDateString(value: unknown): string {
    const date = Array.isArray(value) ? value[0] : value
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ""

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  function setOverviewDate(key: OverviewDateKey, value: unknown) {
    overview[key] = calendarDateString(value)
  }

  function setTransportDate(key: TransportKey, value: unknown) {
    if (key !== "etd" && key !== "eta") return

    transport[key] = calendarDateString(value)
  }

  function normalizedDate(value: string | null | undefined): string | null {
    const text = String(value ?? "").trim()
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)

    if (!match) return null

    const [, year, month, day] = match
    const parsed = new Date(Number(year), Number(month) - 1, Number(day))

    if (
      parsed.getFullYear() !== Number(year) ||
      parsed.getMonth() !== Number(month) - 1 ||
      parsed.getDate() !== Number(day)
    ) {
      return null
    }

    return text
  }

  const jobSequence = computed<CompanyReferenceSequence | null>(() => {
    const seqs = companyStore.item?.reference_sequences ?? []
    if (!Array.isArray(seqs) || seqs.length === 0) return null

    return seqs.find(seq => seq.type === "job") ?? null
  })

  const jobNumberUsesSystem = computed(() => Boolean(jobSequence.value?.use_system))
  const jobNumberPlaceholder = computed(() =>
    jobNumberUsesSystem.value ? "Auto generated when created" : "Enter job number",
  )

  const collectionDraft = reactive({
    coRef: "CO-NEW",
    customerRef: "",
    collectionRef: "",
    pickupDate: "",
    pickupTime: "",
    vehicle: "",
    collectionAddress: "",
    deliveryAddress: "PC Cargo UK Depot",
    deliveryDate: "",
    deliveryTime: "",
    supplier: "",
    goodsDescription: "",
    hazardous: false,
    adrClass: "",
    freight: 0,
    fscPct: 0,
    additional: 0,
    lines: [
      {
        id: 1,
        packageType: "Carton",
        stackable: true,
        atTheTop: false,
        qty: 1,
        length: 0,
        width: 0,
        height: 0,
        netWeight: 0,
        grossWeight: 0,
        adr: false,
      },
    ] as PackageLine[],
  })

  const supplierDraft = reactive({
    supplierName: "",
    customerPoRef: "",
    supplierInvoiceNumber: "",
    invoiceDate: "",
    currency: "USD" as Currency,
    invoiceValue: 0,
    collectionRef: "",
    label: "",
    items: [
      {
        id: 1,
        packageType: "Carton",
        collie: 1,
        length: 0,
        width: 0,
        height: 0,
        stackable: true,
        atTheTop: false,
        net: 0,
        gross: 0,
        adr: "No",
      },
    ] as SupplierItem[],
  })

  const supplierInvoices = ref<SupplierInvoice[]>([])

  const supplierExaNumbers = reactive<Record<string, string>>({})

  const collectionOrders = ref<JobConsolidationCollectionOrder[]>([])

  const goodsInRows = ref<JobConsolidationGoodsRow[]>([])

  const consolidatedLines = ref<JobConsolidationInvoiceLine[]>([])

  const domesticChargeRows = ref<InvoiceChargeLine[]>([])

  const exportChargeRows = ref<InvoiceChargeLine[]>([])

  const quoteLines = ref<InvoiceChargeLine[]>([])

  const domesticInvoice = reactive({
    posted: false,
    ref: "",
    date: "",
  })

  const exportInvoice = reactive({
    posted: false,
    ref: "",
    date: "",
  })

  const weightBreakRates = [
    { label: "0 - 50 kg", rate: 45, perKg: false },
    { label: "51 - 250 kg", rate: 0.85, perKg: true },
    { label: "251 - 500 kg", rate: 0.72, perKg: true },
    { label: "501+ kg", rate: 0.62, perKg: true },
  ]

  const quote = reactive({
    reference: "",
    validUntil: "",
    status: "Draft",
    notes: "",
    terms:
      "This quotation is valid for 30 days from the date of issue. Rates are subject to fuel surcharge adjustments. Subject to carrier availability and standard terms of trading.",
  })

  const collectionRefOptions = computed(() => collectionOrders.value.map(order => order.coRef))
  const nextCollectionRef = computed(
    () => `CO-${String(collectionOrders.value.length + 1).padStart(3, "0")}`,
  )
  const nextGrnRef = computed(() => `GRN-${String(goodsInRows.value.length + 1).padStart(4, "0")}`)

  const collectionDraftTotals = computed(() => summarizePackageLines(collectionDraft.lines))
  const supplierDraftTotals = computed(() => {
    return supplierDraft.items.reduce(
      (sum, item) => {
        sum.pieces += Number(item.collie || 0)
        sum.weight += Number(item.gross || 0)
        sum.volume +=
          (Number(item.collie || 0) *
            Number(item.length || 0) *
            Number(item.width || 0) *
            Number(item.height || 0)) /
          1_000_000
        return sum
      },
      { pieces: 0, weight: 0, volume: 0 },
    )
  })

  const supplierSummaries = computed(() => {
    const summaries = new Map<
      string,
      {
        name: string
        invoiceCount: number
        totalCollies: number
        totalNet: number
        totalGross: number
        valueByCurrency: Map<Currency, number>
        invoices: SupplierInvoice[]
      }
    >()

    supplierInvoices.value.forEach(invoice => {
      const name = invoice.supplierName || "Unnamed Supplier"
      const current = summaries.get(name) || {
        name,
        invoiceCount: 0,
        totalCollies: 0,
        totalNet: 0,
        totalGross: 0,
        valueByCurrency: new Map<Currency, number>(),
        invoices: [],
      }

      const totals = invoiceTotals(invoice)
      current.invoiceCount += 1
      current.totalCollies += totals.collies
      current.totalNet += totals.net
      current.totalGross += totals.gross
      current.valueByCurrency.set(
        invoice.currency,
        (current.valueByCurrency.get(invoice.currency) || 0) + Number(invoice.invoiceValue || 0),
      )
      current.invoices.push(invoice)

      summaries.set(name, current)
    })

    return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name))
  })

  const supplierInvoiceLinkOptions = computed(() =>
    supplierInvoices.value.map(invoice => ({
      label:
        [
          invoice.supplierName || "Unnamed Supplier",
          invoice.supplierInvoiceNumber,
          invoice.customerPoRef,
        ]
          .filter(Boolean)
          .join(" / ") || `Supplier Invoice ${invoice.id}`,
      value: invoice.id,
    })),
  )

  const selectedSupplierSummary = computed(() => {
    return (
      supplierSummaries.value.find(supplier => supplier.name === activeSupplierName.value) ||
      supplierSummaries.value[0] ||
      null
    )
  })

  const hasAdr = computed(() => {
    return (
      collectionDraft.lines.some(line => line.adr) ||
      supplierInvoices.value.some(invoice => invoice.items.some(item => item.adr === "Yes"))
    )
  })

  const collectionFscAmount = computed(
    () => Number(collectionDraft.freight || 0) * (Number(collectionDraft.fscPct || 0) / 100),
  )
  const collectionChargeTotal = computed(
    () =>
      Number(collectionDraft.freight || 0) +
      collectionFscAmount.value +
      Number(collectionDraft.additional || 0),
  )

  const supplierCostTotal = computed(() =>
    supplierInvoices.value.reduce((sum, invoice) => sum + Number(invoice.invoiceValue || 0), 0),
  )
  const supplierTotalsMap = computed(() => {
    const totals = new Map<Currency, number>()
    invoiceCurrencies.forEach(currency => totals.set(currency, 0))
    supplierInvoices.value.forEach(invoice =>
      totals.set(
        invoice.currency,
        (totals.get(invoice.currency) || 0) + Number(invoice.invoiceValue || 0),
      ),
    )
    return totals
  })
  const supplierTotalsByCurrency = computed(() => {
    return Array.from(supplierTotalsMap.value.entries()).map(([currency, total]) => ({
      currency,
      total,
    }))
  })
  const consolidatedTotalsMap = computed(() => {
    const totals = new Map<string, number>()
    invoiceCurrencies.forEach(currency => totals.set(currency, 0))
    consolidatedLines.value.forEach(line => {
      totals.set(
        line.invoiceCurrency,
        (totals.get(line.invoiceCurrency) || 0) +
          Number(line.qty || 0) * Number(line.unitPrice || 0),
      )
    })
    return totals
  })
  const filteredConsolidatedLines = computed(() => {
    return consolidatedLines.value.filter(
      line => line.invoiceCurrency === selectedInvoiceCurrency.value,
    )
  })
  const selectedCurrencyGoodsTotal = computed(
    () => consolidatedTotalsMap.value.get(selectedInvoiceCurrency.value) || 0,
  )
  const selectedCurrencyDapTotal = computed(
    () => selectedCurrencyGoodsTotal.value + Number(consolidatedFreightCharge.value || 0),
  )
  const packageBreakdown = computed(() => {
    return supplierInvoices.value.reduce(
      (sum, invoice) => {
        invoice.items.forEach(item => {
          const qty = Number(item.collie || 0)
          const type = item.packageType.toLowerCase()
          if (type.includes("crate")) sum.crates += qty
          else if (type.includes("pallet")) sum.pallets += qty
          else if (type.includes("jiffy")) sum.jiffies += qty
          else sum.cartons += qty
          sum.net += Number(item.net || 0)
          sum.gross += Number(item.gross || 0)
          sum.cbm +=
            (qty * Number(item.length || 0) * Number(item.width || 0) * Number(item.height || 0)) /
            1_000_000
          sum.ldm += (qty * Number(item.length || 0) * Number(item.width || 0)) / 24000
        })
        return sum
      },
      { crates: 0, pallets: 0, cartons: 0, jiffies: 0, net: 0, gross: 0, cbm: 0, ldm: 0 },
    )
  })

  const domesticInvoiceRows = computed(() =>
    collectionOrders.value.map(order => ({
      ...order,
      cost: calcWeightBreakCost(Number(order.weightKg || 0)),
    })),
  )
  const domesticCollectionTotal = computed(() =>
    domesticInvoiceRows.value.reduce((sum, row) => sum + row.cost, 0),
  )
  const domesticAdditionalTotal = computed(() =>
    domesticChargeRows.value.reduce((sum, line) => sum + line.qty * line.rate, 0),
  )
  const domesticTotal = computed(
    () => domesticCollectionTotal.value + domesticAdditionalTotal.value,
  )
  const exportTotal = computed(() =>
    exportChargeRows.value.reduce((sum, line) => sum + line.qty * line.rate, 0),
  )
  const quoteSubtotal = computed(() =>
    quoteLines.value.reduce((sum, line) => sum + line.qty * line.rate, 0),
  )
  const customerInvoiceSubtotal = computed(() => domesticTotal.value + exportTotal.value)
  const customerInvoiceTax = computed(
    () => customerInvoiceSubtotal.value * (Number(taxRate.value || 0) / 100),
  )
  const customerInvoiceTotal = computed(
    () => customerInvoiceSubtotal.value + customerInvoiceTax.value,
  )

  const metrics = computed(() => [
    { label: "Supplier Invoices", value: supplierInvoices.value.length },
    { label: "Collection Orders", value: collectionOrders.value.length },
    { label: "Goods In", value: goodsInRows.value.length },
    {
      label: "Pieces",
      value: goodsInRows.value.reduce((sum, row) => sum + Number(row.pcs || 0), 0),
    },
    { label: "Supplier Cost", value: money("GBP", supplierCostTotal.value) },
    { label: "Invoice Total", value: money("GBP", customerInvoiceTotal.value) },
  ])

  const haulierQuoteText = ref("")
  refreshHaulierQuote()

  onMounted(async () => {
    companyStore.hydrateFromAuth()

    await Promise.allSettled([
      referenceDataStore.categories.length ? Promise.resolve() : referenceDataStore.fetchAll(),
      globalReferenceDataStore.data.terminals.length ||
      globalReferenceDataStore.data.airlines.length ||
      globalReferenceDataStore.data.cities.length
        ? Promise.resolve()
        : globalReferenceDataStore.fetchAll(),
      ((contactStore as any).items ?? []).length ? Promise.resolve() : contactStore.fetch(),
    ])

    const hasSequence =
      Array.isArray(companyStore.item?.reference_sequences) &&
      companyStore.item.reference_sequences.length > 0

    if (!hasSequence) {
      try {
        await companyStore.fetch()
      } catch {
        // The backend will still validate/generate the job number when the job is created.
      }
    }

    refreshJobNumberPreview(true)
  })

  watch(
    () => overview.jobDate,
    () => refreshJobNumberPreview(true),
  )

  watch(
    () => jobSequence.value?.next_number,
    () => refreshJobNumberPreview(true),
  )

  function parseJobDate(value: string): Date {
    if (!value) return new Date()

    const parsed = new Date(`${value}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }

  function refreshJobNumberPreview(force = false) {
    const seq = jobSequence.value

    if (!seq?.use_system) return
    if (!force && overview.jobNo && !jobNumberAuto.value) return

    const preview = buildReferenceNumber(seq, parseJobDate(overview.jobDate), { separator: "-" })

    if (preview) {
      overview.jobNo = preview
      jobNumberAuto.value = true
    }
  }

  function summarizePackageLines(lines: PackageLine[]) {
    return lines.reduce(
      (sum, line) => {
        sum.pieces += Number(line.qty || 0)
        sum.weight += Number(line.grossWeight || 0)
        sum.volume += cbm(line)
        sum.ldm += ldm(line)
        return sum
      },
      { pieces: 0, weight: 0, volume: 0, ldm: 0 },
    )
  }

  function emptyCollectionLine(): PackageLine {
    return {
      id: 0,
      packageType: "Carton",
      stackable: true,
      atTheTop: false,
      qty: 1,
      length: 0,
      width: 0,
      height: 0,
      netWeight: 0,
      grossWeight: 0,
      adr: false,
    }
  }

  function emptySupplierItem(): SupplierItem {
    return {
      id: 0,
      packageType: "Carton",
      collie: 1,
      length: 0,
      width: 0,
      height: 0,
      stackable: true,
      atTheTop: false,
      net: 0,
      gross: 0,
      adr: "No",
    }
  }

  function emptyConsolidatedLine(): JobConsolidationInvoiceLine {
    return {
      id: 0,
      invoiceCurrency: selectedInvoiceCurrency.value,
      poRef: "",
      shippingLabelNo: "",
      description: "",
      qty: 1,
      uom: "Fixed",
      countryOfOrigin: "",
      hsCode: "",
      unitPrice: 0,
      supplier: "",
      grn: "",
    }
  }

  function emptyChargeLine(
    description = chargeOptions[0] ?? "Consolidation handling",
  ): InvoiceChargeLine {
    return {
      id: 0,
      description,
      qty: 1,
      unit: "Fixed",
      rate: 0,
    }
  }

  function addCollectionLine() {
    collectionDraft.lines.push({
      ...emptyCollectionLine(),
      id: collectionLineId.value++,
    })
  }

  function confirmCollectionLine() {
    collectionDraft.lines.push({
      ...collectionLineDraft,
      id: collectionLineId.value++,
    })
    showCollectionLineModal.value = false
  }

  function addSupplierItem() {
    supplierDraft.items.push({
      ...emptySupplierItem(),
      id: supplierItemId.value++,
    })
  }

  function confirmSupplierItem() {
    supplierDraft.items.push({
      ...supplierItemDraft,
      id: supplierItemId.value++,
    })
    showSupplierItemModal.value = false
  }

  function removeSupplierItem(index: number) {
    supplierDraft.items.splice(index, 1)
  }

  function resetSupplierDraft() {
    Object.assign(supplierDraft, {
      supplierName: "",
      customerPoRef: "",
      supplierInvoiceNumber: "",
      invoiceDate: "",
      currency: "USD" as Currency,
      invoiceValue: 0,
      collectionRef: "",
      label: "",
      items: [
        {
          ...emptySupplierItem(),
          id: supplierItemId.value++,
        },
      ],
    })
  }

  function openSupplierInvoiceModal() {
    activeTab.value = "orders"
    resetSupplierDraft()
    showSupplierInvoiceModal.value = true
  }

  function hasSupplierDraftData() {
    return Boolean(
      supplierDraft.supplierName ||
      supplierDraft.customerPoRef ||
      supplierDraft.supplierInvoiceNumber ||
      supplierDraft.invoiceDate ||
      supplierDraft.invoiceValue ||
      supplierDraft.collectionRef ||
      supplierDraft.label ||
      supplierDraft.items.some(
        item =>
          Number(item.length || 0) > 0 ||
          Number(item.width || 0) > 0 ||
          Number(item.height || 0) > 0 ||
          Number(item.net || 0) > 0 ||
          Number(item.gross || 0) > 0 ||
          item.adr === "Yes",
      ),
    )
  }

  function supplierDraftToInvoice(options: { reserveId?: boolean } = {}): SupplierInvoice {
    const supplierName = supplierDraft.supplierName || "Unnamed Supplier"
    const id = options.reserveId === false ? supplierInvoiceId.value : supplierInvoiceId.value++

    return {
      id,
      supplierName,
      customerPoRef: supplierDraft.customerPoRef,
      supplierInvoiceNumber: supplierDraft.supplierInvoiceNumber,
      invoiceDate: supplierDraft.invoiceDate,
      currency: supplierDraft.currency,
      invoiceValue: Number(supplierDraft.invoiceValue || 0),
      collectionRef: supplierDraft.collectionRef,
      label: supplierDraft.label,
      items: supplierDraft.items.map(item => ({ ...item })),
    }
  }

  function saveSupplierInvoice() {
    const invoice = supplierDraftToInvoice()
    const supplierName = invoice.supplierName

    if (!(supplierName in supplierExaNumbers)) {
      supplierExaNumbers[supplierName] = ""
    }

    supplierInvoices.value = [invoice, ...supplierInvoices.value]
    activeSupplierName.value = supplierName
    showSupplierInvoiceModal.value = false
    resetSupplierDraft()
  }

  function openSupplierCollectionLinkModal() {
    supplierCollectionLinkDraft.supplierInvoiceId = supplierInvoices.value[0]?.id ?? null
    supplierCollectionLinkDraft.collectionRef =
      collectionRefOptions.value[0] ?? supplierDraft.collectionRef
    showSupplierCollectionLinkModal.value = true
  }

  function confirmSupplierCollectionLink() {
    const invoice = supplierInvoices.value.find(
      row => row.id === supplierCollectionLinkDraft.supplierInvoiceId,
    )

    if (invoice) {
      invoice.collectionRef = supplierCollectionLinkDraft.collectionRef
    }

    showSupplierCollectionLinkModal.value = false
  }

  function hasCollectionDraftData() {
    return Boolean(
      collectionDraft.customerRef ||
      collectionDraft.collectionRef ||
      collectionDraft.pickupDate ||
      collectionDraft.pickupTime ||
      collectionDraft.vehicle ||
      collectionDraft.collectionAddress ||
      collectionDraft.deliveryDate ||
      collectionDraft.deliveryTime ||
      collectionDraft.supplier ||
      collectionDraft.goodsDescription ||
      collectionDraft.hazardous ||
      collectionDraft.freight ||
      collectionDraft.fscPct ||
      collectionDraft.additional ||
      collectionDraft.lines.some(
        line =>
          Number(line.length || 0) > 0 ||
          Number(line.width || 0) > 0 ||
          Number(line.height || 0) > 0 ||
          Number(line.netWeight || 0) > 0 ||
          Number(line.grossWeight || 0) > 0 ||
          line.adr,
      ),
    )
  }

  function resetCollectionDraft() {
    Object.assign(collectionDraft, {
      coRef: "CO-NEW",
      customerRef: "",
      collectionRef: "",
      pickupDate: "",
      pickupTime: "",
      vehicle: "",
      collectionAddress: "",
      deliveryAddress: "PC Cargo UK Depot",
      deliveryDate: "",
      deliveryTime: "",
      supplier: "",
      goodsDescription: "",
      hazardous: false,
      adrClass: "",
      freight: 0,
      fscPct: 0,
      additional: 0,
      lines: [
        {
          ...emptyCollectionLine(),
          id: collectionLineId.value++,
        },
      ],
    })
    refreshHaulierQuote()
  }

  function openCollectionOrderModal() {
    activeTab.value = "collections"
    resetCollectionDraft()
    showCollectionOrderModal.value = true
  }

  function collectionDraftToOrder(
    options: { reserveId?: boolean } = {},
  ): JobConsolidationCollectionOrder {
    const totals = collectionDraftTotals.value
    const coRef =
      collectionDraft.coRef === "CO-NEW" ? nextCollectionRef.value : collectionDraft.coRef
    const id = options.reserveId === false ? collectionOrderId.value : collectionOrderId.value++

    return {
      id,
      coRef,
      customerRef: collectionDraft.customerRef,
      collectionRef: collectionDraft.collectionRef,
      supplier: collectionDraft.supplier,
      pickupDate: collectionDraft.pickupDate,
      pickupTime: collectionDraft.pickupTime,
      vehicle: collectionDraft.vehicle,
      collectionAddress: collectionDraft.collectionAddress,
      deliveryAddress: collectionDraft.deliveryAddress,
      deliveryDate: collectionDraft.deliveryDate,
      deliveryTime: collectionDraft.deliveryTime,
      goodsDescription: collectionDraft.goodsDescription,
      hazardous: collectionDraft.hazardous || collectionDraft.lines.some(line => line.adr),
      adrClass: collectionDraft.adrClass,
      freight: Number(collectionDraft.freight || 0),
      fscPct: Number(collectionDraft.fscPct || 0),
      additional: Number(collectionDraft.additional || 0),
      pcs: totals.pieces,
      weightKg: Number(totals.weight.toFixed(1)),
      volumeCbm: Number(totals.volume.toFixed(3)),
      ldm: Number(totals.ldm.toFixed(3)),
      status: "Created",
      notes: "",
      wmsRef: "",
      lines: collectionDraft.lines.map(line => ({ ...line })),
    }
  }

  function saveCollectionOrder() {
    const order = collectionDraftToOrder()
    const grn = nextGrnRef.value

    collectionOrders.value = [order, ...collectionOrders.value]

    goodsInRows.value = [
      {
        id: goodsRowId.value++,
        grn,
        supplier: order.supplier,
        supplierInvoice: "-",
        supplierPO: order.coRef,
        partNo: "-",
        desc: order.goodsDescription,
        pcs: order.pcs,
        weightKg: order.weightKg,
        cbm: order.volumeCbm,
        location: "STAGING",
        status: "Received",
      },
      ...goodsInRows.value,
    ]
    showCollectionOrderModal.value = false
    resetCollectionDraft()
  }

  function supplierInvoicesForPayload(): SupplierInvoice[] {
    const rows = supplierInvoices.value.map(invoice => ({
      ...invoice,
      items: invoice.items.map(item => ({ ...item })),
    }))

    if (hasSupplierDraftData()) {
      rows.push(supplierDraftToInvoice({ reserveId: false }))
    }

    return rows
  }

  function collectionOrdersForPayload(): JobConsolidationCollectionOrder[] {
    const rows = collectionOrders.value.map(order => ({
      ...order,
      lines: order.lines.map(line => ({ ...line })),
    }))

    if (hasCollectionDraftData()) {
      rows.push(collectionDraftToOrder({ reserveId: false }))
    }

    return rows
  }

  function goodsRowsForPayload(
    orders: JobConsolidationCollectionOrder[],
  ): JobConsolidationGoodsRow[] {
    const rows = goodsInRows.value.map(row => ({ ...row }))
    const existingOrderRefs = new Set(rows.map(row => row.supplierPO).filter(Boolean))

    orders.forEach((order, index) => {
      if (!order.coRef || existingOrderRefs.has(order.coRef)) return

      rows.push({
        id: goodsRowId.value + index,
        grn: `GRN-${String(goodsRowId.value + index).padStart(4, "0")}`,
        supplier: order.supplier,
        supplierInvoice: "-",
        supplierPO: order.coRef,
        partNo: "-",
        desc: order.goodsDescription,
        pcs: order.pcs,
        weightKg: order.weightKg,
        cbm: order.volumeCbm,
        location: "STAGING",
        status: "Received",
      })
    })

    return rows
  }

  function transportModeForLeg(): JobTransportLeg["mode"] {
    const mode = overview.mode.toLowerCase()

    if (mode === "air" || mode === "sea" || mode === "rail" || mode === "road") {
      return mode
    }

    return "road"
  }

  function buildTransportLegs(): JobTransportLeg[] {
    const etd = normalizedDate(transport.etd) ?? normalizedDate(overview.shipDate)
    const eta = normalizedDate(transport.eta)
    const hasLeg = [
      transport.bookingRef,
      transport.carrier,
      transport.originPort,
      transport.destinationPort,
      transport.finalDestination,
      etd,
      eta,
    ].some(value => String(value || "").trim())

    if (!hasLeg) return []

    return [
      {
        sequence: 1,
        mode: transportModeForLeg(),
        carrier: transport.carrier || null,
        reference: transport.bookingRef || null,
        origin: transport.originPort || overview.shipFrom || null,
        destination:
          transport.destinationPort ||
          transport.finalDestination ||
          overview.deliveryAddress ||
          null,
        etd,
        eta,
        notes: overview.instructions || null,
        extra_data: {
          consolidation_mode: overview.mode,
          final_destination: transport.finalDestination || null,
        },
      },
    ]
  }

  function buildJobPackages(invoices: SupplierInvoice[]): JobPackage[] {
    return invoices.flatMap(invoice =>
      invoice.items.map(item => {
        const quantity = Number(item.collie || 1)
        const volume =
          (quantity *
            Number(item.length || 0) *
            Number(item.width || 0) *
            Number(item.height || 0)) /
          1_000_000

        return {
          package_type: item.packageType,
          stackable: item.stackable,
          at_the_top: item.atTheTop,
          quantity,
          length_cm: Number(item.length || 0),
          width_cm: Number(item.width || 0),
          height_cm: Number(item.height || 0),
          weight: Number(item.gross || 0),
          volume: Number(volume.toFixed(3)),
          volume_weight_kg: Number((volume * 167).toFixed(2)),
          description: [invoice.supplierName, invoice.supplierInvoiceNumber, invoice.customerPoRef]
            .filter(Boolean)
            .join(" / "),
        }
      }),
    )
  }

  function buildJobCharges(
    invoices: SupplierInvoice[],
    orders: JobConsolidationCollectionOrder[],
  ): JobCharge[] {
    const supplierCharges: JobCharge[] = invoices
      .filter(invoice => Number(invoice.invoiceValue || 0) > 0)
      .map(invoice => ({
        type: "buy",
        description: `Supplier invoice${invoice.supplierInvoiceNumber ? ` - ${invoice.supplierInvoiceNumber}` : ""}`,
        currency: invoice.currency,
        amount: Number(invoice.invoiceValue || 0),
      }))

    const collectionCharges: JobCharge[] = orders
      .map(order => ({
        type: "buy" as const,
        description: `Collection order${order.coRef ? ` - ${order.coRef}` : ""}`,
        currency: "GBP",
        amount:
          Number(order.freight || 0) +
          Number(order.freight || 0) * (Number(order.fscPct || 0) / 100) +
          Number(order.additional || 0),
      }))
      .filter(charge => Number(charge.amount || 0) > 0)

    const customerCharges: JobCharge[] = [...domesticChargeRows.value, ...exportChargeRows.value]
      .map(line => ({
        type: "sell" as const,
        description: line.description,
        currency: "GBP",
        amount: Number(line.qty || 0) * Number(line.rate || 0),
      }))
      .filter(charge => Number(charge.amount || 0) > 0)

    return [...supplierCharges, ...collectionCharges, ...customerCharges]
  }

  function buildConsolidationDetails(
    invoices: SupplierInvoice[],
    orders: JobConsolidationCollectionOrder[],
    goodsRows: JobConsolidationGoodsRow[],
  ): JobConsolidationDetails {
    return {
      overview: { ...overview },
      transport: { ...transport },
      supplierInvoices: invoices,
      supplierExaNumbers: { ...supplierExaNumbers },
      collectionOrders: orders,
      goodsRows,
      consolidatedLines: consolidatedLines.value.map(line => ({ ...line })),
      domesticChargeRows: domesticChargeRows.value.map(line => ({ ...line })),
      exportChargeRows: exportChargeRows.value.map(line => ({ ...line })),
      quoteLines: quoteLines.value.map(line => ({ ...line })),
      domesticInvoice: { ...domesticInvoice },
      exportInvoice: { ...exportInvoice },
      finalDelivery: {
        deliveryRef: transport.bookingRef || "",
        plannedDate: normalizedDate(transport.eta) ?? normalizedDate(overview.shipDate) ?? "",
        plannedTime: "",
        carrier: transport.carrier || "",
        address:
          overview.deliveryAddress || transport.finalDestination || transport.destinationPort || "",
        instructions: overview.instructions || "",
      },
      quote: { ...quote },
      selectedInvoiceCurrency: selectedInvoiceCurrency.value,
      consolidatedFreightCharge: Number(consolidatedFreightCharge.value || 0),
      taxRate: Number(taxRate.value || 0),
      showQuotePanel: showQuotePanel.value,
    }
  }

  function buildCreatePayload(): TransportJobCreatePayload {
    const invoices = supplierInvoicesForPayload()
    const orders = collectionOrdersForPayload()
    const goodsRows = goodsRowsForPayload(orders)
    const packages = buildJobPackages(invoices)
    const charges = buildJobCharges(invoices, orders)
    const transportLegs = buildTransportLegs()
    const firstOrder = orders[0]
    const firstInvoice = invoices[0]

    return {
      customer_id: null,
      quote_ref: quote.reference || null,
      job_number: jobNumberUsesSystem.value ? null : overview.jobNo || null,
      job_date: normalizedDate(overview.jobDate),
      job_type: "consolidation",
      mode_of_transport: "consolidation",
      status: "Draft",
      service_type: "Consolidation",
      incoterms:
        [overview.exitIncoterm, overview.entryIncoterm].filter(Boolean).join(" / ") || null,
      currency: overview.invoiceCurrency,
      declared_value: supplierCostTotal.value || null,
      description_of_goods: overview.goodsDescription || null,
      customer_po_number: firstInvoice?.customerPoRef || null,
      customer_booking_ref: transport.bookingRef || null,
      our_reference: overview.exportCustomsRef || firstOrder?.collectionRef || null,
      supplier_ref: overview.importCustomsRef || firstInvoice?.supplierInvoiceNumber || null,
      consignee_name: overview.notifyParty || overview.customer || null,
      note:
        [
          overview.customer ? `Customer: ${overview.customer}` : "",
          overview.shipper ? `Shipper: ${overview.shipper}` : "",
          overview.deliveryAddress ? `Delivery: ${overview.deliveryAddress}` : "",
          overview.instructions,
        ]
          .filter(Boolean)
          .join("\n") || null,
      collection_date:
        normalizedDate(firstOrder?.pickupDate) ?? normalizedDate(collectionDraft.pickupDate),
      collection_time: firstOrder?.pickupTime || collectionDraft.pickupTime || null,
      transport_legs: transportLegs.length ? transportLegs : undefined,
      packages: packages.length ? packages : undefined,
      charges: charges.length ? charges : undefined,
      consolidation_details: buildConsolidationDetails(invoices, orders, goodsRows),
    }
  }

  function extractErrorMessage(err: any): string {
    return String(
      err?.response?.data?.message ?? err?.message ?? "Unable to create consolidation job.",
    )
  }

  async function createConsolidationJob() {
    if (creatingJob.value) return

    creatingJob.value = true
    createError.value = ""

    try {
      const job = await transportJobStore.create(buildCreatePayload())

      toast.add({
        severity: "success",
        summary: "Consolidation created",
        detail: "The consolidation job has been created.",
        life: 2500,
      })

      await router.push({ name: "tms.jobs.show", params: { id: job.id } })
    } catch (err: any) {
      createError.value = extractErrorMessage(err)
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: createError.value,
        life: 4000,
      })
    } finally {
      creatingJob.value = false
    }
  }

  function addConsolidatedItem() {
    Object.assign(consolidatedLineDraft, emptyConsolidatedLine())
    showConsolidatedItemModal.value = true
  }

  function confirmConsolidatedItem() {
    consolidatedLines.value.push({
      ...consolidatedLineDraft,
      id: consolidatedLineId.value++,
    })
    selectedInvoiceCurrency.value = String(consolidatedLineDraft.invoiceCurrency) as Currency
    showConsolidatedItemModal.value = false
  }

  function addDomesticCharge() {
    chargeModalTarget.value = "domestic"
    Object.assign(chargeDraft, emptyChargeLine("Domestic collection"))
    showChargeModal.value = true
  }

  function addExportCharge() {
    chargeModalTarget.value = "export"
    Object.assign(chargeDraft, emptyChargeLine("Consolidation handling"))
    showChargeModal.value = true
  }

  const chargeModalTitle = computed(() =>
    chargeModalTarget.value === "domestic" ? "Add Domestic Charge" : "Add Export Charge",
  )

  function confirmCharge() {
    const target = chargeModalTarget.value === "domestic" ? domesticChargeRows : exportChargeRows
    const id =
      chargeModalTarget.value === "domestic" ? domesticChargeId.value++ : exportChargeId.value++

    target.value.push({
      ...chargeDraft,
      id,
    })

    showChargeModal.value = false
  }

  function calcWeightBreakCost(weightKg: number) {
    if (weightKg <= 0) return 0
    if (weightKg <= 50) return 45
    if (weightKg <= 250) return weightKg * 0.85
    if (weightKg <= 500) return weightKg * 0.72
    return weightKg * 0.62
  }

  function addDomesticToQuote() {
    quoteLines.value = quoteLines.value.filter(line => line.sourceType !== "domestic")

    const collectionLines = domesticInvoiceRows.value.map(row => ({
      id: quoteLineId.value++,
      description: `Collection - ${row.coRef}${row.supplier ? ` (${row.supplier})` : ""}`,
      qty: 1,
      unit: "Fixed",
      rate: Number(row.cost || 0),
      sourceType: "domestic" as const,
      sourceId: row.coRef,
    }))

    const additionalLines = domesticChargeRows.value.map(line => ({
      ...line,
      id: quoteLineId.value++,
      sourceType: "domestic" as const,
      sourceId: `manual-${line.id}`,
    }))

    quoteLines.value = [...quoteLines.value, ...collectionLines, ...additionalLines]
    showQuotePanel.value = true
  }

  function addExportToQuote() {
    quoteLines.value = quoteLines.value.filter(line => line.sourceType !== "export")
    quoteLines.value = [
      ...quoteLines.value,
      ...exportChargeRows.value.map(line => ({
        ...line,
        id: quoteLineId.value++,
        sourceType: "export" as const,
        sourceId: line.id,
      })),
    ]
    showQuotePanel.value = true
  }

  function isExportLineInQuote(lineId: number) {
    return quoteLines.value.some(line => line.sourceType === "export" && line.sourceId === lineId)
  }

  function toggleExportLineQuote(lineId: number) {
    if (isExportLineInQuote(lineId)) {
      quoteLines.value = quoteLines.value.filter(
        line => !(line.sourceType === "export" && line.sourceId === lineId),
      )
      return
    }

    const source = exportChargeRows.value.find(line => line.id === lineId)
    if (!source) return
    quoteLines.value.push({
      ...source,
      id: quoteLineId.value++,
      sourceType: "export",
      sourceId: lineId,
    })
    showQuotePanel.value = true
  }

  function addQuoteLine() {
    const nextId = quoteLineId.value
    Object.assign(quoteLineDraft, {
      ...emptyChargeLine(chargeOptions[0] ?? "Consolidation handling"),
      sourceType: "manual",
      sourceId: `manual-${nextId}`,
    })
    showQuoteLineModal.value = true
  }

  function confirmQuoteLine() {
    const nextId = quoteLineId.value++

    quoteLines.value.push({
      ...quoteLineDraft,
      id: nextId,
      sourceType: "manual",
      sourceId: `manual-${nextId}`,
    })
    showQuoteLineModal.value = false
  }

  function cancelQuote() {
    quoteLines.value = []
    showQuotePanel.value = false
  }

  function convertQuoteToExportInvoice() {
    exportChargeRows.value = quoteLines.value.map(line => ({
      id: exportChargeId.value++,
      description: line.description,
      qty: line.qty,
      unit: line.unit,
      rate: line.rate,
    }))
    quoteLines.value = []
    showQuotePanel.value = false
  }

  function postDomesticInvoice() {
    domesticInvoice.posted = true
    domesticInvoice.date = new Date().toLocaleDateString("en-GB")
    domesticInvoice.ref = `DI-${overview.jobNo}-${Date.now().toString().slice(-4)}`
  }

  function postExportInvoice() {
    exportInvoice.posted = true
    exportInvoice.date = new Date().toLocaleDateString("en-GB")
    exportInvoice.ref = `EI-${overview.jobNo}-${Date.now().toString().slice(-4)}`
  }

  function supplierInvoicesByCurrency(currency: Currency) {
    return supplierInvoices.value.filter(invoice => invoice.currency === currency)
  }

  function refreshHaulierQuote() {
    const totals = collectionDraftTotals.value
    haulierQuoteText.value = [
      `Subject: Collection / Transport Quote Request - ${collectionDraft.coRef} (${overview.jobNo})`,
      "",
      "Please quote for the following collection and transport service.",
      `Collection From: ${collectionDraft.collectionAddress}`,
      `Delivery To: ${collectionDraft.deliveryAddress}`,
      `Pickup: ${collectionDraft.pickupDate} ${collectionDraft.pickupTime}`,
      `Required Delivery: ${collectionDraft.deliveryDate}`,
      `Mode: ${overview.mode} - ${collectionDraft.vehicle}`,
      `Cargo: ${collectionDraft.goodsDescription}`,
      `Pieces: ${totals.pieces}`,
      `Gross Weight: ${totals.weight.toFixed(1)} kg`,
      `Volume: ${totals.volume.toFixed(3)} cbm`,
      `ADR: ${collectionDraft.lines.some(line => line.adr) ? "Yes" : "No"}`,
      `Budget / Target Rate: ${money("GBP", collectionDraft.freight)}`,
    ].join("\n")
  }

  function cbm(line: PackageLine) {
    return (
      (Number(line.qty || 0) *
        Number(line.length || 0) *
        Number(line.width || 0) *
        Number(line.height || 0)) /
      1_000_000
    )
  }

  function invoiceTotals(invoice: SupplierInvoice) {
    return invoice.items.reduce(
      (sum, item) => {
        sum.collies += Number(item.collie || 0)
        sum.net += Number(item.net || 0)
        sum.gross += Number(item.gross || 0)
        return sum
      },
      { collies: 0, net: 0, gross: 0 },
    )
  }

  function formatCurrencyTotals(totals: Map<string, number>) {
    const entries = Array.from(totals.entries())
    if (!entries.length) return "£0.00"
    return entries.map(([currency, value]) => money(currency, value)).join(" / ")
  }

  function ldm(line: PackageLine) {
    return (Number(line.qty || 0) * Number(line.length || 0) * Number(line.width || 0)) / 24000
  }

  function money(currency: string, value: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0))
  }

  return {
    activeSupplierName,
    activeTab,
    addCollectionLine,
    addConsolidatedItem,
    addDomesticCharge,
    addDomesticToQuote,
    addExportCharge,
    addExportToQuote,
    addQuoteLine,
    addressOptions,
    addSupplierItem,
    adrClassOptions,
    cancelQuote,
    calendarDate,
    carrierOptions,
    cbm,
    chargeDraft,
    chargeModalTitle,
    chargeOptions,
    collectionChargeTotal,
    collectionDraft,
    collectionDraftTotals,
    collectionFscAmount,
    collectionLineDraft,
    collectionOrders,
    collectionRefOptions,
    confirmCharge,
    confirmCollectionLine,
    confirmConsolidatedItem,
    confirmQuoteLine,
    confirmSupplierCollectionLink,
    confirmSupplierItem,
    consolidatedFreightCharge,
    consolidatedLineDraft,
    consolidatedTotalsMap,
    convertQuoteToExportInvoice,
    createConsolidationJob,
    createError,
    creatingJob,
    currencyOptions,
    customerInvoiceSubtotal,
    customerInvoiceTax,
    customerInvoiceTotal,
    deliveryAddressOptions,
    domesticChargeRows,
    domesticInvoice,
    domesticInvoiceRows,
    domesticTotal,
    exportChargeRows,
    exportInvoice,
    exportTotal,
    filteredConsolidatedLines,
    formatCurrencyTotals,
    getPackageStackOption,
    goodsInRows,
    hasAdr,
    haulierQuoteText,
    incotermOptions,
    invoiceCurrencies,
    invoiceTotals,
    isExportLineInQuote,
    jobNumberAuto,
    jobNumberPlaceholder,
    jobNumberUsesSystem,
    ldm,
    metrics,
    modeOptions,
    money,
    nextCollectionRef,
    nextGrnRef,
    openSupplierCollectionLinkModal,
    openCollectionOrderModal,
    openSupplierInvoiceModal,
    overview,
    packageBreakdown,
    packageOptions,
    postDomesticInvoice,
    postExportInvoice,
    quote,
    quoteLineDraft,
    quoteLines,
    quoteStatusOptions,
    quoteSubtotal,
    refreshHaulierQuote,
    removeSupplierItem,
    saveCollectionOrder,
    saveSupplierInvoice,
    selectedCurrencyDapTotal,
    selectedCurrencyGoodsTotal,
    selectedInvoiceCurrency,
    selectedSupplierSummary,
    setOverviewDate,
    setPackageStackOption,
    setTransportDate,
    shipFromOptions,
    showChargeModal,
    showCollectionOrderModal,
    showCollectionLineModal,
    showConsolidatedItemModal,
    showQuoteLineModal,
    showQuotePanel,
    showSupplierCollectionLinkModal,
    showSupplierInvoiceModal,
    showSupplierItemModal,
    supplierCollectionLinkDraft,
    supplierDraft,
    supplierDraftTotals,
    supplierExaNumbers,
    supplierInvoiceId,
    supplierInvoiceLinkOptions,
    supplierInvoices,
    supplierInvoicesByCurrency,
    supplierItemDraft,
    supplierSummaries,
    supplierTotalsMap,
    tabs,
    taxRate,
    toggleExportLineQuote,
    transport,
    transportFields,
    transportFieldOptions,
    transportFieldInputType,
    transportFieldPlaceholder,
    transportLocationOptions,
    unitOptions,
    vehicleOptions,
    weightBreakRates,
    yesNoOptions,
  }
}
