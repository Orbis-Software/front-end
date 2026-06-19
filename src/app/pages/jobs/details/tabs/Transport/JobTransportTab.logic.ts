import { computed, inject, onMounted, ref, watch } from "vue"
import { storeToRefs } from "pinia"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useCountryStore } from "@/app/stores/country"
import contactsService from "@/app/services/contacts"
import globalReferenceDataService from "@/app/services/global-reference-data"
import type { GlobalReferenceDataRow } from "@/app/types/globalReferenceData"
import type { Contact } from "@/app/types/contact"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Country } from "@/app/types/country"
import type { useJobDetailsPage } from "../../JobDetailsPage.logic"
import type {
  BuyCostRow,
  JobTransportTabMode as TransportMode,
  MultiModalLeg,
  MultiModalLegMode,
} from "@/app/types/job-details"

let legId = 1

type ReferenceOption = {
  label: string
  value: string
  subLabel?: string
  searchText: string
}

type ContactOption = {
  label: string
  value: number
  subLabel?: string
  contact: Contact
}

type CountryOption = {
  label: string
  value: string
  subLabel: string
  searchText: string
}

type MultiDropStop = {
  id: number
  company_location: string
  city_postcode: string
  date: string
  stop_type: string
}

const GLOBAL_REFERENCE_OPTION_LIMIT = 150
const HAULIER_COST_ROW_ID = "haulier-buy-rate"
const HAULIER_COST_SOURCE = "road-haulier"
const DEFAULT_HAULIER_CHARGE_DESCRIPTION = "Haulier Charge"

function createLeg(): MultiModalLeg {
  return {
    id: -legId++,
    mode: "road",

    carrier: "",
    reference: "",
    origin: "",
    destination: "",
    etd: "",
    eta: "",
    notes: "",

    vehicle_type: "",
    driver_name: "",
    driver_mobile: "",

    vessel: "",
    voyage: "",
    container: "",

    airline: "",
    flight: "",
    awb: "",

    train: "",
    wagon: "",

    tracking: "",
    service: "",
    extra_data: {},
  }
}

function displayContactName(contact: Contact): string {
  return (
    contact.company_name ||
    (contact as any)?.name ||
    [(contact as any)?.first_name, (contact as any)?.last_name].filter(Boolean).join(" ") ||
    contact.email ||
    `Contact ${contact.id}`
  )
}

function normalizeDescription(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
}

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function filterText(event: { value?: unknown } | unknown): string {
  const value =
    event && typeof event === "object" && "value" in event ? (event as any).value : event

  return String(value ?? "")
}

function createMultiDropStop(): MultiDropStop {
  return {
    id: -Date.now() - Math.floor(Math.random() * 10000),
    company_location: "",
    city_postcode: "",
    date: "",
    stop_type: "Delivery",
  }
}

