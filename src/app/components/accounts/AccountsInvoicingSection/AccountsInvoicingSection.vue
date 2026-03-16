<script setup lang="ts">
import "./AccountsInvoicingSection.css"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

type InvoiceSummaryCard = {
  label: string
  value: string
}

type InvoiceRow = {
  id: number
  invoice: string
  job: string
  customer: string
  mode: string
  invoiceDate: string
  dueDate: string
  amount: string
  paid: string
  paidDate: string
  status: string
  statusTone: "warning" | "danger" | "success"
  finance: string
  financeTone: "neutral" | "success"
}

type BankFeedRow = {
  date: string
  reference: string
  description: string
  direction: string
  currency: string
  amount: string
  matchedInvoice: string
  matched: boolean
}

const summaryCards: InvoiceSummaryCard[] = [
  { label: "Total Invoices", value: "4" },
  { label: "Outstanding", value: "£16,850.00" },
  { label: "Paid", value: "£6,400.00" },
  { label: "Posted to Finance", value: "2" },
  { label: "On Hold Customers", value: "1" },
]

const invoices: InvoiceRow[] = [
  {
    id: 1,
    invoice: "INV-1001",
    job: "JOB-24091",
    customer: "Acme Retail UK",
    mode: "Sea",
    invoiceDate: "2026-03-02",
    dueDate: "2026-04-01",
    amount: "£4,850.00",
    paid: "-",
    paidDate: "-",
    status: "Sent",
    statusTone: "warning",
    finance: "Not Posted",
    financeTone: "neutral",
  },
  {
    id: 2,
    invoice: "INV-1002",
    job: "JOB-24092",
    customer: "Nomad Tech GmbH",
    mode: "Air",
    invoiceDate: "2026-01-12",
    dueDate: "2026-02-11",
    amount: "€9,200.00",
    paid: "-",
    paidDate: "-",
    status: "Overdue 30d",
    statusTone: "danger",
    finance: "Xero",
    financeTone: "success",
  },
  {
    id: 3,
    invoice: "INV-1003",
    job: "JOB-24093",
    customer: "Silk Route Logistics",
    mode: "Road",
    invoiceDate: "2026-02-18",
    dueDate: "2026-03-20",
    amount: "US$6,400.00",
    paid: "US$6,400.00",
    paidDate: "2026-02-28",
    status: "Paid",
    statusTone: "success",
    finance: "QuickBooks",
    financeTone: "success",
  },
  {
    id: 4,
    invoice: "INV-1004",
    job: "JOB-24094",
    customer: "Acme Retail UK",
    mode: "Warehouse",
    invoiceDate: "2025-12-10",
    dueDate: "2026-01-09",
    amount: "£2,800.00",
    paid: "-",
    paidDate: "-",
    status: "Overdue 63d",
    statusTone: "danger",
    finance: "Not Posted",
    financeTone: "neutral",
  },
]

const bankFeedRows: BankFeedRow[] = [
  {
    date: "2026-02-28",
    reference: "PAY-8821",
    description: "Silk Route remittance",
    direction: "IN",
    currency: "USD",
    amount: "US$6,400.00",
    matchedInvoice: "INV-1003",
    matched: true,
  },
  {
    date: "2026-03-05",
    reference: "BK-5521",
    description: "Carrier payment",
    direction: "OUT",
    currency: "EUR",
    amount: "€4,300.00",
    matchedInvoice: "Unmatched",
    matched: false,
  },
  {
    date: "2026-03-06",
    reference: "PAY-9182",
    description: "Partial client receipt",
    direction: "IN",
    currency: "GBP",
    amount: "£2,000.00",
    matchedInvoice: "INV-1001",
    matched: true,
  },
]

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
]

const accountingPlatformOptions = [
  { label: "Xero", value: "xero" },
  { label: "QuickBooks", value: "quickbooks" },
  { label: "Sage", value: "sage" },
]

const transferMethodOptions = [
  { label: "Sales Invoice Push", value: "sales-invoice-push" },
  { label: "Draft Export", value: "draft-export" },
  { label: "Summary Export", value: "summary-export" },
]

