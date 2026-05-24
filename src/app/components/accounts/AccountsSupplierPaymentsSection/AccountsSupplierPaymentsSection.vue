<script setup lang="ts">
import "./AccountsSupplierPaymentsSection.css"

import { computed, ref } from "vue"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

import { downloadCsv, parseCsvFile, useAccountsDemo } from "@/app/composables/useAccountsDemo"

const {
  state,
  selectedSupplier,
  supplierSummary,
  money,
  statusLabel,
  statusTone,
  approveSuppliers,
  scheduleSuppliers,
  paySuppliers,
  saveState,
} = useAccountsDemo()

const selectedStatus = ref("all")
const selectedPaymentMethod = ref("Bank Transfer")
const selectedExportFormat = ref("CSV Bank File")
const searchText = ref("")
const selectedSupplierIds = ref<string[]>([])
const supplierImportInput = ref<HTMLInputElement | null>(null)

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

const allVisibleSelected = computed(
  () =>
    filteredSuppliers.value.length > 0 &&
    filteredSuppliers.value.every(invoice => selectedSupplierIds.value.includes(invoice.id)),
)

function toggleAllSuppliers(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const visibleIds = filteredSuppliers.value.map(invoice => invoice.id)
  selectedSupplierIds.value = checked
    ? Array.from(new Set([...selectedSupplierIds.value, ...visibleIds]))
    : selectedSupplierIds.value.filter(id => !visibleIds.includes(id))
}

function idsOrCurrent() {
  if (selectedSupplierIds.value.length) return selectedSupplierIds.value
  return selectedSupplier.value ? [selectedSupplier.value.id] : []
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

async function importSupplierCsv(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const [, ...rows] = await parseCsvFile(file)
  rows.forEach(row => {
    state.supplierInvoices.push({
      id: row[0] || `PINV-${Date.now()}`,
      supplierInvoice: row[1] || "",
      job: row[2] || "",
      supplier: row[3] || "",
      supplierCode: "",
      user: "",
      mode: row[4] || "",
      invoiceDate: row[5] || "",
      dueDate: row[6] || "",
      amount: Number(row[7] || 0),
      currency: row[8] || "GBP",
      approved: String(row[9]).toLowerCase() === "true",
      approvedDate: row[10] || "",
      paid: String(row[11]).toLowerCase() === "true",
      paidDate: row[12] || "",
      status:
        row[13] === "paid"
          ? "paid"
          : row[13] === "scheduled"
            ? "scheduled"
            : row[13] === "approved"
              ? "approved"
              : row[13] === "overdue"
                ? "overdue"
                : "pending",
      paymentMethod: row[14] || "Bank Transfer",
      chargeDescription: row[15] || "",
      taxCode: row[16] || "",
      bank: {
        bankName: row[17] || "",
        iban: row[18] || "",
        swift: row[19] || "",
        accountNumber: row[18] || "",
        country: row[20] || "",
      },
    })
  })
  ;(event.target as HTMLInputElement).value = ""
  saveState()
}
</script>

<template>
  <div class="accounts-supplier-payments">
    <input
      ref="supplierImportInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="importSupplierCsv"
    />

    <section class="accounts-supplier-payments__hero">
      <div class="accounts-supplier-payments__hero-head">
        <div>
          <div class="accounts-supplier-payments__eyebrow">SUPPLIER PAYMENTS</div>
          <h2 class="accounts-supplier-payments__title">
            Supplier invoices, job costs, approvals and payment control
          </h2>
        </div>

        <div class="accounts-supplier-payments__hero-actions">
          <Button
            label="Export Supplier CSV"
            class="btn btn--ghost"
            size="small"
            @click="exportSupplierCsv"
          />
          <Button
            label="Import Supplier CSV"
            class="btn btn--ghost"
            size="small"
            @click="supplierImportInput?.click()"
          />
          <Button
            label="Approve Selected"
            class="btn btn--ghost"
            size="small"
            @click="approveSuppliers(idsOrCurrent())"
          />
          <Button
            label="Pay Selected"
            class="btn btn--primary"
            size="small"
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
          <h3>Supplier Invoice Register</h3>

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

        <div class="accounts-supplier-payments__table-wrap">
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
              <tr
                v-for="row in filteredSuppliers"
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
                <td>
                  <span
                    class="accounts-supplier-payments__pill"
                    :class="`accounts-supplier-payments__pill--${statusTone(row.status)}`"
                  >
                    {{ statusLabel(row.status, row.dueDate) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
