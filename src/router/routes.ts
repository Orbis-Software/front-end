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
    component: DefaultLayout, // ✅ layout that includes AppSidebar
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
      {
        path: "contacts/customers",
        name: "contacts.customers",
        component: PlaceholderPage,
        meta: { title: "Contacts • Customers" },
      },
      {
        path: "contacts/suppliers",
        name: "contacts.suppliers",
        component: PlaceholderPage,
        meta: { title: "Contacts • Suppliers" },
      },
      {
        path: "contacts/road-hauliers",
        name: "contacts.road_hauliers",
        component: PlaceholderPage,
        meta: { title: "Contacts • Road Hauliers" },
      },
      {
        path: "contacts/airlines",
        name: "contacts.airlines",
        component: PlaceholderPage,
        meta: { title: "Contacts • Airlines" },
      },
      {
        path: "contacts/rail-operators",
        name: "contacts.rail_operators",
        component: PlaceholderPage,
        meta: { title: "Contacts • Rail Operators" },
      },
      {
        path: "contacts/shipping-lines",
        name: "contacts.shipping_lines",
        component: PlaceholderPage,
        meta: { title: "Contacts • Shipping Lines" },
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
