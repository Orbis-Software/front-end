<script setup lang="ts">
import { quotes, quoteStats } from "./CustomerQuotesPage"
</script>

<template>
  <div class="customer-page">
    <div class="page-header">
      <div>
        <h1>Quotes</h1>
        <p>3 open quotes · 1 awaiting your response</p>
      </div>

      <button class="primary-btn">+ Request a Quote</button>
    </div>

    <section class="stats-grid">
      <div v-for="stat in quoteStats" :key="stat.label" class="stat-card small">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value small">{{ stat.value }}</div>
      </div>
    </section>

    <div class="quote-alert">
      <div>
        <strong>Quote QT-0088 is ready and awaiting your acceptance</strong>
        <p>Valid until 31 Mar 2026 · Shanghai → Manchester · Sea FCL</p>
      </div>

      <button class="primary-btn small">Review & Accept</button>
    </div>

    <div class="quote-list">
      <article v-for="quote in quotes" :key="quote.reference" class="quote-card">
        <div>
          <div class="quote-ref">
            {{ quote.reference }}
            <span class="badge" :class="quote.statusColor">{{ quote.status }}</span>
          </div>

          <p>{{ quote.route }} · {{ quote.mode }} · {{ quote.cargo }}</p>

          <div class="quote-meta">
            <span
              ><strong>{{ quote.weight }}</strong> weight</span
            >
            <span
              ><strong>{{ quote.cbm }}</strong> CBM</span
            >
            <span
              >Submitted: <strong>{{ quote.submitted }}</strong></span
            >
          </div>
        </div>

        <div class="quote-right">
          <div class="quote-amount">{{ quote.amount || "Quote pending" }}</div>

          <button v-if="quote.amount" class="ghost-btn">Download</button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped src="./CustomerQuotesPage.css"></style>
