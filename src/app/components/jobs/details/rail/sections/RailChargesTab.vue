<script setup lang="ts">
import { computed, ref } from "vue"

type ChargeLine = {
  id: number
  charge_type: string
  description: string
  currency: string
  unit_price: number | null
  qty: number
  vat_percent: number
  buy_sell: "buy" | "sell"
}

const props = defineProps<{
  form: any
  disabled?: boolean
}>()

const lines = ref<ChargeLine[]>([
  {
    id: 1,
    charge_type: "",
    description: "",
    currency: "GBP",
    unit_price: null,
    qty: 1,
    vat_percent: 20,
    buy_sell: "sell",
  },
])

function addLine() {
  lines.value.push({
    id: Date.now(),
    charge_type: "",
    description: "",
    currency: "GBP",
    unit_price: null,
    qty: 1,
    vat_percent: 20,
    buy_sell: "sell",
  })
}

function removeLine(id: number) {
  lines.value = lines.value.filter(line => line.id !== id)
}

function netAmount(line: ChargeLine) {
  return Number(line.unit_price || 0) * Number(line.qty || 0)
}

function vatAmount(line: ChargeLine) {
  return netAmount(line) * (Number(line.vat_percent || 0) / 100)
}

function grossAmount(line: ChargeLine) {
  return netAmount(line) + vatAmount(line)
}

const sellNet = computed(() =>
  lines.value
    .filter(line => line.buy_sell === "sell")
    .reduce((sum, line) => sum + netAmount(line), 0),
)

const sellVat = computed(() =>
  lines.value
    .filter(line => line.buy_sell === "sell")
    .reduce((sum, line) => sum + vatAmount(line), 0),
)

const sellGross = computed(() =>
  lines.value
    .filter(line => line.buy_sell === "sell")
    .reduce((sum, line) => sum + grossAmount(line), 0),
)

const buyNet = computed(() =>
  lines.value
    .filter(line => line.buy_sell === "buy")
    .reduce((sum, line) => sum + netAmount(line), 0),
)

const netMargin = computed(() => sellNet.value - buyNet.value)
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Charge Lines</h3>
      <Button
        label="Add Charge"
        icon="pi pi-plus"
        size="small"
        :disabled="disabled"
        @click="addLine"
      />
    </div>

    <div class="rail-table-wrap">
      <table class="rail-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Charge Type</th>
            <th>Description</th>
            <th>Currency</th>
            <th>Unit Price</th>
            <th>Qty</th>
            <th>VAT %</th>
            <th>Net Amount</th>
            <th>VAT Amount</th>
            <th>Gross Amount</th>
            <th>Buy / Sell</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(line, index) in lines" :key="line.id">
            <td class="rail-table__num">{{ index + 1 }}</td>
            <td>
              <select v-model="line.charge_type" :disabled="disabled">
                <option value="">Select charge…</option>
                <option>Base Freight Rate</option>
                <option>Fuel Surcharge</option>
                <option>Collection Handling</option>
                <option>Delivery Handling</option>
                <option>Customs Clearance</option>
                <option>Origin Charges</option>
                <option>Destination Charges</option>
                <option>Cargo Insurance</option>
              </select>
            </td>
            <td><input v-model="line.description" type="text" :disabled="disabled" /></td>
            <td>
              <select v-model="line.currency" :disabled="disabled">
                <option>GBP</option>
                <option>EUR</option>
                <option>USD</option>
                <option>CNY</option>
              </select>
            </td>
            <td>
              <input
                v-model.number="line.unit_price"
                type="number"
                min="0"
                step="0.01"
                :disabled="disabled"
              />
            </td>
            <td><input v-model.number="line.qty" type="number" min="1" :disabled="disabled" /></td>
            <td>
              <select v-model.number="line.vat_percent" :disabled="disabled">
                <option :value="0">0%</option>
                <option :value="5">5%</option>
                <option :value="20">20%</option>
                <option :value="25">25%</option>
              </select>
            </td>
            <td><input :value="netAmount(line).toFixed(2)" type="text" disabled /></td>
            <td><input :value="vatAmount(line).toFixed(2)" type="text" disabled /></td>
            <td><input :value="grossAmount(line).toFixed(2)" type="text" disabled /></td>
            <td>
              <select v-model="line.buy_sell" :disabled="disabled">
                <option value="sell">Sell</option>
                <option value="buy">Buy</option>
              </select>
            </td>
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

    <div class="rail-charges-summary">
      <div class="rail-charges-summary__item">
        <div class="rail-charges-summary__label">Sell – Net</div>
        <div class="rail-charges-summary__value rail-charges-summary__value--accent">
          {{ sellNet.toFixed(2) }}
        </div>
      </div>

      <div class="rail-charges-summary__item">
        <div class="rail-charges-summary__label">Sell – VAT</div>
        <div class="rail-charges-summary__value">
          {{ sellVat.toFixed(2) }}
        </div>
      </div>

      <div class="rail-charges-summary__item">
        <div class="rail-charges-summary__label">Sell – Gross</div>
        <div class="rail-charges-summary__value rail-charges-summary__value--accent">
          {{ sellGross.toFixed(2) }}
        </div>
      </div>

      <div class="rail-charges-summary__item">
        <div class="rail-charges-summary__label">Buy – Net</div>
        <div class="rail-charges-summary__value">
          {{ buyNet.toFixed(2) }}
        </div>
      </div>

      <div class="rail-charges-summary__item">
        <div class="rail-charges-summary__label">Net Margin</div>
        <div class="rail-charges-summary__value rail-charges-summary__value--success">
          {{ netMargin.toFixed(2) }}
        </div>
      </div>
    </div>
  </section>
</template>
