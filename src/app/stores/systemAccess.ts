import { defineStore } from "pinia"
import { ref } from "vue"
import type { EmployeeAccessDetails, EmployeeAccessRow } from "@/app/types/systemAccess"
import systemAccessService from "@/app/services/systemAccess"

export const useSystemAccessStore = defineStore("systemAccess", () => {
  const employees = ref<EmployeeAccessRow[]>([])
  const selected = ref<EmployeeAccessDetails | null>(null)

  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  const loadingList = ref(false)
  const loadingSelected = ref(false)
  const savingRoles = ref(false)
  const savingPerms = ref(false)

  const search = ref("")
  const perPage = ref(15)

  async function fetchEmployees() {
    loadingList.value = true
    try {
      const res = await systemAccessService.listEmployees({
        search: search.value || undefined,
        per_page: perPage.value,
        page: 1,
      })
      employees.value = res.data
      return employees.value
    } finally {
      loadingList.value = false
    }
  }

  async function fetchLookups() {
    const [r, p] = await Promise.all([
      systemAccessService.listRoles().catch(() => []),
      systemAccessService.listPermissions().catch(() => []),
    ])
    roles.value = r
    permissions.value = p
  }

  async function selectEmployee(id: number) {
    loadingSelected.value = true
    try {
      selected.value = await systemAccessService.showEmployee(id)
      return selected.value
    } finally {
      loadingSelected.value = false
    }
  }

  async function saveRoles(roleNames: string[]) {
    if (!selected.value) return null
    savingRoles.value = true
    try {
      selected.value = await systemAccessService.syncEmployeeRoles(selected.value.id, roleNames)
      return selected.value
    } finally {
      savingRoles.value = false
    }
  }

  async function savePermissions(permissionNames: string[]) {
    if (!selected.value) return null
    savingPerms.value = true
    try {
      selected.value = await systemAccessService.syncEmployeePermissions(selected.value.id, permissionNames)
      return selected.value
    } finally {
      savingPerms.value = false
    }
  }

  return {
    employees,
    selected,

    roles,
    permissions,

    loadingList,
    loadingSelected,
    savingRoles,
    savingPerms,

    search,
    perPage,

    fetchEmployees,
    fetchLookups,
    selectEmployee,
    saveRoles,
    savePermissions,
  }
})