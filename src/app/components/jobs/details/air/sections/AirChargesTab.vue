<script setup lang="ts">
import Button from "primevue/button"
import { computed, ref } from "vue"

defineProps<{
  form: any
  disabled?: boolean
}>()

type ChargeLine = {
  id: number
  charge_type: string
  description: string
  basis: string
  qty: number
  rate: number | null
  currency: string
  exchange_rate: number
  vat_percent: number
}

const lines = ref<ChargeLine[]>([
  {
    id: 1,
    charge_type: "",
    description: "",
    basis: "Per Shipment",
    qty: 1,
    rate: null,
    currency: "GBP",
    exchange_rate: 1,
    vat_percent: 0,
  },
])

function addLine() {
  lines.value.push({
    id: Date.now(),
    charge_type: "",
    description: "",
    basis: "Per Shipment",
    qty: 1,
    rate: null,
    currency: "GBP",
    exchange_rate: 1,
    vat_percent: 0,
  })
}

function removeLine(id: number) {
  lines.value = lines.value.filter(line => line.id !== id)
}

function amount(line: ChargeLine) {
  return (Number(line.qty || 0) * Number(line.rate || 0)) / Number(line.exchange_rate || 1)
}

function vatAmount(line: ChargeLine) {
  return amount(line) * (Number(line.vat_percent || 0) / 100)
}

function total(line: ChargeLine) {
  return amount(line) + vatAmount(line)
}

const subtotal = computed(() => lines.value.reduce((sum, line) => sum + amount(line), 0))
const vatTotal = computed(() => lines.value.reduce((sum, line) => sum + vatAmount(line), 0))
const grandTotal = computed(() => lines.value.reduce((sum, line) => sum + total(line), 0))
</script>

<template>
  <section class="air-card">
    <div class="air-card__head">
      <h3 class="air-card__title">Charge Lines</h3>

      <Button
        label="Add Charge"
        icon="pi pi-plus"
        size="small"
        :disabled="disabled"
        @click="addLine"
      />
    </div>

    <div class="air-card__body">
      <div class="air-table-wrap">
        <table class="air-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Charge Type</th>
              <th>Description</th>
              <th>Basis</th>
              <th>Qty / Wt</th>
              <th>Rate</th>
              <th>Currency</th>
              <th>Ex. Rate</th>
              <th>Amount (GBP)</th>
              <th>VAT %</th>
              <th>VAT Amt</th>
              <th>Total (GBP)</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(line, index) in lines" :key="line.id">
              <td class="air-table__num">{{ index + 1 }}</td>
              <td>
                <select v-model="line.charge_type" :disabled="disabled">
                  <option value="">— Select Charge —</option>
                  <option>Air Freight Rate</option>
                  <option>Minimum Freight Charge</option>
                  <option>Fuel Surcharge</option>
                  <option>Security Surcharge</option>
                  <option>Collection Charge</option>
                  <option>Export Clearance</option>
                  <option>Delivery Charge</option>
                  <option>Import Clearance</option>
                  <option>Insurance Premium</option>
                  <option>Miscellaneous Charge</option>
                </select>
              </td>
              <td><input v-model="line.description" type="text" :disabled="disabled" /></td>
              <td>
                <select v-model="line.basis" :disabled="disabled">
                  <option>Per Shipment</option>
                  <option>Per KG</option>
                  <option>Per Piece</option>
                  <option>Per CBM</option>
                  <option>% of Value</option>
                  <option>Per Day</option>
                  <option>Flat Rate</option>
                </select>
              </td>
              <td>
                <input v-model.number="line.qty" type="number" step="0.001" :disabled="disabled" />
              </td>
              <td>
                <input v-model.number="line.rate" type="number" step="0.01" :disabled="disabled" />
              </td>
              <td>
                <select v-model="line.currency" :disabled="disabled">
                  <option>GBP</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>AED</option>
                  <option>JPY</option>
                </select>
              </td>
              <td>
                <input
                  v-model.number="line.exchange_rate"
                  type="number"
                  step="0.0001"
                  :disabled="disabled"
                />
              </td>
              <td><input :value="amount(line).toFixed(2)" type="text" disabled /></td>
              <td>
                <input
                  v-model.number="line.vat_percent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  :disabled="disabled"
                />
              </td>
              <td><input :value="vatAmount(line).toFixed(2)" type="text" disabled /></td>
              <td><input :value="total(line).toFixed(2)" type="text" disabled /></td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  :disabled="disabled"
                  @click="removeLine(line.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="air-summary" style="margin-top: 14px">
        <div class="air-summary__item">
          <div class="air-summary__label">Subtotal</div>
          <div class="air-summary__value">{{ subtotal.toFixed(2) }}</div>
        </div>
        <div class="air-summary__item">
          <div class="air-summary__label">VAT Total</div>
          <div class="air-summary__value">{{ vatTotal.toFixed(2) }}</div>
        </div>
        <div class="air-summary__item air-span-2">
          <div class="air-summary__label">Grand Total</div>
          <div class="air-summary__value air-summary__value--accent">
            {{ grandTotal.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
