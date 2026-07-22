<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { ref } from "vue"
import { modeBreakdown, reportStats } from "./CustomerReportsPage"

const activeTab = ref("overview")

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Shipment Modes", value: "modes" },
  { label: "Freight Costs", value: "costs" },
]
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <span class="customer-list-page__eyebrow">Customer Portal</span>
        <h1 class="customer-list-page__title">Reports</h1>
        <p class="customer-list-page__subtitle">
          See logistics performance, transport mix, and spend.
        </p>
      </div>

      <Button class="btn btn--ghost customer-list-page__action-btn" label="Download PDF" />
    </header>

    <div class="customer-list-page__card">
      <div class="customer-list-page__tabs-bar">
        <nav class="customer-list-page__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="customer-list-page__tab"
            :class="{ 'customer-list-page__tab--active': activeTab === tab.value }"
            type="button"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="customer-list-page__content">
        <section v-if="activeTab === 'overview'" class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="stat in reportStats" :key="stat.label">
                  <td>
                    <span class="customer-list-page__cell-title">{{ stat.label }}</span>
                  </td>
                  <td>{{ stat.value }}</td>
                  <td>
                    <span class="customer-list-page__plain-value">{{ stat.note }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-else-if="activeTab === 'modes'" class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Share</th>
                  <th>Volume</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="mode in modeBreakdown" :key="mode.label">
                  <td>
                    <span class="customer-list-page__cell-title">{{ mode.label }}</span>
                  </td>
                  <td>
                    <div class="progress">
                      <div class="progress-fill" :style="{ width: mode.percent }" />
                    </div>
                  </td>
                  <td>{{ mode.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-else class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Cost Category</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Sea Freight</td>
                  <td><strong>£14,200</strong></td>
                </tr>
                <tr>
                  <td>Air Freight</td>
                  <td><strong>£7,840</strong></td>
                </tr>
                <tr>
                  <td>Road / Final Mile</td>
                  <td><strong>£1,250</strong></td>
                </tr>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>£24,190</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped src="./CustomerReportsPage.css"></style>
