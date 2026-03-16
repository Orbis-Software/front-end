<script setup lang="ts">
import "./AccountsCreditControlSection.css"

type CreditCustomerRow = {
  customer: string
  terms: string
  creditLimit: string
  outstanding: string
  oldestDebt: string
  status: string
  statusTone: "warning" | "success"
  hold: string
  holdTone: "danger" | "neutral"
}

const customerRows: CreditCustomerRow[] = [
  {
    customer: "Acme Retail UK",
    terms: "30 days",
    creditLimit: "£10,000.00",
    outstanding: "£7,650.00",
    oldestDebt: "63 days",
    status: "Warning",
    statusTone: "warning",
    hold: "ON HOLD",
    holdTone: "danger",
  },
  {
    customer: "Nomad Tech GmbH",
    terms: "30 days",
    creditLimit: "£12,000.00",
    outstanding: "£9,200.00",
    oldestDebt: "30 days",
    status: "OK",
    statusTone: "success",
    hold: "Active",
    holdTone: "neutral",
  },
  {
    customer: "Silk Route Logistics",
    terms: "14 days",
    creditLimit: "£8,000.00",
    outstanding: "£0.00",
    oldestDebt: "0 days",
    status: "OK",
    statusTone: "success",
    hold: "Active",
    holdTone: "neutral",
  },
]
</script>

<template>
  <div class="accounts-credit-control">
    <section class="accounts-credit-control__hero">
      <div class="accounts-credit-control__eyebrow">CREDIT CONTROL</div>
      <h2 class="accounts-credit-control__title">
        Payment terms, credit limits and hold management
      </h2>
      <p class="accounts-credit-control__subtitle">
        Automatic warnings appear where payment terms are exceeded or credit limit has been reached.
      </p>
    </section>

    <div class="accounts-credit-control__grid">
      <section class="accounts-credit-control__panel">
        <div class="accounts-credit-control__table-wrap">
          <table class="accounts-credit-control__table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Terms</th>
                <th>Credit Limit</th>
                <th>Outstanding</th>
                <th>Oldest Debt</th>
                <th>Status</th>
                <th>Hold</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in customerRows" :key="row.customer">
                <td>{{ row.customer }}</td>
                <td>{{ row.terms }}</td>
                <td>{{ row.creditLimit }}</td>
                <td>{{ row.outstanding }}</td>
                <td>{{ row.oldestDebt }}</td>
                <td>
                  <span
                    class="accounts-credit-control__pill"
                    :class="{
                      'accounts-credit-control__pill--warning': row.statusTone === 'warning',
                      'accounts-credit-control__pill--success': row.statusTone === 'success',
                    }"
                  >
                    {{ row.status }}
                  </span>
                </td>
                <td>
                  <span
                    class="accounts-credit-control__pill"
                    :class="{
                      'accounts-credit-control__pill--danger': row.holdTone === 'danger',
                      'accounts-credit-control__pill--neutral': row.holdTone === 'neutral',
                    }"
                  >
                    {{ row.hold }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside class="accounts-credit-control__panel accounts-credit-control__detail">
        <div class="accounts-credit-control__detail-head">Selected Customer Status</div>

        <div class="accounts-credit-control__detail-stack">
          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">Acme Retail UK</div>
            <div class="accounts-credit-control__detail-text">
              Terms 30 days · Credit Limit £10,000.00
            </div>
          </div>

          <div class="accounts-credit-control__alert">
            Payment terms exceeded. Oldest outstanding debt is 63 days.
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">Credit Position</div>
            <div class="accounts-credit-control__detail-text">Current exposure £7,650.00</div>
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">System Hold</div>
            <div class="accounts-credit-control__detail-text">ON HOLD enabled automatically.</div>
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">Open Invoices</div>
            <div class="accounts-credit-control__detail-text">
              INV-1001 · due 2026-04-01 · £4,850.00
            </div>
            <div class="accounts-credit-control__detail-text">
              INV-1004 · due 2026-01-09 · £2,800.00
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
