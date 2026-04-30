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

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "auth.login" }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: "app.dashboard" }
  }
})

router.afterEach(to => {
  const pageTitle = to.meta.title as string | undefined

  document.title = pageTitle ? `${pageTitle} - ${APP_NAME}` : APP_NAME
})

export default router
