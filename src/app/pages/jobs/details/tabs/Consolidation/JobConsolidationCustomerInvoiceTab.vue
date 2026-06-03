<script setup lang="ts">
import "./JobConsolidationTabs.css"
import { computed } from "vue"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"

import type { JobConsolidationChargeLine } from "@/app/types/transport-job"
import {
  calcWeightBreakCost,
  chargeOptions,
  createChargeLine,
  makeId,
  money,
  quoteStatusOptions,
  unitOptions,
  useJobConsolidationContext,
} from "./JobConsolidationTabs.shared"

const context = useJobConsolidationContext()
const details = context.form.consolidation_details

const domesticRows = computed(() =>
  details.collectionOrders.map(order => ({
    ...order,
    cost: calcWeightBreakCost(Number(order.weightKg || 0)),
  })),
)

const domesticCollectionTotal = computed(() =>
  domesticRows.value.reduce((sum, row) => sum + Number(row.cost || 0), 0),
)

const domesticAdditionalTotal = computed(() =>
  details.domesticChargeRows.reduce(
    (sum, line) => sum + Number(line.qty || 0) * Number(line.rate || 0),
    0,
  ),
)

const domesticTotal = computed(() => domesticCollectionTotal.value + domesticAdditionalTotal.value)

const exportTotal = computed(() =>
  details.exportChargeRows.reduce(
    (sum, line) => sum + Number(line.qty || 0) * Number(line.rate || 0),
    0,
  ),
)

const quoteSubtotal = computed(() =>
  details.quoteLines.reduce((sum, line) => sum + Number(line.qty || 0) * Number(line.rate || 0), 0),
)

const customerInvoiceSubtotal = computed(() => domesticTotal.value + exportTotal.value)
const customerInvoiceTax = computed(
  () => customerInvoiceSubtotal.value * (Number(details.taxRate || 0) / 100),
)
const customerInvoiceTotal = computed(
  () => customerInvoiceSubtotal.value + customerInvoiceTax.value,
)

function addDomesticCharge() {
  details.domesticChargeRows.push(createChargeLine("Domestic collection"))
}

function addExportCharge() {
  details.exportChargeRows.push(createChargeLine("Consolidation handling"))
}

function addDomesticToQuote() {
  details.quoteLines = details.quoteLines.filter(line => line.sourceType !== "domestic")

  const collectionLines: JobConsolidationChargeLine[] = domesticRows.value.map(row => ({
    id: makeId(),
    description: `Collection - ${row.coRef}${row.supplier ? ` (${row.supplier})` : ""}`,
    qty: 1,
    unit: "Fixed",
    rate: Number(row.cost || 0),
    sourceType: "domestic",
    sourceId: row.coRef,
  }))

  const additionalLines = details.domesticChargeRows.map(line => ({
    ...line,
    id: makeId(),
    sourceType: "domestic" as const,
    sourceId: `manual-${line.id}`,
  }))

  details.quoteLines = [...details.quoteLines, ...collectionLines, ...additionalLines]
  details.showQuotePanel = true
}

function addExportToQuote() {
  details.quoteLines = details.quoteLines.filter(line => line.sourceType !== "export")
  details.quoteLines = [
    ...details.quoteLines,
    ...details.exportChargeRows.map(line => ({
      ...line,
      id: makeId(),
      sourceType: "export" as const,
      sourceId: line.id,
    })),
  ]
  details.showQuotePanel = true
}

function addQuoteLine() {
  details.quoteLines.push(createChargeLine(chargeOptions[0] ?? "Consolidation handling"))
  details.showQuotePanel = true
}

function cancelQuote() {
  details.quoteLines = []
  details.showQuotePanel = false
}

function convertQuoteToExportInvoice() {
  details.exportChargeRows = details.quoteLines.map(line => ({
    id: makeId(),
    description: line.description,
    qty: line.qty,
    unit: line.unit,
    rate: line.rate,
  }))
  details.quoteLines = []
  details.showQuotePanel = false
}

function postDomesticInvoice() {
  details.domesticInvoice.posted = true
  details.domesticInvoice.date = new Date().toLocaleDateString("en-GB")
  details.domesticInvoice.ref = `DI-${context.form.job_number || "CON"}-${Date.now()
    .toString()
    .slice(-4)}`
}

