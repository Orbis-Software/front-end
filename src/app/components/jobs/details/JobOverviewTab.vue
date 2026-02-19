<script setup lang="ts">
import type { TransportMode } from "@/app/types/transport-job";

type Props = {
  form: {
    mode_of_transport: TransportMode | null;

    collection_address: string;
    delivery_address: string;

    // ✅ match page form (Date | null)
    collection_date: Date | null;
    delivery_date: Date | null;

    cmr_number: string;
    warehouse_grn: string;
  };
  disabled?: boolean;
};

const { form, disabled } = defineProps<Props>();

function modeLabel() {
  return (form.mode_of_transport || "road").toString().toUpperCase();
}

function formatDDMMYYYY(d: Date | null) {
  if (!d) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  const yr = d.getFullYear();
  return `${day}/${mon}/${yr}`;
}

// Optional: allow typing dd/mm/yyyy into a text box and convert to Date
function parseDDMMYYYY(value: string): Date | null {
  const v = value.trim();
  if (!v) return null;

  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;

  // validate that date didn't overflow (e.g. 32/01/2026)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;

  return d;
}

function onCollectionDateInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  form.collection_date = parseDDMMYYYY(v);
}

function onDeliveryDateInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  form.delivery_date = parseDDMMYYYY(v);
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
          <!-- Use text input to match your UI screenshot, but bind to Date | null -->
          <input
            class="input"
            type="text"
            :disabled="disabled"
            :value="formatDDMMYYYY(form.collection_date)"
            placeholder="dd/mm/yyyy"
            @input="onCollectionDateInput"
          />
        </div>

        <div class="field">
          <div class="label">Delivery Date</div>
          <input
            class="input"
            type="text"
            :disabled="disabled"
            :value="formatDDMMYYYY(form.delivery_date)"
            placeholder="dd/mm/yyyy"
            @input="onDeliveryDateInput"
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

@media (max-width: 1100px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
