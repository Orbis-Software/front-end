<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Customs & Trade</h3>
    </div>

    <div class="rail-card__body">
      <div class="rail-grid rail-grid--4">
        <div class="rail-field">
          <label>HS Code</label>
          <input
            v-model="form.commodity_code"
            type="text"
            :disabled="disabled"
            placeholder="e.g. 8471.30.00"
          />
        </div>

        <div class="rail-field">
          <label>Country of Origin</label>
          <select :disabled="disabled">
            <option value="">Select…</option>
            <option>China (CN)</option>
            <option>Germany (DE)</option>
            <option>Russia (RU)</option>
            <option>Poland (PL)</option>
            <option>Kazakhstan (KZ)</option>
            <option>Ukraine (UA)</option>
            <option>United Kingdom (GB)</option>
            <option>France (FR)</option>
            <option>Netherlands (NL)</option>
            <option>Other…</option>
          </select>
        </div>

        <div class="rail-field">
          <label>MRN / Customs Declaration No.</label>
          <input type="text" :disabled="disabled" placeholder="MRN reference" />
        </div>

        <div class="rail-field">
          <label>Incoterms</label>
          <select v-model="form.incoterms" :disabled="disabled">
            <option value="">Select…</option>
            <option>EXW – Ex Works</option>
            <option>FCA – Free Carrier</option>
            <option>CPT – Carriage Paid To</option>
            <option>CIP – Carriage & Insurance Paid</option>
            <option>DAP – Delivered at Place</option>
            <option>DPU – Delivered at Place Unloaded</option>
            <option>DDP – Delivered Duty Paid</option>
            <option>FOB – Free on Board</option>
            <option>CFR – Cost and Freight</option>
            <option>CIF – Cost, Insurance & Freight</option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>
