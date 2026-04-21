import { computed } from "vue"
import { useRoute } from "vue-router"

export type InventoryReportsTab = {
  label: string
  name: string
}

export function useInventoryReportsPage() {
  const route = useRoute()

  const tabs = computed<InventoryReportsTab[]>(() => [
    {
      label: "Inbound",
      name: "inventory-reports-inbound",
    },
    {
      label: "Outbound",
      name: "inventory-reports-outbound",
    },
    {
      label: "Storage & Dwell",
      name: "inventory-reports-storage",
    },
    {
      label: "Customer Summary",
      name: "inventory-reports-customer",
    },
    {
      label: "Stock Valuation",
      name: "inventory-reports-stock-valuation",
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
