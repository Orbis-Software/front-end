<script setup lang="ts">
import "./JobCostsTab.css"
import { useJobCostsTab } from "./JobCostsTab.logic"

const { buyRows, sellRows, totals, addBuyRow, addSellRow, removeBuyRow, removeSellRow } =
  useJobCostsTab()
</script>

<template>
  <section class="job-costs-tab">
    <div class="job-costs-tab__section">
      <header class="job-costs-tab__section-header">
        <div>
          <h2>Buy Costs</h2>
          <p>Supplier costs for the job.</p>
        </div>

        <button type="button" class="job-costs-tab__add-btn" @click="addBuyRow">
          + Add Cost Line
        </button>
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
              <td><input v-model="row.description" type="text" placeholder="e.g. Haulage" /></td>
              <td><input v-model="row.supplier" type="text" placeholder="Supplier name" /></td>
              <td><input v-model.number="row.quantity" type="number" min="0" /></td>
              <td><input v-model.number="row.unitCost" type="number" min="0" step="0.01" /></td>
              <td>
                <select v-model="row.currency">
                  <option>GBP</option>
                  <option>EUR</option>
                  <option>USD</option>
                </select>
              </td>
              <td class="job-costs-tab__computed">
                £{{ (row.quantity * row.unitCost).toFixed(2) }}
              </td>
              <td>
                <button
                  type="button"
                  class="job-costs-tab__remove-btn"
                  @click="removeBuyRow(row.id)"
                >
                  ×
                </button>
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

        <button type="button" class="job-costs-tab__add-btn" @click="addSellRow">
          + Add Charge Line
        </button>
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
                <input v-model="row.description" type="text" placeholder="e.g. Freight Charge" />
              </td>
              <td><input v-model="row.chargeCode" type="text" placeholder="FRT" /></td>
              <td><input v-model.number="row.quantity" type="number" min="0" /></td>
              <td><input v-model.number="row.unitPrice" type="number" min="0" step="0.01" /></td>
              <td>
                <select v-model="row.currency">
                  <option>GBP</option>
                  <option>EUR</option>
                  <option>USD</option>
                </select>
              </td>
              <td>
                <select v-model.number="row.vatRate">
                  <option :value="20">20%</option>
                  <option :value="5">5%</option>
                  <option :value="0">0%</option>
                </select>
              </td>
              <td class="job-costs-tab__computed">
                £{{ (row.quantity * row.unitPrice).toFixed(2) }}
              </td>
              <td>
                <button
                  type="button"
                  class="job-costs-tab__remove-btn"
                  @click="removeSellRow(row.id)"
                >
                  ×
                </button>
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