const selectedStatus = "all"
const selectedAccountingPlatform = "xero"
const selectedTransferMethod = "sales-invoice-push"
const searchText = ""
</script>

<template>
  <div class="accounts-invoicing">
    <section class="accounts-invoicing__hero">
      <div class="accounts-invoicing__hero-head">
        <div>
          <div class="accounts-invoicing__eyebrow">INVOICING</div>
          <h2 class="accounts-invoicing__title">
            Invoices, posting, PDF print and bank feed control
          </h2>
        </div>

        <div class="accounts-invoicing__hero-actions">
          <Button label="Export Bank Feed CSV" class="btn btn--ghost" size="small" />
          <Button label="Import Bank CSV" class="btn btn--ghost" size="small" />
          <Button label="Post Selected" class="btn btn--ghost" size="small" />
          <Button label="Print Invoice PDF" class="btn btn--primary" size="small" />
        </div>
      </div>

      <div class="accounts-invoicing__summary-grid">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="accounts-invoicing__summary-card"
        >
          <div class="accounts-invoicing__summary-label">{{ card.label }}</div>
          <div class="accounts-invoicing__summary-value">{{ card.value }}</div>
        </div>
      </div>
    </section>

    <div class="accounts-invoicing__grid accounts-invoicing__grid--top">
      <section class="accounts-invoicing__panel">
        <div class="accounts-invoicing__panel-head">
          <h3>Invoice Register</h3>

          <div class="accounts-invoicing__filters">
            <InputText
              :model-value="searchText"
              placeholder="Search invoice, job, customer, mode..."
              class="accounts-invoicing__search"
            />
            <Dropdown
              :model-value="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="All statuses"
              class="accounts-invoicing__status-filter"
            />
          </div>
        </div>

        <div class="accounts-invoicing__table-wrap">
          <table class="accounts-invoicing__table">
            <thead>
              <tr>
                <th class="checkbox-col"></th>
                <th>Invoice</th>
                <th>Job</th>
                <th>Customer</th>
                <th>Mode</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Paid Date</th>
                <th>Status</th>
                <th>Finance</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in invoices" :key="row.id">
                <td class="checkbox-col">
                  <input type="checkbox" />
                </td>
                <td>{{ row.invoice }}</td>
                <td>{{ row.job }}</td>
                <td>{{ row.customer }}</td>
                <td>{{ row.mode }}</td>
                <td>{{ row.invoiceDate }}</td>
                <td>{{ row.dueDate }}</td>
                <td>{{ row.amount }}</td>
                <td>{{ row.paid }}</td>
                <td>{{ row.paidDate }}</td>
                <td>
                  <span
                    class="accounts-invoicing__pill"
                    :class="{
                      'accounts-invoicing__pill--warning': row.statusTone === 'warning',
                      'accounts-invoicing__pill--danger': row.statusTone === 'danger',
                      'accounts-invoicing__pill--success': row.statusTone === 'success',
                    }"
                  >
                    {{ row.status }}
                  </span>
                </td>
                <td>
                  <span
                    class="accounts-invoicing__pill"
                    :class="{
                      'accounts-invoicing__pill--neutral': row.financeTone === 'neutral',
                      'accounts-invoicing__pill--success': row.financeTone === 'success',
                    }"
                  >
                    {{ row.finance }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="accounts-invoicing__panel accounts-invoicing__detail">
        <div class="accounts-invoicing__panel-head">
          <h3>Invoice Detail</h3>
          <span class="accounts-invoicing__linked-pill">Job page linked</span>
        </div>

        <div class="accounts-invoicing__detail-stack">
          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">INV-1001</div>
            <div class="accounts-invoicing__detail-text">
              Job JOB-24091 · Acme Retail UK · Maral
            </div>
          </div>

          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Shipment</div>
            <div class="accounts-invoicing__detail-text">Valencia, ES → Tbilisi, GE</div>
            <div class="accounts-invoicing__detail-text">FCL · Sea · DAP</div>
          </div>

          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Transport Refs</div>
            <div class="accounts-invoicing__detail-text">Master: MEDU3482172</div>
            <div class="accounts-invoicing__detail-text">House/Job Ref: PCCUK24091</div>
          </div>

          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Financial</div>
            <div class="accounts-invoicing__detail-text">Amount: £4,850.00</div>
            <div class="accounts-invoicing__detail-text">Cost: £3,660.00</div>
            <div class="accounts-invoicing__detail-text">Profit: £1,190.00</div>
            <div class="accounts-invoicing__detail-text">Paid: No</div>
          </div>

          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Credit Status</div>
            <div class="accounts-invoicing__detail-text">Terms: 30 days</div>
            <div class="accounts-invoicing__detail-text">
              Outstanding Customer Exposure: £7,650.00
            </div>

            <div class="accounts-invoicing__alert">
              Customer is on hold due to credit limit and/or payment term breach.
            </div>
          </div>

          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Invoice Lines</div>
            <div class="accounts-invoicing__detail-text">Ocean Freight · £3,200.00 · Tax GBZR</div>
            <div class="accounts-invoicing__detail-text">
              Destination Handling · £850.00 · Tax GBZR
            </div>
            <div class="accounts-invoicing__detail-text">
              Customs Clearance · £800.00 · Tax UK20
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="accounts-invoicing__grid accounts-invoicing__grid--bottom">
      <section class="accounts-invoicing__panel">
        <div class="accounts-invoicing__panel-head">
          <h3>Pass / Transfer Invoice</h3>
        </div>

        <div class="accounts-invoicing__form-grid">
          <div class="accounts-invoicing__field">
            <label>Accounting Platform</label>
            <Dropdown
              :model-value="selectedAccountingPlatform"
              :options="accountingPlatformOptions"
              option-label="label"
              option-value="value"
              class="accounts-invoicing__field-control"
            />
          </div>

          <div class="accounts-invoicing__field">
            <label>Transfer Method</label>
            <Dropdown
              :model-value="selectedTransferMethod"
              :options="transferMethodOptions"
              option-label="label"
              option-value="value"
              class="accounts-invoicing__field-control"
            />
          </div>
        </div>

        <div class="accounts-invoicing__field accounts-invoicing__field--full">
          <label>Compatibility Notes</label>
          <textarea class="accounts-invoicing__textarea" rows="4">
Normalised invoice header, line items, nominal codes, tax codes, currency, exchange rate, customer account, due dates, settlement status and payment references are stored in a platform-ready structure. Banking feed import/export follows CSV transaction mapping suitable for later bank/API connectors.
          </textarea>
        </div>

        <div class="accounts-invoicing__panel-actions">
          <Button label="Post Current Invoice" class="btn btn--primary" size="small" />
          <Button label="Mark Selected as Paid" class="btn btn--ghost" size="small" />
        </div>

        <div class="accounts-invoicing__log-stack">
          <div class="accounts-invoicing__log-card">
            <div class="accounts-invoicing__log-title">Xero INV-1002</div>
            <div class="accounts-invoicing__log-text">2026-01-13 09:42 · Posted successfully</div>
          </div>

          <div class="accounts-invoicing__log-card">
            <div class="accounts-invoicing__log-title">QuickBooks INV-1003</div>
            <div class="accounts-invoicing__log-text">2026-02-19 11:25 · Posted successfully</div>
          </div>
        </div>
      </section>

      <section class="accounts-invoicing__panel">
        <div class="accounts-invoicing__panel-head">
          <h3>Bank Feed</h3>
          <span>Import transactions in / out and match against invoices</span>
        </div>

        <div class="accounts-invoicing__table-wrap">
          <table class="accounts-invoicing__table accounts-invoicing__table--bank">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Direction</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Matched Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in bankFeedRows" :key="`${row.reference}-${row.date}`">
                <td>{{ row.date }}</td>
                <td>{{ row.reference }}</td>
                <td>{{ row.description }}</td>
                <td>{{ row.direction }}</td>
                <td>{{ row.currency }}</td>
                <td>{{ row.amount }}</td>
                <td>
                  <span
                    class="accounts-invoicing__pill"
                    :class="
                      row.matched
                        ? 'accounts-invoicing__pill--success'
                        : 'accounts-invoicing__pill--neutral'
                    "
                  >
                    {{ row.matchedInvoice }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
