<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue"
import { useRoute } from "vue-router"
import CustomerHeader from "@/app/components/customer/header/CustomerHeader.vue"
import { useAuthStore } from "@/app/stores/auth"
import { useUiStore } from "@/app/stores/ui"

const ui = useUiStore()
const auth = useAuthStore()
const route = useRoute()

function onResize() {
  ui.setDesktop(window.innerWidth >= 1024)

  if (window.innerWidth >= 1024) {
    ui.mobileNavOpen = false
  }
}

onMounted(() => {
  ui.setDesktop(window.innerWidth >= 1024)
  window.addEventListener("resize", onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize)
})
</script>

<template>
  <div class="customer-shell">
    <CustomerHeader
      v-if="auth.isAuthenticated"
      :mobile-open="ui.mobileNavOpen"
      @toggle-mobile-nav="ui.toggleMobileNav"
      @close-mobile="ui.mobileNavOpen = false"
    />

    <main class="customer-content" :class="{ 'customer-content--guest': !auth.isAuthenticated }">
      <router-view :key="route.fullPath" />
    </main>
  </div>
</template>

<style scoped>
.customer-shell {
  --customer-primary: #ec691a;
  --customer-primary-hover: #d85d14;
  --customer-primary-soft: #fff7ed;
  --customer-primary-border: #fdba74;
  --customer-page-bg: #d3d3d3;
  --customer-surface: #f8f8f8;
  --customer-section-head: #ececec;
  --customer-panel-body: #dedede;
  --customer-panel-soft: #eeeeee;
  --customer-control-bg: #ffffff;
  --customer-card-bg: var(--customer-surface);
  --customer-border: #b6b6b6;
  --customer-control-border: #bdbdbd;
  --customer-text: #1a1a18;
  --customer-muted: #737373;
  --customer-content-max: 1400px;
  --customer-side-padding: clamp(20px, 2.4vw, 32px);
  --primary: var(--customer-primary);
  --bg-page: var(--customer-page-bg);
  --bg-card: var(--customer-surface);
  --border: var(--customer-border);
  --text: var(--customer-text);

  min-height: 100vh;
  background: var(--customer-page-bg);
  color: var(--customer-text);
  display: flex;
  flex-direction: column;
}

.customer-content {
  width: 100%;
  max-width: calc(var(--customer-content-max) + (var(--customer-side-padding) * 2));
  margin: 0 auto;
  padding: 28px var(--customer-side-padding);
  flex: 1;
  box-sizing: border-box;
}

.customer-content--guest {
  max-width: none;
  min-height: 100vh;
  padding: 0;
}
</style>
