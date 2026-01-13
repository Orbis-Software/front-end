export type SidebarLeaf = {
  type: "leaf";
  label: string;
  to: string; 
  icon?: string; 
  disabled?: boolean;
};

export type SidebarSubmenu = {
  type: "submenu";
  label: string;
  icon?: string;
  key: string; 
  children: SidebarLeaf[];
};

export type SidebarGroup = {
  key: string;
  label: string; 
  items: (SidebarLeaf | SidebarSubmenu)[];
};

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    key: "tms",
    label: "TMS",
    items: [
      { type: "leaf", label: "Dashboard", to: "/dashboard", icon: "pi pi-home" },
      { type: "leaf", label: "Jobs", to: "/jobs", icon: "pi pi-briefcase" },
      { type: "leaf", label: "Quotes", to: "/quotes", icon: "pi pi-file" },
      {
        type: "submenu",
        key: "contacts",
        label: "Contacts",
        icon: "pi pi-address-book",
        children: [
          { type: "leaf", label: "Customers", to: "/contacts/customers" },
          { type: "leaf", label: "Suppliers", to: "/contacts/suppliers" },
          { type: "leaf", label: "Road Hauliers", to: "/contacts/road-hauliers" },
          { type: "leaf", label: "Airlines", to: "/contacts/airlines" },
          { type: "leaf", label: "Rail Operators", to: "/contacts/rail-operators" },
          { type: "leaf", label: "Shipping Lines", to: "/contacts/shipping-lines" },
        ],
      },
      { type: "leaf", label: "Invoices", to: "/invoices", icon: "pi pi-receipt" },
      { type: "leaf", label: "Reports", to: "/reports", icon: "pi pi-chart-line" },
    ],
  },

  {
    key: "wms",
    label: "WMS",
    items: [
      { type: "leaf", label: "Warehouse", to: "/warehouse", icon: "pi pi-building" },
      { type: "leaf", label: "Inventory", to: "/inventory", icon: "pi pi-box" },
    ],
  },

  {
    key: "mgmt",
    label: "Management",
    items: [
      { type: "leaf", label: "Accounts", to: "/accounts", icon: "pi pi-id-card" },
      { type: "leaf", label: "Employees (Logins & Roles)", to: "/employees", icon: "pi pi-users" },
      { type: "leaf", label: "Settings", to: "/settings", icon: "pi pi-cog" },
    ],
  },
];
