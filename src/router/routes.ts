import type { RouteRecordRaw } from "vue-router";

/* =========================
   Layouts
========================= */
const DefaultLayout = () => import("@/app/layouts/DefaultLayout.vue");
const AuthLayout = () => import("@/app/layouts/AuthLayout/AuthLayout.vue");

/* =========================
   Pages
========================= */
const LoginPage = () => import("@/app/pages/auth/loginPage/loginPage.vue");
const DashboardPage = () => import("@/app/pages/dashboard/DashboardPage.vue");
const PlaceholderPage = () => import("@/app/pages/default/PlaceholderPage.vue");
const QuoteCreatePage = () => import("@/app/pages/quotes/QuoteCreatePage.vue");
const JobPage = () => import("@/app/pages/jobs/JobPage.vue");
const JobsListPage = () => import("@/app/pages/jobs/list/JobsListPage.vue");
const ContactsPage = () => import("@/app/pages/contacts/ContactsPage.vue");
const ContactCreatePage = () => import("@/app/pages/contacts/create/ContactCreatePage.vue");
const ConsolidationPage = () => import("@/app/pages/consolidations/ConsolidationPage.vue");
const SettingsPage = () => import("@/app/pages/settings/SettingsPage.vue");
const MasterSettingsPage = () => import("@/app/pages/settings/masterSettings/MasterSettingsPage.vue");
const ContactsImportPage = () => import('@/app/pages/contacts/import/ContactsImportPage.vue')
const JobDetailsPage = () => import("@/app/pages/jobs/details/JobDetailsPage.vue");


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
        component: PlaceholderPage,
        meta: { title: "Accounts" },
      },
      {
        path: "employees",
        name: "mgmt.employees",
        component: PlaceholderPage,
        meta: { title: "Employees (Logins & Roles)" },
      },
      {
        path: "settings",
        name: "app.settings",
        component: SettingsPage,
        meta: { title: "Settings" },
      },
      {
        path: "/settings/master",
        name: "settings.master",
        component: MasterSettingsPage,
        meta: { title: "Master Settings" },
      },
      {
        path: '/contacts/import',
        name: 'contacts.import',
        component: ContactsImportPage,
      }
    ],
  },
];
