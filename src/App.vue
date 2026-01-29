<template>
  <Toast />

  <!-- Wait for auth hydration -->
  <router-view v-if="ready" />

  <!-- Optional loading state -->
  <div v-else class="app-loading">
    Loading...
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Toast from 'primevue/toast'
import { useAuthStore } from '@/app/stores/auth'

const auth = useAuthStore()
const ready = computed(() => auth.ready)

onMounted(() => {
  auth.hydrate()
})
</script>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 14px;
  color: var(--text-muted);
}
</style>
