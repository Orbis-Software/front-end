import type { RouteRecordRaw } from "vue-router"

/* =========================
   Layouts
========================= */
const DefaultLayout = () => import("@/app/layouts/DefaultLayout.vue")
const AuthLayout = () => import("@/app/layouts/AuthLayout/AuthLayout.vue")

/* =========================
   Pages
========================= */
const LoginPage = () => import("@/app/pages/auth/loginPage/loginPage.vue")
const DashboardPage = () => import("@/app/pages/dashboard/DashboardPage.vue")
const PlaceholderPage = () => import("@/app/pages/default/PlaceholderPage.vue")
const QuoteCreatePage = () => import("@/app/pages/quotes/QuoteCreatePage.vue")
const JobPage = () => import("@/app/pages/jobs/JobPage.vue")
const JobsListPage = () => import("@/app/pages/jobs/list/JobsListPage.vue")
const ContactsPage = () => import("@/app/pages/contacts/ContactsPage.vue")
const ContactCreatePage = () => import("@/app/pages/contacts/create/ContactCreatePage.vue")
const ConsolidationPage = () => import("@/app/pages/consolidations/ConsolidationPage.vue")
const SettingsPage = () => import("@/app/pages/settings/SettingsPage.vue")
const ContactsImportPage = () => import("@/app/pages/contacts/import/ContactsImportPage.vue")
const JobDetailsPage = () => import("@/app/pages/jobs/details/JobDetailsPage.vue")
const ContactDetailsPage = () => import("@/app/pages/contacts/details/ContactDetailsPage.vue")
const EmployeeListPage = () => import("@/app/pages/employees/EmployeeListPage.vue")
const SystemAccessPage = () => import("@/app/pages/system-access/SystemAccessPage.vue")
const AccountsPage = () => import("@/app/pages/management/accounts/AccountsPage.vue")

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
      { path: "", redirect: "/dashboard" },

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
      },

      {
        path: "quotes",
        name: "tms.quotes.index",
        component: QuoteCreatePage,
        meta: { title: "Quotes" },
      },

      /**
       * ============================
       * Contacts
       * ============================
       */
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
        path: "consolidations",
        name: "tms.consolidations.show",
        component: ConsolidationPage,
        meta: { title: "Consolidation" },
      },

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
      {
        path: "warehouse",
        name: "wms.warehouse",
        component: PlaceholderPage,
        meta: { title: "Warehouse" },
      },
      {
        path: "inventory",
        name: "wms.inventory",
        component: PlaceholderPage,
        meta: { title: "Inventory" },
      },
      {
        path: "accounts",
        name: "acc.accounts",
        component: AccountsPage,
        meta: { title: "Accounts" },
      },
      {
        path: "employees",
        name: "mgmt.employees",
        component: EmployeeListPage,
        meta: { title: "Employees (Logins & Roles)" },
      },
      {
        path: "system-access",
        name: "mgmt.system-access",
        component: SystemAccessPage,
        meta: { title: "System Access" },
      },
      {
        path: "settings",
        name: "app.settings",
        component: SettingsPage,
        meta: { title: "Settings" },
      },

      /**
       * ============================
       * System Settings
       * ============================
       */
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
        ],
      },

      {
        path: "contacts/import",
        name: "contacts.import",
        component: ContactsImportPage,
      },
    ],
  },
]
