<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue"
import { useRoute } from "vue-router"
import AppHeader from "@/app/components/header/AppHeader.vue"
import AppTopNav from "@/app/components/nav/AppTopNav.vue"
import { useUiStore } from "@/app/stores/ui"

const ui = useUiStore()
const route = useRoute()

function onResize() {
  ui.setDesktop(window.innerWidth >= 1024)
  if (window.innerWidth >= 1024) ui.mobileNavOpen = false
}

onMounted(() => {
  ui.setDesktop(window.innerWidth >= 1024)
  window.addEventListener("resize", onResize)
})

onBeforeUnmount(() => window.removeEventListener("resize", onResize))
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
      <router-view :key="route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  --shell-side-padding: clamp(14px, 2.2vw, 32px);
  --shell-content-max: 1400px;

  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

/* sticky header + nav */
.sticky-chrome {
  position: sticky;
  top: 0;
  z-index: 300;
  background: #fff;
  width: 100%;
}

/* content aligned with the same system */
.app-content {
  width: 100%;
  max-width: calc(var(--shell-content-max) + (var(--shell-side-padding) * 2));
  margin: 0 auto;
  padding: 28px var(--shell-side-padding);
  flex: 1;
  box-sizing: border-box;
}

@media (max-width: 1280px) {
  .app-content {
    padding-top: 22px;
    padding-bottom: 22px;
  }
}

@media (max-width: 1024px) {
  .app-content {
    padding-top: 18px;
    padding-bottom: 18px;
  }
}
</style>
