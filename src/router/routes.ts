import type { RouteRecordRaw } from "vue-router"

/* =========================
   Layouts
========================= */
const DefaultLayout = () => import("@/app/layouts/DefaultLayout.vue")
const AuthLayout = () => import("@/app/layouts/AuthLayout/AuthLayout.vue")
const CustomerAuthLayout = () => import("@/app/layouts/CustomerAuthLayout/CustomerAuthLayout.vue")
const CustomerDefaultLayout = () => import("@/app/layouts/CustomerDefaultLayout.vue")

/* =========================
   Shared / Generic Pages
========================= */
const PlaceholderPage = () => import("@/app/pages/default/PlaceholderPage.vue")

/* =========================
   Auth
========================= */
const LoginPage = () => import("@/app/pages/auth/loginPage/loginPage.vue")
const CustomerLoginPage = () => import("@/app/pages/auth/customerLoginPage/CustomerLoginPage.vue")

/* =========================
   TMS Pages
========================= */
const DashboardPage = () => import("@/app/pages/dashboard/DashboardPage.vue")

const JobPage = () => import("@/app/pages/jobs/JobPage.vue")
const JobsListPage = () => import("@/app/pages/jobs/list/JobsListPage.vue")
const JobDetailsPage = () => import("@/app/pages/jobs/details/JobDetailsPage.vue")

const JobOverviewTab = () => import("@/app/pages/jobs/details/tabs/Overview/JobOverviewTab.vue")
const JobPackagesTab = () => import("@/app/pages/jobs/details/tabs/Packages/JobPackagesTab.vue")
const JobTransportTab = () => import("@/app/pages/jobs/details/tabs/Transport/JobTransportTab.vue")
const JobCostsTab = () => import("@/app/pages/jobs/details/tabs/Costs/JobCostsTab.vue")

const QuoteListPage = () => import("@/app/pages/quotes/list/QuoteListPage.vue")
const QuoteCreatePage = () => import("@/app/pages/quotes/create/QuoteCreatePage.vue")
const QuoteDetailsPage = () => import("@/app/pages/quotes/details/QuoteDetailsPage.vue")

const ContactsPage = () => import("@/app/pages/contacts/ContactsPage.vue")
const ContactCreatePage = () => import("@/app/pages/contacts/create/ContactCreatePage.vue")
const ContactDetailsPage = () => import("@/app/pages/contacts/details/ContactDetailsPage.vue")
const ContactsImportPage = () => import("@/app/pages/contacts/import/ContactsImportPage.vue")

const ConsolidationPage = () => import("@/app/pages/consolidations/ConsolidationPage.vue")
const SettingsPage = () => import("@/app/pages/general-settings/GeneralSettingsPage.vue")
const TmsListPage = () => import("@/app/pages/tms/shared/TmsListPage.vue")

const MeasurementsUnitsTab = () =>
  import("@/app/pages/general-settings/tabs/MeasurementsUnitsTab.vue")
