<script setup lang="ts">
import "./AccountsReportingSection.css"

import { computed, onMounted, ref, watch } from "vue"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

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

const allOption = { label: "All", value: "all" }
const dateBasisOptions = [
  { label: "Invoice Date", value: "invoiceDate" },
  { label: "Due Date", value: "dueDate" },
  { label: "Paid Date", value: "paidDate" },
  { label: "Approved Date", value: "approvedDate" },
]
const statusOptions = [
  allOption,
  { label: "Printed", value: "printed" },
  { label: "Sent", value: "sent" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
]

const selectedPeriod = ref("this-month")
const selectedReport = ref("end-of-period-sales")
const selectedDateBasis = ref("invoiceDate")
const selectedParty = ref("all")
const selectedUser = ref("all")
const selectedMode = ref("all")
const selectedCurrency = ref("all")
const selectedStatus = ref("all")
const searchText = ref("")

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

function uniqueOptions(values: unknown[]) {
  return [
    allOption,
    ...Array.from(
      new Set(
        values
          .map(value => String(value ?? "").trim())
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right)),
      ),
    ).map(value => ({ label: value, value })),
  ]
}

const partyOptions = computed(() => {
  if (selectedReport.value === "end-of-period-purchases") {
    return uniqueOptions(state.supplierInvoices.map(row => row.supplier))
  }

  return uniqueOptions(state.customerInvoices.map(row => row.customer))
})
const userOptions = computed(() =>
  uniqueOptions([
    ...state.customerInvoices.map(row => row.user),
    ...state.supplierInvoices.map(row => row.user),
  ]),
)
const modeOptions = computed(() =>
  uniqueOptions([
    ...state.customerInvoices.map(row => row.mode),
    ...state.supplierInvoices.map(row => row.mode),
  ]),
)
const currencyOptions = computed(() =>
  uniqueOptions([
    ...state.customerInvoices.map(row => row.currency),
    ...state.supplierInvoices.map(row => row.currency),
  ]),
)

function rowDate(row: any) {
  return String(row?.[selectedDateBasis.value] ?? "")
}

function commonMatch(row: any, partyName: string) {
  const query = searchText.value.trim().toLowerCase()
  const text = [
    row.invoice,
    row.supplierInvoice,
    row.job,
    partyName,
    row.user,
    row.mode,
    row.currency,
    row.status,
  ]
    .join(" ")
    .toLowerCase()

  return (
    inPeriod(rowDate(row)) &&
    (selectedParty.value === "all" || partyName === selectedParty.value) &&
    (selectedUser.value === "all" || row.user === selectedUser.value) &&
    (selectedMode.value === "all" || row.mode === selectedMode.value) &&
    (selectedCurrency.value === "all" || row.currency === selectedCurrency.value) &&
    (selectedStatus.value === "all" || row.status === selectedStatus.value) &&
    (!query || text.includes(query))
  )
}

const filteredCustomerInvoices = computed(() =>
  state.customerInvoices.filter(row => commonMatch(row, row.customer)),
)
const filteredSupplierInvoices = computed(() =>
  state.supplierInvoices.filter(row => commonMatch(row, row.supplier)),
)

