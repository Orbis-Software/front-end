<script setup lang="ts">
import "../CustomerPortalListPage.css"
import Button from "primevue/button"
import { useCustomerQuotesPage } from "./CustomerQuotesPage"

const {
  tabs,
  activeTab,
  filteredQuotes,
  isActive,
  setActiveTab,
  openQuote,
  approveQuote,
  declineQuote,
  downloadQuote,
} = useCustomerQuotesPage()
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <h1 class="customer-list-page__title">Quotes</h1>
      </div>

      <Button
        class="btn btn--primary customer-list-page__action-btn"
        icon="pi pi-plus"
        label="Request a Quote"
      />
    </header>

    <div class="customer-list-page__card">
      <div class="customer-list-page__tabs-bar">
        <nav class="customer-list-page__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="customer-list-page__tab"
            :class="{ 'customer-list-page__tab--active': isActive(tab.value) }"
            @click="setActiveTab(tab.value)"
          >
            {{ tab.label }}
            <span class="customer-list-page__tab-count">{{ tab.count }}</span>
          </button>
        </nav>
      </div>

      <div class="customer-list-page__content">
        <div class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Quotation</th>
                  <th>Route</th>
                  <th>Mode</th>
                  <th>Cargo</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                <tr v-for="quote in filteredQuotes" :key="quote.reference">
                  <td>
                    <div class="customer-list-page__cell-stack">
                      <button
                        class="customer-list-page__cell-link"
                        type="button"
                        @click="openQuote(quote.reference)"
                      >
                        {{ quote.reference }}
                      </button>
                      <span class="customer-list-page__cell-subtext">
                        Submitted {{ quote.submitted }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="customer-list-page__cell-stack">
                      <span class="customer-list-page__cell-title">{{ quote.route }}</span>
                      <span class="customer-list-page__cell-subtext">
                        Valid until {{ quote.validUntil }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="customer-list-page__chip">{{ quote.mode }}</span>
                  </td>
                  <td>
                    <div class="customer-list-page__cell-stack">
                      <span class="customer-list-page__plain-value">{{ quote.cargo }}</span>
                      <span class="customer-list-page__cell-subtext">
                        {{ quote.weight }} · {{ quote.cbm }} CBM
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${quote.statusColor}`"
                    >
                      {{ quote.status }}
                    </span>
                  </td>
                  <td>
                    <span class="customer-list-page__plain-value">
                      {{ quote.amount || "Quote pending" }}
                    </span>
                  </td>
                  <td>
                    <div class="customer-list-page__row-actions">
                      <Button
                        v-if="quote.canApprove"
                        class="btn btn--primary"
                        label="Approve"
                        @click="approveQuote(quote.reference)"
                      />
                      <Button
                        v-if="quote.canDecline"
                        class="btn btn--ghost"
                        label="Decline"
                        @click="declineQuote(quote.reference)"
                      />
                      <Button
                        class="btn btn--ghost"
                        label="Download"
                        :disabled="!quote.amount"
                        @click="downloadQuote(quote.reference)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!filteredQuotes.length" class="customer-list-page__empty">
            No quotes found for {{ activeTab }}.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
