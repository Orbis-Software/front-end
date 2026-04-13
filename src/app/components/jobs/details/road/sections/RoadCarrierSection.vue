<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title">Carrier &amp; Driver Information</div>
    </div>

    <div class="road-card__body">
      <div class="road-grid road-grid--4">
        <div class="road-field">
          <label class="road-label">Carrier / Haulier Name</label>
          <input
            v-model="form.carrier_name"
            class="road-input"
            :disabled="disabled"
            placeholder="Carrier name"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Driver Name</label>
          <input
            v-model="form.carrier_driver_name"
            class="road-input"
            :disabled="disabled"
            placeholder="Driver full name"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Driver Mobile</label>
          <input
            v-model="form.carrier_driver_mobile"
            class="road-input"
            :disabled="disabled"
            placeholder="+44 …"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Vehicle Registration</label>
          <input
            v-model="form.vehicle_registration"
            class="road-input"
            :disabled="disabled"
            placeholder="AB12 CDE"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Trailer / Container No.</label>
          <input
            v-model="form.trailer_container_no"
            class="road-input"
            :disabled="disabled"
            placeholder="Trailer number"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Seal Number</label>
          <input
            v-model="form.seal_number"
            class="road-input"
            :disabled="disabled"
            placeholder="Seal no."
          />
        </div>

        <div class="road-field">
          <label class="road-label">CMR / Waybill No.</label>
          <input
            v-model="form.cmr_waybill_no"
            class="road-input"
            :disabled="disabled"
            placeholder="CMR reference"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Route / Via</label>
          <input
            v-model="form.route_via"
            class="road-input"
            :disabled="disabled"
            placeholder="e.g. UK → BE → DE"
          />
        </div>
      </div>
    </div>
  </div>
</template>
