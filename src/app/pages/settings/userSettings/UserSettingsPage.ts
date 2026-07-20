import { computed } from "vue"
import { useRoute } from "vue-router"
import type { UserSettingsTab } from "@/app/types/page-tabs"

export function useUserSettingsPage() {
  const route = useRoute()

  const tabs = computed<UserSettingsTab[]>(() => [
    { label: "Signature", name: "settings.user.signature" },
    { label: "Shortcut", name: "settings.user.shortcuts" },
    { label: "Goods Descriptions", name: "settings.user.goods_descriptions" },
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
