import { computed } from "vue"
import { useRoute } from "vue-router"

export type WmsAdminTab = {
  label: string
  name: string
}

export function useWmsAdminPage() {
  const route = useRoute()

  const tabs = computed<WmsAdminTab[]>(() => [
    {
      label: "Customers",
      name: "wms-admin-customers",
    },
    {
      label: "Suppliers",
      name: "wms-admin-suppliers",
    },
    {
      label: "Carriers",
      name: "wms-admin-carriers",
    },
    {
      label: "Units",
      name: "wms-admin-units",
    },
    {
      label: "Categories",
      name: "wms-admin-categories",
    },
    {
      label: "Goods Types",
      name: "wms-admin-goods-types",
    },
    {
      label: "Locations",
      name: "wms-admin-locations",
    },
    {
      label: "Racks",
      name: "wms-admin-racks",
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
