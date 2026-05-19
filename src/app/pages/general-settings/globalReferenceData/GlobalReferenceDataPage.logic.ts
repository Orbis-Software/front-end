import { computed, ref } from "vue"

type TabValue = "terminals" | "airlines" | "cities"

type ReferenceRow = Record<string, string>

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

const terminals: ReferenceRow[] = [
  {
    type: "Airport",
    country: "USA",
    location: "Memphis, TN",
    terminalName: "Memphis International Airport",
    region: "North America",
    status: "Active",
    function: "Cargo Hub",
    year: "1929",
    code: "MEM",
    coordinates: "35.0424°N, 89.9767°W",
  },
  {
    type: "Airport",
    country: "UK",
    location: "London",
    terminalName: "London Heathrow Airport",
    region: "Europe",
    status: "Active",
    function: "Cargo + Passenger",
    year: "1946",
    code: "LHR",
    coordinates: "51.4700°N, 0.4543°W",
  },
  {
    type: "Seaport",
    country: "China",
    location: "Shanghai",
    terminalName: "Port of Shanghai",
    region: "Asia Pacific",
    status: "Active",
    function: "Container / Multi-Purpose",
    year: "1684",
    code: "CNSHA",
    coordinates: "31.2304°N, 121.4737°E",
  },
  {
    type: "Rail Freight",
    country: "UK",
    location: "Daventry",
    terminalName: "DIRFT – Daventry International Rail Freight Terminal",
    region: "Europe",
    status: "Active",
    function: "Intermodal Container Depot",
    year: "1997",
    code: "GBDAV",
    coordinates: "52.2610°N, 1.1559°W",
  },
  {
    type: "Road Freight",
    country: "Netherlands",
    location: "Tilburg",
    terminalName: "Tilburg Distribution Hub",
    region: "Europe",
    status: "Active",
    function: "Road Distribution Hub",
    year: "1985",
    code: "NLTLB",
    coordinates: "51.5600°N, 5.0913°E",
  },
]

const airlines: ReferenceRow[] = [
  {
    name: "American Airlines Cargo",
    iata: "AA",
    icao: "AAL",
    awb: "001",
    country: "USA",
    region: "North America",
    fleet: "B777, B787, A321 belly",
    status: "Active",
  },
  {
    name: "FedEx Express",
    iata: "FX",
    icao: "FDX",
    awb: "023",
    country: "USA",
    region: "North America",
    fleet: "B777F, B767F, ATR72F, B757F",
    status: "Active",
  },
  {
    name: "Lufthansa Cargo",
    iata: "LH",
    icao: "DLH",
    awb: "020",
    country: "Germany",
    region: "Europe",
    fleet: "B777F, MD-11F",
    status: "Active",
  },
  {
    name: "Emirates SkyCargo",
    iata: "EK",
    icao: "UAE",
    awb: "176",
    country: "UAE",
    region: "Middle East",
    fleet: "B777F, B747-400ERF",
    status: "Active",
  },
  {
    name: "TNT Airways",
    iata: "3V",
    icao: "TAY",
    awb: "—",
    country: "Belgium",
    region: "Europe",
    fleet: "B777F, B747-400F",
    status: "Inactive",
  },
]

const cities: ReferenceRow[] = [
  {
    type: "Major City",
    country: "United Kingdom",
    city: "London",
    fullName: "Greater London",
    region: "Europe",
    status: "Active",
    function: "Metro Delivery Hub",
    state: "Greater London",
    code: "GB-LND",
    coordinates: "51.5074°N, 0.1278°W",
  },
  {
    type: "Major City",
    country: "Germany",
    city: "Berlin",
    fullName: "Berlin",
    region: "Europe",
    status: "Active",
    function: "Capital Hub",
    state: "Berlin",
    code: "DE-BER",
    coordinates: "52.5200°N, 13.4050°E",
  },
  {
    type: "Major City",
    country: "United States",
    city: "New York",
    fullName: "New York City",
    region: "North America",
    status: "Active",
    function: "Metro Delivery Hub",
    state: "New York",
    code: "US-NYC",
    coordinates: "40.7128°N, 74.0060°W",
  },
  {
    type: "Major City",
    country: "Philippines",
    city: "Manila",
    fullName: "Manila",
    region: "Asia Pacific",
    status: "Active",
    function: "Port City",
    state: "Metro Manila",
    code: "PH-MNL",
    coordinates: "14.5995°N, 120.9842°E",
  },
]

const tabs: ReferenceTab[] = [
  {
    label: "Transport Terminals",
    value: "terminals",
    icon: "🏭",
    count: terminals.length,
  },
  {
    label: "Air Cargo Airlines",
    value: "airlines",
    icon: "✈️",
    count: airlines.length,
  },
  {
    label: "Road Delivery Cities",
    value: "cities",
    icon: "🚛",
    count: cities.length,
  },
]

export function useGlobalReferenceDataPage() {
  const activeTab = ref<TabValue>("terminals")
  const search = ref("")
  const selectedType = ref("")
  const selectedRegion = ref("")
  const selectedStatus = ref("")
  const selectedCountry = ref("")
  const sortKey = ref("")
  const sortDirection = ref<1 | -1>(1)

  const sourceRows = computed<ReferenceRow[]>(() => {
    if (activeTab.value === "airlines") return airlines
    if (activeTab.value === "cities") return cities

    return terminals
  })

  const columns = computed<Column[]>(() => {
    if (activeTab.value === "airlines") return airlineColumns
    if (activeTab.value === "cities") return cityColumns

    return terminalColumns
  })

  const rows = computed<ReferenceRow[]>(() => {
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

  const typeOptions = computed(() => {
    return unique(terminals.map(item => item.type ?? ""))
  })

  const regionOptions = computed(() => {
    return unique(sourceRows.value.map(item => item.region ?? ""))
  })

  const statusOptions = computed(() => {
    return unique(sourceRows.value.map(item => item.status ?? ""))
  })

  const countryOptions = computed(() => {
    return unique(cities.map(item => item.country ?? ""))
  })

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
  }

  function sortBy(key: string) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 1 ? -1 : 1
      return
    }

    sortKey.value = key
    sortDirection.value = 1
  }

  function exportCsv() {
    const headerRow = columns.value.map(column => column.label)
    const dataRows = rows.value.map(row => columns.value.map(column => row[column.key] ?? ""))

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
    rows,
    columns,
    setTab,
    clearFilters,
    exportCsv,
    sortBy,
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
