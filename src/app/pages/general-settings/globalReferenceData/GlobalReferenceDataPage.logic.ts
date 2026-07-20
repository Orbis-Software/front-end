import { computed, onMounted, ref, watch } from "vue"
import type { PageState } from "primevue/paginator"
import globalReferenceDataService from "@/app/services/global-reference-data"
import type {
  GlobalReferenceDataListResponse,
  GlobalReferenceDataRow,
  GlobalReferenceDataTabValue,
} from "@/app/types/globalReferenceData"

type CategoryValue = GlobalReferenceDataTabValue | ""
type ReferenceRow = GlobalReferenceDataRow

type Column = {
  label: string
  key: string
}

type CategoryOption = {
  label: string
  value: CategoryValue
  count: number
}

const columns: Column[] = [
  { label: "Category", key: "categoryLabel" },
  { label: "Code", key: "codes" },
  { label: "Location / Name", key: "primaryName" },
  { label: "Country", key: "country" },
  { label: "State / Region", key: "place" },
  { label: "Modes", key: "modes" },
  { label: "Timezone", key: "timezoneDisplay" },
  { label: "Coordinates", key: "coordinates" },
]

export function useGlobalReferenceDataPage() {
  const selectedCategory = ref<CategoryValue>("")
  const search = ref("")
  const selectedType = ref("")
  const selectedRegion = ref("")
  const selectedStatus = ref("")
  const selectedCountry = ref("")
  const selectedMode = ref("")
  const sortKey = ref("")
  const sortDirection = ref<1 | -1>(1)

  const first = ref(0)
  const perPage = ref(25)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const serverRows = ref<ReferenceRow[]>([])
  const totalRecords = ref(0)
  const counts = ref<Record<string, number>>({})
  const serverFilters = ref<GlobalReferenceDataListResponse["filters"]>({
    types: [],
    countries: [],
    country_codes: [],
    regions: [],
    states: [],
    statuses: [],
    modes: [],
  })
  let fetchTimer: number | null = null
  let fetchToken = 0

  const categoryOptions = computed<CategoryOption[]>(() => [
    {
      label: "All Reference Data",
      value: "",
      count: counts.value.all ?? totalRecords.value,
    },
    {
      label: "Delivery Locations",
      value: "locations",
      count: counts.value.locations ?? 0,
    },
    {
      label: "Air Cargo Airlines",
      value: "airlines",
      count: counts.value.airlines ?? 0,
    },
  ])

  const rows = computed<ReferenceRow[]>(() => serverRows.value)

  const paginationStart = computed(() => {
    if (!totalRecords.value) return 0

    return first.value + 1
  })

  const paginationEnd = computed(() => {
    return Math.min(first.value + perPage.value, totalRecords.value)
  })

  const typeOptions = computed(() => serverFilters.value.types)
  const regionOptions = computed(() => serverFilters.value.regions)
  const statusOptions = computed(() => serverFilters.value.statuses)
  const countryOptions = computed(() => serverFilters.value.countries)
  const modeOptions = computed(() =>
    (serverFilters.value.modes.length
      ? serverFilters.value.modes
      : ["road", "rail", "sea", "air"]
    ).map(value => ({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value,
    })),
  )

  async function fetchRows(delay = 0) {
    if (fetchTimer) {
      window.clearTimeout(fetchTimer)
      fetchTimer = null
    }

    if (delay > 0) {
      fetchTimer = window.setTimeout(() => fetchRows(), delay)
      return
    }

    const token = ++fetchToken
    loading.value = true
    error.value = null

    try {
      const result = await globalReferenceDataService.list({
        category: selectedCategory.value || undefined,
        type: selectedType.value || undefined,
        country: selectedCountry.value || undefined,
        mode:
          selectedCategory.value === "airlines"
            ? undefined
            : ((selectedMode.value || undefined) as any),
        region: selectedRegion.value || undefined,
        status: selectedStatus.value || undefined,
        search: search.value.trim() || undefined,
        sort: sortKey.value || undefined,
        direction: sortDirection.value === -1 ? "desc" : "asc",
        page: Math.floor(first.value / perPage.value) + 1,
        per_page: perPage.value,
      })

      if (token !== fetchToken) return

      serverRows.value = result.rows.map(row => normalizeRow(row, normalizeCategory(row.category)))
      totalRecords.value = result.meta.total
      counts.value = result.counts
      serverFilters.value = result.filters
    } catch (err: any) {
      console.error("Unable to load global reference data", err)
      error.value =
        err?.response?.data?.message || err?.message || "Failed to load global reference data."
    } finally {
      if (token === fetchToken) {
        loading.value = false
      }
    }
  }

  function clearFilters() {
    selectedCategory.value = ""
    search.value = ""
    selectedType.value = ""
    selectedRegion.value = ""
    selectedStatus.value = ""
    selectedCountry.value = ""
    selectedMode.value = ""
    sortKey.value = ""
    sortDirection.value = 1
    first.value = 0
  }

  function sortBy(key: string) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 1 ? -1 : 1
      first.value = 0
      fetchRows()
      return
    }

    sortKey.value = key
    sortDirection.value = 1
    first.value = 0
    fetchRows()
  }

  function onPageChange(event: PageState) {
    first.value = event.first
    perPage.value = event.rows
    fetchRows()
  }

  watch(
    [
      selectedCategory,
      search,
      selectedType,
      selectedRegion,
      selectedStatus,
      selectedCountry,
      selectedMode,
    ],
    ([, newSearch], [, oldSearch]) => {
      first.value = 0
      fetchRows(newSearch !== oldSearch ? 300 : 0)
    },
  )

  watch(selectedCategory, () => {
    selectedType.value = ""
    selectedRegion.value = ""
    selectedStatus.value = ""
    selectedCountry.value = ""

    if (selectedCategory.value === "airlines") {
      selectedMode.value = ""
    }
  })

  watch(totalRecords, total => {
    if (first.value >= total) {
      first.value = 0
    }
  })

  onMounted(fetchRows)

  return {
    categoryOptions,
    selectedCategory,
    search,
    selectedType,
    selectedRegion,
    selectedStatus,
    selectedCountry,
    selectedMode,
    typeOptions,
    regionOptions,
    statusOptions,
    countryOptions,
    modeOptions,
    loading,
    error,
    rows,
    columns,
    first,
    perPage,
    totalRecords,
    paginationStart,
    paginationEnd,
    clearFilters,
    sortBy,
    onPageChange,
  }
}

