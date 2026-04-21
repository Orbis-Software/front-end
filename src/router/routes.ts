import type { RouteRecordRaw } from "vue-router"

/* =========================
   Layouts
========================= */
const DefaultLayout = () => import("@/app/layouts/DefaultLayout.vue")
const AuthLayout = () => import("@/app/layouts/AuthLayout/AuthLayout.vue")

/* =========================
   Shared / Generic Pages
========================= */
const PlaceholderPage = () => import("@/app/pages/default/PlaceholderPage.vue")

/* =========================
   Auth
========================= */
const LoginPage = () => import("@/app/pages/auth/loginPage/loginPage.vue")

/* =========================
   TMS Pages
========================= */
const DashboardPage = () => import("@/app/pages/dashboard/DashboardPage.vue")

const JobPage = () => import("@/app/pages/jobs/JobPage.vue")
const JobsListPage = () => import("@/app/pages/jobs/list/JobsListPage.vue")
const JobDetailsPage = () => import("@/app/pages/jobs/details/JobDetailsPage.vue")

const QuoteListPage = () => import("@/app/pages/quotes/list/QuoteListPage.vue")
const QuoteCreatePage = () => import("@/app/pages/quotes/create/QuoteCreatePage.vue")

const ContactsPage = () => import("@/app/pages/contacts/ContactsPage.vue")
const ContactCreatePage = () => import("@/app/pages/contacts/create/ContactCreatePage.vue")
const ContactDetailsPage = () => import("@/app/pages/contacts/details/ContactDetailsPage.vue")
const ContactsImportPage = () => import("@/app/pages/contacts/import/ContactsImportPage.vue")

const ConsolidationPage = () => import("@/app/pages/consolidations/ConsolidationPage.vue")
const SettingsPage = () => import("@/app/pages/general-settings/GeneralSettingsPage.vue")

/* =========================
   Management Pages
========================= */
const AccountsPage = () => import("@/app/pages/management/accounts/AccountsPage.vue")
const ManagementUsersPage = () => import("@/app/pages/management/users/ManagementUsersPage.vue")
const EmployeeListPage = () => import("@/app/pages/employees/EmployeeListPage.vue")
const SystemAccessPage = () => import("@/app/pages/system-access/SystemAccessPage.vue")

/* =========================
   System Settings Pages
========================= */
const SystemSettingsPage = () =>
  import("@/app/pages/settings/systemSettings/SystemSettingsPage.vue")
const SystemSettingsCompanyPage = () =>
  import("@/app/pages/settings/systemSettings/company/SystemSettingsCompanyPage.vue")
const SystemSettingsBrandingPage = () =>
  import("@/app/pages/settings/systemSettings/branding/SystemSettingsBrandingPage.vue")
const SystemSettingsShortcutsPage = () =>
  import("@/app/pages/settings/systemSettings/shortcuts/SystemSettingsShortcutsPage.vue")
const MasterSettingsPage = () =>
  import("@/app/pages/settings/systemSettings/master/SystemSettingsMasterPage.vue")
const SystemSettingsAwbManagerPage = () =>
  import("@/app/pages/settings/systemSettings/awbManager/SystemSettingsAwbManagerPage.vue")

/* =========================
   WMS Pages
========================= */
const WmsDashboardPage = () => import("@/app/pages/wms/dashboard/WmsDashboardPage.vue")

const WarehouseGoodsInPage = () => import("@/app/pages/warehouse/goods-in/WarehouseGoodsInPage.vue")

const ArrivalLogTab = () =>
  import("@/app/pages/warehouse/goods-in/tabs/arrival-log/ArrivalLogTab.vue")

const ExpectedArrivalsTab = () =>
  import("@/app/pages/warehouse/goods-in/tabs/expected-arrivals/ExpectedArrivalsTab.vue")

const WarehouseReceiptsTab = () =>
  import("@/app/pages/warehouse/goods-in/tabs/warehouse-receipts/WarehouseReceiptsTab.vue")

