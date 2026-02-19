<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "@/app/components/header/AppHeader.vue";
import AppTopNav from "@/app/components/nav/AppTopNav.vue";
import { useUiStore } from "@/app/stores/ui";

const ui = useUiStore();
const route = useRoute();

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
    <div class="sticky-chrome">
      <AppHeader
        :area="ui.area"
        @switch-area="ui.setArea"
        @toggle-mobile-nav="ui.toggleMobileNav"
      />

      <AppTopNav
        :area="ui.area"
        :mobile-open="ui.mobileNavOpen"
        @close-mobile="ui.mobileNavOpen = false"
      />
    </div>

    <main class="app-content">
      <!-- ✅ force remount on navigation -->
      <router-view :key="route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* ✅ Header + Nav sticky */
.sticky-chrome {
  position: sticky;
  top: 0;
  z-index: 300;
  background: #fff;
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