function postExportInvoice() {
  details.exportInvoice.posted = true
  details.exportInvoice.date = new Date().toLocaleDateString("en-GB")
  details.exportInvoice.ref = `EI-${context.form.job_number || "CON"}-${Date.now()
    .toString()
    .slice(-4)}`
}
</script>

<template>
  <section class="job-consolidation-tab">
      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h2>Customer Invoice</h2>
            <p>Post domestic and export invoices, then build the customer delivery quotation.</p>
          </div>

          <div class="job-consolidation-tab__actions">
            <Button
              label="Add Domestic Charge"
              icon="pi pi-plus"
              class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
              type="button"
              @click="addDomesticCharge"
            />
            <Button
              label="Add Export Charge"
              icon="pi pi-plus"
              class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
              type="button"
              @click="addExportCharge"
            />
            <Button
              :label="details.showQuotePanel ? 'Hide Quote' : 'View Quote'"
              icon="pi pi-file-edit"
              class="job-consolidation-tab__button job-consolidation-tab__button--primary"
              type="button"
              @click="details.showQuotePanel = !details.showQuotePanel"
            />
          </div>
        </header>

        <div class="job-consolidation-tab__two-column">
          <div class="job-consolidation-tab">
            <div>
              <div class="job-consolidation-tab__section-header">
                <div>
                  <h3>Domestic Charges - from Collection Orders</h3>
                  <p>Domestic charges use the collection weight-break calculation.</p>
                </div>
                <span
                  class="job-consolidation-tab__status"
                  :class="{
                    'job-consolidation-tab__status--success': details.domesticInvoice.posted,
                  }"
                >
                  {{
                    details.domesticInvoice.posted
                      ? `Posted - ${details.domesticInvoice.ref}`
                      : "Unposted"
                  }}
                </span>
              </div>

              <div class="job-consolidation-tab__table-wrap">
                <table class="job-consolidation-tab__table">
                  <thead>
                    <tr>
                      <th>Collection Ref</th>
                      <th>Supplier / Carrier</th>
                      <th>Pickup</th>
                      <th>Delivery</th>
                      <th>Pieces</th>
                      <th>Weight kg</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in domesticRows" :key="row.id">
                      <td>{{ row.coRef }}</td>
                      <td>{{ row.supplier }}</td>
                      <td>{{ row.pickupDate }}</td>
                      <td>{{ row.deliveryDate }}</td>
                      <td>{{ row.pcs }}</td>
                      <td>{{ row.weightKg }}</td>
                      <td>{{ money("GBP", row.cost) }}</td>
                    </tr>
                    <tr v-if="!domesticRows.length">
                      <td colspan="7">No collection orders yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="job-consolidation-tab__table-wrap">
                <table class="job-consolidation-tab__table">
                  <thead>
                    <tr>
                      <th>Additional Domestic Charge</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in details.domesticChargeRows" :key="line.id">
                      <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                      <td><InputNumber v-model="line.qty" :min="0" /></td>
                      <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                      <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                      <td>{{ money("GBP", line.qty * line.rate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="job-consolidation-tab__actions" style="margin-top: 12px">
                <Button
                  label="Create / View Quote"
                  icon="pi pi-file-edit"
                  class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
                  type="button"
                  @click="addDomesticToQuote"
                />
                <Button
                  label="Post Domestic Invoice"
                  icon="pi pi-check"
                  class="job-consolidation-tab__button job-consolidation-tab__button--primary"
                  type="button"
                  @click="postDomesticInvoice"
                />
              </div>
            </div>

            <div class="job-consolidation-tab__subsection">
              <div class="job-consolidation-tab__section-header">
                <div>
                  <h3>Export Invoice Charges</h3>
                  <p>Export charges can be quoted line-by-line or posted as the export invoice.</p>
                </div>
                <span
                  class="job-consolidation-tab__status"
                  :class="{
                    'job-consolidation-tab__status--success': details.exportInvoice.posted,
                  }"
                >
                  {{
                    details.exportInvoice.posted
                      ? `Posted - ${details.exportInvoice.ref}`
                      : "Unposted"
                  }}
                </span>
              </div>

              <div class="job-consolidation-tab__table-wrap">
                <table class="job-consolidation-tab__table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in details.exportChargeRows" :key="line.id">
                      <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                      <td><InputNumber v-model="line.qty" :min="0" /></td>
                      <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                      <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                      <td>{{ money("GBP", line.qty * line.rate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="job-consolidation-tab__actions" style="margin-top: 12px">
                <Button
                  label="Create / View Quote"
                  icon="pi pi-file-edit"
                  class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
                  type="button"
                  @click="addExportToQuote"
                />
                <Button
                  label="Post Export Invoice"
                  icon="pi pi-check"
                  class="job-consolidation-tab__button job-consolidation-tab__button--primary"
                  type="button"
                  @click="postExportInvoice"
                />
              </div>
            </div>

            <div v-if="details.showQuotePanel" class="job-consolidation-tab__subsection">
              <div class="job-consolidation-tab__section-header">
                <div>
                  <h3>Delivery Quotation</h3>
                  <span class="job-consolidation-tab__status">{{ details.quote.status }}</span>
                </div>
                <div class="job-consolidation-tab__actions">
                  <Button
                    label="Add Line"
                    icon="pi pi-plus"
                    class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
                    type="button"
                    @click="addQuoteLine"
                  />
                  <Button
                    label="Convert to Export Invoice"
                    icon="pi pi-arrow-right"
                    class="job-consolidation-tab__button job-consolidation-tab__button--primary"
                    type="button"
                    @click="convertQuoteToExportInvoice"
                  />
                  <Button
                    label="Cancel Quote"
                    icon="pi pi-times"
                    class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
                    type="button"
                    @click="cancelQuote"
                  />
                </div>
              </div>

              <div class="job-consolidation-tab__grid job-consolidation-tab__grid--three">
                <label class="job-consolidation-tab__field">
                  <span>Quote Reference</span>
                  <InputText v-model="details.quote.reference" />
                </label>
                <label class="job-consolidation-tab__field">
                  <span>Valid Until</span>
                  <InputText v-model="details.quote.validUntil" type="date" />
                </label>
                <label class="job-consolidation-tab__field">
                  <span>Status</span>
                  <Dropdown v-model="details.quote.status" :options="quoteStatusOptions" />
                </label>
              </div>

              <div class="job-consolidation-tab__table-wrap">
                <table class="job-consolidation-tab__table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in details.quoteLines" :key="line.id">
                      <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                      <td><InputNumber v-model="line.qty" :min="0" /></td>
                      <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                      <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                      <td>{{ money("GBP", line.qty * line.rate) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                class="job-consolidation-tab__grid job-consolidation-tab__grid--two"
                style="margin-top: 12px"
              >
                <label class="job-consolidation-tab__field">
                  <span>Notes to Customer</span>
                  <Textarea v-model="details.quote.notes" rows="3" />
                </label>
                <label class="job-consolidation-tab__field">
                  <span>Terms and Conditions</span>
                  <Textarea v-model="details.quote.terms" rows="3" />
                </label>
              </div>

              <div class="job-consolidation-tab__summary-row">
                <article>
                  <span>Quote Subtotal</span>
                  <strong>{{ money("GBP", quoteSubtotal) }}</strong>
                </article>
              </div>
            </div>
          </div>

          <aside class="job-consolidation-tab__side-card">
            <div>
              <span>Domestic Total</span>
              <strong>{{ money("GBP", domesticTotal) }}</strong>
            </div>
            <div>
              <span>Export Total</span>
              <strong>{{ money("GBP", exportTotal) }}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>{{ money("GBP", customerInvoiceSubtotal) }}</strong>
            </div>
            <div>
              <span>Tax Rate</span>
              <InputNumber
                v-model="details.taxRate"
                suffix="%"
                :min="0"
                :max="100"
                :min-fraction-digits="1"
              />
            </div>
            <div>
              <span>Tax</span>
              <strong>{{ money("GBP", customerInvoiceTax) }}</strong>
            </div>
            <div>
              <span>Invoice Total</span>
              <strong class="job-consolidation-tab__grand-total">
                {{ money("GBP", customerInvoiceTotal) }}
              </strong>
            </div>
          </aside>
        </div>
      </div>
  </section>
</template>
