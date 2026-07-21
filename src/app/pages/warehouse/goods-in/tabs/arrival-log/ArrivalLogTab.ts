import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import expectedArrivalsService from "@/app/services/wms-expected-arrivals"
import type { WmsExpectedArrival } from "@/app/types/wms-expected-arrival"
import type { SelectOption } from "@/app/types/select-option"

export function useArrivalLogTab() {
  const search = ref("")
  const selectedCustomer = ref("")
  const selectedSupplier = ref("")
  const rows = ref<WmsExpectedArrival[]>([])
  const loading = ref(false)
  const error = ref("")

  const customerOptions = computed<SelectOption[]>(() => [
    { label: "All Customers", value: "" },
    ...Array.from(new Set(rows.value.map(row => row.customer_name))).map(value => ({
      label: value,
      value,
    })),
  ])

  const supplierOptions = computed<SelectOption[]>(() => [
    { label: "All Suppliers", value: "" },
    ...Array.from(
      new Set(rows.value.map(row => row.supplier_name).filter(Boolean) as string[]),
    ).map(value => ({ label: value, value })),
  ])

  const filteredRows = computed(() =>
    rows.value.filter(row => {
      const matchesSearch =
        !search.value ||
        [
          row.wms_reference,
          row.receipt_reference,
          row.customer_name,
          row.supplier_name,
          row.description,
          row.storage_location,
          row.received_at,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.value.toLowerCase())
      return (
        matchesSearch &&
        (!selectedCustomer.value || row.customer_name === selectedCustomer.value) &&
        (!selectedSupplier.value || row.supplier_name === selectedSupplier.value)
      )
    }),
  )

  async function loadRows() {
    loading.value = true
    error.value = ""
    try {
      rows.value = (await expectedArrivalsService.list({ per_page: 100, status: "booked_in" })).data
    } catch (requestError: any) {
      error.value =
        requestError?.response?.data?.message || "Received consignments could not be loaded."
    } finally {
      loading.value = false
    }
  }

  function onSearchInput(value: string) {
    search.value = value
  }

  function weightLabel(row: WmsExpectedArrival): string {
    return row.received_weight_kg ? `${Number(row.received_weight_kg).toLocaleString()} kg` : "-"
  }

  function receivedDate(row: WmsExpectedArrival): string {
    if (!row.received_at) return "-"
    return new Date(row.received_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  onMounted(() => {
    loadRows()
    window.addEventListener("wms:consignment-received", loadRows)
  })
  onBeforeUnmount(() => window.removeEventListener("wms:consignment-received", loadRows))

  return {
    search,
    selectedCustomer,
    selectedSupplier,
    customerOptions,
    supplierOptions,
    loading,
    error,
    filteredRows,
    onSearchInput,
    weightLabel,
    receivedDate,
  }
}
