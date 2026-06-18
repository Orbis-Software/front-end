import { computed } from "vue"
import { useRoute } from "vue-router"
import type { WarehouseStorageTab } from "@/app/types/page-tabs"

export function useWarehouseStoragePage() {
  const route = useRoute()

  const tabs = computed<WarehouseStorageTab[]>(() => [
    {
      label: "All Consignments",
      name: "warehouse-storage-all",
    },
    {
      label: "By Customer",
      name: "warehouse-storage-by-customer",
    },
    {
      label: "By Location",
      name: "warehouse-storage-by-location",
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
