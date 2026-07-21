<script setup lang="ts">
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const {
  addDomesticCharge,
  addDomesticToQuote,
  addExportCharge,
  addExportToQuote,
  addQuoteLine,
  cancelQuote,
  chargeOptions,
  convertQuoteToExportInvoice,
  customerInvoiceSubtotal,
  customerInvoiceTax,
  customerInvoiceTotal,
  domesticChargeRows,
  domesticInvoice,
  domesticInvoiceRows,
  domesticTotal,
  exportChargeRows,
  exportInvoice,
  exportTotal,
  isExportLineInQuote,
  money,
  postDomesticInvoice,
  postExportInvoice,
  quote,
  quoteLines,
  quoteStatusOptions,
  quoteSubtotal,
  showQuotePanel,
  taxRate,
  toggleExportLineQuote,
  unitOptions,
  weightBreakRates,
} = context
</script>

<template>
  <section class="consolidation-section">
    <div class="consolidation-section__head">
      <div>
        <h2>Customer Invoice</h2>
        <p>
          Post Domestic and Export invoices separately, then build the customer delivery quotation.
        </p>
      </div>
      <div class="consolidation-page__actions">
        <Button
          label="Add Domestic Charge"
          icon="pi pi-plus"
          class="btn btn--ghost"
          @click="addDomesticCharge"
        />
        <Button
          label="Add Export Charge"
          icon="pi pi-plus"
          class="btn btn--ghost"
          @click="addExportCharge"
        />
        <Button
          :label="showQuotePanel ? 'Hide Quote' : 'View Quote'"
          icon="pi pi-file-edit"
          class="btn btn--primary"
          @click="showQuotePanel = !showQuotePanel"
        />
      </div>
    </div>

    <div class="consolidation-invoice-grid">
      <div>
        <div class="consolidation-subsection">
          <div class="consolidation-subsection__head-row">
            <div>
              <div class="consolidation-subsection__title">
                Domestic Charges - from Collection Orders
              </div>
              <p class="consolidation-note">
                Domestic charges are calculated from collection order weight breaks plus any manual
                charges.
              </p>
            </div>
            <span
              class="consolidation-status"
              :class="{ 'consolidation-status--success': domesticInvoice.posted }"
            >
              {{ domesticInvoice.posted ? `Posted - ${domesticInvoice.ref}` : "Unposted" }}
            </span>
          </div>
          <DataTable
            :value="domesticInvoiceRows"
            responsive-layout="scroll"
            class="consolidation-datatable"
          >
            <Column field="coRef" header="Collection Ref" />
            <Column field="supplier" header="Supplier / Carrier" />
            <Column field="pickupDate" header="Collection Date" />
            <Column field="deliveryDate" header="Delivery Date" />
            <Column field="pcs" header="Pieces" />
            <Column field="weightKg" header="Weight kg" />
            <Column field="status" header="Status" />
            <Column header="Cost">
              <template #body="{ data }">{{ money("GBP", data.cost) }}</template>
              <template #footer>{{ money("GBP", domesticTotal) }}</template>
            </Column>
          </DataTable>

          <div
            v-if="domesticChargeRows.length"
            class="consolidation-table-wrap consolidation-table-wrap--mt"
          >
            <table class="consolidation-table consolidation-table--inputs">
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
                <tr v-for="line in domesticChargeRows" :key="line.id">
                  <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                  <td><InputNumber v-model="line.qty" :min="0" /></td>
                  <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                  <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                  <td>{{ money("GBP", line.qty * line.rate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="consolidation-ci-footer">
            <div class="consolidation-page__actions">
              <Button
                label="Create / View Quote"
                icon="pi pi-file-edit"
                class="btn btn--ghost"
                @click="addDomesticToQuote"
              />
              <Button
                label="Post Domestic Invoice"
                icon="pi pi-check"
                class="btn btn--primary"
                @click="postDomesticInvoice"
              />
            </div>
          </div>
        </div>

        <div class="consolidation-subsection">
          <div class="consolidation-subsection__head-row">
            <div>
              <div class="consolidation-subsection__title">Export Invoice Charges</div>
              <p class="consolidation-note">
                Export charges can be quoted line-by-line or posted as the export invoice.
              </p>
            </div>
            <span
              class="consolidation-status"
              :class="{ 'consolidation-status--success': exportInvoice.posted }"
            >
              {{ exportInvoice.posted ? `Posted - ${exportInvoice.ref}` : "Unposted" }}
            </span>
          </div>
          <div class="consolidation-table-wrap">
            <table class="consolidation-table consolidation-table--inputs">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Total</th>
                  <th>Quote</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in exportChargeRows" :key="line.id">
                  <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                  <td><InputNumber v-model="line.qty" :min="0" /></td>
                  <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                  <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                  <td>{{ money("GBP", line.qty * line.rate) }}</td>
                  <td>
                    <Button
                      :label="isExportLineInQuote(line.id) ? 'In Quote' : '+ Quote'"
                      class="btn btn--ghost btn--small"
                      @click="toggleExportLineQuote(line.id)"
                    />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">Export Total</td>
                  <td colspan="2">{{ money("GBP", exportTotal) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="consolidation-ci-footer">
            <div class="consolidation-page__actions">
              <Button
                label="Create / View Quote"
                icon="pi pi-file-edit"
                class="btn btn--ghost"
                @click="addExportToQuote"
              />
              <Button
                label="Post Export Invoice"
                icon="pi pi-check"
                class="btn btn--primary"
                @click="postExportInvoice"
              />
            </div>
          </div>
        </div>

        <div v-if="showQuotePanel" class="consolidation-quote-panel">
          <div class="consolidation-quote-panel__head">
            <div>
              <h3>Delivery Quotation</h3>
              <span class="consolidation-status">{{ quote.status }}</span>
            </div>
            <div class="consolidation-page__actions">
              <Button
                label="Add Line"
                icon="pi pi-plus"
                class="btn btn--ghost btn--small"
                @click="addQuoteLine"
              />
              <Button label="Preview" icon="pi pi-eye" class="btn btn--ghost btn--small" />
              <Button
                label="Convert to Export Invoice"
                icon="pi pi-arrow-right"
                class="btn btn--primary btn--small"
                @click="convertQuoteToExportInvoice"
              />
              <Button
                label="Cancel Quote"
                icon="pi pi-times"
                class="btn btn--ghost btn--small"
                @click="cancelQuote"
              />
            </div>
          </div>

          <div class="consolidation-form-grid consolidation-form-grid--three">
            <label class="consolidation-field">
              <span>Quote Reference</span>
              <InputText v-model="quote.reference" />
            </label>
            <label class="consolidation-field">
              <span>Valid Until</span>
              <InputText v-model="quote.validUntil" type="date" />
            </label>
            <label class="consolidation-field">
              <span>Status</span>
              <Dropdown v-model="quote.status" :options="quoteStatusOptions" />
            </label>
          </div>

          <div class="consolidation-table-wrap consolidation-table-wrap--mt">
            <table class="consolidation-table consolidation-table--inputs">
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
                <tr v-for="line in quoteLines" :key="line.id">
                  <td><Dropdown v-model="line.description" :options="chargeOptions" /></td>
                  <td><InputNumber v-model="line.qty" :min="0" /></td>
                  <td><Dropdown v-model="line.unit" :options="unitOptions" /></td>
                  <td><InputNumber v-model="line.rate" :min-fraction-digits="2" /></td>
                  <td>{{ money("GBP", line.qty * line.rate) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">Quote Subtotal</td>
                  <td>{{ money("GBP", quoteSubtotal) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div
            class="consolidation-form-grid consolidation-form-grid--two consolidation-table-wrap--mt"
          >
            <label class="consolidation-field">
              <span>Notes to Customer</span>
              <Textarea v-model="quote.notes" rows="3" />
            </label>
            <label class="consolidation-field">
              <span>Terms and Conditions</span>
              <Textarea v-model="quote.terms" rows="3" />
            </label>
          </div>
        </div>
      </div>

      <aside class="consolidation-totals-card">
        <div class="consolidation-weight-breaks">
          <span>Weight Break Rate Reference</span>
          <table>
            <tbody>
              <tr v-for="rate in weightBreakRates" :key="rate.label">
                <td>{{ rate.label }}</td>
                <td>{{ money("GBP", rate.rate) }}{{ rate.perKg ? " / kg" : "" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <span>Domestic Total</span><strong>{{ money("GBP", domesticTotal) }}</strong>
        </div>
        <div>
          <span>Export Total</span><strong>{{ money("GBP", exportTotal) }}</strong>
        </div>
        <div>
          <span>Subtotal</span><strong>{{ money("GBP", customerInvoiceSubtotal) }}</strong>
        </div>
        <div class="consolidation-tax-row">
          <span>Tax Rate</span>
          <InputNumber v-model="taxRate" suffix="%" :min="0" :max="100" :min-fraction-digits="1" />
        </div>
        <div>
          <span>Tax</span><strong>{{ money("GBP", customerInvoiceTax) }}</strong>
        </div>
        <div class="consolidation-totals-card__grand">
          <span>Invoice Total</span><strong>{{ money("GBP", customerInvoiceTotal) }}</strong>
        </div>
      </aside>
    </div>
  </section>
</template>
