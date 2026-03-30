<template>
  <div class="step-head">
    <div class="step-left">
      <span v-if="badge" class="badge">{{ badge }}</span>
      <div class="title">{{ title }}</div>
      <div v-if="subtitle" class="sub">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  badge?: string
}>()
</script>

<style scoped>
.step-head {
  display: block;
  width: 100%;
  margin-bottom: 12px;
}

.step-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #e5e5e5;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 6px;
}

.title {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.sub {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  line-height: 1.4;
}
</style>
