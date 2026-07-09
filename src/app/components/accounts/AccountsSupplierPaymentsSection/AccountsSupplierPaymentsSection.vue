<script setup lang="ts">
import "./AccountsSupplierPaymentsSection.css"

import { computed, onMounted, ref, watch } from "vue"
import type { PageState } from "primevue/paginator"
import { storeToRefs } from "pinia"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Paginator from "primevue/paginator"

import { useAccountsSummaryStore } from "@/app/stores/accounts-summary"
import { downloadCsv } from "@/app/utils/download-csv"

const accountsSummaryStore = useAccountsSummaryStore()
const state = accountsSummaryStore
const { selectedSupplier } = storeToRefs(accountsSummaryStore)

onMounted(() => {
  accountsSummaryStore.fetch().catch(() => null)
})

const selectedStatus = ref("all")
const selectedPaymentMethod = ref("Bank Transfer")
const selectedExportFormat = ref("CSV Bank File")
const searchText = ref("")
const currentPage = ref(1)
const perPage = ref(25)
const selectedSupplierIds = ref<string[]>([])

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending Approval", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
]
const paymentMethodOptions = ["Bank Transfer", "SWIFT Transfer", "SEPA Transfer"].map(value => ({
  label: value,
  value,
}))
const exportFormatOptions = ["CSV Bank File", "Payment Advice PDF", "Supplier Batch Export"].map(
  value => ({ label: value, value }),
)

const supplierSummary = computed(() => {
  const baseCurrency = state.supplierInvoices[0]?.baseCurrency || "GBP"
  const total = state.supplierInvoices.reduce(
    (sum, invoice) => sum + (invoice.baseAmount ?? invoice.amount),
    0,
  )
  const approved = state.supplierInvoices
    .filter(invoice => invoice.approved)
    .reduce((sum, invoice) => sum + (invoice.baseAmount ?? invoice.amount), 0)
  const paid = state.supplierInvoices
    .filter(invoice => invoice.paid)
    .reduce((sum, invoice) => sum + (invoice.baseAmount ?? invoice.amount), 0)
  const overdue = state.supplierInvoices.filter(invoice => invoice.status === "overdue").length

  return [
    { label: "Supplier Cost Lines", value: String(state.supplierInvoices.length) },
    { label: "Pending Payment", value: money(total - paid, baseCurrency) },
    { label: "Approved", value: money(approved, baseCurrency) },
    { label: "Paid", value: money(paid, baseCurrency) },
    { label: "Overdue", value: String(overdue) },
  ]
})

const filteredSuppliers = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  return state.supplierInvoices.filter(invoice => {
    const statusMatch = selectedStatus.value === "all" || invoice.status === selectedStatus.value
    const text = [invoice.supplierInvoice, invoice.job, invoice.supplier, invoice.mode]
      .join(" ")
      .toLowerCase()
    return statusMatch && (!query || text.includes(query))
  })
})

const firstRow = computed(() => (currentPage.value - 1) * perPage.value)
const paginatedSuppliers = computed(() => {
  const start = firstRow.value

  return filteredSuppliers.value.slice(start, start + perPage.value)
})
const supplierCountsText = computed(() => {
  if (!filteredSuppliers.value.length) return "Showing 0 of 0 supplier invoice(s)"

  const from = firstRow.value + 1
  const to = Math.min(firstRow.value + perPage.value, filteredSuppliers.value.length)

  return `Showing ${from}-${to} of ${filteredSuppliers.value.length} supplier invoice(s)`
})

const allVisibleSelected = computed(
  () =>
    paginatedSuppliers.value.length > 0 &&
    paginatedSuppliers.value.every(invoice => selectedSupplierIds.value.includes(invoice.id)),
)

function toggleAllSuppliers(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const visibleIds = paginatedSuppliers.value.map(invoice => invoice.id)
  selectedSupplierIds.value = checked
    ? Array.from(new Set([...selectedSupplierIds.value, ...visibleIds]))
    : selectedSupplierIds.value.filter(id => !visibleIds.includes(id))
}

function onSupplierPage(event: PageState) {
  currentPage.value = event.page + 1
  perPage.value = event.rows
}

