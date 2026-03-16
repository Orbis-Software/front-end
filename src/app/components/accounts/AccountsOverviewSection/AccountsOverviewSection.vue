<script setup lang="ts">
import "./AccountsOverviewSection.css"

const summaryCards = [
  { label: "Total Jobs Invoiced", value: "4" },
  { label: "Outstanding Jobs to Invoice", value: "4" },
  { label: "Total Invoiced Value", value: "£23,250.00" },
  { label: "Total To Be Invoiced", value: "£21,800.00" },
  { label: "Gross Profit", value: "£11,240.00" },
]

const profitLossRows = [
  {
    metric: "Recognised Sales (Invoiced)",
    value: "£23,250.00",
    comment: "4 sales invoices raised",
  },
  {
    metric: "Open Sales Pipeline",
    value: "£21,800.00",
    comment: "4 jobs still to invoice",
  },
  {
    metric: "Total Sales View",
    value: "£45,050.00",
    comment: "Invoiced plus pending operational billing",
  },
  {
    metric: "Invoiced Job Costs",
    value: "£17,410.00",
    comment: "Costs carried on customer invoices/jobs",
  },
  {
    metric: "Pending Job Costs",
    value: "£16,400.00",
    comment: "Estimated costs on unbilled jobs",
  },
  {
    metric: "Supplier Purchase Ledger",
    value: "£15,700.00",
    comment: "4 supplier invoices logged",
  },
  {
    metric: "Gross Profit View",
    value: "£11,240.00",
    comment: "Sales less job costs",
  },
  {
    metric: "Net Position vs Supplier Ledger",
    value: "£29,350.00",
    comment: "Sales less supplier invoice value",
  },
]

const creditCashSnapshot = [
  { value: "£16,850.00", label: "Customer debt still outstanding" },
  { value: "£6,400.00", label: "Customer receipts marked as paid" },
  { value: "£15,700.00", label: "Supplier invoices still awaiting payment" },
  { value: "1", label: "Customers currently on hold" },
]

const jobsAwaitingInvoicing = [
  {
    job: "JOB-24095",
    customer: "Acme Retail UK",
    user: "Maral",
    mode: "Road",
    stage: "Delivered",
    stageClass: "success",
    targetInvoiceDate: "2026-03-12",
    estimatedSell: "£3,250.00",
    estimatedCost: "£2,480.00",
    expectedProfit: "£770.00",
  },
  {
    job: "JOB-24096",
    customer: "Nomad Tech GmbH",
    user: "Ian",
    mode: "Air",
    stage: "Awaiting costs",
    stageClass: "warning",
    targetInvoiceDate: "2026-03-15",
    estimatedSell: "£7,850.00",
    estimatedCost: "£6,120.00",
    expectedProfit: "£1,730.00",
  },
  {
    job: "JOB-24097",
    customer: "Silk Route Logistics",
    user: "John",
    mode: "Sea",
    stage: "Discharged",
    stageClass: "info",
    targetInvoiceDate: "2026-03-18",
    estimatedSell: "US$9,100.00",
    estimatedCost: "US$6,980.00",
    expectedProfit: "US$2,120.00",
  },
  {
    job: "JOB-24098",
    customer: "Baltic Industrial",
    user: "Maral",
    mode: "Warehouse",
    stage: "Ready to bill",
    stageClass: "success",
    targetInvoiceDate: "2026-03-11",
    estimatedSell: "£1,600.00",
    estimatedCost: "£820.00",
    expectedProfit: "£780.00",
  },
]

const accountStatusSummary = [
  { value: "2", label: "Sales invoices transferred to finance systems" },
  { value: "0", label: "Supplier invoices approved/scheduled for payment" },
  { value: "3", label: "Live working currency rates in the table" },
  { value: "2", label: "Configured client bank accounts available for documents and payments" },
]
</script>

<template>
  <div class="accounts-overview">
    <div class="accounts-overview__hero">
      <div class="accounts-overview__hero-top">
        <div>
          <div class="accounts-overview__eyebrow">OVERVIEW</div>
          <h2 class="accounts-overview__title">
            Quick financial view across sales, costs, profit and jobs awaiting invoicing
          </h2>
        </div>

        <div class="accounts-overview__badge">Live demo snapshot</div>
      </div>

      <div class="accounts-overview__summary-grid">
        <div v-for="card in summaryCards" :key="card.label" class="accounts-overview__summary-card">
          <div class="accounts-overview__summary-label">{{ card.label }}</div>
          <div class="accounts-overview__summary-value">{{ card.value }}</div>
        </div>
      </div>
    </div>

    <div class="accounts-overview__grid accounts-overview__grid--top">
      <div class="accounts-overview__panel">
        <div class="accounts-overview__panel-head">
          <h3>Profit &amp; Loss Overview</h3>
          <span>Sales invoices and supplier purchase costs combined</span>
        </div>

        <div class="accounts-overview__table-wrap">
          <table class="accounts-overview__table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in profitLossRows" :key="row.metric">
                <td>{{ row.metric }}</td>
                <td class="strong">{{ row.value }}</td>
                <td>{{ row.comment }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="accounts-overview__panel">
        <div class="accounts-overview__panel-head">
          <h3>Credit &amp; Cash Snapshot</h3>
        </div>

        <div class="accounts-overview__stack">
          <div
            v-for="item in creditCashSnapshot"
            :key="item.label"
            class="accounts-overview__stack-card"
          >
            <div class="accounts-overview__stack-value">{{ item.value }}</div>
            <div class="accounts-overview__stack-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="accounts-overview__grid accounts-overview__grid--bottom">
      <div class="accounts-overview__panel">
        <div class="accounts-overview__panel-head">
          <h3>Jobs Awaiting Invoicing</h3>
          <span>Operational jobs complete or in progress with sales still to raise</span>
        </div>

        <div class="accounts-overview__table-wrap">
          <table class="accounts-overview__table accounts-overview__table--jobs">
            <thead>
              <tr>
                <th>Job</th>
                <th>Customer</th>
                <th>User</th>
                <th>Mode</th>
                <th>Stage</th>
                <th>Target Invoice Date</th>
                <th>Estimated Sell</th>
                <th>Estimated Cost</th>
                <th>Expected Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in jobsAwaitingInvoicing" :key="job.job">
                <td>{{ job.job }}</td>
                <td>{{ job.customer }}</td>
                <td>{{ job.user }}</td>
                <td>{{ job.mode }}</td>
                <td>
                  <span
                    class="accounts-overview__status"
                    :class="`accounts-overview__status--${job.stageClass}`"
                  >
                    {{ job.stage }}
                  </span>
                </td>
                <td>{{ job.targetInvoiceDate }}</td>
                <td>{{ job.estimatedSell }}</td>
                <td>{{ job.estimatedCost }}</td>
                <td class="strong">{{ job.expectedProfit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="accounts-overview__panel">
        <div class="accounts-overview__panel-head">
          <h3>Account Status Summary</h3>
        </div>

        <div class="accounts-overview__stack">
          <div
            v-for="item in accountStatusSummary"
            :key="item.label"
            class="accounts-overview__stack-card"
          >
            <div class="accounts-overview__stack-value">{{ item.value }}</div>
            <div class="accounts-overview__stack-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
