export type NavItem = {
  id: string;
  label: string;
  icon?: string; // PrimeIcons: pi pi-...
  to?: string;
  children?: NavItem[];
};

export function useTopNavItems(): {
  tms: NavItem[];
  wms: NavItem[];
  management: NavItem[];
} {
  return {
    tms: [
      { id: "tms-dashboard", label: "TMS Dashboard", icon: "pi pi-home", to: "/dashboard" },
      {
        id: "jobs",
        label: "Jobs",
        icon: "pi pi-briefcase",
        children: [
          { id: "jobs-browse", label: "Browse Jobs", icon: "pi pi-search", to: "/jobs" },
          { id: "jobs-new", label: "New Job", icon: "pi pi-plus-circle", to: "/jobs/new" },
        ],
      },
      {
        id: "quotes",
        label: "Quotes",
        icon: "pi pi-file",
        children: [
          { id: "quotes-browse", label: "Browse Quotes", icon: "pi pi-search", to: "/quotes" },
          { id: "quotes-new", label: "New Quote", icon: "pi pi-plus-circle", to: "/quotes/new" },
        ],
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: "pi pi-users",
        children: [
          { id: "contacts-all", label: "All Contacts", icon: "pi pi-users", to: "/contacts" },
          { id: "contacts-new", label: "New Contact", icon: "pi pi-user-plus", to: "/contacts/new" },
          { id: "contacts-export", label: "Export Contacts", icon: "pi pi-download", to: "/contacts/export" },
        ],
      },
      { id: "crm", label: "CRM", icon: "pi pi-sitemap", to: "/crm" },
      { id: "reports", label: "Reports", icon: "pi pi-chart-bar", to: "/reports" },
    ],

    wms: [
      { id: "wms-dashboard", label: "WMS Dashboard", icon: "pi pi-warehouse", to: "/wms" },
      {
        id: "warehouse",
        label: "Warehouse",
        icon: "pi pi-box",
        children: [
          { id: "warehouse-browse", label: "Browse Jobs", icon: "pi pi-search", to: "/warehouse/jobs" },
          { id: "goods-in", label: "New Goods In Job", icon: "pi pi-inbox", to: "/warehouse/goods-in/new" },
          { id: "goods-out", label: "New Goods Out Job", icon: "pi pi-send", to: "/warehouse/goods-out/new" },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: "pi pi-list",
        children: [
          { id: "soh", label: "Stock On Hand", icon: "pi pi-box", to: "/inventory/stock" },
          { id: "aged", label: "Aged Stock", icon: "pi pi-clock", to: "/inventory/aged" },
          { id: "space", label: "Space Utilisation", icon: "pi pi-chart-pie", to: "/inventory/space" },
          { id: "exceptions", label: "Exceptions", icon: "pi pi-exclamation-triangle", to: "/inventory/exceptions" },
        ],
      },
    ],

    management: [
      {
        id: "accounts",
        label: "Accounts",
        icon: "pi pi-calculator",
        children: [
          { id: "invoices", label: "Invoicing", icon: "pi pi-file", to: "/accounts/invoices" },
          { id: "financial-reports", label: "Financial Reports", icon: "pi pi-chart-line", to: "/accounts/reports" },
          { id: "exchange", label: "Exchange Rates", icon: "pi pi-dollar", to: "/accounts/exchange-rates" },
          { id: "tax", label: "Tax Codes", icon: "pi pi-percentage", to: "/accounts/tax-codes" },
          { id: "bank", label: "Bank Details", icon: "pi pi-building-columns", to: "/accounts/banks" },
          { id: "charges", label: "Charge Descriptions", icon: "pi pi-file-edit", to: "/accounts/charges" },
        ],
      },
      {
        id: "employees",
        label: "Employees",
        icon: "pi pi-users",
        children: [
          { id: "employee-list", label: "Employee List", icon: "pi pi-list", to: "/employees" },
          { id: "access", label: "System Access", icon: "pi pi-shield", to: "/employees/access" },
        ],
      },
      {
        id: "system",
        label: "System Settings",
        icon: "pi pi-cog",
        children: [
          { id: "company", label: "Company Details", icon: "pi pi-building", to: "/settings/company" },
          { id: "branding", label: "Logos & Branding", icon: "pi pi-palette", to: "/settings/branding" },
          { id: "shortcuts", label: "System Shortcuts", icon: "pi pi-bolt", to: "/settings/shortcuts" },
        ],
      },
    ],
  };
}
