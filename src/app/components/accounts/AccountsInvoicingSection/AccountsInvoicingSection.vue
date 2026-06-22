<script setup lang="ts">
import "./AccountsInvoicingSection.css"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"

import { useAccountsInvoicingSection } from "./AccountsInvoicingSection"

const {
  selectedStatus,
  selectedAccountingPlatform,
  selectedTransferMethod,
  searchText,
  selectedInvoiceIds,
  bankImportInput,
  loading,
  error,
  state,
  statusOptions,
  accountingPlatformOptions,
  transferMethodOptions,
  money,
  statusTone,
  statusLabel,
  selectedInvoice,
  invoiceSummary,
  filteredInvoices,
  allVisibleSelected,
  toggleAllInvoices,
  postSelected,
  markSelectedPaid,
  printInvoice,
  openInvoicePdf,
  invoiceHref,
  onInvoiceLinkClick,
  jobUrl,
  exportBankFeed,
  importBankCsv,
} = useAccountsInvoicingSection()
</script>

<template>
  <div class="accounts-invoicing">
    <input
      ref="bankImportInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="importBankCsv"
    />

    <section class="accounts-invoicing__hero">
      <div class="accounts-invoicing__hero-head">
        <div>
          <div class="accounts-invoicing__eyebrow">INVOICING</div>
          <h2 class="accounts-invoicing__title">
            Invoices, posting, PDF print and bank feed control
          </h2>
        </div>

        <div class="accounts-invoicing__hero-actions">
          <Button
            label="Export Bank Feed CSV"
            class="btn btn--ghost"
            size="small"
            @click="exportBankFeed"
          />
          <Button
            label="Import Bank CSV"
            class="btn btn--ghost"
            size="small"
            @click="bankImportInput?.click()"
          />
          <Button label="Post Selected" class="btn btn--ghost" size="small" @click="postSelected" />
          <Button
            label="Print Invoice PDF"
            class="btn btn--primary"
            size="small"
            @click="printInvoice"
          />
        </div>
      </div>

      <div class="accounts-invoicing__summary-grid">
        <div
          v-for="card in invoiceSummary"
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
              v-model="searchText"
              placeholder="Search invoice, job, customer, mode..."
              class="accounts-invoicing__search"
            />
            <Dropdown
              v-model="selectedStatus"
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
                <th class="checkbox-col">
                  <input
                    type="checkbox"
                    :checked="allVisibleSelected"
                    @change="toggleAllInvoices"
                  />
                </th>
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
              <tr v-if="loading">
                <td colspan="12">Loading printed invoices...</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="12">{{ error }}</td>
              </tr>
              <tr v-else-if="!filteredInvoices.length">
                <td colspan="12">No printed invoices found yet.</td>
              </tr>
              <template v-else>
                <tr
                  v-for="row in filteredInvoices"
                  :key="row.id"
                  @click="state.selectedInvoiceId = row.id"
                >
                  <td class="checkbox-col" @click.stop>
                    <input v-model="selectedInvoiceIds" type="checkbox" :value="row.id" />
                  </td>
                  <td>
                    <a
                      class="accounts-invoicing__table-link"
                      :href="invoiceHref(row)"
                      target="_blank"
                      rel="noopener noreferrer"
                      @click.stop="onInvoiceLinkClick($event, row)"
                    >
                      {{ row.invoice }}
                    </a>
                  </td>
                  <td>
                    <a
                      v-if="row.jobId"
                      class="accounts-invoicing__table-link"
                      :href="jobUrl(row)"
                      target="_blank"
                      rel="noopener noreferrer"
                      @click.stop
                    >
                      {{ row.job }}
                    </a>
                    <span v-else>{{ row.job || "-" }}</span>
                  </td>
                  <td>{{ row.customer }}</td>
                  <td>{{ row.mode }}</td>
                  <td>{{ row.invoiceDate }}</td>
                  <td>{{ row.dueDate }}</td>
                  <td>{{ money(row.amount, row.currency) }}</td>
                  <td>{{ row.paid ? money(row.amount, row.currency) : "-" }}</td>
                  <td>{{ row.paidDate || "-" }}</td>
                  <td>
                    <span
                      class="accounts-invoicing__pill"
                      :class="`accounts-invoicing__pill--${statusTone(row.status)}`"
                    >
                      {{ statusLabel(row.status, row.dueDate) }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="accounts-invoicing__pill"
                      :class="
                        row.postedPlatform
                          ? 'accounts-invoicing__pill--success'
                          : 'accounts-invoicing__pill--neutral'
                      "
                    >
                      {{ row.postedPlatform || "Not Posted" }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <aside v-if="selectedInvoice" class="accounts-invoicing__panel accounts-invoicing__detail">
        <div class="accounts-invoicing__panel-head">
          <h3>Invoice Detail</h3>
          <span class="accounts-invoicing__linked-pill">Job page linked</span>
        </div>

        <div class="accounts-invoicing__detail-stack">
          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">{{ selectedInvoice.invoice }}</div>
            <div class="accounts-invoicing__detail-text">
              {{ selectedInvoice.job }} · {{ selectedInvoice.customer }} ·
              {{ selectedInvoice.user }}
            </div>
          </div>
          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Shipment</div>
            <div class="accounts-invoicing__detail-text">{{ selectedInvoice.route }}</div>
            <div class="accounts-invoicing__detail-text">{{ selectedInvoice.mode }}</div>
          </div>
          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Transport Refs</div>
            <div
              v-for="refText in selectedInvoice.transportRefs"
              :key="refText"
              class="accounts-invoicing__detail-text"
            >
              {{ refText }}
            </div>
          </div>
          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Financial</div>
            <div class="accounts-invoicing__detail-text">
              Amount: {{ money(selectedInvoice.amount, selectedInvoice.currency) }}
            </div>
            <div class="accounts-invoicing__detail-text">
              Cost: {{ money(selectedInvoice.cost, selectedInvoice.currency) }}
            </div>
            <div class="accounts-invoicing__detail-text">
              Profit:
              {{ money(selectedInvoice.amount - selectedInvoice.cost, selectedInvoice.currency) }}
            </div>
            <div class="accounts-invoicing__detail-text">
              Paid: {{ selectedInvoice.paid ? "Yes" : "No" }}
            </div>
          </div>
          <div class="accounts-invoicing__detail-card">
            <div class="accounts-invoicing__detail-title">Invoice Lines</div>
            <div
              v-for="line in selectedInvoice.lines"
              :key="line.description"
              class="accounts-invoicing__detail-text"
            >
              {{ line.description }} · {{ money(line.amount, selectedInvoice.currency) }} · Tax
              {{ line.taxCode }}
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
              v-model="selectedAccountingPlatform"
              :options="accountingPlatformOptions"
              option-label="label"
              option-value="value"
              class="accounts-invoicing__field-control"
            />
          </div>

          <div class="accounts-invoicing__field">
            <label>Transfer Method</label>
            <Dropdown
              v-model="selectedTransferMethod"
              :options="transferMethodOptions"
              option-label="label"
              option-value="value"
              class="accounts-invoicing__field-control"
            />
          </div>
        </div>

        <div class="accounts-invoicing__field accounts-invoicing__field--full">
          <label>Compatibility Notes</label>
          <textarea class="accounts-invoicing__textarea" rows="4" readonly>
Normalised invoice header, line items, nominal codes, tax codes, currency, exchange rate, customer account, due dates, settlement status and payment references are stored in a platform-ready structure. Banking feed import/export follows CSV transaction mapping suitable for later bank/API connectors.
          </textarea>
        </div>

        <div class="accounts-invoicing__panel-actions">
          <Button
            label="Post Current Invoice"
            class="btn btn--primary"
            size="small"
            @click="postSelected"
          />
          <Button
            label="Mark Selected as Paid"
            class="btn btn--ghost"
            size="small"
            @click="markSelectedPaid"
          />
        </div>

        <div class="accounts-invoicing__log-stack">
          <div v-for="log in state.postingLog" :key="log.id" class="accounts-invoicing__log-card">
            <div class="accounts-invoicing__log-title">{{ log.title }}</div>
            <div class="accounts-invoicing__log-text">{{ log.ts }} · {{ log.text }}</div>
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
              <tr v-for="row in state.bankFeed" :key="row.id">
                <td>{{ row.date }}</td>
                <td>{{ row.reference }}</td>
                <td>{{ row.description }}</td>
                <td>{{ row.direction }}</td>
                <td>{{ row.currency }}</td>
                <td>{{ money(row.amount, row.currency) }}</td>
                <td>
                  <span
                    class="accounts-invoicing__pill"
                    :class="
                      row.matchedInvoice
                        ? 'accounts-invoicing__pill--success'
                        : 'accounts-invoicing__pill--neutral'
                    "
                  >
                    {{ row.matchedInvoice || "Unmatched" }}
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
