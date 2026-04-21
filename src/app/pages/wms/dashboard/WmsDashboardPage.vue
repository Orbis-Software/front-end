<script setup lang="ts">
import "./WmsDashboardPage.css"
import { useWmsDashboardPage } from "./WmsDashboardPage"

const { dashboardDate, statCards, recentActivity, pendingActions } = useWmsDashboardPage()
</script>

<template>
  <section class="wms-dashboard-page">
    <header class="wms-dashboard-page__header">
      <div class="wms-dashboard-page__title-wrap">
        <h1 class="wms-dashboard-page__title">
          Dashboard
          <span class="wms-dashboard-page__title-date">{{ dashboardDate }}</span>
        </h1>
      </div>
    </header>

    <div class="wms-dashboard-page__stats">
      <article v-for="card in statCards" :key="card.label" class="wms-dashboard-page__stat-card">
        <div class="wms-dashboard-page__stat-label">{{ card.label }}</div>
        <div class="wms-dashboard-page__stat-value">{{ card.value }}</div>
        <div
          class="wms-dashboard-page__stat-sub"
          :class="{
            'wms-dashboard-page__stat-sub--warn': card.tone === 'warn',
            'wms-dashboard-page__stat-sub--ok': card.tone === 'ok',
          }"
        >
          {{ card.subtext }}
        </div>
      </article>
    </div>

    <div class="wms-dashboard-page__grid">
      <section class="wms-dashboard-page__card">
        <div class="wms-dashboard-page__card-header">
          <h2 class="wms-dashboard-page__card-title">Recent Activity</h2>
        </div>

        <div class="wms-dashboard-page__card-body">
          <ul v-if="recentActivity.length" class="wms-dashboard-page__activity-list">
            <li
              v-for="item in recentActivity"
              :key="`${item.text}-${item.time}`"
              class="wms-dashboard-page__activity-item"
            >
              <span class="wms-dashboard-page__activity-dot" :style="{ background: item.dot }" />
              <div class="wms-dashboard-page__activity-content">
                <div class="wms-dashboard-page__activity-text">{{ item.text }}</div>
                <div class="wms-dashboard-page__activity-time">{{ item.time }}</div>
              </div>
            </li>
          </ul>

          <div v-else class="wms-dashboard-page__empty">No recent activity.</div>
        </div>
      </section>

      <section class="wms-dashboard-page__card">
        <div class="wms-dashboard-page__card-header">
          <h2 class="wms-dashboard-page__card-title">Pending Actions</h2>
        </div>

        <div class="wms-dashboard-page__card-body">
          <div v-if="pendingActions.length" class="wms-dashboard-page__actions">
            <div
              v-for="action in pendingActions"
              :key="action.label"
              class="wms-dashboard-page__action-row"
            >
              <div
                class="wms-dashboard-page__action-text"
                :class="{
                  'wms-dashboard-page__action-text--warn': action.tone === 'warn',
                }"
              >
                <strong>{{ action.count }}</strong>
                {{ action.label }}
              </div>

              <RouterLink class="wms-dashboard-page__action-link" :to="action.to">
                View →
              </RouterLink>
            </div>
          </div>

          <div v-else class="wms-dashboard-page__empty">No pending actions.</div>
        </div>
      </section>
    </div>
  </section>
</template>
