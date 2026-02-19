<script setup lang="ts">
export type JobDetailsTabKey =
  | "overview"
  | "transport"
  | "milestones"
  | "docs"
  | "costs"
  | "invoices"
  | "packages"
  | "customs"
  | "notes";

export type JobDetailsTabItem = {
  key: JobDetailsTabKey;
  label: string;
};

const props = defineProps<{
  modelValue: JobDetailsTabKey;
  tabs: JobDetailsTabItem[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: JobDetailsTabKey): void;
}>();

function selectTab(key: JobDetailsTabKey) {
  if (props.disabled) return;
  emit("update:modelValue", key);
}
</script>

<template>
  <div class="job-details-tabs">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="job-details-tab"
      :class="{ active: modelValue === t.key }"
      :disabled="disabled"
      @click="selectTab(t.key)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<style scoped>
.job-details-tabs {
  display: flex;
  gap: 12px;
  padding: 14px 0 10px 0;
  overflow-x: auto;
}

.job-details-tab {
  appearance: none;
  border: 0;
  background: #f2f2f2;
  color: #111;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.15s ease;
}

.job-details-tab:hover {
  background: #e9e9e9;
}

.job-details-tab.active {
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.job-details-tab:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
