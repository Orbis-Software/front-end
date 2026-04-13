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
        label: "TMS Dashboard",
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
      // {
      //   id: "crm",
      //   label: "CRM",
      //   to: "/crm",
      //   permission: "tms.crm.view",
      // },
      // {
      //   id: "reports",
      //   label: "Reports",
      //   to: "/reports",
      //   permission: "tms.reports.view",
      // },
    ],

    wms: [
      {
        id: "wms-dashboard",
        label: "WMS Dashboard",
        to: "/wms",
        permission: "wms.dashboard.view",
      },
      {
        id: "warehouse",
        label: "Warehouse",
        to: "/warehouse/jobs",
        anyPermissions: [
          "wms.warehouse.jobs.view",
          "wms.warehouse.goods_in.create",
          "wms.warehouse.goods_out.create",
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        to: "/inventory/stock",
        anyPermissions: [
          "wms.inventory.stock_on_hand.view",
          "wms.inventory.aged_stock.view",
          "wms.inventory.space_utilisation.view",
          "wms.inventory.exceptions.view",
        ],
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
