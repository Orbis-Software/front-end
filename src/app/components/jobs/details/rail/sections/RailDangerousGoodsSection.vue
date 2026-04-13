<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Dangerous Goods</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--4">
        <div class="rail-field">
          <label>Hazardous Goods</label>
          <select :disabled="disabled">
            <option value="no">No</option>
            <option value="yes">Yes – Contains DG</option>
          </select>
        </div>

        <div class="rail-field">
          <label>UN Number</label>
          <input
            v-model="form.un_number"
            type="text"
            :disabled="disabled"
            placeholder="e.g. UN1234"
          />
        </div>

        <div class="rail-field">
          <label>DG Class</label>
          <input
            v-model="form.hazmat_class"
            type="text"
            :disabled="disabled"
            placeholder="e.g. 3, 6.1"
          />
        </div>

        <div class="rail-field">
          <label>Packing Group</label>
          <select :disabled="disabled">
            <option value="">Select…</option>
            <option>I – Great danger</option>
            <option>II – Medium danger</option>
            <option>III – Minor danger</option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>
