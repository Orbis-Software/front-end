<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import AppHeader from "@/app/components/header/AppHeader.vue";
import AppTopNav from "@/app/components/nav/AppTopNav.vue";
import { useUiStore } from "@/app/stores/ui";

const ui = useUiStore();

function onResize() {
  ui.setDesktop(window.innerWidth >= 1024);
  if (window.innerWidth >= 1024) ui.mobileNavOpen = false;
}

onMounted(() => {
  ui.setDesktop(window.innerWidth >= 1024);
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => window.removeEventListener("resize", onResize));
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :area="ui.area"
      :management-mode="ui.managementMode"
      @switch-area="ui.setArea"
      @toggle-management="ui.toggleManagementMode"
      @toggle-mobile-nav="ui.toggleMobileNav"
    />

    <AppTopNav
      :area="ui.area"
      :management-mode="ui.managementMode"
      :mobile-open="ui.mobileNavOpen"
      @close-mobile="ui.mobileNavOpen = false"
    />

    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--pc-bg-page);
  display: flex;
  flex-direction: column;
}

/* Centered container like TransportPro */
.app-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 32px;
  flex: 1;
}

@media (max-width: 1200px) {
  .app-content {
    padding: 22px 20px;
  }
}
</style>
