<script setup lang="ts">
type Props = {
  form: {
    mode_of_transport: string | null;

    collection_address: string;
    delivery_address: string;

    collection_date: string | null; // use YYYY-MM-DD or empty
    delivery_date: string | null;

    cmr_number: string;
    warehouse_grn: string;
  };
  disabled?: boolean;
};

const props = defineProps<Props>();

function modeLabel() {
  return (props.form.mode_of_transport || "road").toString().toUpperCase();
}
</script>

<template>
  <div class="route-card">
    <div class="route-card__header">
      <div class="route-card__title">Route &amp; Schedule ({{ modeLabel() }})</div>
    </div>

    <div class="route-card__body">
      <div class="grid-2">
        <div class="field">
          <div class="label">Collection Address</div>
          <input
            class="input"
            v-model="form.collection_address"
            :disabled="disabled"
            placeholder="Enter location"
          />
        </div>

        <div class="field">
          <div class="label">Delivery Address</div>
          <input
            class="input"
            v-model="form.delivery_address"
            :disabled="disabled"
            placeholder="Enter location"
          />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <div class="label">Collection Date</div>
          <input
            class="input"
            type="text"
            v-model="form.collection_date"
            :disabled="disabled"
            placeholder="dd/mm/yyyy"
          />
        </div>

        <div class="field">
          <div class="label">Delivery Date</div>
          <input
            class="input"
            type="text"
            v-model="form.delivery_date"
            :disabled="disabled"
            placeholder="dd/mm/yyyy"
          />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <div class="label">CMR Number</div>
          <input
            class="input"
            v-model="form.cmr_number"
            :disabled="disabled"
            placeholder="Enter reference"
          />
        </div>

        <div class="field">
          <div class="label">Warehouse GRN</div>
          <input
            class="input"
            v-model="form.warehouse_grn"
            :disabled="disabled"
            placeholder="GRN-000000"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* matches the big white card in the screenshot */
.route-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e6e6e6;
  overflow: hidden;
}

.route-card__header {
  padding: 18px 22px;
  border-bottom: 1px solid #e6e6e6;
}

.route-card__title {
  font-weight: 700;
  color: #222;
}

.route-card__body {
  padding: 22px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 26px;
  margin-bottom: 22px;
}

.field {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 13px;
  font-weight: 700;
  color: #222;
  margin-bottom: 10px;
}

/* input style like screenshot */
.input {
  height: 44px;
  border-radius: 10px;
  border: 1px solid #d7d7d7;
  padding: 0 14px;
  background: #fff;
  outline: none;
}

.input::placeholder {
  color: #9a9a9a;
}

.input:focus {
  border-color: #c9c9c9;
}

/* responsive */
@media (max-width: 1100px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
