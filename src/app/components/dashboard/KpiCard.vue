<template>
  <div class="kpi card">
    <div class="kpi-label">{{ kpi.label }}</div>
    <div class="kpi-value">
      {{ kpi.value }}

      <span
        v-if="kpi.delta"
        class="pill"
        :class="kpi.delta.direction === 'up' ? 'up' : 'down'"
      >
        {{ kpi.delta.direction === 'up' ? '↗' : '↘' }}
        {{ kpi.delta.text }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Kpi = {
  key: string;
  label: string;
  value: string | number;
  delta?: { direction: "up" | "down"; text: string };
};

defineProps<{ kpi: Kpi }>();
</script>
