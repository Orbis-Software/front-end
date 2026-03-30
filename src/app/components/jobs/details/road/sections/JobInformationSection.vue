<script setup lang="ts">
defineProps<{ form: any }>()
</script>

<template>
  <div class="card">
    <div class="section-title">Job Information</div>

    <div class="grid-5">
      <div class="field">
        <label>Job Number</label>
        <input v-model="form.job_number" />
      </div>

      <div class="field">
        <label>AWB / Consignment No.</label>
        <input v-model="form.awb_no" />
      </div>

      <div class="field">
        <label>Customer Reference</label>
        <input v-model="form.customer_reference" />
      </div>

      <div class="field">
        <label>Our Reference</label>
        <input v-model="form.our_reference" />
      </div>

      <div class="field">
        <label>Status</label>
        <select v-model="form.status">
          <option>Draft</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
    </div>

    <div class="grid-5">
      <div class="field">
        <label>Service Type</label>
        <select v-model="form.service_type">
          <option>FTL – Full Truck Load</option>
        </select>
      </div>

      <div class="field">
        <label>Vehicle / Trailer Type</label>
        <select v-model="form.vehicle_trailer_type">
          <option>Standard Trailer (13.6m)</option>
        </select>
      </div>

      <div class="field">
        <label>Incoterms</label>
        <select v-model="form.incoterms">
          <option value="">— Select —</option>
        </select>
      </div>

      <div class="field">
        <label>Currency</label>
        <select v-model="form.currency">
          <option>GBP – £</option>
        </select>
      </div>

      <div class="field">
        <label>Declared Value</label>
        <input v-model="form.declared_value" />
      </div>
    </div>

    <div class="grid-3">
      <div class="field span-2">
        <label>Description of Goods</label>
        <input v-model="form.description_of_goods" />
      </div>

      <div class="field">
        <label>Commodity Code (HS)</label>
        <input v-model="form.commodity_code" />
      </div>

      <div class="field">
        <label>ADR / Hazmat Class</label>
        <input v-model="form.hazmat_class" />
      </div>

      <div class="field">
        <label>UN Number</label>
        <input v-model="form.un_number" />
      </div>
    </div>

    <div class="field">
      <label>Special Instructions / Notes</label>
      <textarea v-model="form.special_instructions"></textarea>
    </div>
  </div>
</template>
