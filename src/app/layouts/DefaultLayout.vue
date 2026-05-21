<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue"
import { useRoute } from "vue-router"
import AppHeader from "@/app/components/header/AppHeader.vue"
import { useUiStore } from "@/app/stores/ui"

const ui = useUiStore()
const route = useRoute()

const pageKey = computed(() => {
  const topLevelRecord = route.matched[1]
  const topLevelPath = topLevelRecord?.path ?? route.path
  const stableParams = Object.entries(route.params)
    .map(([key, value]) => `${key}:${Array.isArray(value) ? value.join("|") : value}`)
    .join(";")

  return `${topLevelPath}:${stableParams}`
})

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
        :mobile-open="ui.mobileNavOpen"
        @switch-area="ui.setArea"
        @toggle-mobile-nav="ui.toggleMobileNav"
        @close-mobile="ui.mobileNavOpen = false"
      />
    </div>

    <main class="app-content">
      <router-view :key="pageKey" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  --shell-side-padding: clamp(20px, 2.4vw, 32px);
  --shell-content-max: 1400px;

  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

.sticky-chrome {
  position: sticky;
  top: 0;
  z-index: 300;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.app-content {
  width: 100%;
  max-width: calc(var(--shell-content-max) + (var(--shell-side-padding) * 2));
  margin: 0 auto;
  padding: 28px var(--shell-side-padding);
  flex: 1;
  box-sizing: border-box;
}
</style>
