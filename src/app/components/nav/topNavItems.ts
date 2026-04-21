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

export function useTopNavItems(): {
  tms: NavItem[]
  wms: NavItem[]
  management: NavItem[]
} {
  return {
    tms: [
      {
        id: "tms-dashboard",
        label: "Dashboard",
        to: "/dashboard",
        permission: "tms.dashboard.view",
      },
      {
        id: "jobs",
        label: "Jobs",
        to: "/jobs",
        anyPermissions: ["tms.jobs.view", "tms.jobs.create"],
      },
      {
        id: "quotes",
        label: "Quotes",
        to: "/quotes",
        anyPermissions: ["tms.quotes.view", "tms.quotes.create"],
      },
      {
        id: "contacts",
        label: "Contacts",
        to: "/contacts",
        anyPermissions: ["tms.contacts.view", "tms.contacts.create", "tms.contacts.import_export"],
      },
    ],

    wms: [
      {
        id: "wms-dashboard",
        label: "Dashboard",
        to: "/wms",
      },
      {
        id: "wms-goods-in",
        label: "Goods In",
        to: "/warehouse/goods-in",
      },
      {
        id: "wms-stock",
        label: "Stock",
        to: "/inventory/stock",
      },
      {
        id: "wms-storage",
        label: "Storage",
        to: "/warehouse/storage",
      },
      {
        id: "wms-goods-out",
        label: "Goods Out",
        to: "/warehouse/goods-out",
      },
      {
        id: "wms-consolidation",
        label: "Consolidation",
        to: "/warehouse/consolidation",
      },
      {
        id: "wms-reports",
        label: "Reports",
        to: "/inventory/reports",
      },
      {
        id: "wms-admin-lists",
        label: "Admin Lists",
        to: "/wms/admin",
      },
    ],

    management: [
      {
        id: "accounts",
        label: "Accounts",
        to: "/accounts",
        anyPermissions: [
          "mgmt.accounts.invoices.view",
          "mgmt.accounts.invoices.manage",
          "mgmt.accounts.reports.view",
          "mgmt.accounts.exchange_rates.manage",
          "mgmt.accounts.tax_codes.manage",
          "mgmt.accounts.banks.manage",
          "mgmt.accounts.charge_descriptions.manage",
        ],
      },
      {
        id: "users",
        label: "Employee",
        to: "/management/users",
        anyPermissions: [
          "mgmt.employees.view",
          "mgmt.employees.manage",
          "mgmt.employees.access.manage",
        ],
      },
      {
        id: "system",
        label: "System Settings",
        to: "/settings/system",
        anyPermissions: [
          "mgmt.system.company.manage",
          "mgmt.system.branding.manage",
          "mgmt.system.shortcuts.manage",
          "mgmt.system.master_settings.manage",
        ],
      },
    ],
  }
}
