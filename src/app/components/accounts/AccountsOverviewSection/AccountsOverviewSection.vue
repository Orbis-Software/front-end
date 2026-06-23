<script setup lang="ts">
import "./AccountsOverviewSection.css"

import { onMounted } from "vue"
import { storeToRefs } from "pinia"

import { useAccountsSummaryStore } from "@/app/stores/accounts-summary"

const accountsSummaryStore = useAccountsSummaryStore()
const {
  overviewSummary,
  overviewRows,
  creditCashSnapshot,
  accountStatusSummary,
  pendingJobs,
  loading,
  error,
} = storeToRefs(accountsSummaryStore)

onMounted(() => {
  accountsSummaryStore.fetch().catch(() => null)
})

function money(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(Number.isFinite(value) ? value : 0)
}

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

        <div class="accounts-overview__badge">
          {{ loading ? "Loading live accounts" : "Live jobs data" }}
        </div>
      </div>

      <p v-if="error" class="accounts-overview__stack-label">{{ error }}</p>

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
              <tr v-for="job in pendingJobs" :key="job.job">
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
