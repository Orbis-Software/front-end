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
              <div class="panel-card__sub">Quotes that are waiting for customer follow-up.</div>
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
                {{ reminderLabel(reminder.urgency) }}:
                <strong>{{ formatDashboardDate(reminder.follow_up_date) }}</strong>
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
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import dashboardService from "@/app/services/dashboard"
import { useAuthStore } from "@/app/stores/auth"
import type {
  DashboardDateRange,
  DashboardJobStatus,
  DashboardTransportSummary,
  DashboardUserFocus,
} from "@/app/services/dashboard/transport"
import type { TransportMode } from "@/app/types/transport-job"
import "./DashboardPage.css"

type StatCard = {
  key: string
  label: string
  value: string | number
  sub: string
  progress?: number
  progressLabel?: string
}

const router = useRouter()
const auth = useAuthStore()

const filters = reactive({
  date: "all_time" as DashboardDateRange,
  jobStatus: "all" as DashboardJobStatus,
  userFocus: "all_users" as DashboardUserFocus,
  mode: "all" as TransportMode | "all",
  search: "",
})

const summary = ref<DashboardTransportSummary | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

type SoftDeleteFields = {
  deleted_at?: unknown
  deletedAt?: unknown
  softdelete?: unknown
  softDelete?: unknown
  soft_deleted?: unknown
  is_deleted?: unknown
}

const dateOptions = [
  { label: "All Time", value: "all_time" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Last Month", value: "last_month" },
]

const jobStatusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Job Created", value: "Job Created" },
  { label: "Data Entry", value: "Data Entry" },
  { label: "Booked", value: "Booked" },
  { label: "Departed", value: "Departed" },
  { label: "In Transit", value: "In Transit" },
  { label: "Arrived", value: "Arrived" },
  { label: "POD / Closed", value: "POD / Closed" },
]

const userFocusOptions = computed(() => [
  { label: "All Users", value: "all_users" },
  { label: "My Jobs", value: "current_user" },
  ...(summary.value?.users.map(user => ({
    label: user.name,
    value: user.id,
  })) ?? []),
])

const modeOptions = [
  { label: "All Modes", value: "all" },
  { label: "Air", value: "air" },
  { label: "Road", value: "road" },
  { label: "Sea", value: "sea" },
  { label: "Rail", value: "rail" },
  { label: "Courier", value: "courier" },
  { label: "Multi Modal", value: "multi_modal" },
  { label: "Consolidation", value: "consolidation" },
]

const managementRoles = ["super-admin", "admin", "company-manager"]

const hasManagementRole = computed(() => {
  return managementRoles.some(role => auth.hasRole(role))
})

const managementDashboardPermissions = [
  "mgmt.accounts.invoices.manage",
  "mgmt.accounts.exchange_rates.manage",
  "mgmt.accounts.tax_codes.manage",
  "mgmt.accounts.banks.manage",
  "mgmt.accounts.charge_descriptions.manage",
  "mgmt.employees.view",
  "mgmt.employees.manage",
  "mgmt.employees.access.manage",
  "mgmt.system.company.manage",
  "mgmt.system.branding.manage",
  "mgmt.system.shortcuts.manage",
  "mgmt.system.master_settings.manage",
]

const hasManagementDashboardPermissions = computed(() => {
  return managementDashboardPermissions.some(permission => auth.hasPermission(permission))
})

const isManagement = computed(() => {
  return auth.isAdmin || hasManagementRole.value || hasManagementDashboardPermissions.value
})

const canCreateJobs = computed(() => {
  return auth.hasPermission("tms.jobs.create")
})

const canViewQuotes = computed(() => {
  return auth.hasPermission("tms.quotes.view") || auth.hasPermission("tms.quotes.create")
})

const currentStatCards = computed(() => {
  const stats = summary.value?.stats
  const scope = isManagement.value ? "Selected business view" : "Your visible records"
  const salesTarget = stats?.sales_target ?? 0
  const profitTarget = stats?.profit_target ?? 0

  return [
    { key: "jobs", label: "ALL JOBS", value: stats?.jobs ?? 0, sub: scope },
    { key: "quotes", label: "QUOTES", value: stats?.quotes ?? 0, sub: "Current quotes" },
    { key: "open", label: "OPEN JOBS", value: stats?.open_jobs ?? 0, sub: "Planned + in transit" },
    {
      key: "delivered",
      label: "JOBS DELIVERED",
      value: stats?.delivered_jobs ?? 0,
      sub: "Completed jobs",
    },
    { key: "exceptions", label: "EXCEPTIONS", value: stats?.exceptions ?? 0, sub: "Needs review" },
    { key: "sales", label: "TOTAL SALES", value: money(stats?.sales ?? 0), sub: "Visible sales" },
    { key: "cost", label: "COST", value: money(stats?.cost ?? 0), sub: "Operational cost" },
    {
      key: "profit",
      label: "PROFIT / LOSS",
      value: money(stats?.profit ?? 0),
      sub: "Sales less cost",
    },
    {
      key: "target_sales",
      label: "SALES TARGET",
      value: money(salesTarget),
      sub: `${money(stats?.sales ?? 0)} actual`,
      progress: percentage(stats?.sales ?? 0, salesTarget),
      progressLabel: "Progress",
    },
    {
      key: "target_profit",
      label: "PROFIT TARGET",
      value: money(profitTarget),
      sub: `${money(stats?.profit ?? 0)} actual`,
      progress: percentage(stats?.profit ?? 0, profitTarget),
      progressLabel: "Progress",
    },
  ] satisfies StatCard[]
})

