<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title">Order Type</div>
      <div class="road-placeholder-text">
        Select the type of order to reveal the relevant fields below
      </div>
    </div>

    <div class="road-card__body">
      <div class="road-segmented">
        <button
          type="button"
          class="road-segmented__btn"
          :class="{
            'road-segmented__btn--active': form.order_type === 'local_collection',
          }"
          :disabled="disabled"
          @click="form.order_type = 'local_collection'"
        >
          Local Collection
        </button>

        <button
          type="button"
          class="road-segmented__btn"
          :class="{
            'road-segmented__btn--active': form.order_type === 'full_transport_order',
          }"
          :disabled="disabled"
          @click="form.order_type = 'full_transport_order'"
        >
          Full Transport Order
        </button>
      </div>
    </div>
  </div>
</template>
