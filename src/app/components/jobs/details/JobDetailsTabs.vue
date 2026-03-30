<script setup lang="ts">
import "./JobDetailsTabs.css"

defineProps<{
  modelValue: string
  tabs: { key: string; label: string; icon?: string; badge?: number }[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

function selectTab(key: string) {
  emit("update:modelValue", key)
}
</script>

<template>
  <div class="job-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="job-tab"
      :class="{ active: tab.key === modelValue }"
      :disabled="disabled"
      @click="selectTab(tab.key)"
    >
      <i v-if="tab.icon" :class="tab.icon"></i>
      <span class="job-tab-label">{{ tab.label }}</span>

      <span v-if="tab.badge !== undefined" class="job-tab-badge">
        {{ tab.badge }}
      </span>
    </button>
  </div>
</template>
