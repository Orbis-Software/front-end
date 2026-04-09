import { computed } from "vue"
import { useRoute } from "vue-router"
import { useSystemSettingsStore } from "@/app/stores/system-settings"

type SystemSettingsTabName =
  | "settings.system.company"
  | "settings.system.branding"
  | "settings.system.shortcuts"
  | "settings.system.master"
  | "settings.system.awb_manager"

type SystemSettingsTab = {
  label: string
  name: SystemSettingsTabName
}

export function useSystemSettingsPage() {
  const route = useRoute()
  const systemSettingsStore = useSystemSettingsStore()

  const tabs = computed<SystemSettingsTab[]>(() => {
    const items: SystemSettingsTab[] = [
      { label: "Company", name: "settings.system.company" },
      { label: "Branding", name: "settings.system.branding" },
      { label: "Shortcuts", name: "settings.system.shortcuts" },
      { label: "Master Settings", name: "settings.system.master" },
    ]

    if (systemSettingsStore.hasEoriNumber) {
      items.push({
        label: "AWB Manager",
        name: "settings.system.awb_manager",
      })
    }

    return items
  })

  const currentRouteName = computed(() => String(route.name ?? ""))

  function isActive(tabName: SystemSettingsTab["name"]) {
    return currentRouteName.value === tabName
  }

  return {
    tabs,
    currentRouteName,
    isActive,
  }
}
