<script setup lang="ts">
const props = defineProps<{
  form: {
    mode_of_transport: string | null;

    collection_address: string;
    delivery_address: string;

    collection_date: Date | null;
    delivery_date: Date | null;

    cmr_number: string;
    warehouse_grn: string;
  };
  disabled?: boolean;
}>();
</script>

<template>
  <div class="section-card">
    <div class="section-title">
      Route &amp; Schedule ({{ (form.mode_of_transport || "ROAD").toString().toUpperCase() }})
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="label">Collection Address</label>
        <input
          class="input"
          :disabled="disabled"
          v-model="form.collection_address"
          placeholder="Enter location"
        />
      </div>

      <div class="field">
        <label class="label">Delivery Address</label>
        <input
          class="input"
          :disabled="disabled"
          v-model="form.delivery_address"
          placeholder="Enter location"
        />
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="label">Collection Date</label>
        <input class="input" type="date" :disabled="disabled" />
        <!-- NOTE: Keeping this simple because native date input binds string.
             If you want PrimeVue Calendar here, tell me and I’ll switch it. -->
      </div>

      <div class="field">
        <label class="label">Delivery Date</label>
        <input class="input" type="date" :disabled="disabled" />
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="label">CMR Number</label>
        <input
          class="input"
          :disabled="disabled"
          v-model="form.cmr_number"
          placeholder="Enter reference"
        />
      </div>

      <div class="field">
        <label class="label">Warehouse GRN</label>
        <input
          class="input"
          :disabled="disabled"
          v-model="form.warehouse_grn"
          placeholder="GRN-000000"
        />
      </div>
    </div>

    <div class="hint">
      Note: transport fields are currently UI-only unless your backend model supports them.
    </div>
  </div>
</template>

<style scoped>
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
}

.section-title {
  font-weight: 700;
  margin-bottom: 14px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 18px;
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #6b6b6b;
  margin-bottom: 6px;
  font-weight: 600;
}

.input {
  height: 42px;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  padding: 0 12px;
  outline: none;
  background: #fff;
}

.input:focus {
  border-color: #bdbdbd;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
}
</style>
