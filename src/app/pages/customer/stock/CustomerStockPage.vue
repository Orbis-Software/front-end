<script setup lang="ts">
import { stockItems, stockMovementHistory, stockStats } from "./CustomerStockPage"
</script>

<template>
  <div class="customer-page">
    <div class="page-header">
      <div>
        <h1>Stock & Inventory</h1>
        <p>Consolidated storage — Manchester Warehouse</p>
      </div>

      <div class="actions">
        <button class="secondary-btn">Download Report</button>
        <button class="primary-btn">Request Stock Move</button>
      </div>
    </div>

    <section class="stats-grid">
      <div v-for="stat in stockStats" :key="stat.label" class="stat-card">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-note" :class="stat.color">{{ stat.note }}</div>
      </div>
    </section>

    <div class="capacity-card">
      <div class="capacity-head">
        <strong>Warehouse Capacity</strong>
        <span>28.6 m² used of 42 m²</span>
      </div>

      <div class="progress">
        <div class="progress-fill amber" style="width: 68%" />
      </div>
    </div>

    <div class="table-card">
      <table>
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
                  <div class="progress-fill" :class="item.color" :style="{ width: item.level }" />
                </div>

                <span class="badge" :class="item.color">{{ item.status }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-card">
      <div class="table-title">Stock Movement History</div>

      <table>
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
              <span class="badge" :class="move.color">{{ move.type }}</span>
            </td>
            <td>{{ move.qty }}</td>
            <td>{{ move.reference }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped src="./CustomerStockPage.css"></style>
