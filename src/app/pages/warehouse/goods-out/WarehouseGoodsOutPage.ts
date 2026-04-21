import { computed } from "vue"
import { useRoute } from "vue-router"

export type WarehouseGoodsOutTab = {
  label: string
  name: string
}

export function useWarehouseGoodsOutPage() {
  const route = useRoute()

  const tabs = computed<WarehouseGoodsOutTab[]>(() => [
    {
      label: "Ready to Pick",
      name: "warehouse-goods-out-ready",
    },
    {
      label: "Pick Lists",
      name: "warehouse-goods-out-pick-lists",
    },
    {
      label: "Packing Lists",
      name: "warehouse-goods-out-packing-lists",
    },
  ])

  function isActive(name: string) {
    return route.name === name
  }

  return {
    tabs,
    isActive,
  }
}
