import { computed } from "vue"
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

  function isActive(name: string) {
    return route.name === name
  }

  function onOpenReceiveConsignment() {
    // temporary placeholder
    window.alert("Receive Consignment modal will be added next.")
  }

  return {
    tabs,
    isActive,
    onOpenReceiveConsignment,
  }
}
