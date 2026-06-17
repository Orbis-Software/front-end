import { computed, onMounted, ref, watch } from "vue"
import type { PageState } from "primevue/paginator"
import { storeToRefs } from "pinia"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import type {
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
  const store = useGlobalReferenceDataStore()
  const { data, loading, error } = storeToRefs(store)

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

  const unifiedRows = computed<ReferenceRow[]>(() => {
    return [
      ...data.value.terminals.map(row => normalizeRow(row, "terminals")),
      ...data.value.airlines.map(row => normalizeRow(row, "airlines")),
      ...data.value.cities.map(row => normalizeRow(row, "cities")),
    ]
  })

  const categoryOptions = computed<CategoryOption[]>(() => [
    {
      label: "All Reference Data",
      value: "",
      count: unifiedRows.value.length,
    },
    {
      label: "Transport Terminals",
      value: "terminals",
      count: data.value.terminals.length,
    },
    {
      label: "Air Cargo Airlines",
      value: "airlines",
      count: data.value.airlines.length,
    },
    {
      label: "Road Delivery Cities",
      value: "cities",
      count: data.value.cities.length,
    },
  ])

  const rowsInCategory = computed(() => {
    return unifiedRows.value.filter(row => {
      return !selectedCategory.value || row.category === selectedCategory.value
    })
  })

  const filteredRows = computed<ReferenceRow[]>(() => {
    const query = search.value.trim().toLowerCase()

    const filtered = rowsInCategory.value.filter(row => {
      const matchesSearch =
        !query || Object.values(row).some(value => String(value).toLowerCase().includes(query))
      const matchesType = !selectedType.value || row.type === selectedType.value
      const matchesCountry = !selectedCountry.value || row.country === selectedCountry.value
      const matchesRegion = !selectedRegion.value || row.region === selectedRegion.value
      const matchesStatus = !selectedStatus.value || row.status === selectedStatus.value

      return matchesSearch && matchesType && matchesCountry && matchesRegion && matchesStatus
    })

    if (!sortKey.value) return filtered

    return [...filtered].sort((a, b) => {
      return (
        String(a[sortKey.value] ?? "").localeCompare(String(b[sortKey.value] ?? "")) *
        sortDirection.value
      )
    })
  })

  const totalRecords = computed(() => filteredRows.value.length)

  const rows = computed<ReferenceRow[]>(() => {
    return filteredRows.value.slice(first.value, first.value + perPage.value)
  })

  const paginationStart = computed(() => {
    if (!totalRecords.value) return 0

    return first.value + 1
  })

  const paginationEnd = computed(() => {
    return Math.min(first.value + perPage.value, totalRecords.value)
  })

  const typeOptions = computed(() => unique(rowsInCategory.value.map(item => item.type ?? "")))
  const regionOptions = computed(() => unique(rowsInCategory.value.map(item => item.region ?? "")))
  const statusOptions = computed(() => unique(rowsInCategory.value.map(item => item.status ?? "")))
  const countryOptions = computed(() =>
    unique(rowsInCategory.value.map(item => item.country ?? "")),
  )

  async function fetchRows() {
    try {
      await store.fetchAll()
    } catch (err) {
      console.error("Unable to load global reference data", err)
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
      return
    }

    sortKey.value = key
    sortDirection.value = 1
    first.value = 0
  }

  function onPageChange(event: PageState) {
    first.value = event.first
    perPage.value = event.rows
  }

  function exportCsv() {
    const headerRow = columns.map(column => column.label)
    const dataRows = filteredRows.value.map(row => columns.map(column => row[column.key] ?? ""))

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
    () => {
      first.value = 0
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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function escapeCsvValue(value: string) {
  return String(value).replace(/"/g, '""')
}
