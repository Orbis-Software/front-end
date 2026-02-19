<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div class="section-card">
    <div class="section-title">{{ title }}</div>
    <div class="muted">This section is not implemented yet.</div>
  </div>
</template>

<style scoped>
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
}

.section-title {
  font-weight: 700;
  margin-bottom: 14px;
}

.muted {
  color: #777;
}
</style>
