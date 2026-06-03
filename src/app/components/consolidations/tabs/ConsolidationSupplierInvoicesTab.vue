<script setup lang="ts">
import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import InputText from "primevue/inputtext"
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const {
  activeSupplierName,
  formatCurrencyTotals,
  invoiceCurrencies,
  invoiceTotals,
  money,
  openSupplierCollectionLinkModal,
  openSupplierInvoiceModal,
  selectedSupplierSummary,
  supplierExaNumbers,
  supplierInvoices,
  supplierInvoicesByCurrency,
  supplierSummaries,
  supplierTotalsMap,
} = context
</script>

<template>
  <section class="consolidation-section">
    <div class="consolidation-section__head">
      <div>
        <h2>Supplier Invoices</h2>
        <p>Capture supplier invoice header data and item dimensions before consolidation.</p>
      </div>
      <div class="consolidation-section__actions">
        <Button
          label="Add Supplier Invoice"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="openSupplierInvoiceModal"
        />
        <Button
          label="Add Supplier Invoice to Collection"
          icon="pi pi-link"
          class="btn btn--ghost"
          @click="openSupplierCollectionLinkModal"
        />
      </div>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__head-row">
        <div>
          <div class="consolidation-subsection__title">Supplier Overview</div>
          <p class="consolidation-note">
            Each supplier gets a tab with invoice totals and the EXA customs document number.
          </p>
        </div>
      </div>

      <nav class="consolidation-supplier-tabs" aria-label="Supplier invoice tabs">
        <button
          v-for="supplier in supplierSummaries"
          :key="supplier.name"
          type="button"
          class="consolidation-supplier-tab"
          :class="{
            'consolidation-supplier-tab--active': activeSupplierName === supplier.name,
          }"
          @click="activeSupplierName = supplier.name"
        >
          <span>{{ supplier.name }}</span>
          <small>{{ supplier.invoiceCount }} invoices</small>
        </button>
      </nav>

      <div v-if="selectedSupplierSummary" class="consolidation-supplier-panel">
        <div class="consolidation-form-grid consolidation-form-grid--three">
          <label class="consolidation-field">
            <span>Supplier</span>
            <InputText :model-value="selectedSupplierSummary.name" readonly />
          </label>
          <label class="consolidation-field">
            <span>EXA Number / Customs Document</span>
            <InputText
              v-model="supplierExaNumbers[selectedSupplierSummary.name]"
              placeholder="Enter EXA number"
            />
          </label>
          <label class="consolidation-field">
            <span>Total Value</span>
            <InputText
              :model-value="formatCurrencyTotals(selectedSupplierSummary.valueByCurrency)"
              readonly
            />
          </label>
        </div>

        <div class="consolidation-page__summary-row">
          <article>
            <span>Qty / Packages</span><strong>{{ selectedSupplierSummary.totalCollies }}</strong>
          </article>
          <article>
            <span>Total Net Weight</span
            ><strong>{{ selectedSupplierSummary.totalNet.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Total Gross Weight</span
            ><strong>{{ selectedSupplierSummary.totalGross.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Invoices</span><strong>{{ selectedSupplierSummary.invoiceCount }}</strong>
          </article>
        </div>

        <DataTable
          :value="selectedSupplierSummary.invoices"
          responsive-layout="scroll"
          class="consolidation-datatable consolidation-datatable--mt"
        >
          <Column field="supplierInvoiceNumber" header="Invoice No" />
          <Column field="customerPoRef" header="Customer PO" />
          <Column field="invoiceDate" header="Invoice Date" />
          <Column field="collectionRef" header="Collection" />
          <Column header="Qty">
            <template #body="{ data }">{{ invoiceTotals(data).collies }}</template>
          </Column>
          <Column header="Net kg">
            <template #body="{ data }">{{ invoiceTotals(data).net.toFixed(1) }}</template>
          </Column>
          <Column header="Gross kg">
            <template #body="{ data }">{{ invoiceTotals(data).gross.toFixed(1) }}</template>
          </Column>
          <Column header="Value">
            <template #body="{ data }">{{ money(data.currency, data.invoiceValue) }}</template>
          </Column>
        </DataTable>
      </div>
    </div>

    <DataTable
      :value="supplierInvoices"
      responsive-layout="scroll"
      class="consolidation-datatable consolidation-datatable--mt"
    >
      <Column field="supplierName" header="Supplier" />
      <Column field="customerPoRef" header="Customer PO" />
      <Column field="supplierInvoiceNumber" header="Invoice No" />
      <Column field="collectionRef" header="Collection" />
      <Column field="label" header="Label" />
      <Column header="Value">
        <template #body="{ data }">{{ money(data.currency, data.invoiceValue) }}</template>
      </Column>
      <Column header="Items">
        <template #body="{ data }">{{ data.items.length }}</template>
      </Column>
    </DataTable>

    <div class="consolidation-currency-sections">
      <article
        v-for="currency in invoiceCurrencies"
        :key="currency"
        class="consolidation-currency-card"
      >
        <div class="consolidation-subsection__head-row">
          <div class="consolidation-subsection__title">{{ currency }} Supplier Invoices</div>
          <span class="consolidation-status">
            {{ money(currency, supplierTotalsMap.get(currency) || 0) }}
          </span>
        </div>
        <DataTable
          :value="supplierInvoicesByCurrency(currency)"
          responsive-layout="scroll"
          class="consolidation-datatable"
        >
          <Column field="supplierName" header="Supplier" />
          <Column field="customerPoRef" header="PO Ref" />
          <Column field="supplierInvoiceNumber" header="Inv No" />
          <Column field="invoiceDate" header="Date" />
          <Column header="Value">
            <template #body="{ data }">{{ money(data.currency, data.invoiceValue) }}</template>
          </Column>
          <Column header="Qty">
            <template #body="{ data }">{{ invoiceTotals(data).collies }}</template>
          </Column>
          <Column header="Gross">
            <template #body="{ data }">{{ invoiceTotals(data).gross.toFixed(1) }}</template>
          </Column>
          <Column field="collectionRef" header="Collection Ref" />
          <Column field="label" header="Label" />
        </DataTable>
      </article>
    </div>
  </section>
</template>
