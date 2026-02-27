import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/app/stores/auth'

const router = createRouter({
  history: createWebHistory("/"),
  routes,
})

/**
 * ============================
 * Global Route Middleware
 * ============================
 *
 * Acts like Laravel middleware:
 * - auth
 * - guest
 */
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Hydrate auth once on first navigation
  if (!authStore.ready) {
    await authStore.hydrate()
  }

  // Auth required
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "auth.login" };
  }

  // Guest only
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: "app.dashboard" };
  }
})

export default router
