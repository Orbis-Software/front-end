import { computed, onMounted, reactive, ref, watch } from "vue"
import type { PageState } from "primevue/paginator"
import globalReferenceDataService from "@/app/services/global-reference-data"
import type {
  DeliveryLocationPayload,
  DeliveryLocationUpdate,
  GlobalReferenceCountryOption,
  GlobalReferenceDataColumn,
  GlobalReferenceDataListResponse,
  GlobalReferenceDataRow,
} from "@/app/types/globalReferenceData"

export type DeliveryLocationMode = "road" | "rail" | "sea" | "air"

const columns: GlobalReferenceDataColumn[] = [
  { label: "City", key: "city" },
  { label: "Country", key: "country" },
  { label: "Country Code", key: "country_code" },
  { label: "Location Code", key: "code" },
  { label: "State", key: "state" },
  { label: "Region", key: "region" },
  { label: "Modes", key: "modeCount" },
  { label: "Latitude", key: "latitude" },
  { label: "Longitude", key: "longitude" },
  { label: "Timezone", key: "timezone" },
]

const modes: Array<{ label: string; value: DeliveryLocationMode }> = [
  { label: "Road", value: "road" },
  { label: "Rail", value: "rail" },
  { label: "Sea", value: "sea" },
  { label: "Air", value: "air" },
]

const emptyFilters: GlobalReferenceDataListResponse["filters"] = {
  types: [],
  countries: [],
  country_options: [],
  country_codes: [],
  regions: [],
  states: [],
  statuses: [],
  modes: [],
}

function blankLocation(): DeliveryLocationPayload {
  return {
    city: "",
    country: "",
    country_code: "",
    code: "",
    state: "",
    region: "",
    latitude: null,
    longitude: null,
    timezone: "",
    road: true,
    rail: false,
    sea: false,
    air: false,
  }
}

