<template>
  <section class="card section charges-card">
    <!-- Header -->
    <div class="charges-head">
      <div class="section-title">Charges</div>

      <Button class="btn" outlined type="button" @click="$emit('clear')">
        <i class="pi pi-trash" style="margin-right: 8px" />
        Clear
      </Button>
    </div>

    <!-- Controls row -->
    <div class="charges-controls">
      <div class="field">
        <label class="label">Currency</label>
        <Dropdown
          v-model="local.currency"
          :options="currencyOptions"
          optionLabel="label"
          optionValue="value"
          class="control"
        />
      </div>

      <div class="field">
        <label class="label">Default Tax %</label>
        <InputText v-model="local.defaultTax" class="control" />
      </div>

      <div class="field">
        <label class="label">Discount %</label>
        <InputText v-model="local.discount" class="control" />
      </div>

      <div class="field">
        <label class="label">Add charge line</label>
        <Dropdown
          v-model="local.addCharge"
          :options="chargeOptions"
          optionLabel="label"
          optionValue="value"
          class="control"
        />
      </div>

      <div class="charges-add">
        <Button class="btn" outlined type="button" @click="onAddLine">
          <i class="pi pi-plus" style="margin-right: 8px" />
          Add line
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="charges-table">
      <div class="charges-table-head">
        <div>Description</div>
        <div class="center">Qty</div>
        <div class="center">Unit</div>
        <div class="right">Cost</div>
        <div class="right">Markup %</div>
        <div class="right">Sell</div>
        <div class="right">Line Total</div>
      </div>

      <div class="charges-table-body">
        <template v-if="lines.length">
          <div v-for="(l, idx) in lines" :key="idx" class="charges-row">
            <div>{{ l.description }}</div>
            <div class="center">{{ l.qty }}</div>
            <div class="center">{{ l.unit }}</div>
            <div class="right">{{ money(l.cost) }}</div>
            <div class="right">{{ l.markup }}</div>
            <div class="right">{{ money(l.sell) }}</div>
            <div class="right">{{ money(l.total) }}</div>
          </div>
        </template>

        <div v-else class="charges-empty">No charge lines yet.</div>
      </div>
    </div>

    <!-- Bottom split -->
    <div class="charges-bottom">
      <!-- Conditions -->
      <div class="field">
        <label class="label">Conditions</label>
        <Textarea v-model="local.conditions" class="control textarea charges-conditions" />
      </div>

      <!-- Totals -->
      <div class="charges-totals">
        <div class="totals-row">
          <span>Subtotal (Sell)</span>
          <span>{{ currencySymbol }} {{ money(totals.subtotalSell) }}</span>
        </div>
        <div class="totals-row">
          <span>Subtotal (Cost)</span>
          <span>{{ currencySymbol }} {{ money(totals.subtotalCost) }}</span>
        </div>
        <div class="totals-row">
          <span>Discount</span>
          <span>{{ currencySymbol }} {{ money(totals.discount) }}</span>
        </div>
        <div class="totals-row">
          <span>Tax on Sell</span>
          <span>{{ currencySymbol }} {{ money(totals.taxOnSell) }}</span>
        </div>

        <div class="totals-divider"></div>

        <div class="totals-row strong">
          <span>Total (excl. tax)</span>
          <span>{{ currencySymbol }} {{ money(totals.totalExclTax) }}</span>
        </div>
        <div class="totals-row strong">
          <span>Total (incl. tax)</span>
          <span>{{ currencySymbol }} {{ money(totals.totalInclTax) }}</span>
        </div>
        <div class="totals-row">
          <span>Est Profit</span>
          <span>{{ money(totals.estProfit) }} ({{ totals.estProfitPct.toFixed(2) }}%)</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

export type ChargeLine = {
  description: string;
  qty: number;
  unit: string;
  cost: number;
  markup: number; // %
  sell: number;
  total: number;
};

type ChargesInitial = {
  currency: string;
  defaultTax: string; // keep as string for now
  discount: string; // keep as string for now
  addCharge: string;
  conditions: string;
};