export function useJobTransportTab() {
  const jobDetails = inject<ReturnType<typeof useJobDetailsPage>>("jobDetails")
  const globalReferenceDataStore = useGlobalReferenceDataStore()
  const chargeCodeStore = useChargeCodeStore()
  const countryStore = useCountryStore()
  const { data: globalReferenceData } = storeToRefs(globalReferenceDataStore)
  const contactOptionsLoading = ref(false)
  const contactOptions = ref<ContactOption[]>([])
  const globalReferenceSearchTerm = ref("")
  const remoteGlobalReferenceRows = ref<Array<{ row: GlobalReferenceDataRow; category: string }>>(
    [],
  )
  let globalReferenceFetchTimer: number | null = null
  let globalReferenceFetchToken = 0
  const haulierBuyCostRowId = ref<number | string | null>(null)
  const lastHaulierChargeDescription = ref("")

  if (!jobDetails) {
    throw new Error("Job details context is missing")
  }

  const { form, referenceOptions } = jobDetails

  const haulierChargeDescriptionOptions = computed(() =>
    chargeCodeStore.chargeCodes.map(charge => ({
      label: charge.description,
      value: charge.description,
    })),
  )

  const globalReferenceRows = computed(() => {
    const rows = [
      ...remoteGlobalReferenceRows.value,
      ...globalReferenceData.value.terminals.map(row => ({ row, category: "Terminal" })),
      ...globalReferenceData.value.airlines.map(row => ({ row, category: "Airline" })),
      ...globalReferenceData.value.cities.map(row => ({ row, category: "City" })),
    ]

    return uniqueReferenceRows(rows)
  })

  const selectedReferenceValues = computed(() => {
    return new Set(
      [
        ...multiModalLegs.value.flatMap(leg => [
          leg.origin,
          leg.destination,
          leg.extra_data?.final_destination,
          leg.extra_data?.transhipment_port,
          leg.extra_data?.via_transhipment,
        ]),
        ...multiDropStops.value.map(stop => stop.city_postcode),
        form.road_detail.origin_city,
        form.road_detail.destination_city,
        form.road_detail.final_destination,
        form.road_detail.customs_port_border,
        form.road_detail.customs_paperwork_city,
        form.road_detail.customs_departure_office,
        form.road_detail.customs_delivery_clearance_city,
        form.rail_detail.loading_terminal,
        form.rail_detail.discharge_terminal,
        form.rail_detail.final_destination,
        form.sea_detail.port_of_loading,
        form.sea_detail.port_of_discharge,
        form.sea_detail.transhipment_port,
        form.sea_detail.final_destination,
        form.air_detail.airport_of_departure,
        form.air_detail.airport_of_arrival,
        form.air_detail.via_transhipment,
        form.air_detail.final_destination,
        form.courier_detail.final_destination,
      ]
        .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
        .map(value => value.trim()),
    )
  })

  const visibleGlobalReferenceOptions = computed(() => {
    const query = normalizeSearch(globalReferenceSearchTerm.value)
    const options: ReferenceOption[] = []
    const usedValues = new Set<string>()

    selectedReferenceValues.value.forEach(value => {
      const option = findReferenceOptionByValue(value)

      if (option && !usedValues.has(option.value)) {
        usedValues.add(option.value)
        options.push(option)
        return
      }

      if (!usedValues.has(value)) {
        usedValues.add(value)
        options.push({
          label: value,
          value,
          subLabel: "Selected value",
          searchText: value,
        })
      }
    })

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

  const airportOptions = computed(() => {
    return visibleGlobalReferenceOptions.value
  })

  const seaportOptions = computed(() => {
    return visibleGlobalReferenceOptions.value
  })

  const railTerminalOptions = computed(() => {
    return visibleGlobalReferenceOptions.value
  })

  const roadTerminalOptions = computed(() => {
    return visibleGlobalReferenceOptions.value
  })

  const cityOptions = computed(() => {
    return visibleGlobalReferenceOptions.value
  })

  const countryOptions = computed<CountryOption[]>(() =>
    countryStore.items
      .map(countryOption)
      .sort((left, right) => left.label.localeCompare(right.label)),
  )

  function referenceOption(row: GlobalReferenceDataRow, category: string): ReferenceOption {
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
    const type = firstValue(row, ["type", "function"])
    const place = firstValue(row, ["location", "city", "state", "fleet"])
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

  function countryOption(country: Country): CountryOption {
    const codes = [country.alpha_2, country.alpha_3].filter(Boolean).join(" / ")

    return {
      label: country.name,
      value: country.name,
      subLabel: codes,
      searchText: [country.name, country.alpha_2, country.alpha_3, country.dial_code]
        .filter(Boolean)
        .join(" "),
    }
  }

  function findReferenceOptionByValue(value: string): ReferenceOption | null {
    for (const entry of globalReferenceRows.value) {
      if (referenceValue(entry.row) === value) {
        return referenceOption(entry.row, entry.category)
      }
    }

    return null
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

  function rowMatchesSearch(row: GlobalReferenceDataRow, category: string, query: string): boolean {
    return normalizeSearch(searchText(row, [category])).includes(query)
  }

  function normalizeSearch(value: string): string {
    return value.trim().toLowerCase()
  }

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

  function getLocationOptions(locationMode: MultiModalLegMode): ReferenceOption[] {
    void locationMode

    return visibleGlobalReferenceOptions.value
  }

  function onGlobalReferenceFilter(event: { value?: string }) {
    globalReferenceSearchTerm.value = event.value ?? ""
    fetchGlobalReferenceOptions(250)
  }

  function syncSearchableDropdownInput(
    event: { value?: unknown } | unknown,
    target: Record<string, any>,
    key: string,
    options: { fetchGlobalReference?: boolean } = {},
  ) {
    const value = filterText(event)

    target[key] = value

    if (options.fetchGlobalReference) {
      onGlobalReferenceFilter({ value })
    }
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
      const response = await globalReferenceDataService.list({
        search: globalReferenceSearchTerm.value.trim() || undefined,
        per_page: GLOBAL_REFERENCE_OPTION_LIMIT,
        page: 1,
      })

      if (token !== globalReferenceFetchToken) return

      remoteGlobalReferenceRows.value = response.rows.map(row => ({
        row,
        category: referenceCategoryLabel(row.category),
      }))
    } catch (error) {
      console.error("Unable to load global reference dropdown options", error)
    }
  }

  function getOriginLabel(locationMode: MultiModalLegMode): string {
    if (locationMode === "air") return "Airport of Departure"
    if (locationMode === "sea") return "Port of Loading"
    if (locationMode === "rail") return "Loading Terminal"

    return "Origin Road Terminal"
  }

  function getDestinationLabel(locationMode: MultiModalLegMode): string {
    if (locationMode === "air") return "Airport of Arrival"
    if (locationMode === "sea") return "Port of Discharge"
    if (locationMode === "rail") return "Discharge Terminal"

    return "Destination Road Terminal"
  }

  const mode = computed<TransportMode>(() => {
    const value = form.mode_of_transport

    if (
      value === "road" ||
      value === "rail" ||
      value === "sea" ||
      value === "air" ||
      value === "courier" ||
      value === "multi_modal"
    ) {
      return value
    }

    return ""
  })

  const modeLabel = computed(() => {
    switch (mode.value) {
      case "road":
        return "Road Freight"
      case "rail":
        return "Rail Freight"
      case "sea":
        return "Sea Freight"
      case "air":
        return "Air Freight"
      case "courier":
        return "Courier"
      case "multi_modal":
        return "Multi Modal"
      default:
        return "No mode selected"
    }
  })

  const multiModalLegs = computed<MultiModalLeg[]>({
    get() {
      const extra = form as any

      if (!Array.isArray(extra.multi_modal_legs)) {
        extra.multi_modal_legs = []
      }

      extra.multi_modal_legs.forEach((leg: Partial<MultiModalLeg>) => {
        if (!leg.extra_data || typeof leg.extra_data !== "object") {
          leg.extra_data = {}
        }
      })

      return extra.multi_modal_legs
    },
    set(value) {
      ;(form as any).multi_modal_legs = value
    },
  })

  const multiDropStops = computed<MultiDropStop[]>({
    get() {
      const roadDetail = form.road_detail as any

      if (!Array.isArray(roadDetail.full_multi_drop_stops)) {
        roadDetail.full_multi_drop_stops = []
      }

      return roadDetail.full_multi_drop_stops
    },
    set(value) {
      ;(form.road_detail as any).full_multi_drop_stops = value
    },
  })

  function addLeg() {
    multiModalLegs.value = [...multiModalLegs.value, createLeg()]
  }

  function removeLeg(id: number) {
    multiModalLegs.value = multiModalLegs.value.filter(leg => leg.id !== id)
  }

  function addMultiDropStop() {
    multiDropStops.value = [...multiDropStops.value, createMultiDropStop()]
  }

  function removeMultiDropStop(id: number) {
    multiDropStops.value = multiDropStops.value.filter(stop => stop.id !== id)
  }

  function setBooleanDetail(key: string, value: boolean) {
    ;(form.road_detail as any)[key] = value
  }

  function syncSubcontractorContact(contactId: number | null) {
    const selected = contactOptions.value.find(option => option.value === Number(contactId))

    ;(form.road_detail as any).subcontractor_name = selected?.label ?? ""
  }

  function haulierChargeDescription() {
    return (
      String((form.road_detail as any).subcontractor_charge_description ?? "").trim() ||
      DEFAULT_HAULIER_CHARGE_DESCRIPTION
    )
  }

  function findChargeCodeByDescription(description: string): ChargeCode | null {
    return (
      chargeCodeStore.chargeCodes.find(charge => {
        return normalizeDescription(charge.description) === normalizeDescription(description)
      }) ?? null
    )
  }

  function generatedHaulierDescriptions(description: string) {
    return new Set(
      [description, lastHaulierChargeDescription.value, DEFAULT_HAULIER_CHARGE_DESCRIPTION]
        .map(normalizeDescription)
        .filter(Boolean),
    )
  }

  function rowUnitCost(row: BuyCostRow) {
    return numberValue((row as any).unitCost ?? (row as any).unit_cost ?? row.amount)
  }

  function findHaulierBuyCostRow(description: string, supplierId: number | null, rate: number) {
    const byRuntimeId = form.buy_costs.find(row => {
      return row.id === haulierBuyCostRowId.value || row.id === HAULIER_COST_ROW_ID
    })

    if (byRuntimeId) return byRuntimeId

    const descriptions = generatedHaulierDescriptions(description)

    return (
      form.buy_costs.find(row => {
        const descriptionMatches = descriptions.has(normalizeDescription(row.description))
        const supplierMatches =
          !supplierId || !row.supplier_id || Number(row.supplier_id) === Number(supplierId)
        const rateMatches = !rate || Math.abs(rowUnitCost(row) - rate) < 0.01

        return (
          (row as any).autoSource === HAULIER_COST_SOURCE ||
          (descriptionMatches && supplierMatches && rateMatches)
        )
      }) ?? null
    )
  }

  function removeHaulierBuyCostRow(row: BuyCostRow | null) {
    if (!row) return

    form.buy_costs = form.buy_costs.filter(cost => cost.id !== row.id)
    haulierBuyCostRowId.value = null
  }

  function syncHaulierBuyCost() {
    const roadDetail = form.road_detail as any
    const description = haulierChargeDescription()
    const rate = numberValue(roadDetail.subcontractor_buy_rate)
    const supplierId = roadDetail.subcontractor_contact_id
      ? Number(roadDetail.subcontractor_contact_id)
      : null
    const existingRow = findHaulierBuyCostRow(description, supplierId, rate)

    if (!roadDetail.full_subcontractor_used || rate <= 0) {
      removeHaulierBuyCostRow(existingRow)
      lastHaulierChargeDescription.value = description
      return
    }

    if (!roadDetail.subcontractor_charge_description) {
      roadDetail.subcontractor_charge_description = description
    }

    const charge = findChargeCodeByDescription(description)
    const row =
      existingRow ??
      ({
        id: HAULIER_COST_ROW_ID,
        type: "buy",
        description,
        supplier_id: supplierId,
        chargeCodeId: null,
        quantity: 1,
        unitCost: 0,
        currency: "GBP",
        exchangeRate: 1,
        amount: 0,
      } as BuyCostRow)

    ;(row as any).autoSource = HAULIER_COST_SOURCE
    row.description = description
    row.supplier_id = supplierId
    row.chargeCodeId = charge?.id ?? null
    row.quantity = 1
    row.unitCost = rate
    row.currency = roadDetail.subcontractor_buy_currency || "GBP"
    row.exchangeRate = row.currency === "GBP" ? 1 : row.exchangeRate || 1
    row.amount = rate

    if (!existingRow) {
      form.buy_costs.push(row)
    }

    haulierBuyCostRowId.value = row.id
    lastHaulierChargeDescription.value = description
  }

  async function loadContactOptions() {
    contactOptionsLoading.value = true

    try {
      const response = await contactsService.list({
        page: 1,
        per_page: 500,
        include_addresses: true,
      })

      contactOptions.value = (response.data ?? [])
        .filter(contact => Number(contact.id) !== Number(form.customer_id))
        .map(contact => {
          const label = displayContactName(contact)
          const subLabel = [contact.account_number, contact.email, contact.phone]
            .filter(Boolean)
            .join(" | ")

          return {
            label,
            value: Number(contact.id),
            subLabel,
            contact,
          }
        })
    } finally {
      contactOptionsLoading.value = false
    }
  }

  watch(
    () => (form.road_detail as any).subcontractor_contact_id,
    id => {
      syncSubcontractorContact(id ? Number(id) : null)
    },
  )

  watch(
    () => [
      (form.road_detail as any).full_subcontractor_used,
      (form.road_detail as any).subcontractor_contact_id,
      (form.road_detail as any).subcontractor_charge_description,
      (form.road_detail as any).subcontractor_buy_rate,
      (form.road_detail as any).subcontractor_buy_currency,
      chargeCodeStore.chargeCodes.length,
    ],
    syncHaulierBuyCost,
    { immediate: true },
  )

  watch(
    () => form.customer_id,
    customerId => {
      contactOptions.value = contactOptions.value.filter(
        option => option.value !== Number(customerId),
      )

      if (Number((form.road_detail as any).subcontractor_contact_id) === Number(customerId)) {
        ;(form.road_detail as any).subcontractor_contact_id = null
        ;(form.road_detail as any).subcontractor_name = ""
      }
    },
  )

  onMounted(async () => {
    const hasReferenceData =
      globalReferenceData.value.terminals.length ||
      globalReferenceData.value.airlines.length ||
      globalReferenceData.value.cities.length

    if (!hasReferenceData) {
      await globalReferenceDataStore.fetchAll()
    }

    countryStore.perPage = 300
    if (!countryStore.items.length) {
      await countryStore.fetch()
    }

    await fetchGlobalReferenceOptions()
    if (!chargeCodeStore.chargeCodes.length) {
      await chargeCodeStore.fetchAll({ sort: "description", direction: "asc", perPage: 1000 })
    }
    await loadContactOptions()
  })

  return {
    form,
    mode,
    modeLabel,
    multiModalLegs,
    multiDropStops,
    airportOptions,
    seaportOptions,
    railTerminalOptions,
    roadTerminalOptions,
    cityOptions,
    countryOptions,
    countriesLoading: countryStore.loading,
    referenceOptions,
    haulierChargeDescriptionOptions,
    contactOptions,
    contactOptionsLoading,
    getLocationOptions,
    getOriginLabel,
    getDestinationLabel,
    onGlobalReferenceFilter,
    syncSearchableDropdownInput,
    addLeg,
    removeLeg,
    addMultiDropStop,
    removeMultiDropStop,
    setBooleanDetail,
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
  if (category === "cities") return "City"

  return "Terminal"
}
