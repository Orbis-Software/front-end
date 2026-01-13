<template>
  <div class="mx-auto max-w-7xl p-6">
    <p class="mt-2 text-sm text-neutral-500">Coming soon…</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const title = computed(() => (route.meta.title as string) ?? "Page");
</script>
