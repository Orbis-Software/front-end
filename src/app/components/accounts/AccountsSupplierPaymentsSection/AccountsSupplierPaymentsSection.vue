<script setup lang="ts">
import "./AccountsSupplierPaymentsSection.css"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

type SupplierSummaryCard = {
  label: string
  value: string
}

type SupplierInvoiceRow = {
  id: number
  supplierInvoice: string
  job: string
  supplier: string
  mode: string
  invoiceDate: string
  dueDate: string
  amount: string
  approved: string
  paid: string
  paidDate: string
  status: string
  statusTone: "warning" | "danger" | "success"
}

type SupplierBankingRow = {
  supplier: string
  currency: string
  beneficiaryBank: string
  ibanOrAccount: string
  swift: string
  country: string
}

const summaryCards: SupplierSummaryCard[] = [
  { label: "Total Supplier Invoices", value: "4" },
  { label: "Outstanding to Pay", value: "£10,600.00" },
  { label: "Paid to Suppliers", value: "£5,100.00" },
  { label: "Approved", value: "3" },
  { label: "Overdue", value: "2" },
]

const supplierInvoices: SupplierInvoiceRow[] = [
  {
    id: 1,
    supplierInvoice: "MSC-UK-10482",
    job: "JOB-24091",
    supplier: "MSC Mediterranean Shipping Co.",
    mode: "Sea",
    invoiceDate: "2026-03-01",
    dueDate: "2026-03-15",
    amount: "£2,750.00",
    approved: "2026-03-02",
    paid: "-",
    paidDate: "-",
    status: "Approved",
    statusTone: "warning",
  },
  {
    id: 2,
    supplierInvoice: "LH-CARGO-8841",
    job: "JOB-24092",
    supplier: "Lufthansa Cargo",
    mode: "Air",
    invoiceDate: "2026-01-12",
    dueDate: "2026-02-10",
    amount: "€6,100.00",
    approved: "2026-01-13",
    paid: "-",
    paidDate: "-",
    status: "Overdue 31d",
    statusTone: "danger",
  },
  {
    id: 3,
    supplierInvoice: "TRK-56781",
    job: "JOB-24093",
    supplier: "Anatolia Road Transport",
    mode: "Road",
    invoiceDate: "2026-02-20",
    dueDate: "2026-03-05",
    amount: "US$5,100.00",
    approved: "2026-02-21",
    paid: "US$5,100.00",
    paidDate: "2026-02-28",
    status: "Paid",
    statusTone: "success",
  },
  {
    id: 4,
    supplierInvoice: "WH-22931-CST",
    job: "JOB-24094",
    supplier: "Haydock Storage Services",
    mode: "Warehouse",
    invoiceDate: "2025-12-12",
    dueDate: "2026-01-11",
    amount: "£1,750.00",
    approved: "-",
    paid: "-",
    paidDate: "-",
    status: "Overdue 61d",
    statusTone: "danger",
  },
]

const bankingSnapshotRows: SupplierBankingRow[] = [
  {
    supplier: "MSC Mediterranean Shipping Co.",
    currency: "GBP",
    beneficiaryBank: "HSBC UK",
    ibanOrAccount: "GB22HBUK04005112345678",
    swift: "MIDLGB22",
    country: "GB",
  },
  {
    supplier: "Lufthansa Cargo",
    currency: "EUR",
    beneficiaryBank: "Deutsche Bank",
    ibanOrAccount: "DE89370400440532013000",
    swift: "DEUTDEFF",
    country: "DE",
  },
  {
    supplier: "Anatolia Road Transport",
    currency: "USD",
    beneficiaryBank: "Garanti BBVA",
    ibanOrAccount: "TR330006100519786457841326",
    swift: "TGBATRIS",
    country: "TR",
  },
  {
    supplier: "Haydock Storage Services",
    currency: "GBP",
    beneficiaryBank: "Barclays Bank PLC",
    ibanOrAccount: "GB12BARC12345612345678",
    swift: "BARCGB22",
    country: "GB",
  },
]

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
]

const paymentMethodOptions = [
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "SWIFT Transfer", value: "swift-transfer" },
  { label: "SEPA Transfer", value: "sepa-transfer" },
]

const exportFormatOptions = [
  { label: "CSV Bank File", value: "csv-bank-file" },
  { label: "Payment Advice PDF", value: "payment-advice-pdf" },
  { label: "Supplier Batch Export", value: "supplier-batch-export" },
]

