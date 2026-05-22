<script setup lang="ts">
export type MainTab = "overview" | "branches" | "collections" | "weight_break" | "customer"

defineProps<{
  active: MainTab
  counts?: Partial<Record<MainTab, number>>
}>()

const emit = defineEmits<{
  (e: "change", tab: MainTab): void
}>()
</script>

<template>
  <nav class="contact-details-tabs" aria-label="Contact details sections">
    <button
      type="button"
      class="contact-details-tabs__tab"
      :class="{ 'contact-details-tabs__tab--active': active === 'overview' }"
      @click="emit('change', 'overview')"
    >
      <span>Overview</span>
    </button>

    <button
      type="button"
      class="contact-details-tabs__tab"
      :class="{ 'contact-details-tabs__tab--active': active === 'branches' }"
      @click="emit('change', 'branches')"
    >
      <span>Branches</span>
      <span v-if="counts?.branches !== undefined" class="contact-details-tabs__count">
        {{ counts.branches }}
      </span>
    </button>

    <button
      type="button"
      class="contact-details-tabs__tab"
      :class="{ 'contact-details-tabs__tab--active': active === 'collections' }"
      @click="emit('change', 'collections')"
    >
      <span>Addresses</span>
      <span v-if="counts?.collections !== undefined" class="contact-details-tabs__count">
        {{ counts.collections }}
      </span>
    </button>

    <button
      type="button"
      class="contact-details-tabs__tab"
      :class="{ 'contact-details-tabs__tab--active': active === 'weight_break' }"
      @click="emit('change', 'weight_break')"
    >
      <span>Weight Charges</span>
    </button>

    <button
      type="button"
      class="contact-details-tabs__tab"
      :class="{ 'contact-details-tabs__tab--active': active === 'customer' }"
      @click="emit('change', 'customer')"
    >
      <span>Customer Charges</span>
    </button>
  </nav>
</template>
