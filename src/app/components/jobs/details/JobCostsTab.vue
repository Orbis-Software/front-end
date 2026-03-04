<script setup lang="ts">
import { computed, reactive } from "vue"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

type CurrencyCode = "GBP" | "USD" | "EUR"

type CostLine = {
  id: string
  description: string
  supplier_id: number | null
  currency: CurrencyCode
  cost: string // ✅ string for PrimeVue InputText v-model
  charge: string // ✅ string for PrimeVue InputText v-model
  comment: string
}

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: "addLine", section: "manual" | "domestic" | "import_export"): void
  (e: "removeLine", section: "manual" | "domestic" | "import_export", id: string): void
  (e: "print"): void
  (e: "exportExcel"): void
  (e: "emailCustomer"): void
}>()

// sample suppliers (replace later)
const supplierOptions = [
  { label: "Select Supplier", value: null },
  { label: "ABC Logistics", value: 1 },
  { label: "Continental Shipping", value: 2 },
  { label: "XYZ Transport", value: 3 },
  { label: "Global Freight", value: 4 },
]

const currencyOptions = [
  { label: "GBP", value: "GBP" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
]

const state = reactive({
  manual: [
    {
      id: "m1",
      description: "",
      supplier_id: null,
      currency: "GBP" as CurrencyCode,
      cost: "0.00",
      charge: "0.00",
      comment: "",
    },
  ] as CostLine[],

  domestic: [
    {
      id: "d1",
      description: "Collection Order - ABC Logistics",
      supplier_id: 1,
      currency: "GBP",
      cost: "150.00",
      charge: "150.00",
      comment: "COL-2026-0001 - Domestic Collection",
    },
    {
      id: "d2",
      description: "Transport Order - Continental Shipping",
      supplier_id: 2,
      currency: "GBP",
      cost: "185.25",
      charge: "185.25",
      comment: "TR-2026-0002 - Domestic Transport",
    },
  ] as CostLine[],

  import_export: [
    {
      id: "ie1",
      description: "Export Collection - XYZ Transport",
      supplier_id: 3,
      currency: "GBP",
      cost: "275.50",
      charge: "275.50",
      comment: "COL-2026-0002 - Export Collection",
    },
    {
      id: "ie2",
      description: "Import Transport - Global Freight",
      supplier_id: 4,
      currency: "GBP",
      cost: "420.75",
      charge: "420.75",
      comment: "TR-2026-0001 - Import Transport",
    },
  ] as CostLine[],
})

function fmtMoney(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2)
}

