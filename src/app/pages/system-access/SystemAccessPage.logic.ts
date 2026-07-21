import { computed, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"
import { useSystemAccessStore } from "@/app/stores/systemAccess"
import { useTopNavItems } from "@/app/components/nav/topNavItems"
import type { NavItem } from "@/app/types/navigation"
import type { PermissionGroup, PermissionRow } from "@/app/types/systemAccess"

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), wait)
  }
}

function unique(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)))
}

function titleCase(value: string) {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim()
}

function actionFromPermission(permission: string) {
  const last = permission.split(".").filter(Boolean).pop() || permission
  return titleCase(last)
}

function collectPermissionsFromItem(item: NavItem): string[] {
  const perms: string[] = []

  if (item.permission) perms.push(item.permission)
  if (Array.isArray(item.anyPermissions)) perms.push(...item.anyPermissions)

  return unique(perms)
}

function flattenNavToPermRows(items: NavItem[]): PermissionRow[] {
  const rows: PermissionRow[] = []

  items.forEach((node: NavItem) => {
    const perms = collectPermissionsFromItem(node)

    perms.forEach(permission => {
      rows.push({
        key: `${node.id}:${permission}`,
        label: node.label,
        permission,
        title: titleCase(permission.replace(/^[^.]+\./, "")),
        action: actionFromPermission(permission),
      })
    })
  })

  const seenPerm = new Set<string>()

  return rows.filter(row => {
    if (seenPerm.has(row.permission)) return false
    seenPerm.add(row.permission)
    return true
  })
}

