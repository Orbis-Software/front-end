<script setup lang="ts">
import "./JobConsolidationTabs.css"
import { computed } from "vue"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"

import {
  createConsolidatedLine,
  currencyOptions,
  money,
  unitOptions,
  useJobConsolidationContext,
} from "./JobConsolidationTabs.shared"

const context = useJobConsolidationContext()
const details = context.form.consolidation_details

const supplierTotalsByCurrency = computed(() => {
  return currencyOptions.map(currency => ({
    currency,
    total: details.supplierInvoices
      .filter(invoice => invoice.currency === currency)
      .reduce((sum, invoice) => sum + Number(invoice.invoiceValue || 0), 0),
  }))
})

const consolidatedTotalsByCurrency = computed(() => {
  return currencyOptions.map(currency => ({
    currency,
    total: details.consolidatedLines
      .filter(line => line.invoiceCurrency === currency)
      .reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.unitPrice || 0), 0),
  }))
})

const filteredLines = computed(() => {
  return details.consolidatedLines.filter(
    line => line.invoiceCurrency === details.selectedInvoiceCurrency,
  )
})

const selectedGoodsTotal = computed(() => {
  return filteredLines.value.reduce(
    (sum, line) => sum + Number(line.qty || 0) * Number(line.unitPrice || 0),
    0,
  )
})

const selectedDapTotal = computed(() => {
  return selectedGoodsTotal.value + Number(details.consolidatedFreightCharge || 0)
})

const packageBreakdown = computed(() => {
  return details.supplierInvoices.reduce(
    (sum, invoice) => {
      invoice.items.forEach(item => {
        const qty = Number(item.collie || 0)
        const type = item.packageType.toLowerCase()

        if (type.includes("crate")) sum.crates += qty
        else if (type.includes("pallet")) sum.pallets += qty
        else if (type.includes("jiffy")) sum.jiffies += qty
        else sum.cartons += qty

        sum.net += Number(item.net || 0)
        sum.gross += Number(item.gross || 0)
      })

      return sum
    },
    { crates: 0, pallets: 0, cartons: 0, jiffies: 0, net: 0, gross: 0 },
  )
})

function addConsolidatedItem() {
  details.consolidatedLines.push(createConsolidatedLine(details.selectedInvoiceCurrency))
}
</script>

<template>
  <section class="job-consolidation-tab">
    <div v-if="!context.isConsolidationJob.value" class="job-consolidation-tab__empty">
      This tab is only available for consolidation jobs.
    </div>

    <template v-else>
      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h2>Consolidated Invoices</h2>
            <p>Build the consolidated commercial invoice by currency for customs clearance.</p>
          </div>

          <div class="job-consolidation-tab__actions">
            <Button
              label="Print Invoice"
              icon="pi pi-print"
              class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
              type="button"
            />
            <Button
              label="Add Item"
              icon="pi pi-plus"
              class="job-consolidation-tab__button job-consolidation-tab__button--primary"
              type="button"
              @click="addConsolidatedItem"
            />
          </div>
        </header>

        <div class="job-consolidation-tab__summary-row">
          <article v-for="row in supplierTotalsByCurrency" :key="`supplier-${row.currency}`">
            <span>Supplier {{ row.currency }}</span>
            <strong>{{ money(row.currency, row.total) }}</strong>
          </article>
          <article
            v-for="row in consolidatedTotalsByCurrency"
            :key="`consolidated-${row.currency}`"
          >
            <span>Consolidated {{ row.currency }}</span>
            <strong>{{ money(row.currency, row.total) }}</strong>
          </article>
        </div>

        <div class="job-consolidation-tab__currency-switch">
          <Button
            v-for="currency in currencyOptions"
            :key="currency"
            :label="currency"
            class="job-consolidation-tab__button"
            :class="
              details.selectedInvoiceCurrency === currency
                ? 'job-consolidation-tab__button--primary'
                : 'job-consolidation-tab__button--ghost'
            "
            type="button"
            @click="details.selectedInvoiceCurrency = currency"
          />
        </div>

        <div
          v-if="!filteredLines.length"
          class="job-consolidation-tab__empty"
          style="margin-top: 12px"
        >
          No consolidated invoice lines for {{ details.selectedInvoiceCurrency }} yet.
        </div>

        <div v-else class="job-consolidation-tab__table-wrap">
          <table class="job-consolidation-tab__table job-consolidation-tab__table--wide">
            <thead>
              <tr>
                <th>#</th>
                <th>PO Ref</th>
                <th>Supplier</th>
                <th>Shipping Label</th>
                <th>Description</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>COO</th>
                <th>HS Code</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, index) in filteredLines" :key="line.id">
                <td>{{ index + 1 }}</td>
                <td><InputText v-model="line.poRef" /></td>
                <td><InputText v-model="line.supplier" /></td>
                <td><InputText v-model="line.shippingLabelNo" /></td>
                <td><InputText v-model="line.description" /></td>
                <td><InputNumber v-model="line.qty" :min="0" /></td>
                <td><Dropdown v-model="line.uom" :options="unitOptions" /></td>
                <td><InputText v-model="line.countryOfOrigin" /></td>
                <td><InputText v-model="line.hsCode" /></td>
                <td><InputNumber v-model="line.unitPrice" :min-fraction-digits="2" /></td>
                <td>{{ money(line.invoiceCurrency, line.qty * line.unitPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h3>Package Counts and Value Breakdown</h3>
          </div>
        </header>

        <div class="job-consolidation-tab__summary-row">
          <article>
            <span>Crates</span>
            <strong>{{ packageBreakdown.crates }}</strong>
          </article>
          <article>
            <span>Pallets</span>
            <strong>{{ packageBreakdown.pallets }}</strong>
          </article>
          <article>
            <span>Cartons</span>
            <strong>{{ packageBreakdown.cartons }}</strong>
          </article>
          <article>
            <span>Jiffy Bags</span>
            <strong>{{ packageBreakdown.jiffies }}</strong>
          </article>
          <article>
            <span>Total Net Weight</span>
            <strong>{{ packageBreakdown.net.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Total Gross Weight</span>
            <strong>{{ packageBreakdown.gross.toFixed(1) }} kg</strong>
          </article>
        </div>

        <div
          class="job-consolidation-tab__grid job-consolidation-tab__grid--three"
          style="margin-top: 12px"
        >
          <label class="job-consolidation-tab__field">
            <span>Total Value of Goods EXW</span>
            <InputText
              :model-value="money(details.selectedInvoiceCurrency, selectedGoodsTotal)"
              readonly
            />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Freight Charges</span>
            <InputNumber v-model="details.consolidatedFreightCharge" :min-fraction-digits="2" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Total Value of Goods DAP</span>
            <InputText
              :model-value="money(details.selectedInvoiceCurrency, selectedDapTotal)"
              readonly
            />
          </label>
        </div>
      </div>
    </template>
  </section>
</template>
