<script setup lang="ts">
import {
  dashboardStats,
  activeShipments,
  recentQuotes,
  recentActivities,
} from "./CustomerDashboardPage"
</script>

<template>
  <div class="customer-dashboard-page">
    <section class="welcome-banner">
      <div>
        <h1 class="welcome-title">Welcome back, Acme Corp</h1>
        <p class="welcome-subtitle">Here's your logistics overview for March 2026</p>
      </div>

      <button class="quote-btn">+ Request a Quote</button>
    </section>

    <section class="stats-grid">
      <div v-for="stat in dashboardStats" :key="stat.label" class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-icon" :class="stat.color">{{ stat.icon }}</div>
        </div>

        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-note" :class="stat.noteColor">{{ stat.note }}</div>
      </div>
    </section>

    <section class="dashboard-grid">
      <div class="table-card">
        <div class="table-header">
          <h2>Active Shipments</h2>
          <button class="ghost-btn">View all →</button>
        </div>

        <table class="shipments-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Route</th>
              <th>Mode</th>
              <th>ETA</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="shipment in activeShipments" :key="shipment.reference">
              <td>
                <strong>{{ shipment.reference }}</strong>
              </td>
              <td>{{ shipment.route }}</td>
              <td>
                <span class="badge" :class="shipment.modeColor">
                  {{ shipment.mode }}
                </span>
              </td>
              <td>{{ shipment.eta }}</td>
              <td>
                <span class="badge" :class="shipment.statusColor">
                  {{ shipment.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="side-column">
        <div class="mini-card">
          <div class="mini-header">
            <h3>Recent Quotes</h3>
          </div>

          <div class="mini-list">
            <div v-for="quote in recentQuotes" :key="quote.reference" class="mini-item">
              <div>
                <strong>{{ quote.reference }}</strong>
                <div class="mini-sub">{{ quote.route }}</div>
              </div>

              <div class="mini-right">
                <strong>{{ quote.amount }}</strong>
                <span class="badge small" :class="quote.statusColor">
                  {{ quote.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-header">
            <h3>Recent Activity</h3>
          </div>

          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.text" class="activity-item">
              <span class="activity-dot" :class="activity.color" />

              <div>
                <div class="activity-text" v-html="activity.text" />
                <div class="activity-meta">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped src="./CustomerDashboardPage.css"></style>