const kanban = computed(() => summary.value?.kanban ?? [])
const userTodo = computed(() => summary.value?.todos ?? [])
const managementExceptions = computed(() => summary.value?.todos ?? [])
const quoteReminders = computed(() => summary.value?.quote_reminders ?? [])
const modeMix = computed(() => summary.value?.mode_mix ?? [])
const revenueByMode = computed(() => summary.value?.revenue_by_mode ?? [])

const managementPerformance = computed(() => {
  const items = summary.value?.performance ?? []
  const maxMetric = Math.max(1, ...items.flatMap(item => [item.sales, item.profit, item.target]))

  return items.map(item => ({
    ...item,
    salesPct: Math.max(2, Math.round((item.sales / maxMetric) * 100)),
    profitPct: Math.max(2, Math.round((item.profit / maxMetric) * 100)),
    targetPct: Math.max(2, Math.round((item.target / maxMetric) * 100)),
  }))
})

const donutMixStyle = computed(() => donutStyle(modeMix.value, "count"))
const donutRevenueStyle = computed(() => donutStyle(revenueByMode.value, "amount"))

let fetchTimer: ReturnType<typeof setTimeout> | null = null
let fetchVersion = 0

onMounted(() => {
  fetchDashboard()
})

watch(
  () => [
    filters.date,
    filters.jobStatus,
    filters.userFocus,
    filters.mode,
    filters.search,
    isManagement.value,
  ],
  () => {
    if (fetchTimer) {
      clearTimeout(fetchTimer)
    }

    fetchTimer = setTimeout(fetchDashboard, 250)
  },
)

async function fetchDashboard() {
  const version = ++fetchVersion
  loading.value = true
  error.value = null

  try {
    const data = await dashboardService.transport({
      date: filters.date,
      job_status: filters.jobStatus,
      user_focus: isManagement.value ? filters.userFocus : "current_user",
      mode: filters.mode,
      q: filters.search || undefined,
    })

    if (version === fetchVersion) {
      summary.value = filterSoftDeletedDashboardData(data)
    }
  } catch (err) {
    if (version === fetchVersion) {
      error.value = "Dashboard data could not be loaded."
      console.error(err)
    }
  } finally {
    if (version === fetchVersion) {
      loading.value = false
    }
  }
}

function filterSoftDeletedDashboardData(
  data: DashboardTransportSummary,
): DashboardTransportSummary {
  return {
    ...data,
    users: filterActiveRecords(data.users),
    kanban: filterActiveRecords(data.kanban).map(lane => ({
      ...lane,
      jobs: filterActiveRecords(lane.jobs),
    })),
    todos: filterActiveRecords(data.todos),
    quote_reminders: filterActiveRecords(data.quote_reminders),
    mode_mix: filterActiveRecords(data.mode_mix),
    revenue_by_mode: filterActiveRecords(data.revenue_by_mode),
    performance: filterActiveRecords(data.performance),
  }
}

function filterActiveRecords<T extends object>(items: T[] = []): T[] {
  return items.filter(item => !isSoftDeleted(item as T & SoftDeleteFields))
}

function isSoftDeleted(item: SoftDeleteFields) {
  return [
    item.deleted_at,
    item.deletedAt,
    item.softdelete,
    item.softDelete,
    item.soft_deleted,
    item.is_deleted,
  ].some(isSoftDeleteValue)
}

function isSoftDeleteValue(value: unknown) {
  if (value === null || value === undefined || value === false || value === 0 || value === "") {
    return false
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized !== "" && normalized !== "0" && normalized !== "false"
  }

  return Boolean(value)
}

function money(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

function percentage(actual: number, target: number) {
  if (!target) return 0

  return Math.min(100, Math.round((actual / target) * 100))
}

function donutStyle(
  items: { mode: string; count?: number; amount?: number }[],
  key: "count" | "amount",
) {
  const total = items.reduce((sum, item) => sum + Number(item[key] ?? 0), 0)

  if (!total) {
    return { background: "var(--dashboard-panel-soft)" }
  }

  let start = 0
  const segments = items.map((item, index) => {
    const value = Number(item[key] ?? 0)
    const end = start + (value / total) * 360
    const segment = `${modeColor(item.mode, index)} ${start}deg ${end}deg`
    start = end
    return segment
  })

  return { background: `conic-gradient(${segments.join(", ")})` }
}

function modeColor(mode: string, fallbackIndex = 0) {
  const colors: Record<string, string> = {
    air: "var(--dashboard-accent)",
    road: "#9c9c9c",
    sea: "#595959",
    rail: "#b9b9b9",
    courier: "#777",
    multi_modal: "#d0d0d0",
    consolidation: "#434343",
  }
  const fallbackColors = Object.values(colors)

  return colors[mode] ?? fallbackColors[fallbackIndex % fallbackColors.length]
}

function goJobs() {
  router.push({ name: "tms.jobs.index" })
}

function goJobsCreate() {
  router.push({ name: "tms.jobs.create" })
}

function goQuotes() {
  router.push({ name: "tms.quotes.index" })
}

function openJob(id: number) {
  router.push({ name: "tms.jobs.show", params: { id } })
}

function openQuote(id: number) {
  router.push({ name: "tms.quotes.show", params: { id } })
}

function reminderLabel(urgency: "overdue" | "today" | "upcoming") {
  if (urgency === "overdue") return "Follow-up overdue"
  if (urgency === "today") return "Follow up today"

  return "Follow up"
}

function formatDashboardDate(value: string) {
  const date = new Date(`${value}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
}

function exportView() {
  console.log("export dashboard", {
    view: isManagement.value ? "management" : "user",
    ...filters,
    stats: summary.value?.stats,
  })
}
</script>