function clearFilters() {
  selectedPeriod.value = "this-month"
  selectedDateBasis.value = "invoiceDate"
  selectedParty.value = "all"
  selectedUser.value = "all"
  selectedMode.value = "all"
  selectedCurrency.value = "all"
  selectedStatus.value = "all"
  searchText.value = ""
  applyPeriod()
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
    return filteredSupplierInvoices.value.map(row => ({
      a: row.supplierInvoice,
      b: row.invoiceDate,
      c: row.supplier,
      d: row.user,
      e: row.currency,
      f: money(row.amount, row.currency),
    }))
  }

  if (selectedReport.value === "gross-profit-report") {
    return filteredCustomerInvoices.value.map(row => ({
      a: row.invoice,
      b: row.job,
      c: row.customer,
      d: money(row.amount, row.currency),
      e: money(row.cost, row.currency),
      f: money(row.amount - row.cost, row.currency),
    }))
  }

  if (selectedReport.value === "customer-activity-report") {
    return filteredCustomerInvoices.value.map(row => ({
      a: row.customer,
      b: row.invoice,
      c: row.job,
      d: row.user,
      e: row.currency,
      f: money(row.amount, row.currency),
    }))
  }

  return filteredCustomerInvoices.value.map(row => ({
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
  const baseCurrency =
    state.customerInvoices[0]?.baseCurrency || state.supplierInvoices[0]?.baseCurrency || "GBP"
  const sales = filteredCustomerInvoices.value.reduce((sum, row) => sum + row.baseAmount, 0)
  const purchases = filteredSupplierInvoices.value.reduce((sum, row) => sum + row.baseAmount, 0)
  const customers = new Set(filteredCustomerInvoices.value.map(row => row.customer)).size
  return [
    { label: "Sales", value: money(sales, baseCurrency) },
    { label: "Purchases", value: money(purchases, baseCurrency) },
    { label: "Profit", value: money(sales - purchases, baseCurrency) },
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

watch(selectedReport, () => {
  selectedParty.value = "all"
})
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

          <div class="accounts-reporting__active-report">
            <div>
              <span>Active Report</span>
              <strong>{{ reportTitle }}</strong>
            </div>
            <div>
              <span>Rows</span>
              <strong>{{ reportRows.length }}</strong>
            </div>
          </div>

          <div class="accounts-reporting__summary-grid accounts-reporting__summary-grid--hero">
            <div
              v-for="card in summaryCards"
              :key="card.label"
              class="accounts-reporting__summary-card"
            >
              <div class="accounts-reporting__summary-label">{{ card.label }}</div>
              <div class="accounts-reporting__summary-value">{{ card.value }}</div>
            </div>
          </div>
        </div>

        <div class="accounts-reporting__hero-right">
          <div class="accounts-reporting__run-row">
            <Dropdown
              v-model="selectedReport"
              :options="reportOptions"
              option-label="label"
              option-value="value"
              class="accounts-reporting__control accounts-reporting__control--report"
            />
            <Button label="Run Report" class="btn btn--primary" />
          </div>

          <div class="accounts-reporting__filter-grid">
            <div class="accounts-reporting__field">
              <label>Period</label>
              <Dropdown
                v-model="selectedPeriod"
                :options="periodOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
                @change="applyPeriod"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>Date Basis</label>
              <Dropdown
                v-model="selectedDateBasis"
                :options="dateBasisOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>From</label>
              <Calendar
                v-model="fromDate"
                date-format="dd/mm/yy"
                show-icon
                class="accounts-reporting__control accounts-reporting__date"
                @date-select="selectedPeriod = 'custom'"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>To</label>
              <Calendar
                v-model="toDate"
                date-format="dd/mm/yy"
                show-icon
                class="accounts-reporting__control accounts-reporting__date"
                @date-select="selectedPeriod = 'custom'"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>Party</label>
              <Dropdown
                v-model="selectedParty"
                :options="partyOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>User</label>
              <Dropdown
                v-model="selectedUser"
                :options="userOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>Mode</label>
              <Dropdown
                v-model="selectedMode"
                :options="modeOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>Currency</label>
              <Dropdown
                v-model="selectedCurrency"
                :options="currencyOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
              />
            </div>
            <div class="accounts-reporting__field">
              <label>Status</label>
              <Dropdown
                v-model="selectedStatus"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="accounts-reporting__control"
              />
            </div>
            <div class="accounts-reporting__field accounts-reporting__field--search">
              <label>Search</label>
              <InputText
                v-model="searchText"
                placeholder="Invoice, job, party, user..."
                class="accounts-reporting__control"
              />
            </div>
          </div>

          <div class="accounts-reporting__filter-actions">
            <Button label="Clear Filters" class="btn btn--ghost" @click="clearFilters" />
          </div>
        </div>
      </div>
    </section>

    <section class="accounts-reporting__panel">
      <div class="accounts-reporting__panel-head">
        <h3>{{ reportTitle }}</h3>
        <Button label="Export Report CSV" class="btn btn--ghost" @click="exportReportCsv" />
      </div>

      <div class="accounts-reporting__table-wrap">
        <div v-if="state.loading" class="accounts-reporting__loading-bar" />
        <table class="accounts-reporting__table">
          <thead>
            <tr>
              <th v-for="heading in reportHeadings" :key="heading">{{ heading }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="state.loading">
              <td :colspan="reportHeadings.length" class="accounts-reporting__table-message">
                Loading reporting data...
              </td>
            </tr>
            <tr v-else-if="state.error">
              <td :colspan="reportHeadings.length" class="accounts-reporting__table-message">
                {{ state.error }}
              </td>
            </tr>
            <tr v-else-if="!reportRows.length">
              <td :colspan="reportHeadings.length" class="accounts-reporting__table-message">
                No report rows found for the selected filters.
              </td>
            </tr>
            <template v-else>
              <tr v-for="row in reportRows" :key="`${row.a}-${row.b}`">
                <td>{{ row.a }}</td>
                <td>{{ row.b }}</td>
                <td>{{ row.c }}</td>
                <td>{{ row.d }}</td>
                <td>{{ row.e }}</td>
                <td class="accounts-reporting__strong">{{ row.f }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
