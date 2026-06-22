<script setup lang="ts">
import "./AccountsCreditControlSection.css"

import Button from "primevue/button"

import { useAccountsCreditControlSection } from "./AccountsCreditControlSection"

const {
  rows,
  selectedCustomerId,
  loading,
  savingHold,
  errorMessage,
  selectedCustomer,
  money,
  toggleHold,
} = useAccountsCreditControlSection()
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
              <tr v-if="loading">
                <td colspan="7" class="accounts-credit-control__empty">
                  Loading credit control...
                </td>
              </tr>

              <tr v-else-if="errorMessage">
                <td
                  colspan="7"
                  class="accounts-credit-control__empty accounts-credit-control__empty--error"
                >
                  {{ errorMessage }}
                </td>
              </tr>

              <tr v-else-if="!rows.length">
                <td colspan="7" class="accounts-credit-control__empty">
                  No printed invoices are available for credit control yet.
                </td>
              </tr>

              <template v-else>
                <tr
                  v-for="row in rows"
                  :key="row.customerId ?? row.customer"
                  :class="{
                    'accounts-credit-control__row--active':
                      selectedCustomer?.customerId === row.customerId,
                  }"
                  @click="selectedCustomerId = row.customerId"
                >
                  <td>{{ row.customer }}</td>
                  <td>{{ row.termsLabel }}</td>
                  <td>{{ row.creditLimitLabel }}</td>
                  <td>{{ row.outstandingLabel }}</td>
                  <td>{{ row.oldestDebtLabel }}</td>
                  <td>
                    <span
                      class="accounts-credit-control__pill"
                      :class="`accounts-credit-control__pill--${row.statusTone}`"
                    >
                      {{ row.status }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="accounts-credit-control__pill"
                      :class="`accounts-credit-control__pill--${row.holdTone}`"
                    >
                      {{ row.hold }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <aside
        v-if="selectedCustomer"
        class="accounts-credit-control__panel accounts-credit-control__detail"
      >
        <div class="accounts-credit-control__detail-head">Selected Customer Status</div>

        <div class="accounts-credit-control__detail-stack">
          <div v-if="errorMessage" class="accounts-credit-control__alert">
            {{ errorMessage }}
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">{{ selectedCustomer.customer }}</div>
            <div class="accounts-credit-control__detail-text">
              Terms {{ selectedCustomer.termsLabel }} - Credit Limit
              {{ selectedCustomer.creditLimitLabel }}
            </div>
          </div>

          <div
            v-if="selectedCustomer.statusTone !== 'success'"
            class="accounts-credit-control__alert"
          >
            Payment terms or credit limit warning. Oldest outstanding debt is
            {{ selectedCustomer.oldestDebtLabel }}.
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">Credit Position</div>
            <div class="accounts-credit-control__detail-text">
              Current exposure {{ selectedCustomer.outstandingLabel }}
            </div>
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">System Hold</div>
            <div class="accounts-credit-control__detail-text">
              {{ selectedCustomer.onHold ? "ON HOLD enabled." : "Account active." }}
            </div>
            <Button
              :label="selectedCustomer.onHold ? 'Release Hold' : 'Place On Hold'"
              class="btn btn--ghost"
              size="small"
              :loading="savingHold"
              :disabled="savingHold || !selectedCustomer.customerId"
              @click="toggleHold"
            />
          </div>

          <div class="accounts-credit-control__detail-card">
            <div class="accounts-credit-control__detail-title">Open Invoices</div>
            <div
              v-for="invoice in selectedCustomer.openInvoices"
              :key="invoice.id"
              class="accounts-credit-control__detail-text"
            >
              {{ invoice.invoice }} - {{ invoice.job || "No job" }} - due
              {{ invoice.dueDate || "No due date" }} -
              {{ money(invoice.amount, invoice.currency) }}
              <span v-if="invoice.daysOverdue > 0">({{ invoice.daysOverdue }} days overdue)</span>
            </div>
            <div
              v-if="!selectedCustomer.openInvoices.length"
              class="accounts-credit-control__detail-text"
            >
              No open invoices for this customer.
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
