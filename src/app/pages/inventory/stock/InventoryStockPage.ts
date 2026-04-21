import { computed } from "vue"
import { useRoute } from "vue-router"

export type InventoryStockTab = {
  label: string
  name: string
}

export function useInventoryStockPage() {
  const route = useRoute()

  const tabs = computed<InventoryStockTab[]>(() => [
    {
      label: "Stock on Hand",
      name: "inventory-stock-on-hand",
    },
    {
      label: "By Category",
      name: "inventory-stock-by-category",
    },
    {
      label: "Low Stock",
      name: "inventory-stock-low-stock",
    },
    {
      label: "Valuation",
      name: "inventory-stock-valuation",
    },
    {
      label: "Barcode Labels",
      name: "inventory-stock-barcodes",
    },
    {
      label: "Adjustments",
      name: "inventory-stock-adjustments",
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