const WarehouseStoragePage = () => import("@/app/pages/warehouse/storage/WarehouseStoragePage.vue")
const WarehouseGoodsOutPage = () =>
  import("@/app/pages/warehouse/goods-out/WarehouseGoodsOutPage.vue")
const WarehouseConsolidationPage = () =>
  import("@/app/pages/warehouse/consolidation/WarehouseConsolidationPage.vue")

const InventoryStockPage = () => import("@/app/pages/inventory/stock/InventoryStockPage.vue")
const InventoryReportsPage = () => import("@/app/pages/inventory/reports/InventoryReportsPage.vue")

const WmsAdminPage = () => import("@/app/pages/wms-admin/WmsAdminPage.vue")

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: "",
        name: "auth.login",
        component: LoginPage,
      },
    ],
  },

  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },

      /* =========================
         TMS Dashboard
      ========================= */
      {
        path: "dashboard",
        name: "app.dashboard",
        component: DashboardPage,
        meta: { title: "Dashboard" },
      },

      /* =========================
         Jobs
      ========================= */
      {
        path: "jobs",
        name: "tms.jobs.index",
        component: JobsListPage,
        meta: { title: "Jobs" },
      },
      {
        path: "jobs/new",
        name: "tms.jobs.create",
        component: JobPage,
        meta: { title: "Jobs • New" },
      },
      {
        path: "jobs/:id",
        name: "tms.jobs.show",
        component: JobDetailsPage,
        meta: { title: "Jobs • Details" },
      },

      /* =========================
         Quotes
      ========================= */
      {
        path: "quotes",
        name: "tms.quotes.index",
        component: QuoteListPage,
        meta: { title: "Quotes" },
      },
      {
        path: "quotes/new",
        name: "tms.quotes.create",
        component: QuoteCreatePage,
        meta: { title: "Quotes • New" },
      },
      {
        path: "quotes/:id",
        name: "tms.quotes.show",
        component: QuoteCreatePage,
        meta: { title: "Quotes • Details" },
      },

      /* =========================
         Contacts
      ========================= */
      {
        path: "contacts",
        name: "crm.contacts.index",
        component: ContactsPage,
        meta: { title: "Contacts" },
      },
      {
        path: "contacts/new",
        name: "crm.contacts.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • New" },
      },
      {
        path: "contacts/:id",
        name: "crm.contacts.show",
        component: ContactDetailsPage,
        meta: { title: "Contacts • Details" },
      },
      {
        path: "contacts/:id/edit",
        name: "crm.contacts.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit" },
      },
      {
        path: "contacts/import",
        name: "contacts.import",
        component: ContactsImportPage,
        meta: { title: "Contacts • Import" },
      },

      /* =========================
         TMS Consolidations
      ========================= */
      {
        path: "consolidations",
        name: "tms.consolidations.show",
        component: ConsolidationPage,
        meta: { title: "Consolidation" },
      },

      /* =========================
         Legacy / Generic Pages
      ========================= */
      {
        path: "invoices",
        name: "acc.invoices",
        component: PlaceholderPage,
        meta: { title: "Invoices" },
      },
      {
        path: "reports",
        name: "mgmt.reports",
        component: PlaceholderPage,
        meta: { title: "Reports" },
      },

      /* =========================
         WMS Dashboard
      ========================= */
      {
        path: "wms",
        name: "wms.dashboard",
        component: WmsDashboardPage,
        meta: { title: "WMS Dashboard" },
      },

      /* =========================
         Warehouse • Goods In
      ========================= */
      {
        path: "warehouse/goods-in",
        component: WarehouseGoodsInPage,
        meta: { title: "Goods In" },
        children: [
          {
            path: "",
            redirect: { name: "warehouse-goods-in-arrival-log" },
          },
          {
            path: "arrival-log",
            name: "warehouse-goods-in-arrival-log",
            component: ArrivalLogTab,
            meta: { title: "Goods In • Arrival Log" },
          },
          {
            path: "expected-arrivals",
            name: "warehouse-goods-in-expected-arrivals",
            component: ExpectedArrivalsTab,
            meta: { title: "Goods In • Expected Arrivals" },
          },
          {
            path: "warehouse-receipts",
            name: "warehouse-goods-in-receipts",
            component: WarehouseReceiptsTab,
            meta: { title: "Goods In • Warehouse Receipts" },
          },
        ],
      },
      /* =========================
         Warehouse • Storage
      ========================= */
      {
        path: "warehouse/storage",
        component: WarehouseStoragePage,
        meta: { title: "Storage" },
        children: [
          {
            path: "",
            redirect: { name: "warehouse-storage-all" },
          },
          {
            path: "all-consignments",
            name: "warehouse-storage-all",
            component: PlaceholderPage,
            meta: { title: "Storage • All Consignments" },
          },
          {
            path: "by-customer",
            name: "warehouse-storage-by-customer",
            component: PlaceholderPage,
            meta: { title: "Storage • By Customer" },
          },
          {
            path: "by-location",
            name: "warehouse-storage-by-location",
            component: PlaceholderPage,
            meta: { title: "Storage • By Location" },
          },
        ],
      },

      /* =========================
         Warehouse • Goods Out
      ========================= */
      {
        path: "warehouse/goods-out",
        component: WarehouseGoodsOutPage,
        meta: { title: "Goods Out" },
        children: [
          {
            path: "",
            redirect: { name: "warehouse-goods-out-ready" },
          },
          {
            path: "ready-to-pick",
            name: "warehouse-goods-out-ready",
            component: PlaceholderPage,
            meta: { title: "Goods Out • Ready to Pick" },
          },
          {
            path: "pick-lists",
            name: "warehouse-goods-out-pick-lists",
            component: PlaceholderPage,
            meta: { title: "Goods Out • Pick Lists" },
          },
          {
            path: "packing-lists",
            name: "warehouse-goods-out-packing-lists",
            component: PlaceholderPage,
            meta: { title: "Goods Out • Packing Lists" },
          },
        ],
      },

      /* =========================
         Warehouse • Consolidation
      ========================= */
      {
        path: "warehouse/consolidation",
        component: WarehouseConsolidationPage,
        meta: { title: "Consolidation" },
        children: [
          {
            path: "",
            redirect: { name: "warehouse-consolidation-active" },
          },
          {
            path: "active-shipments",
            name: "warehouse-consolidation-active",
            component: PlaceholderPage,
            meta: { title: "Consolidation • Active Shipments" },
          },
          {
            path: "dispatched",
            name: "warehouse-consolidation-dispatched",
            component: PlaceholderPage,
            meta: { title: "Consolidation • Dispatched" },
          },
        ],
      },

      /* =========================
         Inventory • Stock
      ========================= */
      {
        path: "inventory/stock",
        component: InventoryStockPage,
        meta: { title: "Stock" },
        children: [
          {
            path: "",
            redirect: { name: "inventory-stock-on-hand" },
          },
          {
            path: "stock-on-hand",
            name: "inventory-stock-on-hand",
            component: PlaceholderPage,
            meta: { title: "Stock • Stock on Hand" },
          },
          {
            path: "by-category",
            name: "inventory-stock-by-category",
            component: PlaceholderPage,
            meta: { title: "Stock • By Category" },
          },
          {
            path: "low-stock",
            name: "inventory-stock-low-stock",
            component: PlaceholderPage,
            meta: { title: "Stock • Low Stock" },
          },
          {
            path: "valuation",
            name: "inventory-stock-valuation",
            component: PlaceholderPage,
            meta: { title: "Stock • Valuation" },
          },
          {
            path: "barcode-labels",
            name: "inventory-stock-barcodes",
            component: PlaceholderPage,
            meta: { title: "Stock • Barcode Labels" },
          },
          {
            path: "adjustments",
            name: "inventory-stock-adjustments",
            component: PlaceholderPage,
            meta: { title: "Stock • Adjustments" },
          },
        ],
      },

      /* =========================
         Inventory • Reports
      ========================= */
      {
        path: "inventory/reports",
        component: InventoryReportsPage,
        meta: { title: "WMS Reports" },
        children: [
          {
            path: "",
            redirect: { name: "inventory-reports-inbound" },
          },
          {
            path: "inbound",
            name: "inventory-reports-inbound",
            component: PlaceholderPage,
            meta: { title: "WMS Reports • Inbound" },
          },
          {
            path: "outbound",
            name: "inventory-reports-outbound",
            component: PlaceholderPage,
            meta: { title: "WMS Reports • Outbound" },
          },
          {
            path: "storage",
            name: "inventory-reports-storage",
            component: PlaceholderPage,
            meta: { title: "WMS Reports • Storage & Dwell" },
          },
          {
            path: "customer-summary",
            name: "inventory-reports-customer",
            component: PlaceholderPage,
            meta: { title: "WMS Reports • Customer Summary" },
          },
          {
            path: "stock-valuation",
            name: "inventory-reports-stock-valuation",
            component: PlaceholderPage,
            meta: { title: "WMS Reports • Stock Valuation" },
          },
        ],
      },

      /* =========================
         WMS Admin
      ========================= */
      {
        path: "wms/admin",
        component: WmsAdminPage,
        meta: { title: "WMS Admin Lists" },
        children: [
          {
            path: "",
            redirect: { name: "wms-admin-customers" },
          },
          {
            path: "customers",
            name: "wms-admin-customers",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Customers" },
          },
          {
            path: "suppliers",
            name: "wms-admin-suppliers",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Suppliers" },
          },
          {
            path: "carriers",
            name: "wms-admin-carriers",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Carriers" },
          },
          {
            path: "units",
            name: "wms-admin-units",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Units" },
          },
          {
            path: "categories",
            name: "wms-admin-categories",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Categories" },
          },
          {
            path: "goods-types",
            name: "wms-admin-goods-types",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Goods Types" },
          },
          {
            path: "locations",
            name: "wms-admin-locations",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Locations" },
          },
          {
            path: "racks",
            name: "wms-admin-racks",
            component: PlaceholderPage,
            meta: { title: "WMS Admin • Racks" },
          },
        ],
      },

      /* =========================
         Accounts
      ========================= */
      {
        path: "accounts",
        name: "acc.accounts",
        component: AccountsPage,
        meta: { title: "Accounts" },
      },

      /* =========================
         User Management
      ========================= */
      {
        path: "management/users",
        component: ManagementUsersPage,
        meta: { title: "User Management" },
        children: [
          {
            path: "",
            redirect: { name: "mgmt.users.employees" },
          },
          {
            path: "employees",
            name: "mgmt.users.employees",
            component: EmployeeListPage,
            meta: { title: "User Management • Employee List" },
          },
          {
            path: "system-access",
            name: "mgmt.users.system-access",
            component: SystemAccessPage,
            meta: { title: "User Management • System Access" },
          },
        ],
      },

      /* =========================
         General Settings
      ========================= */
      {
        path: "settings",
        name: "app.settings",
        component: SettingsPage,
        meta: { title: "Settings" },
      },

      /* =========================
         System Settings
      ========================= */
      {
        path: "settings/system",
        component: SystemSettingsPage,
        meta: { title: "System Settings" },
        children: [
          {
            path: "",
            redirect: { name: "settings.system.company" },
          },
          {
            path: "company",
            name: "settings.system.company",
            component: SystemSettingsCompanyPage,
            meta: { title: "System Settings • Company" },
          },
          {
            path: "branding",
            name: "settings.system.branding",
            component: SystemSettingsBrandingPage,
            meta: { title: "System Settings • Branding" },
          },
          {
            path: "shortcuts",
            name: "settings.system.shortcuts",
            component: SystemSettingsShortcutsPage,
            meta: { title: "System Settings • Shortcuts" },
          },
          {
            path: "master",
            name: "settings.system.master",
            component: MasterSettingsPage,
            meta: { title: "System Settings • Master Settings" },
          },
          {
            path: "awb-manager",
            name: "settings.system.awb_manager",
            component: SystemSettingsAwbManagerPage,
            meta: { title: "System Settings • AWB Manager" },
          },
        ],
      },
    ],
  },
]