function normalizeRow(row: ReferenceRow, category: GlobalReferenceDataTabValue): ReferenceRow {
  if (category === "locations") {
    return {
      ...blankRow(),
      ...row,
      category,
      categoryLabel: "Delivery Location",
      primaryName: row.fullName || row.city || row.location || row.code || "",
      place: [row.state, row.region].filter(Boolean).join(" / "),
      code: row.code || "",
      codes: compactCodes([
        ["LOC", row.code],
        ["CC", row.countryCode],
      ]),
      modes: modeLabels(row),
      timezoneDisplay: [row.timezone, row.gmtOffset ? `GMT ${row.gmtOffset}` : ""]
        .filter(Boolean)
        .join(" / "),
    }
  }

  if (category === "terminals") {
    return {
      ...blankRow(),
      ...row,
      category,
      categoryLabel: "Terminal",
      primaryName: row.terminalName || row.name || "",
      place: row.location || "",
      code: row.code || row.iata || "",
      codes: compactCodes([
        ["Code", row.code],
        ["IATA", row.iata],
        ["ICAO", row.icao],
      ]),
    }
  }

  if (category === "airlines") {
    return {
      ...blankRow(),
      ...row,
      category,
      categoryLabel: "Airline",
      type: row.type || "Air Cargo",
      primaryName: row.name || "",
      place: row.fleet || "",
      function: row.function || "Air Cargo",
      modes: "Air",
      timezoneDisplay: "",
      code: row.code || row.iata || row.icao || "",
      codes: compactCodes([
        ["IATA", row.iata],
        ["ICAO", row.icao],
        ["AWB", row.awb],
      ]),
    }
  }

  return {
    ...blankRow(),
    ...row,
    category,
    categoryLabel: "City",
    primaryName: row.fullName || row.city || "",
    place: row.state || "",
    codes: compactCodes([["Code", row.code]]),
    modes: row.function || "Road",
    timezoneDisplay: "",
  }
}

function normalizeCategory(value: string | undefined): GlobalReferenceDataTabValue {
  if (value === "locations" || value === "airlines" || value === "cities") return value

  return "terminals"
}

function blankRow(): ReferenceRow {
  return {
    category: "",
    categoryLabel: "",
    type: "",
    country: "",
    primaryName: "",
    place: "",
    region: "",
    status: "",
    function: "",
    code: "",
    iata: "",
    icao: "",
    awb: "",
    codes: "",
    coordinates: "",
    modes: "",
    timezoneDisplay: "",
  }
}

function compactCodes(entries: Array<[string, string | undefined]>) {
  return entries
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join(" / ")
}

function modeLabels(row: ReferenceRow): string {
  return [
    ["Road", row.road],
    ["Rail", row.rail],
    ["Sea", row.sea],
    ["Air", row.air],
  ]
    .filter(([, enabled]) => enabled === "true" || enabled === "1")
    .map(([label]) => label)
    .join(" / ")
}