function idsOrCurrent() {
  if (selectedSupplierIds.value.length) return selectedSupplierIds.value
  return selectedSupplier.value ? [selectedSupplier.value.id] : []
}

function money(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    currencyDisplay: "narrowSymbol",
  }).format(Number.isFinite(value) ? value : 0)
}

function statusTone(status: string) {
  if (status === "paid") return "success"
  if (status === "approved" || status === "scheduled") return "info"
  if (status === "overdue") return "danger"
  return "warning"
}

function statusLabel(status: string, dueDate = "") {
  if (status === "paid") return "Paid"
  if (status === "approved") return "Approved"
  if (status === "scheduled") return "Scheduled"
  if (status === "overdue") return "Overdue"
  return "Pending"
}

function statusDetail(status: string, dueDate = "") {
  if (!dueDate || status === "paid") return ""
  if (status === "overdue") return `Due ${dueDate}`
  if (status === "pending") return `Due ${dueDate}`
  return ""
}

function approveSuppliers(ids: string[]) {
  accountsSummaryStore.approveSuppliers(ids)
}

function scheduleSuppliers(ids: string[]) {
  accountsSummaryStore.scheduleSuppliers(ids)
}

function paySuppliers(ids: string[], method: string) {
  accountsSummaryStore.paySuppliers(ids, method)
}

function exportSupplierCsv() {
  downloadCsv("supplier_invoices.csv", [
    [
      "ID",
      "SupplierInvoiceNo",
      "JobNo",
      "Supplier",
      "Mode",
      "InvoiceDate",
      "DueDate",
      "Amount",
      "Currency",
      "Approved",
      "ApprovedDate",
      "Paid",
      "PaidDate",
      "Status",
      "PaymentMethod",
      "ChargeDesc",
      "TaxCode",
      "BankName",
      "IBAN",
      "SWIFT",
      "Country",
    ],
    ...state.supplierInvoices.map(row => [
      row.id,
      row.supplierInvoice,
      row.job,
      row.supplier,
      row.mode,
      row.invoiceDate,
      row.dueDate,
      row.amount,
      row.currency,
      row.approved,
      row.approvedDate,
      row.paid,
      row.paidDate,
      row.status,
      row.paymentMethod,
      row.chargeDescription,
      row.taxCode,
      row.bank.bankName,
      row.bank.iban || row.bank.accountNumber,
      row.bank.swift,
      row.bank.country,
    ]),
  ])
}

function exportPaymentFile() {
  const ids = idsOrCurrent()
  const rows = state.supplierInvoices.filter(invoice => ids.includes(invoice.id))
  downloadCsv("supplier_payment_file.csv", [
    [
      "Supplier",
      "Invoice",
      "Currency",
      "Amount",
      "Method",
      "Bank",
      "IBAN/Account",
      "SWIFT",
      "Country",
    ],
    ...rows.map(row => [
      row.supplier,
      row.supplierInvoice,
      row.currency,
      row.amount,
      selectedPaymentMethod.value,
      row.bank.bankName,
      row.bank.iban || row.bank.accountNumber,
      row.bank.swift,
      row.bank.country,
    ]),
  ])
}

