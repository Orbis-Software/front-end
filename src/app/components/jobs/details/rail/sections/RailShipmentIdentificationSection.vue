<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Shipment Identification</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--4">
        <div class="rail-field">
          <label>SMGS Number</label>
          <input
            v-model="form.awb_no"
            type="text"
            :disabled="disabled"
            placeholder="e.g. SMGS-2026-001234"
          />
        </div>

        <div class="rail-field">
          <label>CIM / COTIF Number</label>
          <input
            v-model="form.our_reference"
            type="text"
            :disabled="disabled"
            placeholder="e.g. CIM-2026-001234"
          />
        </div>

        <div class="rail-field">
          <label>Wagon Number</label>
          <input
            v-model="form.vehicle_registration"
            type="text"
            :disabled="disabled"
            placeholder="e.g. 27-84-0000-1234"
          />
        </div>

        <div class="rail-field">
          <label>Wagon Type</label>
          <select v-model="form.vehicle_trailer_type" :disabled="disabled">
            <option value="">Select…</option>
            <option>Flatcar (F)</option>
            <option>Gondola (G)</option>
            <option>Boxcar (B)</option>
            <option>Hopper (H)</option>
            <option>Tank (T)</option>
            <option>Refrigerated (R)</option>
            <option>Platform (P)</option>
            <option>Container (C)</option>
            <option>Auto Carrier (A)</option>
          </select>
        </div>

        <div class="rail-field">
          <label>Train Number</label>
          <input
            v-model="form.route_via"
            type="text"
            :disabled="disabled"
            placeholder="e.g. TR-4521"
          />
        </div>

        <div class="rail-field">
          <label>Service Type</label>
          <select v-model="form.service_type" :disabled="disabled">
            <option value="">Select…</option>
            <option>Block Train (BT)</option>
            <option>Single Wagon Load (SWL)</option>
            <option>Combined Transport (CT)</option>
            <option>Intermodal</option>
            <option>Express Rail</option>
          </select>
        </div>

        <div class="rail-field">
          <label>Rail Operator / Carrier</label>
          <input
            v-model="form.carrier_name"
            type="text"
            :disabled="disabled"
            placeholder="e.g. DB Cargo, RZD, SNCF"
          />
        </div>

        <div class="rail-field">
          <label>Carrier SCAC Code</label>
          <input
            v-model="form.cmr_waybill_no"
            type="text"
            :disabled="disabled"
            placeholder="e.g. DBCA"
          />
        </div>
      </div>
    </div>
  </section>
</template>
