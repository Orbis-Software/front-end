<script setup lang="ts">
export type MainTab =
  | "branches"
  | "collections"
  | "weight_break"
  | "customer"
  | "demo"

defineProps<{
  active: MainTab
}>()

const emit = defineEmits<{
  (e: "change", tab: MainTab): void
}>()
</script>

<template>
  <div class="tabs">

    <button
      class="tab"
      :class="{ 'tab--active': active === 'branches' }"
      @click="emit('change', 'branches')"
    >
      Branches & Billing
    </button>

    <button
      class="tab"
      :class="{ 'tab--active': active === 'collections' }"
      @click="emit('change', 'collections')"
    >
      Collection Addresses
    </button>

    <button
      class="tab"
      :class="{ 'tab--active': active === 'weight_break' }"
      @click="emit('change', 'weight_break')"
    >
      Weight Break Charges
    </button>

    <button
      class="tab"
      :class="{ 'tab--active': active === 'customer' }"
      @click="emit('change', 'customer')"
    >
      Customer Charges
    </button>

    <button
      class="tab"
      :class="{ 'tab--active': active === 'demo' }"
      @click="emit('change', 'demo')"
    >
      Calculation Demo
    </button>

  </div>
</template>