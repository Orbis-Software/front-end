import { computed } from "vue"
import { useRoute } from "vue-router"

type ManagementUsersTabName = "mgmt.users.employees" | "mgmt.users.system-access"

type ManagementUsersTab = {
  label: string
  name: ManagementUsersTabName
}

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
