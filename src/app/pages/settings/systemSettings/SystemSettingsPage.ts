import { computed } from "vue"
import { useRoute } from "vue-router"

type SystemSettingsTab = {
  label: string
  name:
    | "settings.system.company"
    | "settings.system.branding"
    | "settings.system.shortcuts"
    | "settings.system.master"
}

export function useSystemSettingsPage() {
  const route = useRoute()

  const tabs: SystemSettingsTab[] = [
    { label: "Company", name: "settings.system.company" },
    { label: "Branding", name: "settings.system.branding" },
    { label: "Shortcuts", name: "settings.system.shortcuts" },
    { label: "Master Settings", name: "settings.system.master" },
  ]

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
