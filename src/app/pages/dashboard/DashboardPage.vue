<template>
  <div class="dashboard-page">
    <!-- HERO -->
    <Card class="dash-card dash-hero">
      <template #content>
        <div class="dash-hero__inner">
          <div class="dash-hero__content">
            <div class="dash-eyebrow">DASHBOARD</div>
            <h1 class="dash-title">
              {{ isManagement ? "Management Dashboard" : "Transport Management Dashboard" }}
            </h1>
            <p class="dash-subtitle">
              {{
                isManagement
                  ? "Management overview based on your access level."
                  : "Operational dashboard based on your user access."
              }}
            </p>
          </div>

          <div class="dash-hero__actions">
            <Button
              v-if="canCreateJobs"
              label="Create Job"
              icon="pi pi-plus"
              class="btn btn--primary"
              @click="goJobsCreate"
            />
            <Button
              v-if="canViewQuotes"
              label="Create Quote"
              class="btn btn--ghost"
              @click="goQuotes"
            />
            <Button label="Export View" class="btn btn--ghost" @click="exportView" />
          </div>
        </div>
      </template>
    </Card>

    <!-- FILTERS -->
    <Card class="dash-card dash-filters">
      <template #content>
        <div class="dash-filters__grid" :class="{ 'dash-filters__grid--management': isManagement }">
          <div class="dash-field">
            <label class="dash-label">DATE RANGE</label>
            <Select
              v-model="filters.date"
              :options="dateOptions"
              optionLabel="label"
              optionValue="value"
              class="dash-select"
            />
          </div>

          <div class="dash-field">
            <label class="dash-label">JOB STATUS</label>
            <Select
              v-model="filters.jobStatus"
              :options="jobStatusOptions"
              optionLabel="label"
              optionValue="value"
              class="dash-select"
            />
          </div>

          <div v-if="isManagement" class="dash-field">
            <label class="dash-label">USER FOCUS</label>
            <Select
              v-model="filters.userFocus"
              :options="userFocusOptions"
              optionLabel="label"
              optionValue="value"
              class="dash-select"
            />
          </div>

          <div class="dash-field">
            <label class="dash-label">MODE OF TRANSPORT</label>
            <Select
              v-model="filters.mode"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              class="dash-select"
            />
          </div>

          <div class="dash-field dash-field--search">
            <label class="dash-label">SEARCH</label>
            <InputText
              v-model="filters.search"
              class="dash-search"
              placeholder="Search jobs, customers, issues..."
            />
          </div>
        </div>
      </template>
    </Card>

    <div v-if="loading" class="dashboard-status">Loading dashboard data...</div>
    <div v-else-if="error" class="dashboard-status dashboard-status--error">{{ error }}</div>

    <!-- KPI GRID -->
    <section class="dash-kpis">
      <Card v-for="card in currentStatCards" :key="card.key" class="dash-card stat-card">
        <template #content>
          <div class="stat-card__label">{{ card.label }}</div>
          <div class="stat-card__value">{{ card.value }}</div>
          <div class="stat-card__sub">{{ card.sub }}</div>

          <div v-if="card.progress !== undefined" class="stat-card__progress-wrap">
            <div class="stat-card__progress-meta">
              <span>{{ card.progressLabel }}</span>
              <span>{{ card.progress }}%</span>
            </div>

            <div class="stat-progress">
              <div class="stat-progress__bar" :style="{ width: `${card.progress}%` }" />
            </div>
          </div>
        </template>
      </Card>
    </section>

    <section v-if="canViewQuotes" class="quote-reminders-section">
      <Card class="dash-card panel-card quote-reminders-card">
        <template #content>
          <div class="panel-card__head">
            <div>
              <div class="panel-card__title">Quote Follow-Up Reminders</div>
              <div class="panel-card__sub">
                Newly accepted quotes and quotes waiting for customer follow-up.
              </div>
            </div>

            <Button label="VIEW ALL QUOTES" class="btn btn--ghost btn--small" @click="goQuotes" />
          </div>

          <div v-if="quoteReminders.length" class="quote-reminder-list">
            <button
              v-for="reminder in quoteReminders"
              :key="reminder.id"
              type="button"
              class="quote-reminder"
              :class="`quote-reminder--${reminder.urgency}`"
              @click="openQuote(reminder.id)"
            >
              <div class="quote-reminder__top">
                <strong>{{ reminder.ref }}</strong>
                <span class="quote-reminder__status">{{ reminder.status }}</span>
              </div>
              <div class="quote-reminder__customer">{{ reminder.customer }}</div>
              <div class="quote-reminder__date">
                {{ reminderLabel(reminder) }}:
                <strong>{{ formatDashboardDate(reminder.reminder_date) }}</strong>
              </div>
              <div v-if="reminder.reminder_type === 'accepted'" class="quote-reminder__notice">
                Customer accepted — ready for job conversion.
              </div>
              <div class="quote-reminder__owner">Owner: {{ reminder.owner }}</div>
            </button>
          </div>

          <div v-else class="quote-reminder-empty">
            <i class="pi pi-check-circle" aria-hidden="true"></i>
            <span>No active quote follow-ups are scheduled.</span>
          </div>
        </template>
      </Card>
    </section>

    <section v-if="isManagement && creditAlerts.length" class="credit-alerts-section">
      <Card class="dash-card panel-card credit-alerts-card">
        <template #content>
          <div class="panel-card__head">
            <div>
              <div class="panel-card__title">Customer Credit Limits</div>
              <div class="panel-card__sub">
                Customers at their credit limit or the 110% hard stop.
              </div>
            </div>
          </div>

          <div class="credit-alert-list">
            <button
              v-for="alert in creditAlerts"
              :key="alert.customer_id"
              type="button"
              class="credit-alert"
              :class="{ 'credit-alert--hard-stop': alert.hard_stopped }"
              @click="openContact(alert.customer_id)"
            >
              <span class="credit-alert__status">
                {{ alert.hard_stopped ? "HARD STOP" : "CREDIT LIMIT" }}
              </span>
              <strong>{{ alert.customer }}</strong>
              <small>{{ alert.account_number || "No account number" }}</small>
              <span>
                Outstanding {{ formatCredit(alert.credit_used, alert.credit_currency) }} / limit
                {{ formatCredit(alert.credit_limit, alert.credit_currency) }}
              </span>
            </button>
          </div>
        </template>
      </Card>
    </section>

    <!-- USER VIEW -->
    <template v-if="!isManagement">
      <section class="dash-grid dash-grid--main">
        <!-- KANBAN -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Operational Kanban</div>
                <div class="panel-card__sub">Workflow grouped by status.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" @click="goJobs" />
            </div>

            <div class="kanban-grid">
              <div
                v-for="lane in kanban"
                :key="lane.key"
                class="kanban-lane"
                :class="`kanban-lane--${lane.key}`"
              >
                <div class="kanban-lane__title">{{ lane.title }}</div>

                <div class="kanban-lane__list">
                  <div
                    v-for="job in lane.jobs"
                    :key="job.ref"
                    class="kanban-card"
                    @click="openJob(job.id)"
                  >
                    <div class="kanban-card__ref">{{ job.ref }}</div>
                    <div class="kanban-card__customer">{{ job.customer }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- TODO / EXCEPTIONS -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">To Do & Exceptions</div>
                <div class="panel-card__sub">Daily tasks plus exception handling.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="todo-list">
              <div v-for="t in userTodo" :key="t.id" class="todo-card">
                <div class="todo-card__title">{{ t.title }}</div>
                <div class="todo-card__meta">{{ t.owner }} &middot; {{ t.when }}</div>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="dash-grid dash-grid--bottom">
        <!-- MODE OF TRANSPORT -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Mode of Transport</div>
                <div class="panel-card__sub">Donut report by mode.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="chart-card">
              <div class="chart-card__legend chart-card__legend--top">
                <div v-for="item in modeMix" :key="item.mode" class="legend-item">
                  <span class="legend-dot" :style="{ background: modeColor(item.mode) }"></span>
                  <span>{{ item.label }}</span>
                </div>
              </div>

              <div class="donut" :style="donutMixStyle">
                <div class="donut-hole"></div>
              </div>

              <div class="metric-row">
                <div v-for="item in modeMix" :key="item.mode" class="metric-pill">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.count ?? 0 }}</strong>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- REVENUE DISTRIBUTION -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Revenue Distribution</div>
                <div class="panel-card__sub">Sales by mode.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="chart-card">
              <div class="chart-card__legend chart-card__legend--top">
                <div v-for="item in revenueByMode" :key="item.mode" class="legend-item">
                  <span class="legend-dot" :style="{ background: modeColor(item.mode) }"></span>
                  <span>{{ item.label }}</span>
                </div>
              </div>

              <div class="donut" :style="donutRevenueStyle">
                <div class="donut-hole"></div>
              </div>

              <div class="metric-row">
                <div v-for="item in revenueByMode" :key="item.mode" class="metric-pill">
                  <span>{{ item.label }}</span>
                  <strong>{{ money(item.amount ?? 0) }}</strong>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </section>
    </template>

    <!-- MANAGEMENT VIEW -->
    <template v-else>
      <div class="management-note">
        This dashboard is displayed automatically because your role or permissions allow management
        access.
      </div>

      <section class="dash-grid dash-grid--main">
        <!-- MANAGEMENT PERFORMANCE OVERVIEW -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Management Performance Overview</div>
                <div class="panel-card__sub">Compare users by sales, profit and targets.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="chart-area">
              <div class="bar-chart">
                <div class="bar-chart__legend">
                  <div class="legend-item">
                    <span class="legend-dot legend-dot--orange"></span>
                    <span>Sales</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot legend-dot--gray-dark"></span>
                    <span>Profit</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot legend-dot--gray-light"></span>
                    <span>Sales Target</span>
                  </div>
                </div>

                <div class="bar-chart__plot">
                  <div class="bar-chart__gridline" v-for="n in 6" :key="n"></div>

                  <div
                    v-for="item in managementPerformance"
                    :key="item.name"
                    class="bar-chart__group"
                  >
                    <div class="bar-chart__bars">
                      <div
                        class="bar bar--sales"
                        :style="{ height: `${item.salesPct}%` }"
                        :title="`Sales: ${item.sales}`"
                      ></div>
                      <div
                        class="bar bar--profit"
                        :style="{ height: `${item.profitPct}%` }"
                        :title="`Profit: ${item.profit}`"
                      ></div>
                      <div
                        class="bar bar--target"
                        :style="{ height: `${item.targetPct}%` }"
                        :title="`Sales Target: ${item.target}`"
                      ></div>
                    </div>

                    <div class="bar-chart__label">{{ item.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- MANAGER EXCEPTIONS -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Manager Exceptions View</div>
                <div class="panel-card__sub">
                  Showing the first 4 exceptions to keep the dashboard compact.
                </div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="todo-list">
              <div v-for="t in managementExceptions" :key="t.id" class="todo-card">
                <div class="todo-card__title">{{ t.title }}</div>
                <div class="todo-card__meta">{{ t.owner }} &middot; {{ t.when }}</div>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="dash-grid dash-grid--bottom">
        <!-- BUSINESS MIX -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Business Mix by Mode</div>
                <div class="panel-card__sub">Donut report by mode.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="chart-card">
              <div class="chart-card__legend chart-card__legend--top">
                <div v-for="item in modeMix" :key="item.mode" class="legend-item">
                  <span class="legend-dot" :style="{ background: modeColor(item.mode) }"></span>
                  <span>{{ item.label }}</span>
                </div>
              </div>

              <div class="donut" :style="donutMixStyle">
                <div class="donut-hole"></div>
              </div>
            </div>
          </template>
        </Card>

        <!-- BUSINESS REVENUE -->
        <Card class="dash-card panel-card">
          <template #content>
            <div class="panel-card__head">
              <div>
                <div class="panel-card__title">Business Revenue by Mode</div>
                <div class="panel-card__sub">Sales by mode.</div>
              </div>

              <Button label="VIEW ALL" class="btn btn--ghost btn--small" />
            </div>

            <div class="chart-card">
              <div class="chart-card__legend chart-card__legend--top">
                <div v-for="item in revenueByMode" :key="item.mode" class="legend-item">
                  <span class="legend-dot" :style="{ background: modeColor(item.mode) }"></span>
                  <span>{{ item.label }}</span>
                </div>
              </div>

              <div class="donut" :style="donutRevenueStyle">
                <div class="donut-hole"></div>
              </div>
            </div>
          </template>
        </Card>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import "./DashboardPage.css"
import { useDashboardPage } from "./DashboardPage.logic"

const {
  filters,
  dateOptions,
  jobStatusOptions,
  userFocusOptions,
  modeOptions,
  loading,
  error,
  isManagement,
  canCreateJobs,
  canViewQuotes,
  currentStatCards,
  kanban,
  userTodo,
  managementExceptions,
  quoteReminders,
  creditAlerts,
  modeMix,
  revenueByMode,
  managementPerformance,
  donutMixStyle,
  donutRevenueStyle,
  money,
  formatCredit,
  modeColor,
  goJobs,
  goJobsCreate,
  goQuotes,
  openJob,
  openQuote,
  openContact,
  reminderLabel,
  formatDashboardDate,
  exportView,
} = useDashboardPage()
</script>
