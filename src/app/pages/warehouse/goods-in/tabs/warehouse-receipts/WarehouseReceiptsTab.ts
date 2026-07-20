import { onBeforeUnmount, onMounted, ref } from "vue"
import expectedArrivalsService from "@/app/services/wms-expected-arrivals"
import type { WmsExpectedArrival } from "@/app/types/wms-expected-arrival"

export function useWarehouseReceiptsTab() {
  const rows = ref<WmsExpectedArrival[]>([])
  const loading = ref(false)
  const error = ref("")

  async function loadRows() {
    loading.value = true
    error.value = ""
    try {
      rows.value = (await expectedArrivalsService.list({ per_page: 100, status: "booked_in" })).data
    } catch (requestError: any) {
      error.value =
        requestError?.response?.data?.message || "Warehouse receipts could not be loaded."
    } finally {
      loading.value = false
    }
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

  return { rows, loading, error, receivedDate }
}
