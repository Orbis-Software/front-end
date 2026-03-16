<script setup lang="ts">
import "./ContactCalculationDemoTab.css"

import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import Button from "primevue/button"
import Card from "primevue/card"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import ProgressSpinner from "primevue/progressspinner"

import { useContactStore } from "@/app/stores/contact"
import type { ContactChargeTable } from "@/app/types/contact"

type CurrencyCode = "GBP" | "USD" | "EUR" | "PHP" | string

type NormalizedBreak = {
  id: number
  label: string
  min: number
  max: number | null
  unit: string
  sortOrder: number
}

type NormalizedRowValue = {
  id: number
  chargeBreakId: number
  amount: number
}

type NormalizedRow = {
  id: number
  description: string
  chargeBasis: string
  sortOrder: number
  values: NormalizedRowValue[]
}

type CalculationRow = {
  description: string
  weightBreak: string
  rate: number
  rateText: string
  weightUnit: string
  charge: number
  basisText: string
}

const route = useRoute()
const contactStore = useContactStore()

const contactId = computed(() => Number(route.params.id))

const selectedTableId = ref<number | null>(null)
const shipmentWeight = ref<number | null>(75)

const calculationRows = ref<CalculationRow[]>([])
const totalCharge = ref(0)

const loadingTables = computed(() => contactStore.chargeTablesLoading)
const loadingTable = computed(() => contactStore.currentChargeTableLoading)

const availableTables = computed(() => contactStore.chargeTables ?? [])

const selectedTable = computed<ContactChargeTable | null>(() => {
  return (
    availableTables.value.find(
      table => Number((table as any).id) === Number(selectedTableId.value),
    ) ?? null
  )
})

const selectedCurrency = computed<CurrencyCode>(() => {
  return getTableCurrency(selectedTable.value)
})

const normalizedBreaks = computed<NormalizedBreak[]>(() => {
  return normalizeBreaks(selectedTable.value)
})

const normalizedRows = computed<NormalizedRow[]>(() => {
  return normalizeRows(selectedTable.value)
})

function getTableName(table: ContactChargeTable | null): string {
  if (!table) return "None selected"

  return String(
    (table as any).name ??
      (table as any).title ??
      (table as any).table_name ??
      `Table #${(table as any).id ?? ""}`,
  )
}

function getTableCurrency(table: ContactChargeTable | null): CurrencyCode {
  if (!table) return "GBP"

  return String(
    (table as any).currency_code ??
      (table as any).currency ??
      (table as any).currency?.code ??
      "GBP",
  )
}

function normalizeBreaks(table: ContactChargeTable | null): NormalizedBreak[] {
  if (!table) return []

  const rawBreaks = Array.isArray((table as any).breaks) ? (table as any).breaks : []

  return rawBreaks
    .map((item: any) => ({
      id: Number(item.id),
      label: String(item.label ?? ""),
      min: Number(item.min_value ?? 0),
      max:
        item.max_value === null || item.max_value === undefined || item.max_value === ""
          ? null
          : Number(item.max_value),
      unit: String(item.unit ?? "kg"),
      sortOrder: Number(item.sort_order ?? 0),
    }))
    .sort((a: NormalizedBreak, b: NormalizedBreak) => a.sortOrder - b.sortOrder)
}

function normalizeRows(table: ContactChargeTable | null): NormalizedRow[] {
  if (!table) return []

  const rawRows = Array.isArray((table as any).rows) ? (table as any).rows : []

  return rawRows
    .map((row: any) => ({
      id: Number(row.id),
      description: String(row.description ?? "Charge"),
      chargeBasis: String(row.charge_basis ?? "flat"),
      sortOrder: Number(row.sort_order ?? 0),
      values: Array.isArray(row.values)
        ? row.values.map((value: any) => ({
            id: Number(value.id),
            chargeBreakId: Number(value.charge_break_id),
            amount: Number(value.amount ?? 0),
          }))
        : [],
    }))
    .sort((a: NormalizedBreak, b: NormalizedBreak) => a.sortOrder - b.sortOrder)
}

