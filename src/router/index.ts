import { createRouter, createWebHistory } from "vue-router"
import { routes } from "./routes"
import { useAuthStore } from "@/app/stores/auth"

const APP_NAME = "Orbis"

const router = createRouter({
  history: createWebHistory("/"),
  routes,
})

router.beforeEach(async to => {
  const authStore = useAuthStore()

  if (!authStore.ready) {
    await authStore.hydrate()
  }

  const requiresAuth = to.meta.requiresAuth === true
  const guestOnly = to.meta.guestOnly === true
  const userOnly = to.meta.authType === "user"
  const customerOnly = to.meta.authType === "customer"
  const publicNotFound = to.meta.publicNotFound === true

  if (publicNotFound && !authStore.isAuthenticated) {
    return
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: "auth.login" }
  }

  if (guestOnly && authStore.isAuthenticated) {
    if (authStore.isCustomer) {
      return { name: "customer.dashboard" }
    }

    return { name: "app.dashboard" }
  }

  if (userOnly && !authStore.isUser) {
    return { name: "customer.dashboard" }
  }

  if (customerOnly && !authStore.isCustomer) {
    return { name: "app.dashboard" }
  }
})

router.afterEach(to => {
  const pageTitle = to.meta.title as string | undefined
  document.title = pageTitle ? `${pageTitle} - ${APP_NAME}` : APP_NAME
})

export default router