watch([selectedStatus, searchText], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="accounts-supplier-payments">
    <section class="accounts-supplier-payments__hero">
      <div class="accounts-supplier-payments__hero-head">
        <div>
          <div class="accounts-supplier-payments__eyebrow">SUPPLIER PAYMENTS</div>
          <h2 class="accounts-supplier-payments__title">
            Supplier invoices, job costs, approvals and payment control
          </h2>
        </div>

        <div class="accounts-supplier-payments__hero-actions">
          <Button label="Export Supplier CSV" class="btn btn--ghost" @click="exportSupplierCsv" />
          <Button
            label="Approve Selected"
            class="btn btn--ghost"
            @click="approveSuppliers(idsOrCurrent())"
          />
          <Button
            label="Pay Selected"
            class="btn btn--primary"
            @click="paySuppliers(idsOrCurrent(), selectedPaymentMethod)"
          />
        </div>
      </div>

      <div class="accounts-supplier-payments__summary-grid">
        <div
          v-for="card in supplierSummary"
          :key="card.label"
          class="accounts-supplier-payments__summary-card"
        >
          <div class="accounts-supplier-payments__summary-label">{{ card.label }}</div>
          <div class="accounts-supplier-payments__summary-value">{{ card.value }}</div>
        </div>
      </div>
    </section>

    <div class="accounts-supplier-payments__grid accounts-supplier-payments__grid--top">
      <section class="accounts-supplier-payments__panel">
        <div class="accounts-supplier-payments__panel-head">
          <div>
            <h3>Supplier Invoice Register</h3>
            <div class="accounts-supplier-payments__counts">{{ supplierCountsText }}</div>
          </div>

          <div class="accounts-supplier-payments__filters">
            <InputText
              v-model="searchText"
              placeholder="Search supplier, invoice, job, mode..."
              class="accounts-supplier-payments__search"
            />
            <Dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="All statuses"
              class="accounts-supplier-payments__status-filter"
            />
          </div>
        </div>

        <div
          class="accounts-supplier-payments__table-wrap accounts-supplier-payments__table-wrap--register"
        >
          <div v-if="state.loading" class="accounts-supplier-payments__loading-bar" />
          <table class="accounts-supplier-payments__table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <input
                    type="checkbox"
                    :checked="allVisibleSelected"
                    @change="toggleAllSuppliers"
                  />
                </th>
                <th>Supplier Inv</th>
                <th>Job</th>
                <th>Supplier</th>
                <th>Mode</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Approved</th>
                <th>Paid</th>
                <th>Paid Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="state.loading">
                <td colspan="12" class="accounts-supplier-payments__table-message">
                  Loading supplier invoice register...
                </td>
              </tr>
              <tr v-else-if="state.error">
                <td colspan="12" class="accounts-supplier-payments__table-message">
                  {{ state.error }}
                </td>
              </tr>
              <tr v-else-if="!filteredSuppliers.length">
                <td colspan="12" class="accounts-supplier-payments__table-message">
                  No supplier invoices found yet.
                </td>
              </tr>
              <tr
                v-for="row in paginatedSuppliers"
                :key="row.id"
                @click="state.selectedSupplierId = row.id"
              >
                <td class="checkbox-col" @click.stop>
                  <input v-model="selectedSupplierIds" type="checkbox" :value="row.id" />
                </td>
                <td>{{ row.supplierInvoice }}</td>
                <td>{{ row.job }}</td>
                <td>{{ row.supplier }}</td>
                <td>{{ row.mode }}</td>
                <td>{{ row.invoiceDate }}</td>
                <td>{{ row.dueDate }}</td>
                <td>{{ money(row.amount, row.currency) }}</td>
                <td>{{ row.approvedDate || "-" }}</td>
                <td>{{ row.paid ? money(row.amount, row.currency) : "-" }}</td>
                <td>{{ row.paidDate || "-" }}</td>
                <td class="accounts-supplier-payments__status-cell">
                  <span
                    class="accounts-supplier-payments__pill"
                    :class="`accounts-supplier-payments__pill--${statusTone(row.status)}`"
                  >
                    {{ statusLabel(row.status, row.dueDate) }}
                  </span>
                  <span
                    v-if="statusDetail(row.status, row.dueDate)"
                    class="accounts-supplier-payments__status-detail"
                  >
                    {{ statusDetail(row.status, row.dueDate) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Paginator
          v-if="filteredSuppliers.length > 0"
          :rows="perPage"
          :total-records="filteredSuppliers.length"
          :first="firstRow"
          :rows-per-page-options="[15, 25, 50, 100]"
          class="accounts-supplier-payments__paginator"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          @page="onSupplierPage"
        />
      </section>

      <aside
        v-if="selectedSupplier"
        class="accounts-supplier-payments__panel accounts-supplier-payments__detail"
      >
        <div class="accounts-supplier-payments__panel-head">
          <h3>Supplier Detail</h3>
          <span class="accounts-supplier-payments__linked-pill">Job cost linked</span>
        </div>

        <div class="accounts-supplier-payments__detail-stack">
          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">
              {{ selectedSupplier.supplierInvoice }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              {{ selectedSupplier.supplier }} · Job {{ selectedSupplier.job }}
            </div>
          </div>
          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Financial</div>
            <div class="accounts-supplier-payments__detail-text">
              Purchase: {{ money(selectedSupplier.amount, selectedSupplier.currency) }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              Approved:
              {{ selectedSupplier.approved ? `Yes on ${selectedSupplier.approvedDate}` : "No" }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              Paid: {{ selectedSupplier.paid ? `Yes on ${selectedSupplier.paidDate}` : "No" }}
            </div>
          </div>
          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Banking</div>
            <div class="accounts-supplier-payments__detail-text">
              Bank: {{ selectedSupplier.bank.bankName }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              IBAN/Account: {{ selectedSupplier.bank.iban || selectedSupplier.bank.accountNumber }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              SWIFT: {{ selectedSupplier.bank.swift }}
            </div>
          </div>
          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Coding</div>
            <div class="accounts-supplier-payments__detail-text">
              Charge: {{ selectedSupplier.chargeDescription }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              Tax Code: {{ selectedSupplier.taxCode }}
            </div>
            <div class="accounts-supplier-payments__detail-text">
              Payment Method: {{ selectedSupplier.paymentMethod }}
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="accounts-supplier-payments__grid accounts-supplier-payments__grid--bottom">
      <section class="accounts-supplier-payments__panel">
        <div class="accounts-supplier-payments__panel-head"><h3>Payment Processing</h3></div>

        <div class="accounts-supplier-payments__form-grid">
          <div class="accounts-supplier-payments__field">
            <label>Payment Method</label>
            <Dropdown
              v-model="selectedPaymentMethod"
              :options="paymentMethodOptions"
              option-label="label"
              option-value="value"
              class="accounts-supplier-payments__field-control"
            />
          </div>
          <div class="accounts-supplier-payments__field">
            <label>Export Format</label>
            <Dropdown
              v-model="selectedExportFormat"
              :options="exportFormatOptions"
              option-label="label"
              option-value="value"
              class="accounts-supplier-payments__field-control"
            />
          </div>
        </div>

        <div class="accounts-supplier-payments__field accounts-supplier-payments__field--full">
          <label>Compatibility Notes</label>
          <textarea class="accounts-supplier-payments__textarea" rows="4" readonly>
Supplier payment records include supplier invoice number, linked job, charge lines, nominal purchase code, tax code, bank payment method, beneficiary account fields and payment references. The structure is designed for future supplier banking export, international bank export mapping, including transactions out and supplier settlement status.
          </textarea>
        </div>

        <div class="accounts-supplier-payments__panel-actions">
          <Button
            label="Schedule Selected"
            class="btn btn--ghost"
            size="small"
            @click="scheduleSuppliers(idsOrCurrent())"
          />
          <Button
            label="Export Payment File"
            class="btn btn--primary"
            size="small"
            @click="exportPaymentFile"
          />
        </div>

        <div class="accounts-supplier-payments__log-stack">
          <div
            v-for="log in state.supplierLog"
            :key="log.id"
            class="accounts-supplier-payments__log-card"
          >
            <div class="accounts-supplier-payments__log-title">{{ log.title }}</div>
            <div class="accounts-supplier-payments__log-text">{{ log.ts }} · {{ log.text }}</div>
          </div>
        </div>
      </section>

      <section class="accounts-supplier-payments__panel">
        <div class="accounts-supplier-payments__panel-head">
          <h3>Supplier Banking Snapshot</h3>
          <span>Beneficiary details used for international payment export</span>
        </div>

        <div class="accounts-supplier-payments__table-wrap">
          <table
            class="accounts-supplier-payments__table accounts-supplier-payments__table--banking"
          >
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Currency</th>
                <th>Beneficiary Bank</th>
                <th>IBAN / Account</th>
                <th>SWIFT</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in state.supplierInvoices" :key="`${row.supplier}-${row.currency}`">
                <td>{{ row.supplier }}</td>
                <td>{{ row.currency }}</td>
                <td>{{ row.bank.bankName }}</td>
                <td>{{ row.bank.iban || row.bank.accountNumber }}</td>
                <td>{{ row.bank.swift }}</td>
                <td>{{ row.bank.country }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
