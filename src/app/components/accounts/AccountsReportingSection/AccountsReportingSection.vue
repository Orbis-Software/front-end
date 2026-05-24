<script setup lang="ts">
import "./AccountsReportingSection.css"

import { computed, ref } from "vue"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Dropdown from "primevue/dropdown"

import { downloadCsv, useAccountsDemo } from "@/app/composables/useAccountsDemo"

const { state, money } = useAccountsDemo()

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

const selectedPeriod = ref("this-month")
const selectedReport = ref("end-of-period-sales")
const fromDate = ref(new Date("2026-03-01"))
const toDate = ref(new Date("2026-03-31"))

function iso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function inPeriod(dateText: string) {
  return dateText >= iso(fromDate.value) && dateText <= iso(toDate.value)
}

function applyPeriod() {
  if (selectedPeriod.value === "last-month") {
    fromDate.value = new Date("2026-02-01")
    toDate.value = new Date("2026-02-28")
  } else if (selectedPeriod.value === "this-quarter") {
    fromDate.value = new Date("2026-01-01")
    toDate.value = new Date("2026-03-31")
  } else if (selectedPeriod.value === "this-month") {
    fromDate.value = new Date("2026-03-01")
    toDate.value = new Date("2026-03-31")
  }
}

const reportRows = computed(() => {
  if (selectedReport.value === "end-of-period-purchases") {
    return state.supplierInvoices
      .filter(row => inPeriod(row.invoiceDate))
      .map(row => ({
        a: row.supplierInvoice,
        b: row.invoiceDate,
        c: row.supplier,
        d: row.user,
        e: row.currency,
        f: money(row.amount, row.currency),
      }))
  }

  if (selectedReport.value === "gross-profit-report") {
    return state.invoices
      .filter(row => inPeriod(row.invoiceDate))
      .map(row => ({
        a: row.invoice,
        b: row.job,
        c: row.customer,
        d: money(row.amount, row.currency),
        e: money(row.cost, row.currency),
        f: money(row.amount - row.cost, row.currency),
      }))
  }

  if (selectedReport.value === "customer-activity-report") {
    return state.invoices
      .filter(row => inPeriod(row.invoiceDate))
      .map(row => ({
        a: row.customer,
        b: row.invoice,
        c: row.job,
        d: row.user,
        e: row.currency,
        f: money(row.amount, row.currency),
      }))
  }

  return state.invoices
    .filter(row => inPeriod(row.invoiceDate))
    .map(row => ({
      a: row.invoice,
      b: row.invoiceDate,
      c: row.customer,
      d: row.user,
      e: row.currency,
      f: money(row.amount, row.currency),
    }))
})

const reportHeadings = computed(() => {
  if (selectedReport.value === "gross-profit-report")
    return ["Invoice", "Job", "Customer", "Sales", "Cost", "Profit"]
  if (selectedReport.value === "customer-activity-report")
    return ["Customer", "Invoice", "Job", "User", "Currency", "Sales"]
  if (selectedReport.value === "end-of-period-purchases")
    return ["Supplier Inv", "Date", "Supplier", "User", "Currency", "Purchases"]
  return ["Invoice", "Date", "Customer", "User", "Currency", "Sales"]
})

const summaryCards = computed(() => {
  const sales = state.invoices
    .filter(row => inPeriod(row.invoiceDate))
    .reduce((sum, row) => sum + row.amount, 0)
  const purchases = state.supplierInvoices
    .filter(row => inPeriod(row.invoiceDate))
    .reduce((sum, row) => sum + row.amount, 0)
  const customers = new Set(
    state.invoices.filter(row => inPeriod(row.invoiceDate)).map(row => row.customer),
  ).size
  return [
    { label: "Sales", value: money(sales) },
    { label: "Purchases", value: money(purchases) },
    { label: "Profit", value: money(sales - purchases) },
    { label: "Invoices", value: String(reportRows.value.length) },
    { label: "Customers Active", value: String(customers) },
  ]
})

const reportTitle = computed(() => {
  const label =
    reportOptions.find(option => option.value === selectedReport.value)?.label ?? "Report"
  return `${label} (${iso(fromDate.value)} to ${iso(toDate.value)})`
})

function exportReportCsv() {
  downloadCsv("accounts_report.csv", [
    reportHeadings.value,
    ...reportRows.value.map(row => [row.a, row.b, row.c, row.d, row.e, row.f]),
  ])
}
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
            v-model="selectedPeriod"
            :options="periodOptions"
            option-label="label"
            option-value="value"
            class="accounts-reporting__control"
            @change="applyPeriod"
          />
          <Calendar
            v-model="fromDate"
            date-format="dd/mm/yy"
            show-icon
            class="accounts-reporting__control"
            @date-select="selectedPeriod = 'custom'"
          />
          <Calendar
            v-model="toDate"
            date-format="dd/mm/yy"
            show-icon
            class="accounts-reporting__control"
            @date-select="selectedPeriod = 'custom'"
          />

          <div class="accounts-reporting__run-row">
            <Dropdown
              v-model="selectedReport"
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
        <h3>{{ reportTitle }}</h3>
        <Button
          label="Export Report CSV"
          class="btn btn--ghost"
          size="small"
          @click="exportReportCsv"
        />
      </div>

      <div class="accounts-reporting__table-wrap">
        <table class="accounts-reporting__table">
          <thead>
            <tr>
              <th v-for="heading in reportHeadings" :key="heading">{{ heading }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in reportRows" :key="`${row.a}-${row.b}`">
              <td>{{ row.a }}</td>
              <td>{{ row.b }}</td>
              <td>{{ row.c }}</td>
              <td>{{ row.d }}</td>
              <td>{{ row.e }}</td>
              <td class="accounts-reporting__strong">{{ row.f }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
