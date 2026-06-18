import { computed } from "vue"
import { useRoute } from "vue-router"
import type { WarehouseConsolidationTab } from "@/app/types/page-tabs"

export function useWarehouseConsolidationPage() {
  const route = useRoute()

  const tabs = computed<WarehouseConsolidationTab[]>(() => [
    {
      label: "Active Shipments",
      name: "warehouse-consolidation-active",
    },
    {
      label: "Dispatched",
      name: "warehouse-consolidation-dispatched",
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
