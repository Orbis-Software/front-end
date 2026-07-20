export type PageTab = {
  label: string
  name: string
}

export type GeneralSettingsTab = PageTab & {
  group?: string
  count?: number
}

export type ManagementUsersTabName = "mgmt.users.employees" | "mgmt.users.system-access"

export type ManagementUsersTab = {
  label: string
  name: ManagementUsersTabName
}

export type UserSettingsTabName =
  | "settings.user.signature"
  | "settings.user.shortcuts"
  | "settings.user.goods_descriptions"

export type UserSettingsTab = {
  label: string
  name: UserSettingsTabName
}

export type SystemSettingsTabName =
  | "settings.system.company"
  | "settings.system.branding"
  | "settings.system.email_notifications"
  | "settings.system.master"
  | "settings.system.account_settings"
  | "settings.system.awb_manager"
  | "settings.system.terms_conditions"

export type SystemSettingsTab = {
  label: string
  name: SystemSettingsTabName
}

export type WarehouseGoodsInTab = PageTab
export type WarehouseGoodsOutTab = PageTab
export type WarehouseStorageTab = PageTab
export type WarehouseConsolidationTab = PageTab
export type InventoryStockTab = PageTab
export type InventoryReportsTab = PageTab
export type WmsAdminTab = PageTab
