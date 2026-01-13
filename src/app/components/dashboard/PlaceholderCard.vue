<template>
  <div class="card bottom-card">
    <div class="card-title">{{ title }}</div>
    <div class="muted">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
</script>
