<script setup lang="ts">
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const {
  addConsolidatedItem,
  consolidatedFreightCharge,
  consolidatedTotalsMap,
  filteredConsolidatedLines,
  invoiceCurrencies,
  money,
  packageBreakdown,
  selectedCurrencyDapTotal,
  selectedCurrencyGoodsTotal,
  selectedInvoiceCurrency,
  supplierTotalsMap,
  unitOptions,
} = context
</script>

<template>
  <section class="consolidation-section">
    <div class="consolidation-section__head">
      <div>
        <h2>Consolidated Invoices</h2>
        <p>Build the consolidated commercial invoice by currency for customs clearance.</p>
      </div>
      <div class="consolidation-page__actions">
        <Button label="Print Invoice" icon="pi pi-print" class="btn btn--ghost" />
        <Button
          label="Add Item"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="addConsolidatedItem"
        />
      </div>
    </div>

    <div class="consolidation-invoice-total-bar">
      <div>
        <div class="consolidation-subsection__title">Supplier Invoice Totals</div>
        <div class="consolidation-page__summary-row consolidation-page__summary-row--currency">
          <article v-for="currency in invoiceCurrencies" :key="`supplier-${currency}`">
            <span>{{ currency }}</span>
            <strong>{{ money(currency, supplierTotalsMap.get(currency) || 0) }}</strong>
          </article>
        </div>
      </div>
      <div>
        <div class="consolidation-subsection__title">Consolidated Invoice Totals</div>
        <div class="consolidation-page__summary-row consolidation-page__summary-row--currency">
          <article v-for="currency in invoiceCurrencies" :key="`goods-${currency}`">
            <span>{{ currency }}</span>
            <strong>{{ money(currency, consolidatedTotalsMap.get(currency) || 0) }}</strong>
          </article>
        </div>
      </div>
    </div>

    <div class="consolidation-currency-switch">
      <Button
        v-for="currency in invoiceCurrencies"
        :key="currency"
        :label="currency"
        class="btn"
        :class="selectedInvoiceCurrency === currency ? 'btn--primary' : 'btn--ghost'"
        @click="selectedInvoiceCurrency = currency"
      />
    </div>

    <div class="consolidation-table-wrap consolidation-table-wrap--mt">
      <table class="consolidation-table consolidation-table--inputs consolidation-table--wide">
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
          <tr v-for="(line, index) in filteredConsolidatedLines" :key="line.id">
            <td>{{ index + 1 }}</td>
            <td><InputText v-model="line.poRef" /></td>
            <td>{{ line.supplier || "-" }}</td>
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

    <div class="consolidation-invoice-bottom">
      <section class="consolidation-invoice-sheet">
        <div class="consolidation-subsection__title">Package Counts and Weight</div>
        <div class="consolidation-page__summary-row">
          <article>
            <span>Crates</span><strong>{{ packageBreakdown.crates }}</strong>
          </article>
          <article>
            <span>Pallets</span><strong>{{ packageBreakdown.pallets }}</strong>
          </article>
          <article>
            <span>Cartons</span><strong>{{ packageBreakdown.cartons }}</strong>
          </article>
          <article>
            <span>Jiffy Bags</span><strong>{{ packageBreakdown.jiffies }}</strong>
          </article>
          <article>
            <span>Total Net Weight</span><strong>{{ packageBreakdown.net.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Total Gross Weight</span
            ><strong>{{ packageBreakdown.gross.toFixed(1) }} kg</strong>
          </article>
        </div>
      </section>

      <section class="consolidation-invoice-sheet">
        <div class="consolidation-subsection__title">
          Value Breakdown - {{ selectedInvoiceCurrency }}
        </div>
        <div class="consolidation-form-grid consolidation-form-grid--three">
          <label class="consolidation-field">
            <span>Total Value of Goods EXW</span>
            <InputText
              :model-value="money(selectedInvoiceCurrency, selectedCurrencyGoodsTotal)"
              readonly
            />
          </label>
          <label class="consolidation-field">
            <span>Freight Charges</span>
            <InputNumber v-model="consolidatedFreightCharge" :min-fraction-digits="2" />
          </label>
          <label class="consolidation-field">
            <span>Total Value of Goods DAP</span>
            <InputText
              :model-value="money(selectedInvoiceCurrency, selectedCurrencyDapTotal)"
              readonly
            />
          </label>
        </div>
      </section>
    </div>
  </section>
</template>