export function useSystemAccessPage() {
  const toast = useToast()
  const store = useSystemAccessStore()

  const searchLocal = ref(store.search ?? "")
  const searching = ref(false)

  const rolesDraft = ref<string[]>([])
  const permsDraft = ref<string[]>([])
  const permissionQuery = ref("")

  const HIDDEN_ROLES = new Set(["dev"])

  const rolesOptions = computed(() =>
    (store.roles ?? []).filter(role => !HIDDEN_ROLES.has(String(role).toLowerCase())),
  )

  watch(
    rolesDraft,
    value => {
      const next = (value ?? []).filter(role => !HIDDEN_ROLES.has(String(role).toLowerCase()))
      if (next.length !== (value ?? []).length) {
        rolesDraft.value = next
      }
    },
    { deep: true },
  )

  const runSearch = debounce(async (value: string) => {
    searching.value = true
    try {
      store.search = value
      await store.fetchEmployees()
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Search failed",
        detail: e?.response?.data?.message ?? "Please try again.",
        life: 3000,
      })
    } finally {
      searching.value = false
    }
  }, 300)

  watch(searchLocal, value => runSearch(value ?? ""))

  function clearSearch() {
    searchLocal.value = ""
  }

  async function onRowClick(e: any) {
    const row = e?.data
    if (!row?.id) return

    try {
      const selected = await store.selectEmployee(Number(row.id))

      rolesDraft.value = [...(selected?.roles ?? [])].filter(
        role => !HIDDEN_ROLES.has(String(role).toLowerCase()),
      )

      permsDraft.value = [...(selected?.direct_permissions ?? [])]
    } catch (err: any) {
      toast.add({
        severity: "error",
        summary: "Failed to load employee",
        detail: err?.response?.data?.message ?? "Please try again.",
        life: 3500,
      })
    }
  }

  const nav = useTopNavItems()

  const permissionGroups = computed<PermissionGroup[]>(() => {
    const effective = new Set(store.selected?.effective_permissions ?? [])
    const direct = new Set(store.selected?.direct_permissions ?? [])
    const roleOnlyPermissions = new Set(
      Array.from(effective).filter(permission => !direct.has(permission)),
    )

    const buildGroup = (id: string, label: string, items: NavItem[]): PermissionGroup => {
      const rows = flattenNavToPermRows(items)

      const filtered = rows.filter(row => !roleOnlyPermissions.has(row.permission))

      return {
        id,
        label,
        items: filtered,
      }
    }

    const groups: PermissionGroup[] = [
      buildGroup("tms", "TMS", nav.tms),
      buildGroup("wms", "WMS", nav.wms),
      buildGroup("mgmt", "Management", nav.management),
    ]

    return groups.filter(group => group.items.length > 0)
  })

  const allMapped = computed(() => {
    const set = new Set<string>()
    permissionGroups.value.forEach(group => {
      group.items.forEach(item => set.add(item.permission))
    })
    return set
  })

  const unmappedPermissions = computed(() => {
    return (store.permissions ?? []).filter(permission => !allMapped.value.has(permission))
  })

  const filteredPermissionGroups = computed<PermissionGroup[]>(() => {
    const query = permissionQuery.value.trim().toLowerCase()
    if (!query) return permissionGroups.value

    return permissionGroups.value
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          return [group.label, item.label, item.title, item.action, item.permission]
            .join(" ")
            .toLowerCase()
            .includes(query)
        }),
      }))
      .filter(group => group.items.length > 0)
  })

  const filteredUnmappedPermissions = computed(() => {
    const query = permissionQuery.value.trim().toLowerCase()
    if (!query) return unmappedPermissions.value
    return unmappedPermissions.value.filter(permission => permission.toLowerCase().includes(query))
  })

  const selectedDirectCount = computed(() => unique(permsDraft.value ?? []).length)
  const selectedRoleCount = computed(() => unique(rolesDraft.value ?? []).length)
  const effectiveCount = computed(() => unique(store.selected?.effective_permissions ?? []).length)

  function roleLabel(role: string) {
    return titleCase(role)
  }

  function permissionLabel(permission: string) {
    return titleCase(permission)
  }

  function isPermSelected(permission: string) {
    return (permsDraft.value ?? []).includes(permission)
  }

  function selectAllGroup(group: PermissionGroup) {
    const set = new Set(permsDraft.value ?? [])
    group.items.forEach(item => set.add(item.permission))
    permsDraft.value = Array.from(set)
  }

  function clearAllGroup(group: PermissionGroup) {
    const remove = new Set(group.items.map(item => item.permission))
    permsDraft.value = (permsDraft.value ?? []).filter(permission => !remove.has(permission))
  }

  function countSelectedInGroup(group: PermissionGroup) {
    const selected = new Set(permsDraft.value ?? [])
    return group.items.reduce((count, item) => count + (selected.has(item.permission) ? 1 : 0), 0)
  }

  function countTotalInGroup(group: PermissionGroup) {
    return group.items.length
  }

  function selectAllUnmapped() {
    const set = new Set(permsDraft.value ?? [])
    filteredUnmappedPermissions.value.forEach(permission => set.add(permission))
    permsDraft.value = Array.from(set)
  }

  function clearAllUnmapped() {
    const remove = new Set(filteredUnmappedPermissions.value)
    permsDraft.value = (permsDraft.value ?? []).filter(permission => !remove.has(permission))
  }

  const countSelectedUnmapped = computed(() => {
    const selected = new Set(permsDraft.value ?? [])
    return filteredUnmappedPermissions.value.reduce(
      (count, permission) => count + (selected.has(permission) ? 1 : 0),
      0,
    )
  })

  async function saveRoles() {
    if (!store.selected) return

    try {
      const safeRoles = (rolesDraft.value ?? []).filter(
        role => !HIDDEN_ROLES.has(String(role).toLowerCase()),
      )

      const updated = await store.saveRoles(safeRoles)

      toast.add({
        severity: "success",
        summary: "Roles saved",
        detail: "Updated employee roles.",
        life: 2500,
      })

      rolesDraft.value = [...(updated?.roles ?? [])].filter(
        role => !HIDDEN_ROLES.has(String(role).toLowerCase()),
      )
    } catch (err: any) {
      toast.add({
        severity: "error",
        summary: "Save failed",
        detail: err?.response?.data?.message ?? "Please try again.",
        life: 3500,
      })
    }
  }

  async function savePermissions() {
    if (!store.selected) return

    try {
      const updated = await store.savePermissions(permsDraft.value ?? [])

      toast.add({
        severity: "success",
        summary: "Permissions saved",
        detail: "Updated direct permissions.",
        life: 2500,
      })

      permsDraft.value = [...(updated?.direct_permissions ?? [])]
    } catch (err: any) {
      toast.add({
        severity: "error",
        summary: "Save failed",
        detail: err?.response?.data?.message ?? "Please try again.",
        life: 3500,
      })
    }
  }

  async function saveAllAccess() {
    await saveRoles()
    await savePermissions()
  }

  const effectiveGroups = computed(() => {
    const effective = new Set(store.selected?.effective_permissions ?? [])
    const direct = new Set(store.selected?.direct_permissions ?? [])

    return permissionGroups.value
      .map(group => {
        const permissions = group.items
          .filter(item => effective.has(item.permission))
          .map(item => ({
            ...item,
            source: direct.has(item.permission) ? ("direct" as const) : ("role" as const),
          }))

        return {
          id: group.id,
          label: group.label,
          permissions,
        }
      })
      .filter(group => group.permissions.length > 0)
  })

  const effectiveUnmapped = computed(() => {
    const effective = new Set(store.selected?.effective_permissions ?? [])
    const mapped = allMapped.value
    return Array.from(effective).filter(permission => !mapped.has(permission))
  })

  async function init() {
    try {
      await store.fetchLookups()
      await store.fetchEmployees()
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Failed to load System Access",
        detail: e?.response?.data?.message ?? "Please refresh.",
        life: 3500,
      })
    }
  }

  return {
    store,

    searchLocal,
    searching,
    clearSearch,
    onRowClick,

    rolesDraft,
    rolesOptions,
    roleLabel,

    permsDraft,
    permissionQuery,
    selectedDirectCount,
    selectedRoleCount,
    effectiveCount,
    permissionLabel,
    isPermSelected,

    permissionGroups,
    filteredPermissionGroups,
    unmappedPermissions,
    filteredUnmappedPermissions,

    selectAllGroup,
    clearAllGroup,
    countSelectedInGroup,
    countTotalInGroup,

    selectAllUnmapped,
    clearAllUnmapped,
    countSelectedUnmapped,

    effectiveGroups,
    effectiveUnmapped,

    saveRoles,
    savePermissions,
    saveAllAccess,

    init,
  }
}