const selectedStatus = "all"
const selectedPaymentMethod = "bank-transfer"
const selectedExportFormat = "csv-bank-file"
const searchText = ""
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
          <Button label="Export Supplier CSV" class="btn btn--ghost" size="small" />
          <Button label="Import Supplier CSV" class="btn btn--ghost" size="small" />
          <Button label="Approve Selected" class="btn btn--ghost" size="small" />
          <Button label="Pay Selected" class="btn btn--primary" size="small" />
        </div>
      </div>

      <div class="accounts-supplier-payments__summary-grid">
        <div
          v-for="card in summaryCards"
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
              :model-value="searchText"
              placeholder="Search supplier, invoice, job, mode..."
              class="accounts-supplier-payments__search"
            />
            <Dropdown
              :model-value="selectedStatus"
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
                <th class="checkbox-col"></th>
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
              <tr v-for="row in supplierInvoices" :key="row.id">
                <td class="checkbox-col">
                  <input type="checkbox" />
                </td>
                <td>{{ row.supplierInvoice }}</td>
                <td>{{ row.job }}</td>
                <td>{{ row.supplier }}</td>
                <td>{{ row.mode }}</td>
                <td>{{ row.invoiceDate }}</td>
                <td>{{ row.dueDate }}</td>
                <td>{{ row.amount }}</td>
                <td>{{ row.approved }}</td>
                <td>{{ row.paid }}</td>
                <td>{{ row.paidDate }}</td>
                <td>
                  <span
                    class="accounts-supplier-payments__pill"
                    :class="{
                      'accounts-supplier-payments__pill--warning': row.statusTone === 'warning',
                      'accounts-supplier-payments__pill--danger': row.statusTone === 'danger',
                      'accounts-supplier-payments__pill--success': row.statusTone === 'success',
                    }"
                  >
                    {{ row.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="accounts-supplier-payments__panel accounts-supplier-payments__detail">
        <div class="accounts-supplier-payments__panel-head">
          <h3>Supplier Detail</h3>
          <span class="accounts-supplier-payments__linked-pill">Job cost linked</span>
        </div>

        <div class="accounts-supplier-payments__detail-stack">
          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">MSC-UK-10482</div>
            <div class="accounts-supplier-payments__detail-text">
              MSC Mediterranean Shipping Co. · Job JOB-24091
            </div>
          </div>

          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Financial</div>
            <div class="accounts-supplier-payments__detail-text">Purchase: £2,750.00</div>
            <div class="accounts-supplier-payments__detail-text">Approved: Yes on 2026-03-02</div>
            <div class="accounts-supplier-payments__detail-text">Paid: No</div>
          </div>

          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Job Margin Check</div>
            <div class="accounts-supplier-payments__detail-text">
              Sales Invoice: INV-1001 · £4,850.00
            </div>
            <div class="accounts-supplier-payments__detail-text">Job Cost: £2,750.00</div>
            <div class="accounts-supplier-payments__detail-text">Estimated Margin: £2,100.00</div>
          </div>

          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Banking</div>
            <div class="accounts-supplier-payments__detail-text">Bank: HSBC UK</div>
            <div class="accounts-supplier-payments__detail-text">
              IBAN/Account: GB22HBUK04005112345678
            </div>
            <div class="accounts-supplier-payments__detail-text">SWIFT: MIDLGB22</div>
          </div>

          <div class="accounts-supplier-payments__detail-card">
            <div class="accounts-supplier-payments__detail-title">Coding</div>
            <div class="accounts-supplier-payments__detail-text">Charge: Ocean Freight</div>
            <div class="accounts-supplier-payments__detail-text">Tax Code: GBZR</div>
            <div class="accounts-supplier-payments__detail-text">Payment Method: Bank Transfer</div>
          </div>
        </div>
      </aside>
    </div>

    <div class="accounts-supplier-payments__grid accounts-supplier-payments__grid--bottom">
      <section class="accounts-supplier-payments__panel">
        <div class="accounts-supplier-payments__panel-head">
          <h3>Payment Processing</h3>
        </div>

        <div class="accounts-supplier-payments__form-grid">
          <div class="accounts-supplier-payments__field">
            <label>Payment Method</label>
            <Dropdown
              :model-value="selectedPaymentMethod"
              :options="paymentMethodOptions"
              option-label="label"
              option-value="value"
              class="accounts-supplier-payments__field-control"
            />
          </div>

          <div class="accounts-supplier-payments__field">
            <label>Export Format</label>
            <Dropdown
              :model-value="selectedExportFormat"
              :options="exportFormatOptions"
              option-label="label"
              option-value="value"
              class="accounts-supplier-payments__field-control"
            />
          </div>
        </div>

        <div class="accounts-supplier-payments__field accounts-supplier-payments__field--full">
          <label>Compatibility Notes</label>
          <textarea class="accounts-supplier-payments__textarea" rows="4">
Supplier payment records include supplier invoice number, linked job, charge lines, nominal purchase code, tax code, bank payment method, beneficiary account fields and payment references. The structure is designed for future supplier banking export, international bank export mapping, including transactions out and supplier settlement status.
          </textarea>
        </div>

        <div class="accounts-supplier-payments__panel-actions">
          <Button label="Schedule Selected" class="btn btn--ghost" size="small" />
          <Button label="Export Payment File" class="btn btn--primary" size="small" />
        </div>

        <div class="accounts-supplier-payments__log-stack">
          <div class="accounts-supplier-payments__log-card">
            <div class="accounts-supplier-payments__log-title">PINV-7001</div>
            <div class="accounts-supplier-payments__log-text">
              2026-03-02 09:15 · Approved for payment
            </div>
          </div>

          <div class="accounts-supplier-payments__log-card">
            <div class="accounts-supplier-payments__log-title">PINV-7003</div>
            <div class="accounts-supplier-payments__log-text">
              2026-02-28 14:10 · Paid by SWIFT Transfer
            </div>
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
              <tr v-for="row in bankingSnapshotRows" :key="`${row.supplier}-${row.currency}`">
                <td>{{ row.supplier }}</td>
                <td>{{ row.currency }}</td>
                <td>{{ row.beneficiaryBank }}</td>
                <td>{{ row.ibanOrAccount }}</td>
                <td>{{ row.swift }}</td>
                <td>{{ row.country }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
