import { onMounted, ref } from "vue"
import type { AddExpectedArrivalPayload } from "@/app/components/warehouse/goods-in/AddExpectedArrivalModal.vue"
import type { ReceiveConsignmentPayload } from "@/app/components/warehouse/goods-in/ReceiveConsignmentModal.vue"
import expectedArrivalsService from "@/app/services/wms-expected-arrivals"
import type { WmsExpectedArrival, WmsExpectedArrivalStatus } from "@/app/types/wms-expected-arrival"

export function useExpectedArrivalsTab() {
  const rows = ref<WmsExpectedArrival[]>([])
  const expectedArrivalOpen = ref(false)
  const receiveConsignmentOpen = ref(false)
  const selectedArrival = ref<WmsExpectedArrival | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref("")

  async function loadRows() {
    loading.value = true
    error.value = ""

    try {
      const response = await expectedArrivalsService.list({ per_page: 100, status: "open" })
      rows.value = response.data
    } catch (requestError: any) {
      error.value =
        requestError?.response?.data?.message || "Expected arrivals could not be loaded."
    } finally {
      loading.value = false
    }
  }

  function onAddExpectedArrival() {
    expectedArrivalOpen.value = true
  }

  function onCloseExpectedArrival() {
    if (!saving.value) expectedArrivalOpen.value = false
  }

  async function onSavedExpectedArrival(payload: AddExpectedArrivalPayload) {
    saving.value = true
    error.value = ""

    try {
      const arrival = await expectedArrivalsService.create({
        customer_name: payload.customer.trim(),
        supplier_name: payload.supplier.trim() || null,
        description: payload.description.trim(),
        expected_date: toApiDate(payload.expectedDate),
        estimated_quantity: payload.qty ?? 0,
        external_reference: payload.reference.trim() || null,
        status: normalizeStatus(payload.status),
        notes: payload.notes.trim() || null,
      })
      rows.value.unshift(arrival)
      expectedArrivalOpen.value = false
    } catch (requestError: any) {
      error.value =
        requestError?.response?.data?.message || "The expected arrival could not be saved."
    } finally {
      saving.value = false
    }
  }

  async function removeRow(row: WmsExpectedArrival) {
    if (row.is_source_locked) return
    if (!window.confirm(`Remove ${row.wms_reference}?`)) return

    error.value = ""
    try {
      await expectedArrivalsService.remove(row.id)
      rows.value = rows.value.filter(item => item.id !== row.id)
    } catch (requestError: any) {
      error.value = requestError?.response?.data?.message || "The arrival could not be removed."
    }
  }

  function onReceive(row: WmsExpectedArrival) {
    selectedArrival.value = row
    receiveConsignmentOpen.value = true
  }

  function onCloseReceive() {
    if (saving.value) return
    receiveConsignmentOpen.value = false
    selectedArrival.value = null
  }

  async function onSavedReceive(payload: ReceiveConsignmentPayload) {
    if (!selectedArrival.value) return
    saving.value = true
    error.value = ""

    try {
      const received = await expectedArrivalsService.receive(selectedArrival.value.id, {
        storage_location: payload.location.trim() || null,
        received_by_name: payload.receivedBy.trim() || null,
        received_quantity: payload.qty ?? selectedArrival.value.estimated_quantity,
        received_weight_kg: payload.weight,
        received_volume_cbm: payload.cbm,
        notes: payload.notes.trim() || null,
      })
      rows.value = rows.value.filter(row => row.id !== received.id)
      receiveConsignmentOpen.value = false
      selectedArrival.value = null
    } catch (requestError: any) {
      error.value =
        requestError?.response?.data?.message || "The consignment could not be received."
    } finally {
      saving.value = false
    }
  }

  function formatDate(value: string | null): string {
    if (!value) return "-"
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  function statusLabel(status: WmsExpectedArrivalStatus): string {
    return status === "booked_in"
      ? "Booked In"
      : `${status.charAt(0).toUpperCase()}${status.slice(1)}`
  }

  function sourceLabel(row: WmsExpectedArrival): string {
    if (row.source_type === "manual") return "Manual"
    return [row.collection_order_ref, row.job_number].filter(Boolean).join(" · ")
  }

  onMounted(loadRows)

  return {
    rows,
    loading,
    saving,
    error,
    expectedArrivalOpen,
    receiveConsignmentOpen,
    selectedArrival,
    onAddExpectedArrival,
    onCloseExpectedArrival,
    onSavedExpectedArrival,
    removeRow,
    onReceive,
    onCloseReceive,
    onSavedReceive,
    formatDate,
    statusLabel,
    sourceLabel,
  }
}

function toApiDate(value: Date | null): string | null {
  if (!value) return null
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizeStatus(value: string): WmsExpectedArrivalStatus {
  if (value === "Delayed") return "delayed"
  if (value === "Booked In") return "booked_in"
  return "expected"
}