function toNumber(v: any): number {
  const n = Number(String(v ?? "").replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : 0
}

function sumCost(lines: CostLine[]) {
  return lines.reduce((a, x) => a + toNumber(x.cost), 0)
}
function sumCharge(lines: CostLine[]) {
  return lines.reduce((a, x) => a + toNumber(x.charge), 0)
}

const manualCostTotal = computed(() => sumCost(state.manual))
const manualChargeTotal = computed(() => sumCharge(state.manual))

const domesticCostTotal = computed(() => sumCost(state.domestic))
const domesticChargeTotal = computed(() => sumCharge(state.domestic))

const ieCostTotal = computed(() => sumCost(state.import_export))
const ieChargeTotal = computed(() => sumCharge(state.import_export))

const grandTotal = computed(
  () => domesticChargeTotal.value + ieChargeTotal.value + manualChargeTotal.value
)

function addLine(section: "manual" | "domestic" | "import_export") {
  emit("addLine", section)

  const id = `${section}-${Date.now()}`
  const line: CostLine = {
    id,
    description: "",
    supplier_id: null,
    currency: "GBP",
    cost: "0.00",
    charge: "0.00",
    comment: "",
  }

  state[section].push(line)
}

function removeLine(section: "manual" | "domestic" | "import_export", id: string) {
  emit("removeLine", section, id)
  state[section] = state[section].filter((x) => x.id !== id) as any
}
</script>

<template>
  <div class="job-costs">
    <div class="costs-card">
      <div class="costs-title">Costs &amp; Charges</div>

      <!-- SECTION: MANUAL -->
      <div class="cc-section">
        <div class="cc-head">
          <div class="cc-head__title">ADD A CHARGE</div>

          <Button
            class="cc-add-btn"
            type="button"
            icon="pi pi-plus"
            label="Add Charge Line"
            :disabled="disabled"
            @click="addLine('manual')"
          />
        </div>

        <div class="cc-table">
          <div class="cc-row cc-row--head">
            <div>Charge Description</div>
            <div>Supplier</div>
            <div>Currency</div>
            <div class="right">Cost</div>
            <div class="right">Charge</div>
            <div>Comment</div>
            <div class="right"></div>
          </div>

          <div v-for="l in state.manual" :key="l.id" class="cc-row">
            <div>
              <InputText v-model="l.description" class="cc-input" :disabled="disabled" />
            </div>

            <div>
              <Dropdown
                v-model="l.supplier_id"
                :options="supplierOptions"
                optionLabel="label"
                optionValue="value"
                class="cc-dd"
                :disabled="disabled"
              />
            </div>

            <div>
              <Dropdown
                v-model="l.currency"
                :options="currencyOptions"
                optionLabel="label"
                optionValue="value"
                class="cc-dd cc-dd--tiny"
                :disabled="disabled"
              />
            </div>

            <div class="right">
              <InputText v-model="l.cost" class="cc-input cc-input--num" :disabled="disabled" />
            </div>

            <div class="right">
              <InputText v-model="l.charge" class="cc-input cc-input--num" :disabled="disabled" />
            </div>

            <div>
              <InputText v-model="l.comment" class="cc-input" :disabled="disabled" />
            </div>

            <div class="right">
              <button
                class="cc-trash"
                type="button"
                :disabled="disabled"
                title="Remove"
                @click="removeLine('manual', l.id)"
              >
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>

          <div class="cc-row cc-row--total">
            <div class="muted">TOTAL</div>
            <div></div>
            <div></div>
            <div class="right"><b>{{ fmtMoney(manualCostTotal) }}</b></div>
            <div class="right"><b>{{ fmtMoney(manualChargeTotal) }}</b></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      <!-- SECTION: DOMESTIC -->
      <div class="cc-section">
        <div class="cc-head">
          <div class="cc-head__title">DOMESTIC Costs &amp; Charges</div>

          <Button
            class="cc-add-btn"
            type="button"
            icon="pi pi-plus"
            label="Add Charge Line"
            :disabled="disabled"
            @click="addLine('domestic')"
          />
        </div>

        <div class="cc-table">
          <div class="cc-row cc-row--head">
            <div>Charge Description</div>
            <div>Supplier</div>
            <div>Currency</div>
            <div class="right">Cost</div>
            <div class="right">Charge</div>
            <div>Comment</div>
            <div class="right"></div>
          </div>

          <div v-for="l in state.domestic" :key="l.id" class="cc-row">
            <div>
              <InputText v-model="l.description" class="cc-input" :disabled="disabled" />
            </div>

            <div>
              <Dropdown
                v-model="l.supplier_id"
                :options="supplierOptions"
                optionLabel="label"
                optionValue="value"
                class="cc-dd"
                :disabled="disabled"
              />
            </div>

            <div>
              <Dropdown
                v-model="l.currency"
                :options="currencyOptions"
                optionLabel="label"
                optionValue="value"
                class="cc-dd cc-dd--tiny"
                :disabled="disabled"
              />
            </div>

            <div class="right">
              <InputText v-model="l.cost" class="cc-input cc-input--num" :disabled="disabled" />
            </div>

            <div class="right">
              <InputText v-model="l.charge" class="cc-input cc-input--num" :disabled="disabled" />
            </div>

            <div>
              <InputText v-model="l.comment" class="cc-input" :disabled="disabled" />
            </div>

            <div class="right">
              <button
                class="cc-trash"
                type="button"
                :disabled="disabled"
                title="Remove"
                @click="removeLine('domestic', l.id)"
              >
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>

          <div class="cc-row cc-row--total">
            <div class="muted">TOTAL</div>
            <div></div>
            <div></div>
            <div class="right"><b>{{ fmtMoney(domesticCostTotal) }}</b></div>
            <div class="right"><b>{{ fmtMoney(domesticChargeTotal) }}</b></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      <!-- SECTION: IMPORT/EXPORT -->
      <div class="cc-section">
        <div class="cc-head">
          <div class="cc-head__title">IMPORT/EXPORT Costs &amp; Charges</div>

          <Button
            class="cc-add-btn"
            type="button"
            icon="pi pi-plus"
            label="Add Charge Line"
            :disabled="disabled"
            @click="addLine('import_export')"
          />
        </div>

        <div class="cc-table">
          <div class="cc-row cc-row--head">
            <div>Charge Description</div>
            <div>Supplier</div>
            <div>Currency</div>
            <div class="right">Cost</div>
            <div class="right">Charge</div>
            <div>Comment</div>
            <div class="right"></div>
          </div>

          <div v-for="l in state.import_export" :key="l.id" class="cc-row">
            <div>
              <InputText v-model="l.description" class="cc-input" :disabled="disabled" />
            </div>

            <div>
              <Dropdown
                v-model="l.supplier_id"
                :options="supplierOptions"
                optionLabel="label"
                optionValue="value"
                class="cc-dd"
                :disabled="disabled"
              />
            </div>

            <div>
              <Dropdown
                v-model="l.currency"
                :options="currencyOptions"
                optionLabel="label"
                optionValue="value"
                class="cc-dd cc-dd--tiny"
                :disabled="disabled"
              />
            </div>

            <div class="right">
              <InputText v-model="l.cost" class="cc-input cc-input--num" :disabled="disabled" />
            </div>

            <div class="right">
              <InputText v-model="l.charge" class="cc-input cc-input--num" :disabled="disabled" />
            </div>

            <div>
              <InputText v-model="l.comment" class="cc-input" :disabled="disabled" />
            </div>

            <div class="right">
              <button
                class="cc-trash"
                type="button"
                :disabled="disabled"
                title="Remove"
                @click="removeLine('import_export', l.id)"
              >
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>

          <div class="cc-row cc-row--total">
            <div class="muted">TOTAL</div>
            <div></div>
            <div></div>
            <div class="right"><b>{{ fmtMoney(ieCostTotal) }}</b></div>
            <div class="right"><b>{{ fmtMoney(ieChargeTotal) }}</b></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      <!-- GRAND TOTALS -->
      <div class="grand">
        <div class="grand-title">GRAND TOTALS</div>

        <div class="grand-grid">
          <div class="grand-item">
            <div class="grand-label">Domestic Total</div>
            <div class="grand-value">£{{ fmtMoney(domesticChargeTotal) }}</div>
          </div>

          <div class="grand-item">
            <div class="grand-label">Import/Export Total</div>
            <div class="grand-value">£{{ fmtMoney(ieChargeTotal) }}</div>
          </div>

          <div class="grand-item">
            <div class="grand-label">Manual Charges Total</div>
            <div class="grand-value">£{{ fmtMoney(manualChargeTotal) }}</div>
          </div>

          <div class="grand-item grand-item--big">
            <div class="grand-label">GRAND TOTAL</div>
            <div class="grand-value grand-value--big">£{{ fmtMoney(grandTotal) }}</div>
          </div>
        </div>

        <div class="grand-actions">
          <Button
            class="grand-btn grand-btn--primary"
            type="button"
            icon="pi pi-print"
            label="Print Cost Sheet"
            :disabled="disabled"
            @click="emit('print')"
          />
          <Button
            class="grand-btn"
            type="button"
            icon="pi pi-file-excel"
            label="Export to Excel"
            :disabled="disabled"
            @click="emit('exportExcel')"
          />
          <Button
            class="grand-btn"
            type="button"
            icon="pi pi-envelope"
            label="Email to Customer"
            :disabled="disabled"
            @click="emit('emailCustomer')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./JobCostsTab.css";
</style>