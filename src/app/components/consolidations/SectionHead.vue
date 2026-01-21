<template>
  <div class="section-head">
    <div>
      <div class="h2" style="font-weight: 800;">{{ title }}</div>
      <div v-if="subtitle" class="muted">{{ subtitle }}</div>
    </div>

    <div class="panel-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
