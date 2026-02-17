import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useAuthStore } from "@/app/stores/auth";

export type AppArea = "tms" | "wms";

export const useUiStore = defineStore("ui", () => {
  const auth = useAuthStore();

  const area = ref<AppArea>("tms");

  const mobileNavOpen = ref(false);
  const isDesktop = ref(true);

  /**
   * ✅ Management visibility is role-based (no manual switch)
   * - admins/dev can see it
   * - company-manager can see it
   * - company-employee cannot
   */
  const canSeeManagement = computed(() => {
    if (!auth.isAuthenticated) return false;
    if (auth.isAdmin || auth.isDev) return true;
    return auth.hasRole("company-manager");
  });

  function setArea(next: AppArea) {
    area.value = next;
  }

  function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value;
  }

  function setDesktop(v: boolean) {
    isDesktop.value = v;
  }

  return {
    area,
    canSeeManagement,
    mobileNavOpen,
    isDesktop,
    setArea,
    toggleMobileNav,
    setDesktop,
  };
});
