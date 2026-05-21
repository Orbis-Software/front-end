<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { ref } from "vue"
import Button from "primevue/button"
import { stockItems, stockMovementHistory } from "./CustomerStockPage"

const activeTab = ref("on-hand")

const tabs = [
  { label: "Stock On Hand", value: "on-hand", count: stockItems.length },
  { label: "Movement History", value: "history", count: stockMovementHistory.length },
]
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <h1 class="customer-list-page__title">Stock & Inventory</h1>
      </div>

      <div class="customer-list-page__header-actions">
        <Button class="btn btn--ghost customer-list-page__action-btn" label="Download Report" />
        <Button
          class="btn btn--primary customer-list-page__action-btn"
          label="Request Stock Move"
        />
      </div>
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
            <span class="customer-list-page__tab-count">{{ tab.count }}</span>
          </button>
        </nav>
      </div>

      <div class="customer-list-page__content">
        <div class="customer-list-page__table-card">
          <div class="customer-list-page__table-scroll">
            <table v-if="activeTab === 'on-hand'" class="customer-list-page__table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Description</th>
                  <th>Batch / Lot</th>
                  <th>On Hand</th>
                  <th>Allocated</th>
                  <th>Available</th>
                  <th>Location</th>
                  <th>Stock Level</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in stockItems" :key="item.sku">
                  <td>
                    <strong>{{ item.sku }}</strong>
                  </td>
                  <td>{{ item.product }}</td>
                  <td>{{ item.batch }}</td>
                  <td>{{ item.onHand }}</td>
                  <td>{{ item.allocated }}</td>
                  <td>
                    <strong>{{ item.available }}</strong>
                  </td>
                  <td>{{ item.location }}</td>
                  <td>
                    <div class="stock-level">
                      <div class="progress mini">
                        <div
                          class="progress-fill"
                          :class="item.color"
                          :style="{ width: item.level }"
                        />
                      </div>

                      <span
                        class="customer-list-page__chip"
                        :class="`customer-list-page__chip--${item.color}`"
                      >
                        {{ item.status }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table v-else class="customer-list-page__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Movement Type</th>
                  <th>Qty</th>
                  <th>Reference</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="move in stockMovementHistory" :key="`${move.date}-${move.reference}`">
                  <td>{{ move.date }}</td>
                  <td>{{ move.sku }}</td>
                  <td>{{ move.product }}</td>
                  <td>
                    <span
                      class="customer-list-page__chip"
                      :class="`customer-list-page__chip--${move.color}`"
                    >
                      {{ move.type }}
                    </span>
                  </td>
                  <td>{{ move.qty }}</td>
                  <td>{{ move.reference }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped src="./CustomerStockPage.css"></style>
