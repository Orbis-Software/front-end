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
  { label: "Type", key: "type" },
  { label: "Country", key: "country" },
  { label: "Name", key: "primaryName" },
  { label: "Location", key: "place" },
  { label: "Region", key: "region" },
  { label: "Status", key: "status" },
  { label: "Function", key: "function" },
  { label: "Codes", key: "codes" },
]

export function useGlobalReferenceDataPage() {
  const selectedCategory = ref<CategoryValue>("")
  const search = ref("")
  const selectedType = ref("")
  const selectedRegion = ref("")
  const selectedStatus = ref("")
  const selectedCountry = ref("")
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
    regions: [],
    statuses: [],
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
      label: "Transport Terminals",
      value: "terminals",
      count: counts.value.terminals ?? 0,
    },
    {
      label: "Air Cargo Airlines",
      value: "airlines",
      count: counts.value.airlines ?? 0,
    },
    {
      label: "Road Delivery Cities",
      value: "cities",
      count: counts.value.cities ?? 0,
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

  function exportCsv() {
    const headerRow = columns.map(column => column.label)
    const dataRows = rows.value.map(row => columns.map(column => row[column.key] ?? ""))

    const csv = [headerRow, ...dataRows]
      .map(row => row.map(value => `"${escapeCsvValue(value)}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "TMS_global_reference_data.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  function getTypeClass(type: string) {
    if (type === "Airport") return "global-reference-page__badge--airport"
    if (type === "Seaport") return "global-reference-page__badge--seaport"
    if (type === "Rail Freight") return "global-reference-page__badge--rail"
    if (type === "Air Cargo") return "global-reference-page__badge--air"

    return "global-reference-page__badge--road"
  }

  function getStatusClass(status: string) {
    if (status === "Active") return "global-reference-page__status--active"
    if (status === "Inactive") return "global-reference-page__status--inactive"
    if (status === "Under Construction") {
      return "global-reference-page__status--construction"
    }

    return "global-reference-page__status--planned"
  }

  watch(
    [selectedCategory, search, selectedType, selectedRegion, selectedStatus, selectedCountry],
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
    typeOptions,
    regionOptions,
    statusOptions,
    countryOptions,
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
    exportCsv,
    sortBy,
    onPageChange,
    getTypeClass,
    getStatusClass,
  }
}

function normalizeRow(row: ReferenceRow, category: GlobalReferenceDataTabValue): ReferenceRow {
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
  }
}

function normalizeCategory(value: string | undefined): GlobalReferenceDataTabValue {
  if (value === "airlines" || value === "cities") return value

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
  }
}

function compactCodes(entries: Array<[string, string | undefined]>) {
  return entries
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join(" / ")
}

function escapeCsvValue(value: string) {
  return String(value).replace(/"/g, '""')
}
