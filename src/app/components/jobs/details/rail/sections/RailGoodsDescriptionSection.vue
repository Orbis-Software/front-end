<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Goods Description</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--2">
        <div class="rail-field">
          <label>Commodity Description</label>
          <input
            v-model="form.description_of_goods"
            type="text"
            :disabled="disabled"
            placeholder="Full description of goods being shipped"
          />
        </div>

        <div class="rail-field">
          <label>Special Instructions</label>
          <textarea
            v-model="form.special_instructions"
            :disabled="disabled"
            placeholder="Handling requirements, temperature controls, customs notes…"
          />
        </div>
      </div>
    </div>
  </section>
</template>
