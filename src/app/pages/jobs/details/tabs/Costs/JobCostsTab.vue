<script setup lang="ts">
import "./JobCostsTab.css"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import { useJobCostsTab } from "./JobCostsTab.logic"

const { buyRows, sellRows, totals, addBuyRow, addSellRow, removeBuyRow, removeSellRow } =
  useJobCostsTab()

const currencyOptions = [
  { label: "GBP", value: "GBP" },
  { label: "EUR", value: "EUR" },
  { label: "USD", value: "USD" },
]

const vatRateOptions = [
  { label: "20%", value: 20 },
  { label: "5%", value: 5 },
  { label: "0%", value: 0 },
]
</script>

<template>
  <section class="job-costs-tab">
    <div class="job-costs-tab__section">
      <header class="job-costs-tab__section-header">
        <div>
          <h2>Buy Costs</h2>
          <p>Supplier costs for the job.</p>
        </div>

        <Button
          type="button"
          class="job-costs-tab__add-btn"
          label="Add Cost Line"
          icon="pi pi-plus"
          @click="addBuyRow"
        />
      </header>

      <div class="job-costs-tab__table-wrap">
        <table class="job-costs-tab__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Charge Description</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Unit Cost</th>
              <th>Currency</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in buyRows" :key="row.id">
              <td class="job-costs-tab__number">{{ index + 1 }}</td>
              <td>
                <InputText v-model="row.description" placeholder="e.g. Haulage" />
              </td>
              <td>
                <InputText v-model="row.supplier" placeholder="Supplier name" />
              </td>
              <td>
                <InputNumber v-model="row.quantity" :min="0" />
              </td>
              <td>
                <InputNumber
                  v-model="row.unitCost"
                  :min="0"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                />
              </td>
              <td>
                <Dropdown
                  v-model="row.currency"
                  :options="currencyOptions"
                  option-label="label"
                  option-value="value"
                />
              </td>
              <td class="job-costs-tab__computed">
                £{{ (row.quantity * row.unitCost).toFixed(2) }}
              </td>
              <td>
                <Button
                  type="button"
                  class="job-costs-tab__remove-btn"
                  icon="pi pi-times"
                  text
                  rounded
                  aria-label="Remove cost line"
                  @click="removeBuyRow(row.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="job-costs-tab__section">
      <header class="job-costs-tab__section-header">
        <div>
          <h2>Sell Charges</h2>
          <p>Customer charges and revenue lines.</p>
        </div>

        <Button
          type="button"
          class="job-costs-tab__add-btn"
          label="Add Charge Line"
          icon="pi pi-plus"
          @click="addSellRow"
        />
      </header>

      <div class="job-costs-tab__table-wrap">
        <table class="job-costs-tab__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Charge Description</th>
              <th>Charge Code</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Currency</th>
              <th>VAT %</th>
              <th>Net Total</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in sellRows" :key="row.id">
              <td class="job-costs-tab__number">{{ index + 1 }}</td>
              <td>
                <InputText v-model="row.description" placeholder="e.g. Freight Charge" />
              </td>
              <td><InputText v-model="row.chargeCode" placeholder="FRT" /></td>
              <td>
                <InputNumber v-model="row.quantity" :min="0" />
              </td>
              <td>
                <InputNumber
                  v-model="row.unitPrice"
                  :min="0"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                />
              </td>
              <td>
                <Dropdown
                  v-model="row.currency"
                  :options="currencyOptions"
                  option-label="label"
                  option-value="value"
                />
              </td>
              <td>
                <Dropdown
                  v-model="row.vatRate"
                  :options="vatRateOptions"
                  option-label="label"
                  option-value="value"
                />
              </td>
              <td class="job-costs-tab__computed">
                £{{ (row.quantity * row.unitPrice).toFixed(2) }}
              </td>
              <td>
                <Button
                  type="button"
                  class="job-costs-tab__remove-btn"
                  icon="pi pi-times"
                  text
                  rounded
                  aria-label="Remove charge line"
                  @click="removeSellRow(row.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="job-costs-tab__summary">
      <div class="job-costs-tab__summary-row">
        <span>Total Buy</span>
        <strong>£{{ totals.totalBuy.toFixed(2) }}</strong>
      </div>

      <div class="job-costs-tab__summary-row">
        <span>Total Sell</span>
        <strong>£{{ totals.totalSell.toFixed(2) }}</strong>
      </div>

      <div class="job-costs-tab__summary-row job-costs-tab__summary-row--total">
        <span>Margin</span>
        <strong>£{{ totals.margin.toFixed(2) }}</strong>
      </div>
    </div>
  </section>
</template>
