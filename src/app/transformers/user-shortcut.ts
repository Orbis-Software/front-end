import type { UserShortcut } from "@/app/types/user-shortcut"

function fetch(raw: any): UserShortcut {
  return {
    id: Number(raw?.id ?? 0),
    key: raw?.key,
    keyBinding: raw?.keyBinding ?? null,
    label: raw?.label ?? "",
    description: raw?.description ?? "",
    routeName: raw?.routeName ?? null,
    permission: raw?.permission ?? null,
    icon: raw?.icon ?? "pi pi-link",
    priority: Number(raw?.priority ?? 1),
    isEnabled: raw?.isEnabled !== false,
  }
}

function fetchCollection(rows: any[] = []): UserShortcut[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
