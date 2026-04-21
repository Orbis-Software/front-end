import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useAuthStore } from "@/app/stores/auth"

export type AppArea = "tms" | "wms" | "management"

export const useUiStore = defineStore("ui", () => {
  const auth = useAuthStore()

  const area = ref<AppArea>("tms")

  const mobileNavOpen = ref(false)
  const isDesktop = ref(true)

  /**
   * Management visibility is role / permission based.
   * This only controls whether the user is allowed to access
   * management-related sections at all.
   *
   * It should NOT be used to merge management nav items into WMS or TMS.
   */
  const canSeeManagement = computed(() => {
    if (!auth.isAuthenticated) return false

    if (auth.isAdmin || auth.isDev) return true

    if (auth.hasRole("company-manager")) return true

    return auth.permissions.some(permission => permission.startsWith("mgmt."))
  })

  function setArea(next: AppArea) {
    area.value = next
  }

  function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value
  }

  function closeMobileNav() {
    mobileNavOpen.value = false
  }

  function openMobileNav() {
    mobileNavOpen.value = true
  }

  function setDesktop(value: boolean) {
    isDesktop.value = value
  }

  return {
    area,
    canSeeManagement,
    mobileNavOpen,
    isDesktop,
    setArea,
    toggleMobileNav,
    closeMobileNav,
    openMobileNav,
    setDesktop,
  }
})
