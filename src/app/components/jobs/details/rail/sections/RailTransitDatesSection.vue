<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Transit Dates</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--4">
        <div class="rail-field">
          <label>ETD</label>
          <input type="datetime-local" :disabled="disabled" />
        </div>

        <div class="rail-field">
          <label>ETA</label>
          <input type="datetime-local" :disabled="disabled" />
        </div>

        <div class="rail-field">
          <label>ATD (Actual Departure)</label>
          <input type="datetime-local" :disabled="disabled" />
        </div>

        <div class="rail-field">
          <label>ATA (Actual Arrival)</label>
          <input type="datetime-local" :disabled="disabled" />
        </div>
      </div>
    </div>
  </section>
</template>