function formatMoney(amount: number, currency: CurrencyCode): string {
  const symbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    PHP: "₱",
  }

  const symbol = symbols[currency] ?? `${currency} `
  return `${symbol}${Number(amount || 0).toFixed(2)}`
}

function formatBreakRange(item: NormalizedBreak): string {
  if (item.max === null) {
    return `${item.label} (${item.min}${item.unit}+)`
  }

  return `${item.label} (${item.min}-${item.max}${item.unit})`
}

function resolveBreak(weight: number, breaks: NormalizedBreak[]): NormalizedBreak | null {
  return (
    breaks.find(item => {
      if (item.max === null) return weight >= item.min
      return weight >= item.min && weight <= item.max
    }) ?? null
  )
}

function isMinimumBreak(item: NormalizedBreak): boolean {
  return item.min === 0 && item.max !== null && item.max <= 49
}

function getRowAmountForBreak(row: NormalizedRow, breakId: number): number {
  const matched = row.values.find(value => value.chargeBreakId === breakId)
  return Number(matched?.amount ?? 0)
}

function getCalculationBasisText(matchedBreak: NormalizedBreak): string {
  return isMinimumBreak(matchedBreak) ? "Flat" : "Per kg"
}

async function loadTables() {
  if (!contactId.value || Number.isNaN(contactId.value)) return

  await contactStore.fetchChargeTables(contactId.value)

  if (!selectedTableId.value && availableTables.value.length > 0) {
    selectedTableId.value = Number((availableTables.value[0] as any).id)
  }
}

async function onTableChange() {
  calculationRows.value = []
  totalCharge.value = 0

  if (!contactId.value || !selectedTableId.value) return

  const localSelected = availableTables.value.find(
    table => Number((table as any).id) === Number(selectedTableId.value),
  )

  const hasRows =
    Array.isArray((localSelected as any)?.rows) && (localSelected as any).rows.length > 0
  const hasBreaks =
    Array.isArray((localSelected as any)?.breaks) && (localSelected as any).breaks.length > 0

  if (!hasRows || !hasBreaks) {
    await contactStore.loadChargeTable(contactId.value, selectedTableId.value)
  }
}

function calculateCharges() {
  const table = selectedTable.value
  const weight = Number(shipmentWeight.value ?? 0)
  const breaks = normalizedBreaks.value
  const rows = normalizedRows.value

  calculationRows.value = []
  totalCharge.value = 0

  if (!table || weight <= 0 || !breaks.length || !rows.length) return

  const matchedBreak = resolveBreak(weight, breaks)
  if (!matchedBreak) return

  const useFlatAmount = isMinimumBreak(matchedBreak)

  const results: CalculationRow[] = rows.map(row => {
    const rate = getRowAmountForBreak(row, matchedBreak.id)
    const charge = useFlatAmount ? rate : rate * weight

    return {
      description: row.description,
      weightBreak: formatBreakRange(matchedBreak),
      rate,
      rateText: useFlatAmount
        ? formatMoney(rate, selectedCurrency.value)
        : `${formatMoney(rate, selectedCurrency.value)} per kg`,
      weightUnit: `${weight.toFixed(1)} kg`,
      charge,
      basisText: getCalculationBasisText(matchedBreak),
    }
  })

  calculationRows.value = results
  totalCharge.value = results.reduce((sum, row) => sum + row.charge, 0)
}

function clearCalculator() {
  shipmentWeight.value = 75
  calculationRows.value = []
  totalCharge.value = 0
}

watch(
  () => route.params.id,
  async () => {
    selectedTableId.value = null
    calculationRows.value = []
    totalCharge.value = 0
    await loadTables()
  },
)

onMounted(async () => {
  await loadTables()
})
</script>

