<script setup lang="ts">
import "./AccountsReportingSection.css"

import { computed, onMounted, ref } from "vue"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Dropdown from "primevue/dropdown"

import { useAccountsSummaryStore } from "@/app/stores/accounts-summary"
import { downloadCsv } from "@/app/utils/download-csv"

const state = useAccountsSummaryStore()

onMounted(() => {
  state.fetch().catch(() => null)
})

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

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

const todayDate = new Date()
const fromDate = ref(monthStart(todayDate))
const toDate = ref(monthEnd(todayDate))

function iso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function inPeriod(dateText: string) {
  return dateText >= iso(fromDate.value) && dateText <= iso(toDate.value)
}

function applyPeriod() {
  const now = new Date()

  if (selectedPeriod.value === "last-month") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    fromDate.value = monthStart(lastMonth)
    toDate.value = monthEnd(lastMonth)
  } else if (selectedPeriod.value === "this-quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    fromDate.value = new Date(now.getFullYear(), quarterStartMonth, 1)
    toDate.value = new Date(now.getFullYear(), quarterStartMonth + 3, 0)
  } else if (selectedPeriod.value === "this-month") {
    fromDate.value = monthStart(now)
    toDate.value = monthEnd(now)
  }
}

function money(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    currencyDisplay: "narrowSymbol",
  }).format(Number.isFinite(value) ? value : 0)
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
    return state.customerInvoices
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
    return state.customerInvoices
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

  return state.customerInvoices
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
  const sales = state.customerInvoices
    .filter(row => inPeriod(row.invoiceDate))
    .reduce((sum, row) => sum + row.amount, 0)
  const purchases = state.supplierInvoices
    .filter(row => inPeriod(row.invoiceDate))
    .reduce((sum, row) => sum + row.amount, 0)
  const customers = new Set(
    state.customerInvoices.filter(row => inPeriod(row.invoiceDate)).map(row => row.customer),
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
