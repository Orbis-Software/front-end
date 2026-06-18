import { computed } from "vue"
import { useRoute } from "vue-router"
import type { ManagementUsersTab } from "@/app/types/page-tabs"

export function useManagementUsersPage() {
  const route = useRoute()

  const tabs = computed<ManagementUsersTab[]>(() => [
    { label: "Employee List", name: "mgmt.users.employees" },
    { label: "System Access", name: "mgmt.users.system-access" },
  ])

  const currentRouteName = computed(() => String(route.name ?? ""))

  function isActive(tabName: ManagementUsersTab["name"]) {
    return currentRouteName.value === tabName
  }

  return {
    tabs,
    currentRouteName,
    isActive,
  }
}
