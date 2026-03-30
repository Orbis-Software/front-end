<script setup lang="ts">
import "./JobDetailsTabs.css"

defineProps<{
  modelValue: string
  tabs: { key: string; label: string; icon?: string; badge?: number }[]
}>()

const emit = defineEmits(["update:modelValue"])

function selectTab(key: string) {
  emit("update:modelValue", key)
}
</script>

<template>
  <div class="job-tabs">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      class="job-tab"
      :class="{ active: tab.key === modelValue }"
      @click="selectTab(tab.key)"
    >
      <i v-if="tab.icon" :class="tab.icon"></i>

      <span>{{ tab.label }}</span>

      <span v-if="tab.badge !== undefined" class="badge">
        {{ tab.badge }}
      </span>
    </div>
  </div>
</template>
