<script setup lang="ts">
import "./CustomerQuotesPage.css"
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
  <section class="customer-quotes-page">
    <header class="customer-quotes-page__header">
      <div class="customer-quotes-page__title-wrap">
        <h1 class="customer-quotes-page__title">Quotes</h1>
      </div>

      <button class="customer-quotes-page__primary-btn" type="button">+ Request a Quote</button>
    </header>

    <div class="customer-quotes-page__card">
      <nav class="customer-quotes-page__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="customer-quotes-page__tab"
          :class="{ 'customer-quotes-page__tab--active': isActive(tab.value) }"
          @click="setActiveTab(tab.value)"
        >
          {{ tab.label }}
          <span class="customer-quotes-page__tab-count">{{ tab.count }}</span>
        </button>
      </nav>

      <div class="customer-quotes-page__content">
        <div class="customer-quotes-page__table-card">
          <div class="customer-quotes-page__table-head">
            <div>Quotation</div>
            <div>Route</div>
            <div>Mode</div>
            <div>Cargo</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>

          <article
            v-for="quote in filteredQuotes"
            :key="quote.reference"
            class="customer-quotes-page__table-row"
          >
            <div class="customer-quotes-page__quote-cell">
              <button
                class="customer-quotes-page__quote-link"
                type="button"
                @click="openQuote(quote.reference)"
              >
                {{ quote.reference }}
              </button>

              <span class="customer-quotes-page__cell-subtext">
                Submitted {{ quote.submitted }}
              </span>
            </div>

            <div>
              <strong>{{ quote.route }}</strong>
              <span class="customer-quotes-page__cell-subtext">
                Valid until {{ quote.validUntil }}
              </span>
            </div>

            <div>
              <span class="customer-quotes-page__info-chip">
                {{ quote.mode }}
              </span>
            </div>

            <div>
              <strong>{{ quote.cargo }}</strong>
              <span class="customer-quotes-page__cell-subtext">
                {{ quote.weight }} · {{ quote.cbm }} CBM
              </span>
            </div>

            <div>
              <span
                class="customer-quotes-page__status-chip"
                :class="`customer-quotes-page__status-chip--${quote.statusColor}`"
              >
                {{ quote.status }}
              </span>
            </div>

            <div class="customer-quotes-page__amount">
              {{ quote.amount || "Quote pending" }}
            </div>

            <div class="customer-quotes-page__actions">
              <button
                v-if="quote.canApprove"
                class="customer-quotes-page__action-btn customer-quotes-page__action-btn--approve"
                type="button"
                @click="approveQuote(quote.reference)"
              >
                Approve
              </button>

              <button
                v-if="quote.canDecline"
                class="customer-quotes-page__action-btn customer-quotes-page__action-btn--decline"
                type="button"
                @click="declineQuote(quote.reference)"
              >
                Decline
              </button>

              <button
                class="customer-quotes-page__action-btn customer-quotes-page__action-btn--download"
                type="button"
                :disabled="!quote.amount"
                @click="downloadQuote(quote.reference)"
              >
                Download
              </button>
            </div>
          </article>

          <div v-if="!filteredQuotes.length" class="customer-quotes-page__empty">
            No quotes found for {{ activeTab }}.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