<template>
  <div class="contact-calculation-demo">
    <div class="contact-calculation-demo__header">
      <div>
        <h2>Collection Charges Calculator</h2>
        <p>Calculate collection charges based on selected table and shipment weight</p>
      </div>
    </div>

    <Card class="calc-card">
      <template #content>
        <div class="calc-card__title">
          <h3>Collection Charges Calculator</h3>
          <p>Minimum break is flat. 50kg and above is amount × shipment weight.</p>
        </div>

        <div class="calc-layout">
          <div class="calc-form">
            <div class="field-block">
              <label for="table">Select Weight Break Table</label>

              <Dropdown
                id="table"
                v-model="selectedTableId"
                :options="availableTables"
                option-label="name"
                option-value="id"
                placeholder="-- Select a table --"
                class="w-full"
                :loading="loadingTables"
                @change="onTableChange"
              />
            </div>

            <div class="field-block">
              <label for="weight">Shipment Weight (kg)</label>
              <InputNumber
                id="weight"
                v-model="shipmentWeight"
                input-class="w-full"
                class="w-full"
                :min="0"
                :min-fraction-digits="0"
                :max-fraction-digits="3"
                placeholder="Enter shipment weight"
              />
            </div>

            <div class="calc-actions">
              <Button
                label="Calculate Charges"
                icon="pi pi-calculator"
                class="calc-btn calc-btn--primary"
                :disabled="!selectedTableId || !shipmentWeight"
                @click="calculateCharges"
              />
              <Button
                label="Clear"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                class="calc-btn"
                @click="clearCalculator"
              />
            </div>
          </div>

          <div class="calc-preview">
            <div class="calc-preview__head">
              <span>Selected Table</span>
              <strong>{{ getTableName(selectedTable) }}</strong>
            </div>

            <div v-if="loadingTable" class="calc-preview__loading">
              <ProgressSpinner style="width: 32px; height: 32px" strokeWidth="4" />
            </div>

            <div v-else-if="selectedTable && normalizedBreaks.length" class="calc-preview__body">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>Weight Break</th>
                    <th>Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in normalizedBreaks" :key="item.id">
                    <td>{{ formatBreakRange(item) }}</td>
                    <td>{{ isMinimumBreak(item) ? "Flat" : "Per kg" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="calc-preview__empty">
              Select a weight break table to preview charges
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card class="calc-card">
      <template #content>
        <div class="results-head">
          <div class="results-head__title">
            <i class="pi pi-file"></i>
            <span>Calculation Results</span>
          </div>

          <div class="results-total">
            <span>Total Collection Charges</span>
            <strong>{{ formatMoney(totalCharge, selectedCurrency) }}</strong>
          </div>
        </div>

        <div class="results-table-wrap">
          <table class="results-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Weight Break</th>
                <th>Basis</th>
                <th>Rate</th>
                <th>Weight/Unit</th>
                <th>Charge</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!calculationRows.length">
                <td colspan="6" class="results-empty">
                  No calculation yet. Select a table, enter weight, then click Calculate Charges.
                </td>
              </tr>

              <tr v-for="row in calculationRows" :key="`${row.description}-${row.weightBreak}`">
                <td>{{ row.description }}</td>
                <td>{{ row.weightBreak }}</td>
                <td>{{ row.basisText }}</td>
                <td>{{ row.rateText }}</td>
                <td>{{ row.weightUnit }}</td>
                <td>{{ formatMoney(row.charge, selectedCurrency) }}</td>
              </tr>
            </tbody>

            <tfoot v-if="calculationRows.length">
              <tr>
                <td colspan="5" class="results-grand-total-label">Total</td>
                <td class="results-grand-total-value">
                  {{ formatMoney(totalCharge, selectedCurrency) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </Card>

    <Card class="calc-card">
      <template #content>
        <div class="how-it-works">
          <div class="how-it-works__title">
            <i class="pi pi-info-circle"></i>
            <span>How It Works</span>
          </div>

          <ol>
            <li><strong>Minimum</strong> break (0–49kg): flat charge regardless of weight.</li>
            <li><strong>50kg and above</strong>: charge is amount × shipment weight.</li>
            <li>Each row in the selected table is calculated separately.</li>
            <li>The total collection charges is the sum of all calculated rows.</li>
          </ol>
        </div>
      </template>
    </Card>
  </div>
</template>
