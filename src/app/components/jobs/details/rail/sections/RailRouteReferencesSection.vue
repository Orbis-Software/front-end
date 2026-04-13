<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Route & References</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--4">
        <div class="rail-field">
          <label>Route / Line</label>
          <input
            v-model="form.route_via"
            type="text"
            :disabled="disabled"
            placeholder="e.g. New Silk Road"
          />
        </div>

        <div class="rail-field">
          <label>Service Lane</label>
          <input type="text" :disabled="disabled" placeholder="e.g. CN-EU-W01" />
        </div>

        <div class="rail-field">
          <label>Customer Reference</label>
          <input
            v-model="form.customer_reference"
            type="text"
            :disabled="disabled"
            placeholder="Customer PO / Ref"
          />
        </div>

        <div class="rail-field">
          <label>Internal Reference</label>
          <input
            v-model="form.our_reference"
            type="text"
            :disabled="disabled"
            placeholder="Internal job ref"
          />
        </div>
      </div>
    </div>
  </section>
</template>
