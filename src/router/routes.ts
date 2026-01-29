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
const ContactCreatePage = () => import("@/app/pages/contacts/create/ContactCreatePage.vue");
const ConsolidationPage  = () => import("@/app/pages/consolidations/ConsolidationPage.vue");
const SettingsPage = () => import("@/app/pages/settings/SettingsPage.vue");

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
       * Contacts (List + Create + Edit per type)
       * ============================
       */

      // Customers
      {
        path: "contacts/customers",
        name: "contacts.customers",
        component: ContactsPage,
        meta: { title: "Contacts • Customers", contactType: "customer" },
      },
      {
        path: "contacts/customers/create",
        name: "contacts.customers.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • Create • Customers", contactType: "customer" },
      },
      {
        path: "contacts/customers/edit/:id",
        name: "contacts.customers.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit • Customers", contactType: "customer" },
      },

      // Suppliers
      {
        path: "contacts/suppliers",
        name: "contacts.suppliers",
        component: ContactsPage,
        meta: { title: "Contacts • Suppliers", contactType: "supplier" },
      },
      {
        path: "contacts/suppliers/create",
        name: "contacts.suppliers.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • Create • Suppliers", contactType: "supplier" },
      },
      {
        path: "contacts/suppliers/edit/:id",
        name: "contacts.suppliers.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit • Suppliers", contactType: "supplier" },
      },

      // Road Hauliers
      {
        path: "contacts/road-hauliers",
        name: "contacts.road_hauliers",
        component: ContactsPage,
        meta: { title: "Contacts • Road Hauliers", contactType: "road_haulier" },
      },
      {
        path: "contacts/road-hauliers/create",
        name: "contacts.road_hauliers.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • Create • Road Hauliers", contactType: "road_haulier" },
      },
      {
        path: "contacts/road-hauliers/edit/:id",
        name: "contacts.road_hauliers.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit • Road Hauliers", contactType: "road_haulier" },
      },

      // Airlines
      {
        path: "contacts/airlines",
        name: "contacts.airlines",
        component: ContactsPage,
        meta: { title: "Contacts • Airlines", contactType: "airline" },
      },
      {
        path: "contacts/airlines/create",
        name: "contacts.airlines.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • Create • Airlines", contactType: "airline" },
      },
      {
        path: "contacts/airlines/edit/:id",
        name: "contacts.airlines.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit • Airlines", contactType: "airline" },
      },

      // Rail Operators
      {
        path: "contacts/rail-operators",
        name: "contacts.rail_operators",
        component: ContactsPage,
        meta: { title: "Contacts • Rail Operators", contactType: "rail_operator" },
      },
      {
        path: "contacts/rail-operators/create",
        name: "contacts.rail_operators.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • Create • Rail Operators", contactType: "rail_operator" },
      },
      {
        path: "contacts/rail-operators/edit/:id",
        name: "contacts.rail_operators.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit • Rail Operators", contactType: "rail_operator" },
      },

      // Shipping Lines
      {
        path: "contacts/shipping-lines",
        name: "contacts.shipping_lines",
        component: ContactsPage,
        meta: { title: "Contacts • Shipping Lines", contactType: "shipping_line" },
      },
      {
        path: "contacts/shipping-lines/create",
        name: "contacts.shipping_lines.create",
        component: ContactCreatePage,
        meta: { title: "Contacts • Create • Shipping Lines", contactType: "shipping_line" },
      },
      {
        path: "contacts/shipping-lines/edit/:id",
        name: "contacts.shipping_lines.edit",
        component: ContactCreatePage,
        meta: { title: "Contacts • Edit • Shipping Lines", contactType: "shipping_line" },
      },
      {
        path: "consolidations",
        name: "tms.consolidations.show",
        component: ConsolidationPage,
        meta: { title: "Consolidation" },
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
        component: SettingsPage,
        meta: { title: "Settings" },
      },
    ],
  },
];
