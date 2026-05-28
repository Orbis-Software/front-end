import { computed } from "vue"
import { useRoute } from "vue-router"

type UserSettingsTabName = "settings.user.signature" | "settings.user.shortcuts"

type UserSettingsTab = {
  label: string
  name: UserSettingsTabName
}

export function useUserSettingsPage() {
  const route = useRoute()

  const tabs = computed<UserSettingsTab[]>(() => [
    { label: "Signature", name: "settings.user.signature" },
    { label: "Shortcut", name: "settings.user.shortcuts" },
  ])

  const currentRouteName = computed(() => String(route.name ?? ""))

  function isActive(tabName: UserSettingsTab["name"]) {
    return currentRouteName.value === tabName
  }

  return {
    tabs,
    isActive,
  }
}
