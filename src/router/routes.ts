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
const ContactsPage = () => import("@/app/pages/contacts/ContactsPage.vue");

export const routes: RouteRecordRaw[] = [
  /**
   * ============================
   * Auth Routes (Guest only)
   * ============================
   */
  {
    path: "/login",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: "",
        name: "login",
        component: LoginPage,
      },
    ],
  },

  /**
   * ============================
   * Protected App Routes
   * (Uses NEW layout with sidebar)
   * ============================
   */
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/dashboard",
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: DashboardPage,
      },
      {
        path: "jobs",
        name: "jobs",
        component: JobPage,
        meta: { title: "Jobs" },
      },
      {
        path: "quotes",
        name: "quotes",
        component: QuoteCreatePage,
        meta: { title: "Quotes" },
      },

      /**
       * ============================
       * Contacts (One dynamic page)
       * ============================
       */
      {
        path: "contacts/customers",
        name: "contacts.customers",
        component: ContactsPage,
        meta: { title: "Contacts • Customers", contactType: "customer" },
      },
      {
        path: "contacts/suppliers",
        name: "contacts.suppliers",
        component: ContactsPage,
        meta: { title: "Contacts • Suppliers", contactType: "supplier" },
      },
      {
        path: "contacts/road-hauliers",
        name: "contacts.road_hauliers",
        component: ContactsPage,
        meta: { title: "Contacts • Road Hauliers", contactType: "road_haulier" },
      },
      {
        path: "contacts/airlines",
        name: "contacts.airlines",
        component: ContactsPage,
        meta: { title: "Contacts • Airlines", contactType: "airline" },
      },
      {
        path: "contacts/rail-operators",
        name: "contacts.rail_operators",
        component: ContactsPage,
        meta: { title: "Contacts • Rail Operators", contactType: "rail_operator" },
      },
      {
        path: "contacts/shipping-lines",
        name: "contacts.shipping_lines",
        component: ContactsPage,
        meta: { title: "Contacts • Shipping Lines", contactType: "shipping_line" },
      },

      {
        path: "invoices",
        name: "invoices",
        component: PlaceholderPage,
        meta: { title: "Invoices" },
      },
      {
        path: "reports",
        name: "reports",
        component: PlaceholderPage,
        meta: { title: "Reports" },
      },
      {
        path: "warehouse",
        name: "warehouse",
        component: PlaceholderPage,
        meta: { title: "Warehouse" },
      },
      {
        path: "inventory",
        name: "inventory",
        component: PlaceholderPage,
        meta: { title: "Inventory" },
      },
      {
        path: "accounts",
        name: "accounts",
        component: PlaceholderPage,
        meta: { title: "Accounts" },
      },
      {
        path: "employees",
        name: "employees",
        component: PlaceholderPage,
        meta: { title: "Employees (Logins & Roles)" },
      },
      {
        path: "settings",
        name: "settings",
        component: PlaceholderPage,
        meta: { title: "Settings" },
      },
    ],
  },
];
