import { computed, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"
import { useSystemAccessStore } from "@/app/stores/systemAccess"

// ✅ CHANGE THIS IMPORT PATH to where your file actually is:
import { useTopNavItems, type NavItem } from "@/app/components/nav/topNavItems"

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), wait)
  }
}

type PermRow = {
  key: string
  label: string
  icon?: string
  permission: string
}

type PermGroup = {
  id: string
  label: string
  icon?: string
  items: PermRow[]
}

function unique(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)))
}

function collectPermissionsFromItem(item: NavItem): string[] {
  const perms: string[] = []

  if (item.permission) perms.push(item.permission)
  if (Array.isArray(item.anyPermissions)) perms.push(...item.anyPermissions)

  // If you want parent permissions too, keep as-is.
  // Children permissions handled elsewhere.
  return unique(perms)
}

function flattenNavToPermRows(items: NavItem[]): PermRow[] {
  const rows: PermRow[] = []

  const pushPerms = (node: NavItem, perms: string[]) => {
    perms.forEach(p => {
      rows.push({
        key: `${node.id}:${p}`,
        label: node.label,
        icon: node.icon,
        permission: p,
      })
    })
  }

  const walk = (node: NavItem) => {
    const nodePerms = collectPermissionsFromItem(node)

    // ✅ First collect from children (more specific)
    if (Array.isArray(node.children) && node.children.length) {
      node.children.forEach(walk)

      // ✅ Build a set of permissions that are already represented by children
      const childPerms = new Set<string>()
      node.children.forEach(c => collectPermissionsFromItem(c).forEach(p => childPerms.add(p)))

      // ✅ Only keep parent perms that are NOT already in children
      const parentOnly = nodePerms.filter(p => !childPerms.has(p))
      pushPerms(node, parentOnly)
      return
    }

    // ✅ Leaf node: keep all its perms
    pushPerms(node, nodePerms)
  }

  items.forEach(walk)

  // ✅ Final de-dupe by permission (keep FIRST occurrence = most specific due to child-first walk)
  const seenPerm = new Set<string>()
  return rows.filter(r => {
    if (seenPerm.has(r.permission)) return false
    seenPerm.add(r.permission)
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

  // Hide dev role
  const HIDDEN_ROLES = new Set(["dev"])
  const rolesOptions = computed(() =>
    (store.roles ?? []).filter(r => !HIDDEN_ROLES.has(String(r).toLowerCase())),
  )

  watch(
    rolesDraft,
    val => {
      const next = (val ?? []).filter(r => !HIDDEN_ROLES.has(String(r).toLowerCase()))
      if (next.length !== (val ?? []).length) rolesDraft.value = next
    },
    { deep: true },
  )

  const runSearch = debounce(async (val: string) => {
    searching.value = true
    try {
      store.search = val
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

  watch(searchLocal, val => runSearch(val ?? ""))

  function clearSearch() {
    searchLocal.value = ""
  }

  async function onRowClick(e: any) {
    const row = e?.data
    if (!row?.id) return

    try {
      const selected = await store.selectEmployee(Number(row.id))
      rolesDraft.value = [...(selected?.roles ?? [])].filter(
        r => !HIDDEN_ROLES.has(String(r).toLowerCase()),
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

  // ✅ Build grouped permissions from nav structure
  const nav = useTopNavItems()

  const permissionGroups = computed<PermGroup[]>(() => {
    const effective = new Set(store.selected?.effective_permissions ?? [])
    const direct = new Set(store.selected?.direct_permissions ?? [])

    const roleOnlyPermissions = new Set(Array.from(effective).filter(p => !direct.has(p)))

    const buildGroup = (id: string, label: string, icon: string, items: NavItem[]) => {
      const rows = flattenNavToPermRows(items)

      // ✅ FILTER OUT permissions that are granted via role only
      const filtered = rows.filter(row => {
        return !roleOnlyPermissions.has(row.permission)
      })

      return {
        id,
        label,
        icon,
        items: filtered,
      }
    }

    const groups = [
      buildGroup("tms", "TMS", "pi pi-home", nav.tms),
      buildGroup("wms", "WMS", "pi pi-warehouse", nav.wms),
      buildGroup("mgmt", "Management", "pi pi-cog", nav.management),
    ]

    return groups.filter(g => g.items.length > 0)
  })

  // Permissions not covered by nav mapping (still selectable)
  const allMapped = computed(() => {
    const set = new Set<string>()
    permissionGroups.value.forEach(g => g.items.forEach(i => set.add(i.permission)))
    return set
  })

  const unmappedPermissions = computed(() => {
    return (store.permissions ?? []).filter(p => !allMapped.value.has(p))
  })

  function selectAllGroup(group: PermGroup) {
    const set = new Set(permsDraft.value ?? [])
    group.items.forEach(i => set.add(i.permission))
    permsDraft.value = Array.from(set)
  }

  function clearAllGroup(group: PermGroup) {
    const remove = new Set(group.items.map(i => i.permission))
    permsDraft.value = (permsDraft.value ?? []).filter(p => !remove.has(p))
  }

  function countSelectedInGroup(group: PermGroup) {
    const sel = new Set(permsDraft.value ?? [])
    return group.items.reduce((acc, i) => acc + (sel.has(i.permission) ? 1 : 0), 0)
  }

  function countTotalInGroup(group: PermGroup) {
    return group.items.length
  }

  function selectAllUnmapped() {
    const set = new Set(permsDraft.value ?? [])
    unmappedPermissions.value.forEach(p => set.add(p))
    permsDraft.value = Array.from(set)
  }

  function clearAllUnmapped() {
    const remove = new Set(unmappedPermissions.value)
    permsDraft.value = (permsDraft.value ?? []).filter(p => !remove.has(p))
  }

  const countSelectedUnmapped = computed(() => {
    const sel = new Set(permsDraft.value ?? [])
    return unmappedPermissions.value.reduce((acc, p) => acc + (sel.has(p) ? 1 : 0), 0)
  })

  async function saveRoles() {
    if (!store.selected) return
    try {
      const safeRoles = (rolesDraft.value ?? []).filter(
        r => !HIDDEN_ROLES.has(String(r).toLowerCase()),
      )
      const updated = await store.saveRoles(safeRoles)
      toast.add({
        severity: "success",
        summary: "Roles saved",
        detail: "Updated employee roles.",
        life: 2500,
      })
      rolesDraft.value = [...(updated?.roles ?? [])].filter(
        r => !HIDDEN_ROLES.has(String(r).toLowerCase()),
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

  // Effective permissions grouped + sources
  const effectiveGroups = computed(() => {
    const effective = new Set(store.selected?.effective_permissions ?? [])
    const direct = new Set(store.selected?.direct_permissions ?? [])

    const mapGroup = (group: PermGroup) => {
      const perms = group.items
        .filter(i => effective.has(i.permission))
        .map(i => ({
          ...i,
          source: direct.has(i.permission) ? ("direct" as const) : ("role" as const),
        }))

      return { id: group.id, label: group.label, icon: group.icon, permissions: perms }
    }

    return permissionGroups.value.map(mapGroup).filter(g => g.permissions.length > 0)
  })

  const effectiveUnmapped = computed(() => {
    const effective = new Set(store.selected?.effective_permissions ?? [])
    const mapped = allMapped.value
    return Array.from(effective).filter(p => !mapped.has(p))
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

    permsDraft,

    permissionGroups,
    unmappedPermissions,

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

    init,
  }
}
