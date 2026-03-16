<script setup lang="ts">
import "./AccountsReportingSection.css"

import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Dropdown from "primevue/dropdown"

type ReportingSummaryCard = {
  label: string
  value: string
}

type ReportingRow = {
  invoice: string
  date: string
  customer: string
  user: string
  currency: string
  sales: string
}

const periodOptions = [
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "This Quarter", value: "this-quarter" },
  { label: "Custom", value: "custom" },
]

const reportOptions = [
  { label: "End of Period - Sales", value: "end-of-period-sales" },
  { label: "End of Period - Purchases", value: "end-of-period-purchases" },
  { label: "Gross Profit Report", value: "gross-profit-report" },
  { label: "Customer Activity Report", value: "customer-activity-report" },
]

const selectedPeriod = "this-month"
const selectedReport = "end-of-period-sales"
const fromDate = new Date("2026-02-28")
const toDate = new Date("2026-03-30")

const summaryCards: ReportingSummaryCard[] = [
  { label: "Sales", value: "£4,850.00" },
  { label: "Purchases", value: "£2,750.00" },
  { label: "Profit", value: "£2,100.00" },
  { label: "Invoices", value: "1" },
  { label: "Customers Active", value: "1" },
]

const salesRows: ReportingRow[] = [
  {
    invoice: "INV-1001",
    date: "2026-03-02",
    customer: "Acme Retail UK",
    user: "Maral",
    currency: "GBP",
    sales: "£4,850.00",
  },
]
</script>

<template>
  <div class="accounts-reporting">
    <section class="accounts-reporting__hero">
      <div class="accounts-reporting__hero-grid">
        <div class="accounts-reporting__hero-left">
          <div class="accounts-reporting__eyebrow">REPORTING</div>
          <h2 class="accounts-reporting__title">
            Financial period reports and operational account reporting
          </h2>
        </div>

        <div class="accounts-reporting__hero-right">
          <Dropdown
            :model-value="selectedPeriod"
            :options="periodOptions"
            option-label="label"
            option-value="value"
            class="accounts-reporting__control"
          />

          <Calendar
            :model-value="fromDate"
            date-format="dd/mm/yy"
            show-icon
            class="accounts-reporting__control"
          />

          <Calendar
            :model-value="toDate"
            date-format="dd/mm/yy"
            show-icon
            class="accounts-reporting__control"
          />

          <div class="accounts-reporting__run-row">
            <Dropdown
              :model-value="selectedReport"
              :options="reportOptions"
              option-label="label"
              option-value="value"
              class="accounts-reporting__control accounts-reporting__control--report"
            />

            <Button label="Run Report" class="btn btn--primary" size="small" />
          </div>
        </div>
      </div>

      <div class="accounts-reporting__summary-grid">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="accounts-reporting__summary-card"
        >
          <div class="accounts-reporting__summary-label">{{ card.label }}</div>
          <div class="accounts-reporting__summary-value">{{ card.value }}</div>
        </div>
      </div>
    </section>

    <section class="accounts-reporting__panel">
      <div class="accounts-reporting__panel-head">
        <h3>End of Period - Sales (2026-02-28 to 2026-03-30)</h3>

        <Button label="Export Report CSV" class="btn btn--ghost" size="small" />
      </div>

      <div class="accounts-reporting__table-wrap">
        <table class="accounts-reporting__table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>User</th>
              <th>Currency</th>
              <th>Sales</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in salesRows" :key="row.invoice">
              <td>{{ row.invoice }}</td>
              <td>{{ row.date }}</td>
              <td>{{ row.customer }}</td>
              <td>{{ row.user }}</td>
              <td>{{ row.currency }}</td>
              <td class="accounts-reporting__strong">{{ row.sales }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