const FreightCargoTab = () => import("@/app/pages/general-settings/tabs/FreightCargoTab.vue")
const OperationsTab = () => import("@/app/pages/general-settings/tabs/OperationsTab.vue")
const WarehouseTab = () => import("@/app/pages/general-settings/tabs/WarehouseTab.vue")
const DocumentationTab = () => import("@/app/pages/general-settings/tabs/DocumentationTab.vue")
const ContactsAddressesTab = () =>
  import("@/app/pages/general-settings/tabs/ContactsAddressesTab.vue")

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
const WmsTableTab = () => import("@/app/pages/wms/shared/WmsTableTab.vue")

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
const WmsAdminListTab = () => import("@/app/pages/wms-admin/WmsAdminListTab.vue")

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: AuthLayout,
    meta: {
      guestOnly: true,
      title: "Login",
    },
    children: [
      {
        path: "",
        name: "auth.login",
        component: LoginPage,
      },
    ],
  },

  {
    path: "/customer/login",
    component: CustomerAuthLayout,
    meta: {
      guestOnly: true,
      title: "Customer Login",
    },
    children: [
      {
        path: "",
        name: "auth.customer.login",
        component: CustomerLoginPage,
      },
    ],
  },

  {
    path: "/customer",
    component: CustomerDefaultLayout,
    meta: {
      requiresAuth: true,
      authType: "customer",
    },
    children: [
      {
        path: "",
        redirect: {
          name: "customer.dashboard",
        },
      },
      {
        path: "dashboard",
        name: "customer.dashboard",
        component: () => import("@/app/pages/customer/dashboard/CustomerDashboardPage.vue"),
        meta: { title: "Customer Dashboard" },
      },
      {
        path: "shipments",
        name: "customer.shipments",
        component: () => import("@/app/pages/customer/shipments/CustomerShipmentsPage.vue"),
        meta: { title: "Customer Shipments" },
      },
      {
        path: "stock",
        name: "customer.stock",
        component: () => import("@/app/pages/customer/stock/CustomerStockPage.vue"),
        meta: { title: "Customer Stock" },
      },
      {
        path: "quotes",
        name: "customer.quotes",
        component: () => import("@/app/pages/customer/quotes/CustomerQuotesPage.vue"),
        meta: { title: "Customer Quotes" },
      },
      {
        path: "quotes/:id",
        name: "customer.quotes.show",
        component: () => import("@/app/pages/customer/quotes/CustomerQuoteDetailsPage.vue"),
        meta: { title: "Customer Quote Details" },
      },
      {
        path: "documents",
        name: "customer.documents",
        component: () => import("@/app/pages/customer/documents/CustomerDocumentsPage.vue"),
        meta: { title: "Customer Documents" },
      },
      {
        path: "reports",
        name: "customer.reports",
        component: () => import("@/app/pages/customer/reports/CustomerReportsPage.vue"),
        meta: { title: "Customer Reports" },
      },
      {
        path: "settings",
        name: "customer.settings",
        component: () => import("@/app/pages/customer/settings/CustomerSettingsPage.vue"),
        meta: { title: "Customer Settings" },
      },
    ],
  },

  {
    path: "/",
    component: DefaultLayout,
    meta: {
      requiresAuth: true,
      authType: "user",
    },
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },

      {
        path: "dashboard",
        name: "app.dashboard",
        component: DashboardPage,
        meta: { title: "Dashboard" },
      },

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
        redirect: { name: "tms.jobs.show.overview" },
        children: [
          {
            path: "overview",
            name: "tms.jobs.show.overview",
            component: JobOverviewTab,
          },
          {
            path: "packages",
            name: "tms.jobs.show.packages",
            component: JobPackagesTab,
          },
          {
            path: "transport",
            name: "tms.jobs.show.transport",
            component: JobTransportTab,
          },
          {
            path: "costs",
            name: "tms.jobs.show.costs",
            component: JobCostsTab,
          },
        ],
      },

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
        component: QuoteDetailsPage,
        meta: { title: "Quotes • Details" },
      },
      {
        path: "quotes/:id/edit",
        name: "tms.quotes.edit",
        component: QuoteCreatePage,
        meta: { title: "Quotes • Edit" },
      },

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

      {
        path: "consolidations",
        name: "tms.consolidations.show",
        component: ConsolidationPage,
        meta: { title: "Consolidation" },
      },

      {
        path: "invoices",
        name: "acc.invoices",
        component: TmsListPage,
        props: { tableKey: "invoices" },
        meta: { title: "Invoices" },
      },
      {
        path: "reports",
        name: "mgmt.reports",
        component: TmsListPage,
        props: { tableKey: "reports" },
        meta: { title: "Reports" },
      },

      {
        path: "wms",
        name: "wms.dashboard",
        component: WmsDashboardPage,
        meta: { title: "WMS Dashboard" },
      },

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
            component: WmsTableTab,
            props: { tableKey: "storageAll" },
            meta: { title: "Storage • All Consignments" },
          },
          {
            path: "by-customer",
            name: "warehouse-storage-by-customer",
            component: WmsTableTab,
            props: { tableKey: "storageByCustomer" },
            meta: { title: "Storage • By Customer" },
          },
          {
            path: "by-location",
            name: "warehouse-storage-by-location",
            component: WmsTableTab,
            props: { tableKey: "storageByLocation" },
            meta: { title: "Storage • By Location" },
          },
        ],
      },

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
            component: WmsTableTab,
            props: { tableKey: "goodsOutReady" },
            meta: { title: "Goods Out • Ready to Pick" },
          },
          {
            path: "pick-lists",
            name: "warehouse-goods-out-pick-lists",
            component: WmsTableTab,
            props: { tableKey: "goodsOutPickLists" },
            meta: { title: "Goods Out • Pick Lists" },
          },
          {
            path: "packing-lists",
            name: "warehouse-goods-out-packing-lists",
            component: WmsTableTab,
            props: { tableKey: "goodsOutPackingLists" },
            meta: { title: "Goods Out • Packing Lists" },
          },
        ],
      },

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
            component: WmsTableTab,
            props: { tableKey: "consolidationActive" },
            meta: { title: "Consolidation • Active Shipments" },
          },
          {
            path: "dispatched",
            name: "warehouse-consolidation-dispatched",
            component: WmsTableTab,
            props: { tableKey: "consolidationDispatched" },
            meta: { title: "Consolidation • Dispatched" },
          },
        ],
      },

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
            component: WmsTableTab,
            props: { tableKey: "stockOnHand" },
            meta: { title: "Stock • Stock on Hand" },
          },
          {
            path: "by-category",
            name: "inventory-stock-by-category",
            component: WmsTableTab,
            props: { tableKey: "stockCategory" },
            meta: { title: "Stock • By Category" },
          },
          {
            path: "low-stock",
            name: "inventory-stock-low-stock",
            component: WmsTableTab,
            props: { tableKey: "stockLow" },
            meta: { title: "Stock • Low Stock" },
          },
          {
            path: "valuation",
            name: "inventory-stock-valuation",
            component: WmsTableTab,
            props: { tableKey: "stockValuation" },
            meta: { title: "Stock • Valuation" },
          },
          {
            path: "barcode-labels",
            name: "inventory-stock-barcodes",
            component: WmsTableTab,
            props: { tableKey: "barcodeLabels" },
            meta: { title: "Stock • Barcode Labels" },
          },
          {
            path: "adjustments",
            name: "inventory-stock-adjustments",
            component: WmsTableTab,
            props: { tableKey: "stockAdjustments" },
            meta: { title: "Stock • Adjustments" },
          },
        ],
      },

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
            component: WmsTableTab,
            props: { tableKey: "reportsInbound" },
            meta: { title: "WMS Reports • Inbound" },
          },
          {
            path: "outbound",
            name: "inventory-reports-outbound",
            component: WmsTableTab,
            props: { tableKey: "reportsOutbound" },
            meta: { title: "WMS Reports • Outbound" },
          },
          {
            path: "storage",
            name: "inventory-reports-storage",
            component: WmsTableTab,
            props: { tableKey: "reportsStorage" },
            meta: { title: "WMS Reports • Storage & Dwell" },
          },
          {
            path: "customer-summary",
            name: "inventory-reports-customer",
            component: WmsTableTab,
            props: { tableKey: "reportsCustomer" },
            meta: { title: "WMS Reports • Customer Summary" },
          },
          {
            path: "stock-valuation",
            name: "inventory-reports-stock-valuation",
            component: WmsTableTab,
            props: { tableKey: "reportsValuation" },
            meta: { title: "WMS Reports • Stock Valuation" },
          },
        ],
      },

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
            component: WmsAdminListTab,
            props: { listKey: "customers" },
            meta: { title: "WMS Admin • Customers" },
          },
          {
            path: "suppliers",
            name: "wms-admin-suppliers",
            component: WmsAdminListTab,
            props: { listKey: "suppliers" },
            meta: { title: "WMS Admin • Suppliers" },
          },
          {
            path: "carriers",
            name: "wms-admin-carriers",
            component: WmsAdminListTab,
            props: { listKey: "carriers" },
            meta: { title: "WMS Admin • Carriers" },
          },
          {
            path: "units",
            name: "wms-admin-units",
            component: WmsAdminListTab,
            props: { listKey: "units" },
            meta: { title: "WMS Admin • Units" },
          },
          {
            path: "categories",
            name: "wms-admin-categories",
            component: WmsAdminListTab,
            props: { listKey: "categories" },
            meta: { title: "WMS Admin • Categories" },
          },
          {
            path: "goods-types",
            name: "wms-admin-goods-types",
            component: WmsAdminListTab,
            props: { listKey: "goodsTypes" },
            meta: { title: "WMS Admin • Goods Types" },
          },
          {
            path: "locations",
            name: "wms-admin-locations",
            component: WmsAdminListTab,
            props: { listKey: "locations" },
            meta: { title: "WMS Admin • Locations" },
          },
          {
            path: "racks",
            name: "wms-admin-racks",
            component: WmsAdminListTab,
            props: { listKey: "racks" },
            meta: { title: "WMS Admin • Racks" },
          },
        ],
      },

      {
        path: "accounts",
        name: "acc.accounts",
        component: AccountsPage,
        meta: { title: "Accounts" },
      },

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

      {
        path: "settings",
        component: SettingsPage,
        meta: { title: "Settings" },
        children: [
          {
            path: "",
            redirect: { name: "general-settings.measurements" },
          },
          {
            path: "measurements",
            name: "general-settings.measurements",
            component: MeasurementsUnitsTab,
            meta: { title: "Measurements & Units" },
          },
          {
            path: "freight-cargo",
            name: "general-settings.freight-cargo",
            component: FreightCargoTab,
            meta: { title: "Freight & Cargo" },
          },
          {
            path: "operations",
            name: "general-settings.operations",
            component: OperationsTab,
            meta: { title: "Operations" },
          },
          {
            path: "warehouse",
            name: "general-settings.warehouse",
            component: WarehouseTab,
            meta: { title: "Warehouse" },
          },
          {
            path: "documentation",
            name: "general-settings.documentation",
            component: DocumentationTab,
            meta: { title: "Documentation" },
          },
          {
            path: "contacts-addresses",
            name: "general-settings.contacts-addresses",
            component: ContactsAddressesTab,
            meta: { title: "Contacts & Addresses" },
          },
          {
            path: "global-reference-data",
            name: "general-settings.global-reference-data",
            component: () =>
              import("@/app/pages/general-settings/globalReferenceData/GlobalReferenceDataPage.vue"),
            meta: {
              title: "Global Reference Data",
              requiresAuth: true,
            },
          },
        ],
      },

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
