<script setup lang="ts">
import { shipmentStats, shipments } from "./CustomerShipmentsPage"
</script>

<template>
  <div class="customer-page">
    <div class="page-header">
      <div>
        <h1>Shipments</h1>
        <p>8 active · 3 arriving this week</p>
      </div>

      <button class="primary-btn">+ Request Shipment</button>
    </div>

    <section class="stats-grid five">
      <div v-for="stat in shipmentStats" :key="stat.label" class="stat-card small">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value small">{{ stat.value }}</div>
      </div>
    </section>

    <div class="filter-bar">
      <input class="search-input" placeholder="Search by reference, route…" />

      <select class="filter-select">
        <option>All Statuses</option>
        <option>In Transit</option>
        <option>Customs</option>
        <option>Arrived</option>
      </select>

      <select class="filter-select">
        <option>All Modes</option>
        <option>Sea FCL</option>
        <option>Sea LCL</option>
        <option>Air</option>
        <option>Road</option>
      </select>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Mode</th>
            <th>Carrier</th>
            <th>Vessel / Flight</th>
            <th>ETA</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr v-for="shipment in shipments" :key="shipment.reference">
            <td>
              <strong>{{ shipment.reference }}</strong>
            </td>
            <td>{{ shipment.origin }}</td>
            <td>{{ shipment.destination }}</td>
            <td>
              <span class="badge" :class="shipment.modeColor">{{ shipment.mode }}</span>
            </td>
            <td class="muted">{{ shipment.carrier }}</td>
            <td class="muted">{{ shipment.vessel }}</td>
            <td class="muted">{{ shipment.eta }}</td>
            <td>
              <span class="badge" :class="shipment.statusColor">{{ shipment.status }}</span>
            </td>
            <td><button class="ghost-btn">Track</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped src="./CustomerShipmentsPage.css"></style>
