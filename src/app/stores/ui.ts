import { defineStore } from "pinia";
import { ref } from "vue";

export type AppArea = "tms" | "wms";

export const useUiStore = defineStore("ui", () => {
  const area = ref<AppArea>("tms");

  // ✅ TEMP: role-less management switch (UI only)
  const managementMode = ref(false);

  const mobileNavOpen = ref(false);
  const isDesktop = ref(true);

  function setArea(next: AppArea) {
    area.value = next;
  }

  function toggleManagementMode() {
    managementMode.value = !managementMode.value;
  }

  function toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value;
  }

  function setDesktop(v: boolean) {
    isDesktop.value = v;
  }

  return {
    area,
    managementMode,
    mobileNavOpen,
    isDesktop,
    setArea,
    toggleManagementMode,
    toggleMobileNav,
    setDesktop,
  };
});
