<script setup lang="ts">
defineProps<{ active: "branches" | "collections" }>()

const emit = defineEmits<{
  (e: "change", tab: "branches" | "collections"): void
}>()
</script>

<template>
  <div class="tabs">
    <button
      class="tab"
      :class="{ 'tab--active': active === 'branches' }"
      type="button"
      @click="emit('change', 'branches')"
    >
      Branches & billing
    </button>

    <button
      class="tab"
      :class="{ 'tab--active': active === 'collections' }"
      type="button"
      @click="emit('change', 'collections')"
    >
      Collection addresses
    </button>
  </div>
</template>