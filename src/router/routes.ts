import type { RouteRecordRaw } from 'vue-router'

/* =========================
   Layouts
========================= */
import DefaultLayout from '@/app/layouts/DefaultLayout.vue'
import AuthLayout from '@/app/layouts/AuthLayout/AuthLayout.vue'

/* =========================
   Auth Pages
========================= */
import LoginPage from '@/app/pages/auth/loginPage/loginPage.vue'

/* =========================
   Protected Pages
========================= */
import DashboardHome from '@/app/pages/dashboard/DashboardHome.vue'
import JobsPage from '@/app/pages/job/list/jobPage.vue'
import ClientsPage from '@/app/pages/client/list/ClientsPage.vue'
import JobFormPage from '@/app/pages/job/jobForm/JobFormPage.vue'

/* =========================
   Public Pages
========================= */
import PublicJobSearch from '@/app/pages/public/JobSearch/JobSearch.vue'
import PublicJobView from '@/app/pages/public/JobView/JobView.vue'
import PublicJobPayment from '@/app/pages/public/JobPayment/JobPayment.vue'

export const routes: RouteRecordRaw[] = [
  /**
   * ============================
   * Auth Routes (Guest only)
   * ============================
   */
  {
    path: '/login',
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: '',
        name: 'login',
        component: LoginPage,
      },
    ],
  },

  /**
   * ============================
   * Public Routes (NO AUTH)
   * ============================
   */
  {
    path: '/public/jobs',
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'public.jobs.search',
        component: PublicJobSearch,
      },
      {
        path: ':reference',
        name: 'public.jobs.view',
        component: PublicJobView,
        props: true,
      },
      {
        path: ':reference/pay',
        name: 'public.jobs.pay',
        component: PublicJobPayment,
        props: true,
      },
    ],
  },

  /**
   * ============================
   * Protected App Routes
   * ============================
   */
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardHome,
      },
      {
        path: 'jobs',
        name: 'jobs',
        component: JobsPage,
      },
      {
        path: 'jobs/create',
        name: 'jobs.create',
        component: JobFormPage,
      },
      {
        path: 'jobs/:id/edit',
        name: 'jobs.edit',
        component: JobFormPage,
        props: true,
      },
      {
        path: 'clients',
        name: 'clients',
        component: ClientsPage,
      },
    ],
  },
]
