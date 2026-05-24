<script setup lang="ts">
import "./AccountsOverviewSection.css"

import { computed } from "vue"

import { useAccountsDemo } from "@/app/composables/useAccountsDemo"

const { state, overviewSummary, overviewRows, creditRows, money } = useAccountsDemo()

const creditCashSnapshot = computed(() => {
  const outstanding = state.invoices
    .filter(invoice => !invoice.paid)
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const paid = state.invoices
    .filter(invoice => invoice.paid)
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const supplierOutstanding = state.supplierInvoices
    .filter(invoice => !invoice.paid)
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return [
    { value: money(outstanding), label: "Customer debt still outstanding" },
    { value: money(paid), label: "Customer receipts marked as paid" },
    { value: money(supplierOutstanding), label: "Supplier invoices still awaiting payment" },
    {
      value: String(state.creditCustomers.filter(customer => customer.onHold).length),
      label: "Customers currently on hold",
    },
  ]
})

const accountStatusSummary = computed(() => [
  {
    value: String(state.invoices.filter(invoice => invoice.postedPlatform).length),
    label: "Sales invoices transferred to finance systems",
  },
  {
    value: String(state.supplierInvoices.filter(invoice => invoice.status === "scheduled").length),
    label: "Supplier invoices approved/scheduled for payment",
  },
  { value: String(state.exchangeRates.length), label: "Live working currency rates in the table" },
  {
    value: String(state.bankAccounts.length),
    label: "Configured client bank accounts available for documents and payments",
  },
])

function stageClass(stage: string) {
  if (stage.toLowerCase().includes("ready") || stage.toLowerCase().includes("delivered"))
    return "success"
  if (stage.toLowerCase().includes("awaiting")) return "warning"
  return "info"
}
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
        <div
          v-for="card in overviewSummary"
          :key="card.label"
          class="accounts-overview__summary-card"
        >
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
              <tr v-for="row in overviewRows" :key="row.metric">
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
              <tr v-for="job in state.pendingJobs" :key="job.job">
                <td>{{ job.job }}</td>
                <td>{{ job.customer }}</td>
                <td>{{ job.user }}</td>
                <td>{{ job.mode }}</td>
                <td>
                  <span
                    class="accounts-overview__status"
                    :class="`accounts-overview__status--${stageClass(job.stage)}`"
                  >
                    {{ job.stage }}
                  </span>
                </td>
                <td>{{ job.targetInvoiceDate }}</td>
                <td>{{ money(job.estimatedSell, job.currency) }}</td>
                <td>{{ money(job.estimatedCost, job.currency) }}</td>
                <td class="strong">
                  {{ money(job.estimatedSell - job.estimatedCost, job.currency) }}
                </td>
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
