<script setup lang="ts">
import { modeBreakdown, reportStats } from "./CustomerReportsPage"
</script>

<template>
  <div class="customer-page">
    <div class="page-header">
      <div>
        <h1>Reports</h1>
        <p>Shipment, stock and cost analytics</p>
      </div>

      <button class="secondary-btn">Download PDF</button>
    </div>

    <section class="stats-grid">
      <div v-for="stat in reportStats" :key="stat.label" class="stat-card">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-note" :class="stat.color">{{ stat.note }}</div>
      </div>
    </section>

    <section class="report-grid">
      <div class="report-card">
        <h2>Shipments by Mode</h2>

        <div class="mode-list">
          <div v-for="mode in modeBreakdown" :key="mode.label" class="mode-item">
            <div class="mode-head">
              <span>{{ mode.label }}</span>
              <strong>{{ mode.value }}</strong>
            </div>

            <div class="progress">
              <div class="progress-fill" :style="{ width: mode.percent }" />
            </div>
          </div>
        </div>
      </div>

      <div class="report-card">
        <h2>Freight Cost Breakdown</h2>

        <div class="cost-row">
          <span>Sea Freight</span>
          <strong>£14,200</strong>
        </div>

        <div class="cost-row">
          <span>Air Freight</span>
          <strong>£7,840</strong>
        </div>

        <div class="cost-row">
          <span>Road / Final Mile</span>
          <strong>£1,250</strong>
        </div>

        <div class="cost-row total">
          <span>Total</span>
          <strong>£24,190</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped src="./CustomerReportsPage.css"></style>
