<script setup lang="ts">
import "./JobConsolidationTabs.css"
import { computed, reactive } from "vue"

import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"

import { getPackageStackOption, setPackageStackOption } from "@/app/utils/packageStacking"
import type {
  JobConsolidationSupplierInvoice,
  JobConsolidationSupplierItem,
} from "@/app/types/transport-job"
import {
  createSupplierItem,
  currencyOptions,
  makeId,
  money,
  packageOptions,
  supplierInvoiceTotals,
  useJobConsolidationContext,
} from "./JobConsolidationTabs.shared"

const context = useJobConsolidationContext()
const details = context.form.consolidation_details

const draft = reactive<JobConsolidationSupplierInvoice>({
  id: makeId(),
  supplierName: "",
  customerPoRef: "",
  supplierInvoiceNumber: "",
  invoiceDate: "",
  currency: "GBP",
  invoiceValue: 0,
  collectionRef: "",
  label: "",
  items: [createSupplierItem()],
})

function isAdrPackage(item: JobConsolidationSupplierItem) {
  return item.adr === "Yes"
}

function setAdrPackage(item: JobConsolidationSupplierItem, checked: boolean) {
  item.adr = checked ? "Yes" : "No"
}

const supplierSummaries = computed(() => {
  const summaries = new Map<
    string,
    { name: string; invoiceCount: number; collies: number; gross: number; value: number }
  >()

  details.supplierInvoices.forEach(invoice => {
    const name = invoice.supplierName || "Unnamed Supplier"
    const totals = supplierInvoiceTotals(invoice)
    const current = summaries.get(name) || { name, invoiceCount: 0, collies: 0, gross: 0, value: 0 }

    current.invoiceCount += 1
    current.collies += totals.collies
    current.gross += totals.gross
    current.value += Number(invoice.invoiceValue || 0)
    summaries.set(name, current)
  })

  return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const totalValue = computed(() =>
  details.supplierInvoices.reduce((sum, invoice) => sum + Number(invoice.invoiceValue || 0), 0),
)

function addItem() {
  draft.items.push(createSupplierItem())
}

function removeItem(item: JobConsolidationSupplierItem) {
  if (draft.items.length === 1) return
  draft.items = draft.items.filter(row => row.id !== item.id)
}

function resetDraft() {
  Object.assign(draft, {
    id: makeId(),
    supplierName: "",
    customerPoRef: "",
    supplierInvoiceNumber: "",
    invoiceDate: "",
    currency: "GBP",
    invoiceValue: 0,
    collectionRef: "",
    label: String(details.supplierInvoices.length + 1),
    items: [createSupplierItem()],
  })
}

function addSupplierInvoice() {
  const supplierName = draft.supplierName.trim() || "Unnamed Supplier"

  details.supplierInvoices.unshift({
    ...draft,
    id: makeId(),
    supplierName,
    items: draft.items.map(item => ({ ...item, id: makeId() })),
  })

  if (!(supplierName in details.supplierExaNumbers)) {
    details.supplierExaNumbers[supplierName] = ""
  }

  resetDraft()
}
</script>

<template>
  <section class="job-consolidation-tab">
      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h2>Supplier Invoices</h2>
            <p>Capture supplier invoice header data and item dimensions before consolidation.</p>
          </div>

          <Button
            label="Add Item"
            icon="pi pi-plus"
            class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
            type="button"
            @click="addItem"
          />
        </header>

        <div class="job-consolidation-tab__grid">
          <label class="job-consolidation-tab__field">
            <span>Supplier</span>
            <InputText v-model="draft.supplierName" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Customer PO Ref</span>
            <InputText v-model="draft.customerPoRef" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Supplier Invoice No</span>
            <InputText v-model="draft.supplierInvoiceNumber" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Invoice Date</span>
            <InputText v-model="draft.invoiceDate" type="date" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Currency</span>
            <Dropdown v-model="draft.currency" :options="currencyOptions" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Invoice Value</span>
            <InputNumber v-model="draft.invoiceValue" :min-fraction-digits="2" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Collection Ref</span>
            <InputText v-model="draft.collectionRef" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Shipping Label</span>
            <InputText v-model="draft.label" />
          </label>
        </div>

        <div
          class="job-consolidation-tab__table-wrap job-consolidation-tab__supplier-package-wrap"
        >
          <table
            class="job-consolidation-tab__table job-consolidation-tab__table--inputs job-consolidation-tab__supplier-package-table"
          >
            <colgroup>
              <col class="job-consolidation-tab__package-col--index" />
              <col class="job-consolidation-tab__package-col--package" />
              <col class="job-consolidation-tab__package-col--qty" />
              <col class="job-consolidation-tab__package-col--measure" />
              <col class="job-consolidation-tab__package-col--measure" />
              <col class="job-consolidation-tab__package-col--measure" />
              <col class="job-consolidation-tab__package-col--kg" />
              <col class="job-consolidation-tab__package-col--kg" />
              <col class="job-consolidation-tab__package-col--check" />
              <col class="job-consolidation-tab__package-col--check-wide" />
              <col class="job-consolidation-tab__package-col--check-wide" />
              <col class="job-consolidation-tab__package-col--check-wide" />
              <col class="job-consolidation-tab__package-col--action" />
            </colgroup>
            <thead>
              <tr>
                <th class="job-consolidation-tab__item-heading">#</th>
                <th class="job-consolidation-tab__package-heading">Package</th>
                <th class="job-consolidation-tab__compact-heading">Qty</th>
                <th class="job-consolidation-tab__compact-heading">Length</th>
                <th class="job-consolidation-tab__compact-heading">Width</th>
                <th class="job-consolidation-tab__compact-heading">Height</th>
                <th class="job-consolidation-tab__kg-heading">Net kg</th>
                <th class="job-consolidation-tab__kg-heading">Gross kg</th>
                <th class="job-consolidation-tab__check-heading">ADR</th>
                <th class="job-consolidation-tab__check-heading">Stackable</th>
                <th class="job-consolidation-tab__check-heading">Non-Stack</th>
                <th class="job-consolidation-tab__check-heading">Top-Loadable</th>
                <th class="job-consolidation-tab__action-heading">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in draft.items" :key="item.id">
                <td class="job-consolidation-tab__item-number" data-label="#">{{ index + 1 }}</td>
                <td class="job-consolidation-tab__package-cell" data-label="Package">
                  <Dropdown v-model="item.packageType" :options="packageOptions" />
                </td>
                <td class="job-consolidation-tab__compact-cell" data-label="Qty">
                  <InputNumber
                    v-model="item.collie"
                    class="job-consolidation-tab__number--compact"
                    :min="1"
                    :max="9999"
                  />
                </td>
                <td class="job-consolidation-tab__compact-cell" data-label="Length">
                  <InputNumber
                    v-model="item.length"
                    class="job-consolidation-tab__number--compact"
                    :min="0"
                    :max="9999"
                  />
                </td>
                <td class="job-consolidation-tab__compact-cell" data-label="Width">
                  <InputNumber
                    v-model="item.width"
                    class="job-consolidation-tab__number--compact"
                    :min="0"
                    :max="9999"
                  />
                </td>
                <td class="job-consolidation-tab__compact-cell" data-label="Height">
                  <InputNumber
                    v-model="item.height"
                    class="job-consolidation-tab__number--compact"
                    :min="0"
                    :max="9999"
                  />
                </td>
                <td class="job-consolidation-tab__kg-cell" data-label="Net kg">
                  <InputNumber
                    v-model="item.net"
                    class="job-consolidation-tab__number--kg"
                    :min="0"
                    :min-fraction-digits="1"
                  />
                </td>
                <td class="job-consolidation-tab__kg-cell" data-label="Gross kg">
                  <InputNumber
                    v-model="item.gross"
                    class="job-consolidation-tab__number--kg"
                    :min="0"
                    :min-fraction-digits="1"
                  />
                </td>
                <td class="job-consolidation-tab__check-cell" data-label="ADR">
                  <Checkbox
                    :model-value="isAdrPackage(item)"
                    binary
                    @update:model-value="setAdrPackage(item, $event)"
                  />
                </td>
                <td class="job-consolidation-tab__check-cell" data-label="Stackable">
                  <Checkbox
                    :model-value="getPackageStackOption(item) === 'stackable'"
                    binary
                    @update:model-value="setPackageStackOption(item, 'stackable')"
                  />
                </td>
                <td class="job-consolidation-tab__check-cell" data-label="Non-Stack">
                  <Checkbox
                    :model-value="getPackageStackOption(item) === 'non_stack'"
                    binary
                    @update:model-value="setPackageStackOption(item, 'non_stack')"
                  />
                </td>
                <td class="job-consolidation-tab__check-cell" data-label="Top-Loadable">
                  <Checkbox
                    :model-value="getPackageStackOption(item) === 'top_loadable'"
                    binary
                    @update:model-value="setPackageStackOption(item, 'top_loadable')"
                  />
                </td>
                <td class="job-consolidation-tab__action-cell" data-label="Action">
                  <Button
                    icon="pi pi-trash"
                    class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
                    type="button"
                    :disabled="draft.items.length === 1"
                    @click="removeItem(item)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-consolidation-tab__summary-row">
          <article>
            <span>Draft pieces</span>
            <strong>{{ supplierInvoiceTotals(draft).collies }}</strong>
          </article>
          <article>
            <span>Draft gross</span>
            <strong>{{ supplierInvoiceTotals(draft).gross.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Invoice value</span>
            <strong>{{ money(draft.currency, draft.invoiceValue) }}</strong>
          </article>
        </div>

        <div class="job-consolidation-tab__actions" style="margin-top: 12px">
          <Button
            label="Add Supplier Invoice"
            icon="pi pi-save"
            class="job-consolidation-tab__button job-consolidation-tab__button--primary"
            type="button"
            @click="addSupplierInvoice"
          />
        </div>
      </div>

      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h3>Supplier Summary</h3>
            <p>EXA customs references can be recorded against each supplier.</p>
          </div>
        </header>

        <div v-if="!details.supplierInvoices.length" class="job-consolidation-tab__empty">
          No supplier invoices added yet.
        </div>

        <div v-else class="job-consolidation-tab__table-wrap">
          <table class="job-consolidation-tab__table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Invoices</th>
                <th>Collies</th>
                <th>Gross kg</th>
                <th>Value</th>
                <th>EXA Customs No</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in supplierSummaries" :key="supplier.name">
                <td>{{ supplier.name }}</td>
                <td>{{ supplier.invoiceCount }}</td>
                <td>{{ supplier.collies }}</td>
                <td>{{ supplier.gross.toFixed(1) }}</td>
                <td>{{ money("GBP", supplier.value) }}</td>
                <td><InputText v-model="details.supplierExaNumbers[supplier.name]" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-consolidation-tab__summary-row">
          <article>
            <span>Total supplier invoices</span>
            <strong>{{ details.supplierInvoices.length }}</strong>
          </article>
          <article>
            <span>Total supplier value</span>
            <strong>{{ money("GBP", totalValue) }}</strong>
          </article>
        </div>
      </div>
  </section>
</template>
