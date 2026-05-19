import { computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useReferenceDataStore } from "@/app/stores/reference-data"

export type GeneralSettingsTab = {
  label: string
  name: string
  group?: string
  count?: number
}

export function useGeneralSettingsPage() {
  const route = useRoute()
  const referenceDataStore = useReferenceDataStore()

  const tabs: GeneralSettingsTab[] = [
    {
      label: "Measurements & Units",
      name: "general-settings.measurements",
      group: "Measurements & units",
    },
    {
      label: "Freight & Cargo",
      name: "general-settings.freight-cargo",
      group: "Freight & cargo",
    },
    {
      label: "Operations",
      name: "general-settings.operations",
      group: "Operations",
    },
    {
      label: "Warehouse",
      name: "general-settings.warehouse",
      group: "Warehouse",
    },
    {
      label: "Documentation",
      name: "general-settings.documentation",
      group: "Documentation",
    },
    {
      label: "Contacts & Addresses",
      name: "general-settings.contacts-addresses",
      group: "Contacts & addresses",
    },
    {
      label: "Global Reference Data",
      name: "general-settings.global-reference-data",
      count: 3,
    },
  ]

  const currentRouteName = computed(() => String(route.name ?? ""))

  function isActive(name: string) {
    return currentRouteName.value === name
  }

  function getTabCount(tab: GeneralSettingsTab) {
    if (typeof tab.count === "number") {
      return tab.count
    }

    if (!tab.group) {
      return 0
    }

    const categories = referenceDataStore.getByGroup(tab.group)

    return categories.reduce((total, category) => {
      return total + category.options.length
    }, 0)
  }

  onMounted(() => {
    if (!referenceDataStore.categories.length) {
      referenceDataStore.fetchAll()
    }
  })

  return {
    tabs,
    isActive,
    getTabCount,
    loading: computed(() => referenceDataStore.loading),
  }
}
