export type NavItem = {
  id: string
  label: string
  icon?: string // PrimeIcons: pi pi-...
  to?: string
  children?: NavItem[]

  // ✅ Access control
  permission?: string
  anyPermissions?: string[]
  roles?: string[]

  // convenience (optional)
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
        icon: "pi pi-home",
        to: "/dashboard",
        permission: "tms.dashboard.view",
      },
      {
        id: "jobs",
        label: "Jobs",
        icon: "pi pi-briefcase",
        anyPermissions: ["tms.jobs.view", "tms.jobs.create"],
        children: [
          {
            id: "jobs-browse",
            label: "Browse Jobs",
            icon: "pi pi-search",
            to: "/jobs",
            permission: "tms.jobs.view",
          },
          {
            id: "jobs-new",
            label: "New Job",
            icon: "pi pi-plus-circle",
            to: "/jobs/new",
            permission: "tms.jobs.create",
          },
        ],
      },
      {
        id: "quotes",
        label: "Quotes",
        icon: "pi pi-file",
        anyPermissions: ["tms.quotes.view", "tms.quotes.create"],
        children: [
          {
            id: "quotes-browse",
            label: "Browse Quotes",
            icon: "pi pi-search",
            to: "/quotes",
            permission: "tms.quotes.view",
          },
          {
            id: "quotes-new",
            label: "New Quote",
            icon: "pi pi-plus-circle",
            to: "/quotes/new",
            permission: "tms.quotes.create",
          },
        ],
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: "pi pi-users",
        anyPermissions: ["tms.contacts.view", "tms.contacts.create", "tms.contacts.import_export"],
        children: [
          {
            id: "contacts-all",
            label: "All Contacts",
            icon: "pi pi-users",
            to: "/contacts",
            permission: "tms.contacts.view",
          },
          {
            id: "contacts-new",
            label: "New Contact",
            icon: "pi pi-user-plus",
            to: "/contacts/new",
            permission: "tms.contacts.create",
          },
          {
            id: "contacts-import",
            label: "Import/Export Contacts",
            icon: "pi pi-download",
            to: "/contacts/import",
            permission: "tms.contacts.import_export",
          },
        ],
      },
      {
        id: "crm",
        label: "CRM",
        icon: "pi pi-sitemap",
        to: "/crm",
        permission: "tms.crm.view",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "pi pi-chart-bar",
        to: "/reports",
        permission: "tms.reports.view",
      },
    ],

    wms: [
      {
        id: "wms-dashboard",
        label: "WMS Dashboard",
        icon: "pi pi-warehouse",
        to: "/wms",
        permission: "wms.dashboard.view",
      },
      {
        id: "warehouse",
        label: "Warehouse",
        icon: "pi pi-box",
        anyPermissions: [
          "wms.warehouse.jobs.view",
          "wms.warehouse.goods_in.create",
          "wms.warehouse.goods_out.create",
        ],
        children: [
          {
            id: "warehouse-browse",
            label: "Browse Jobs",
            icon: "pi pi-search",
            to: "/warehouse/jobs",
            permission: "wms.warehouse.jobs.view",
          },
          {
            id: "goods-in",
            label: "New Goods In Job",
            icon: "pi pi-inbox",
            to: "/warehouse/goods-in/new",
            permission: "wms.warehouse.goods_in.create",
          },
          {
            id: "goods-out",
            label: "New Goods Out Job",
            icon: "pi pi-send",
            to: "/warehouse/goods-out/new",
            permission: "wms.warehouse.goods_out.create",
          },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: "pi pi-list",
        anyPermissions: [
          "wms.inventory.stock_on_hand.view",
          "wms.inventory.aged_stock.view",
          "wms.inventory.space_utilisation.view",
          "wms.inventory.exceptions.view",
        ],
        children: [
          {
            id: "soh",
            label: "Stock On Hand",
            icon: "pi pi-box",
            to: "/inventory/stock",
            permission: "wms.inventory.stock_on_hand.view",
          },
          {
            id: "aged",
            label: "Aged Stock",
            icon: "pi pi-clock",
            to: "/inventory/aged",
            permission: "wms.inventory.aged_stock.view",
          },
          {
            id: "space",
            label: "Space Utilisation",
            icon: "pi pi-chart-pie",
            to: "/inventory/space",
            permission: "wms.inventory.space_utilisation.view",
          },
          {
            id: "exceptions",
            label: "Exceptions",
            icon: "pi pi-exclamation-triangle",
            to: "/inventory/exceptions",
            permission: "wms.inventory.exceptions.view",
          },
        ],
      },
    ],

    management: [
      {
        id: "accounts",
        label: "Accounts",
        icon: "pi pi-calculator",
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
        id: "employees",
        label: "Employees",
        icon: "pi pi-users",
        anyPermissions: [
          "mgmt.employees.view",
          "mgmt.employees.manage",
          "mgmt.employees.access.manage",
        ],
        children: [
          {
            id: "employee-list",
            label: "Employee List",
            icon: "pi pi-list",
            to: "/employees",
            anyPermissions: ["mgmt.employees.view", "mgmt.employees.manage"],
          },
          {
            id: "access",
            label: "System Access",
            icon: "pi pi-shield",
            to: "/system-access",
            permission: "mgmt.employees.access.manage",
          },
        ],
      },

      {
        id: "system",
        label: "System Settings",
        icon: "pi pi-cog",
        anyPermissions: [
          "mgmt.system.company.manage",
          "mgmt.system.branding.manage",
          "mgmt.system.shortcuts.manage",
          "mgmt.system.master_settings.manage",
        ],
        children: [
          {
            id: "company",
            label: "Company Details",
            icon: "pi pi-building",
            to: "/settings/company",
            permission: "mgmt.system.company.manage",
          },
          {
            id: "branding",
            label: "Logos & Branding",
            icon: "pi pi-palette",
            to: "/settings/branding",
            permission: "mgmt.system.branding.manage",
          },
          {
            id: "shortcuts",
            label: "System Shortcuts",
            icon: "pi pi-bolt",
            to: "/settings/shortcuts",
            permission: "mgmt.system.shortcuts.manage",
          },
          {
            id: "master-settings",
            label: "Master Settings",
            icon: "pi pi-sliders-h",
            to: "/settings/master",
            permission: "mgmt.system.master_settings.manage",
          },
        ],
      },
    ],
  }
}