const props = defineProps<{
  lines: ChargeLine[];
  initial: ChargesInitial;
}>();

const emit = defineEmits<{
  (e: "clear"): void;
  (e: "add-line", chargeKey: string): void;
  (e: "update:initial", val: ChargesInitial): void;
}>();

const local = reactive<ChargesInitial>({ ...props.initial });

watch(
  () => props.initial,
  (v) => Object.assign(local, v),
  { deep: true }
);

watch(
  () => local,
  () => emit("update:initial", { ...local }),
  { deep: true }
);

const currencyOptions = [
  { label: "GBP £", value: "GBP" },
  { label: "EUR €", value: "EUR" },
  { label: "USD $", value: "USD" },
];

const chargeOptions = [
  { label: "Freight", value: "freight" },
  { label: "Handling", value: "handling" },
  { label: "Customs", value: "customs" },
  { label: "Insurance", value: "insurance" },
];

const currencySymbol = computed(() => {
  if (local.currency === "EUR") return "€";
  if (local.currency === "USD") return "$";
  return "£";
});

function onAddLine() {
  emit("add-line", local.addCharge);
}

function money(n: number) {
  // simple formatting for now
  return (Number(n) || 0).toFixed(2);
}

/**
 * Dummy totals for now (fillable later)
 * Later: compute from lines + tax + discount properly.
 */
const totals = computed(() => {
  const subtotalSell = props.lines.reduce((s, l) => s + (Number(l.total) || 0), 0);
  const subtotalCost = props.lines.reduce((s, l) => s + (Number(l.cost) || 0) * (Number(l.qty) || 0), 0);

  const discountPct = Number(local.discount || 0) / 100;
  const discount = subtotalSell * discountPct;

  const taxPct = Number(local.defaultTax || 0) / 100;
  const taxOnSell = (subtotalSell - discount) * taxPct;

  const totalExclTax = subtotalSell - discount;
  const totalInclTax = totalExclTax + taxOnSell;

  const estProfit = totalExclTax - subtotalCost;
  const estProfitPct = totalExclTax > 0 ? (estProfit / totalExclTax) * 100 : 0;

  return {
    subtotalSell,
    subtotalCost,
    discount,
    taxOnSell,
    totalExclTax,
    totalInclTax,
    estProfit,
    estProfitPct,
  };
});
</script>

<style scoped>
/* Header (Charges + Clear button) */
.charges-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

/* Controls row */
.charges-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2.4fr auto;
  gap: 14px;
  align-items: end;
  margin-bottom: 14px;
}

.charges-add {
  display: flex;
  justify-content: flex-end;
}

/* Table wrapper */
.charges-table {
  border: 1px solid #ededed;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.charges-table-head {
  display: grid;
  grid-template-columns: 2fr 0.7fr 0.9fr 1fr 1fr 1fr 1.1fr;
  gap: 0;
  padding: 12px 14px;
  font-weight: 800;
  border-bottom: 1px solid #ededed;
  background: #fafafa;
}

.charges-table-body {
  min-height: 120px;
  padding: 12px 14px;
}

.charges-row {
  display: grid;
  grid-template-columns: 2fr 0.7fr 0.9fr 1fr 1fr 1fr 1.1fr;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.charges-row:last-child {
  border-bottom: none;
}

.charges-empty {
  color: #777;
  text-align: center;
  padding: 28px 0;
}

/* Bottom split: Conditions + Totals */
.charges-bottom {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin-top: 14px;
  align-items: start;
}

.charges-conditions {
  min-height: 88px;
}

/* Totals box */
.charges-totals {
  border: 1px solid #ededed;
  border-radius: 12px;
  padding: 14px;
  background: #fafafa;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  padding: 3px 0;
}

.totals-row.strong {
  font-weight: 800;
}

.totals-divider {
  height: 1px;
  background: #e6e6e6;
  margin: 10px 0;
}

.center {
  text-align: center;
}
.right {
  text-align: right;
}
</style>
