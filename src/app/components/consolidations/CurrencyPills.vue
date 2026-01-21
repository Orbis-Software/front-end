<template>
  <div class="pills">
    <button
      v-for="ccy in options"
      :key="ccy"
      type="button"
      class="pill"
      :class="{ active: modelValue === ccy }"
      @click="emit('update:modelValue', ccy)"
    >
      {{ ccy }}
    </button>
  </div>
</template>

<script setup lang="ts">
type Currency = "GBP" | "USD" | "EUR";

const props = defineProps<{
  modelValue: Currency;
  options: readonly Currency[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Currency): void;
}>();

// NOTE: `props` is referenced in template implicitly by <script setup>
// but we don't need to use it directly here.
</script>