export function useGlobalReferenceDataPage() {
  const search = ref("")
  const selectedCountry = ref("")
  const selectedModes = ref<DeliveryLocationMode[]>([])
  const sortKey = ref("country")
  const sortDirection = ref<1 | -1>(1)
  const first = ref(0)
  const perPage = ref(100)
  const loading = ref(false)
  const saving = ref(false)
  const adding = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)
  const serverRows = ref<GlobalReferenceDataRow[]>([])
  const totalRecords = ref(0)
  const unfilteredTotal = ref(0)
  const countriesTotal = ref(0)
  const generatedDate = ref("")
  const serverFilters = ref<GlobalReferenceDataListResponse["filters"]>({ ...emptyFilters })
  const pendingUpdates = ref<Record<string, DeliveryLocationUpdate>>({})
  const addDialogVisible = ref(false)
  const newLocation = reactive<DeliveryLocationPayload>(blankLocation())
  let fetchTimer: number | null = null
  let fetchToken = 0

  const rows = computed(() => serverRows.value)
  const countryOptions = computed<GlobalReferenceCountryOption[]>(
    () => serverFilters.value.country_options,
  )
  const hasChanges = computed(() => Object.keys(pendingUpdates.value).length > 0)
  const paginationStart = computed(() => (totalRecords.value ? first.value + 1 : 0))
  const paginationEnd = computed(() => Math.min(first.value + perPage.value, totalRecords.value))
  const formattedGeneratedDate = computed(() => {
    if (!generatedDate.value) return "—"

    const [year, month, day] = generatedDate.value.split("-")
    return year && month && day ? `${day}/${month}/${year}` : generatedDate.value
  })

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
        category: "locations",
        country: selectedCountry.value || undefined,
        modes: selectedModes.value.length ? selectedModes.value : undefined,
        search: search.value.trim() || undefined,
        sort: sortKey.value,
        direction: sortDirection.value === -1 ? "desc" : "asc",
        page: Math.floor(first.value / perPage.value) + 1,
        per_page: perPage.value,
      })

      if (token !== fetchToken) return

      serverRows.value = result.rows.map(row => ({ ...row }))
      totalRecords.value = result.meta.total
      unfilteredTotal.value = result.meta.unfiltered_total
      countriesTotal.value = result.meta.countries_total
      generatedDate.value = result.meta.generated_date
      serverFilters.value = result.filters
    } catch (err: any) {
      console.error("Unable to load delivery locations", err)
      error.value =
        err?.response?.data?.message || err?.message || "Failed to load delivery locations."
    } finally {
      if (token === fetchToken) loading.value = false
    }
  }

  function clearFilters() {
    search.value = ""
    selectedCountry.value = ""
    selectedModes.value = []
    sortKey.value = "country"
    sortDirection.value = 1
    first.value = 0
  }

  function sortBy(key: string) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 1 ? -1 : 1
    } else {
      sortKey.value = key
      sortDirection.value = 1
    }

    first.value = 0
    fetchRows()
  }

  function onPageChange(event: PageState) {
    first.value = event.first
    perPage.value = event.rows
    fetchRows()
  }

  function editLocation(row: GlobalReferenceDataRow, field: "code" | "state", value: string) {
    const id = Number(row.id)
    if (!id) return

    row[field] =
      field === "code"
        ? value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 3)
        : value
    pendingUpdates.value[id] = {
      id,
      code: row.code || "",
      state: row.state || "",
    }
    success.value = null
  }

  async function saveChanges() {
    const updates = Object.values(pendingUpdates.value)
    if (!updates.length || saving.value) return

    saving.value = true
    error.value = null
    success.value = null

    try {
      await globalReferenceDataService.saveLocations(updates)
      pendingUpdates.value = {}
      success.value = `${updates.length} location ${updates.length === 1 ? "change" : "changes"} saved.`
      await fetchRows()
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || "Unable to save changes."
    } finally {
      saving.value = false
    }
  }

  function openAddDialog() {
    Object.assign(newLocation, blankLocation())
    addDialogVisible.value = true
    error.value = null
    success.value = null
  }

  function onNewLocationCountryChange() {
    const option = countryOptions.value.find(item => item.name === newLocation.country)
    newLocation.country_code = option?.code ?? ""
    newLocation.region = option?.region ?? ""
  }

  async function addLocation() {
    if (
      !newLocation.city.trim() ||
      !newLocation.country ||
      !newLocation.country_code ||
      adding.value
    ) {
      error.value = "City and country are required."
      return
    }

    adding.value = true
    error.value = null

    try {
      await globalReferenceDataService.createLocation({
        ...newLocation,
        city: newLocation.city.trim(),
        code: newLocation.code?.trim().toUpperCase(),
        state: newLocation.state?.trim(),
        region: newLocation.region?.trim(),
        timezone: newLocation.timezone?.trim(),
      })
      addDialogVisible.value = false
      success.value = `${newLocation.city.trim()} was added to delivery locations.`
      first.value = 0
      await fetchRows()
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors
      error.value = validationErrors
        ? Object.values(validationErrors).flat().join(" ")
        : err?.response?.data?.message || err?.message || "Unable to add the location."
    } finally {
      adding.value = false
    }
  }

  function isEnabled(row: GlobalReferenceDataRow, mode: DeliveryLocationMode): boolean {
    return row[mode] === "true" || row[mode] === "1"
  }

  function coordinate(value: string | undefined): string {
    if (!value) return "—"
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric.toFixed(4) : value
  }

  function timezoneDisplay(row: GlobalReferenceDataRow): string {
    if (!row.timezone) return "—"
    if (!row.gmtOffset) return row.timezone

    const offset = row.gmtOffset.toUpperCase().startsWith("GMT")
      ? row.gmtOffset
      : `GMT${row.gmtOffset}`
    return `${row.timezone} (${offset})`
  }

  watch(
    [search, selectedCountry, selectedModes],
    ([newSearch], [oldSearch]) => {
      first.value = 0
      fetchRows(newSearch !== oldSearch ? 300 : 0)
    },
    { deep: true },
  )

  watch(totalRecords, total => {
    if (first.value >= total) first.value = 0
  })

  onMounted(fetchRows)

  return {
    columns,
    modes,
    search,
    selectedCountry,
    selectedModes,
    sortKey,
    sortDirection,
    first,
    perPage,
    loading,
    saving,
    adding,
    error,
    success,
    rows,
    totalRecords,
    unfilteredTotal,
    countriesTotal,
    formattedGeneratedDate,
    countryOptions,
    hasChanges,
    paginationStart,
    paginationEnd,
    addDialogVisible,
    newLocation,
    clearFilters,
    sortBy,
    onPageChange,
    editLocation,
    saveChanges,
    openAddDialog,
    onNewLocationCountryChange,
    addLocation,
    isEnabled,
    coordinate,
    timezoneDisplay,
  }
}
