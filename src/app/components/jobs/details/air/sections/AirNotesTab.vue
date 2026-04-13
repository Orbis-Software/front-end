<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="air-card">
    <div class="air-card__head">
      <h3 class="air-card__title">Notes & Instructions</h3>
    </div>

    <div class="air-card__body">
      <div class="air-grid air-grid--2">
        <div class="air-field">
          <label>Internal Notes</label>
          <textarea
            class="air-textarea"
            style="min-height: 120px"
            :disabled="disabled"
            placeholder="Internal team notes — not printed on documents..."
          />
        </div>

        <div class="air-field">
          <label>Special Instructions</label>
          <textarea
            class="air-textarea"
            style="min-height: 120px"
            :disabled="disabled"
            placeholder="Handling instructions, special requirements..."
          />
        </div>

        <div class="air-field">
          <label>Customs Remarks</label>
          <textarea
            class="air-textarea"
            :disabled="disabled"
            placeholder="Customs / compliance notes..."
          />
        </div>

        <div class="air-field">
          <label>Delivery Instructions</label>
          <textarea
            class="air-textarea"
            :disabled="disabled"
            placeholder="Specific delivery requirements..."
          />
        </div>
      </div>
    </div>
  </section>
</template>
