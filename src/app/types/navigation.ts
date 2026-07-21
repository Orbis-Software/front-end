export type AppArea = "tms" | "wms" | "management"

export type NavItem = {
  id: string
  label: string
  to?: string
  permission?: string
  anyPermissions?: string[]
  roles?: string[]
  devOnly?: boolean
  adminOnly?: boolean
}

export type SidebarLeaf = {
  type: "leaf"
  label: string
  to: string
  icon?: string
  disabled?: boolean
}

export type SidebarSubmenu = {
  type: "submenu"
  label: string
  icon?: string
  key: string
  children: SidebarLeaf[]
}

export type SidebarGroup = {
  key: string
  label: string
  items: (SidebarLeaf | SidebarSubmenu)[]
}
