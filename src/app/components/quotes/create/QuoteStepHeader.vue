<template>
  <div class="step-head" :class="{ compact }">
    <div class="step-left">
      <span v-if="badge" class="badge">{{ badge }}</span>
      <div class="title">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  badge?: string
  compact?: boolean
}>()
</script>

<style scoped>
.step-head {
  display: block;
  width: 100%;
  margin-bottom: 8px;
}

.step-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
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
}

.title {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.step-head.compact {
  margin-bottom: 6px;
}

.step-head.compact .step-left {
  gap: 6px;
}

.step-head.compact .badge {
  height: 20px;
  padding: 0 8px;
  font-size: 10px;
}

.step-head.compact .title {
  font-size: 13px;
}
</style>
