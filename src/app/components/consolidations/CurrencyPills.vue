<template>
  <div class="pills">
    <button
      v-for="ccy in options"
      :key="ccy"
      type="button"
      class="pill"
      :class="{ active: modelValue === ccy }"
      @click="$emit('update:modelValue', ccy)"
    >
      {{ ccy }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true }, // ['GBP','USD','EUR']
})
defineEmits(['update:modelValue'])
</script>
