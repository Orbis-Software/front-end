import { computed, ref } from "vue"
import { useRoute } from "vue-router"

export type WarehouseGoodsInTab = {
  label: string
  name: string
}

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

  function isActive(name: string) {
    return route.name === name
  }

  function onOpenReceiveConsignment() {
    receiveConsignmentOpen.value = true
  }

  function onCloseReceiveConsignment() {
    receiveConsignmentOpen.value = false
  }

  function onSavedReceiveConsignment(payload: unknown) {
    console.log("Received consignment saved:", payload)
    receiveConsignmentOpen.value = false
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
