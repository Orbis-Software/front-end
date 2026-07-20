import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import type { WarehouseGoodsInTab } from "@/app/types/page-tabs"
import expectedArrivalsService from "@/app/services/wms-expected-arrivals"
import type { ReceiveConsignmentPayload } from "@/app/components/warehouse/goods-in/ReceiveConsignmentModal.vue"

export function useWarehouseGoodsInPage() {
  const route = useRoute()

  const tabs = computed<WarehouseGoodsInTab[]>(() => [
    {
      label: "Arrival Log",
      name: "warehouse-goods-in-arrival-log",
    },
    {
      label: "Expected Arrivals",
      name: "warehouse-goods-in-expected-arrivals",
    },
    {
      label: "Warehouse Receipts",
      name: "warehouse-goods-in-receipts",
    },
  ])

  const receiveConsignmentOpen = ref(false)
  const expectedArrivalOpen = ref(false)
  const warehouseReceiptOpen = ref(false)
  const receiving = ref(false)
  const error = ref("")

  function isActive(name: string) {
    return route.name === name
  }

  function onOpenReceiveConsignment() {
    receiveConsignmentOpen.value = true
  }

  function onCloseReceiveConsignment() {
    receiveConsignmentOpen.value = false
  }

  async function onSavedReceiveConsignment(payload: ReceiveConsignmentPayload) {
    receiving.value = true
    error.value = ""

    try {
      const arrival = await expectedArrivalsService.create({
        customer_name: payload.customer.trim(),
        supplier_name: payload.supplier.trim() || null,
        description: payload.description.trim(),
        estimated_quantity: payload.qty ?? 0,
        external_reference: payload.reference.trim() || null,
        notes: payload.notes.trim() || null,
      })
      await expectedArrivalsService.receive(arrival.id, {
        storage_location: payload.location.trim() || null,
        received_by_name: payload.receivedBy.trim() || null,
        received_quantity: payload.qty ?? 0,
        received_weight_kg: payload.weight,
        received_volume_cbm: payload.cbm,
        notes: payload.notes.trim() || null,
      })
      receiveConsignmentOpen.value = false
      window.dispatchEvent(new CustomEvent("wms:consignment-received"))
    } catch (requestError: any) {
      error.value =
        requestError?.response?.data?.message || "The consignment could not be received."
    } finally {
      receiving.value = false
    }
  }

  function onOpenExpectedArrival() {
    expectedArrivalOpen.value = true
  }

  function onCloseExpectedArrival() {
    expectedArrivalOpen.value = false
  }

  function onSavedExpectedArrival(payload: unknown) {
    console.log("Expected arrival saved:", payload)
    expectedArrivalOpen.value = false
  }

  function onOpenWarehouseReceipt() {
    warehouseReceiptOpen.value = true
  }

  function onCloseWarehouseReceipt() {
    warehouseReceiptOpen.value = false
  }

  function onSavedWarehouseReceipt(payload: unknown) {
    console.log("Warehouse receipt saved:", payload)
    warehouseReceiptOpen.value = false
  }

  return {
    tabs,
    isActive,

    receiveConsignmentOpen,
    expectedArrivalOpen,
    warehouseReceiptOpen,
    receiving,
    error,

    onOpenReceiveConsignment,
    onCloseReceiveConsignment,
    onSavedReceiveConsignment,

    onOpenExpectedArrival,
    onCloseExpectedArrival,
    onSavedExpectedArrival,

    onOpenWarehouseReceipt,
    onCloseWarehouseReceipt,
    onSavedWarehouseReceipt,
  }
}
