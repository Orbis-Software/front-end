import { computed } from "vue"
import { useRoute } from "vue-router"
import type { WarehouseGoodsOutTab } from "@/app/types/page-tabs"

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
