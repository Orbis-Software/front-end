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
  --customer-primary-hover: #d85f17;
  --customer-page-bg: #d4d4d4;
  --customer-card-bg: #ffffff;
  --customer-border: #c7c7c7;
  --customer-text: #262626;
  --customer-muted: #737373;
  --customer-content-max: 1400px;
  --customer-side-padding: clamp(20px, 2.4vw, 32px);

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
