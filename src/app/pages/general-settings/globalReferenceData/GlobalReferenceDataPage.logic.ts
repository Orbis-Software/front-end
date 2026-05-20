import { computed, onMounted, ref, watch } from "vue"
import type { PageState } from "primevue/paginator"
import { storeToRefs } from "pinia"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import type {
  GlobalReferenceDataRow,
  GlobalReferenceDataTabValue,
} from "@/app/types/globalReferenceData"

type TabValue = GlobalReferenceDataTabValue

type ReferenceRow = GlobalReferenceDataRow

type Column = {
  label: string
  key: string
}

type ReferenceTab = {
  label: string
  value: TabValue
  icon: string
  count: number
}

const terminalColumns: Column[] = [
  { label: "Type", key: "type" },
  { label: "Country", key: "country" },
  { label: "Location", key: "location" },
  { label: "Terminal Name", key: "terminalName" },
  { label: "Region", key: "region" },
  { label: "Status", key: "status" },
  { label: "Function", key: "function" },
  { label: "Est. Year", key: "year" },
  { label: "Code", key: "code" },
  { label: "Coordinates", key: "coordinates" },
]

const airlineColumns: Column[] = [
  { label: "Airline Name", key: "name" },
  { label: "IATA", key: "iata" },
  { label: "ICAO", key: "icao" },
  { label: "AWB Prefix", key: "awb" },
  { label: "Country", key: "country" },
  { label: "Region", key: "region" },
  { label: "Fleet Type", key: "fleet" },
  { label: "Status", key: "status" },
]

const cityColumns: Column[] = [
  { label: "Type", key: "type" },
  { label: "Country", key: "country" },
  { label: "City / Town", key: "city" },
  { label: "Full Name", key: "fullName" },
  { label: "Region", key: "region" },
  { label: "Status", key: "status" },
  { label: "Function", key: "function" },
  { label: "State / County", key: "state" },
  { label: "Code", key: "code" },
  { label: "Coordinates", key: "coordinates" },
]

export function useGlobalReferenceDataPage() {
  const store = useGlobalReferenceDataStore()
  const { data, loading, error } = storeToRefs(store)

  const activeTab = ref<TabValue>("terminals")
  const search = ref("")
  const selectedType = ref("")
  const selectedRegion = ref("")
  const selectedStatus = ref("")
  const selectedCountry = ref("")
  const sortKey = ref("")
  const sortDirection = ref<1 | -1>(1)

  const first = ref(0)
  const perPage = ref(25)

  const tabs = computed<ReferenceTab[]>(() => [
    {
      label: "Transport Terminals",
      value: "terminals",
      icon: "🏭",
      count: data.value.terminals.length,
    },
    {
      label: "Air Cargo Airlines",
      value: "airlines",
      icon: "✈️",
      count: data.value.airlines.length,
    },
    {
      label: "Road Delivery Cities",
      value: "cities",
      icon: "🚚",
      count: data.value.cities.length,
    },
  ])

  const sourceRows = computed<ReferenceRow[]>(() => {
    if (activeTab.value === "airlines") return data.value.airlines
    if (activeTab.value === "cities") return data.value.cities

    return data.value.terminals
  })

  const columns = computed<Column[]>(() => {
    if (activeTab.value === "airlines") return airlineColumns
    if (activeTab.value === "cities") return cityColumns

    return terminalColumns
  })

  const filteredRows = computed<ReferenceRow[]>(() => {
    const query = search.value.trim().toLowerCase()

    const filtered = sourceRows.value.filter(row => {
      const matchesSearch =
        !query || Object.values(row).some(value => String(value).toLowerCase().includes(query))

      const matchesType =
        activeTab.value !== "terminals" || !selectedType.value || row.type === selectedType.value

      const matchesCountry =
        activeTab.value !== "cities" ||
        !selectedCountry.value ||
        row.country === selectedCountry.value

      const matchesRegion = !selectedRegion.value || row.region === selectedRegion.value

      const matchesStatus =
        activeTab.value === "cities" || !selectedStatus.value || row.status === selectedStatus.value

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

  const typeOptions = computed(() => {
    return unique(data.value.terminals.map(item => item.type ?? ""))
  })

  const regionOptions = computed(() => {
    return unique(sourceRows.value.map(item => item.region ?? ""))
  })

  const statusOptions = computed(() => {
    return unique(sourceRows.value.map(item => item.status ?? ""))
  })

  const countryOptions = computed(() => {
    return unique(data.value.cities.map(item => item.country ?? ""))
  })

  async function fetchRows() {
    try {
      await store.fetchAll()
    } catch (err) {
      console.error("Unable to load global reference data", err)
    }
  }

  function setTab(tab: TabValue) {
    activeTab.value = tab
    clearFilters()
  }

  function clearFilters() {
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
    const headerRow = columns.value.map(column => column.label)
    const dataRows = filteredRows.value.map(row =>
      columns.value.map(column => row[column.key] ?? ""),
    )

    const csv = [headerRow, ...dataRows]
      .map(row => row.map(value => `"${escapeCsvValue(value)}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `TMS_${activeTab.value}_reference_data.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  function getTypeClass(type: string) {
    if (type === "Airport") return "global-reference-page__badge--airport"
    if (type === "Seaport") return "global-reference-page__badge--seaport"
    if (type === "Rail Freight") return "global-reference-page__badge--rail"

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

  watch([search, selectedType, selectedRegion, selectedStatus, selectedCountry], () => {
    first.value = 0
  })

  watch(totalRecords, total => {
    if (first.value >= total) {
      first.value = 0
    }
  })

  onMounted(fetchRows)

  return {
    tabs,
    activeTab,
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
    setTab,
    clearFilters,
    exportCsv,
    sortBy,
    onPageChange,
    getTypeClass,
    getStatusClass,
  }
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function escapeCsvValue(value: string) {
  return String(value).replace(/"/g, '""')
}
