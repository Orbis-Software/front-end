<template>
  <div class="dashboard-page">
    <!-- HERO -->
    <Card class="dash-card dash-hero">
      <template #content>
        <div class="dash-hero__inner">
          <div class="dash-hero__content">
            <div class="dash-eyebrow">ORBIS TMS / DASHBOARD DEMO</div>
            <h1 class="dash-title">Transport Management Dashboard</h1>
            <p class="dash-subtitle">
              Consistent dashboard layout across User, Management All Users, and Management
              Individual User views.
            </p>
          </div>

          <div class="dash-hero__actions">
            <Button
              label="Create Job"
              icon="pi pi-plus"
              class="btn btn--primary"
              @click="goJobsCreate"
            />
            <Button label="Create Quote" class="btn btn--ghost" @click="goQuotes" />
            <Button label="Export View" class="btn btn--ghost" @click="exportView" />
          </div>
        </div>
      </template>
    </Card>

    <!-- VIEW TABS -->
    <div class="dash-view-tabs">
      <button
        type="button"
        class="dash-view-tab"
        :class="{ 'dash-view-tab--active': activeView === 'user' }"
        @click="activeView = 'user'"
      >
        User Dashboard
      </button>

      <button
        type="button"
        class="dash-view-tab"
        :class="{ 'dash-view-tab--active': activeView === 'management' }"
        @click="activeView = 'management'"
      >
        Management Overview
      </button>
    </div>

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

    <!-- USER VIEW -->
    <template v-if="activeView === 'user'">
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
                <div class="todo-card__meta">{{ t.owner }} · {{ t.when }}</div>
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
                <div class="legend-item">
                  <span class="legend-dot legend-dot--orange"></span>
                  <span>Air</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray"></span>
                  <span>Road</span>
                </div>
              </div>

              <div class="donut donut--mode-user">
                <div class="donut-hole"></div>
              </div>

              <div class="metric-row">
                <div class="metric-pill">
                  <span>Air</span>
                  <strong>1</strong>
                </div>

                <div class="metric-pill">
                  <span>Road</span>
                  <strong>2</strong>
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
                <div class="legend-item">
                  <span class="legend-dot legend-dot--orange"></span>
                  <span>Air</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray"></span>
                  <span>Road</span>
                </div>
              </div>

              <div class="donut donut--revenue-user">
                <div class="donut-hole"></div>
              </div>

              <div class="metric-row">
                <div class="metric-pill">
                  <span>Air</span>
                  <strong>£2,450</strong>
                </div>

                <div class="metric-pill">
                  <span>Road</span>
                  <strong>£2,490</strong>
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
        The management page now keeps the same structure whether you are viewing All Users or an
        individual user.
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
                <div class="todo-card__meta">{{ t.owner }} · {{ t.when }}</div>
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
                <div class="legend-item">
                  <span class="legend-dot legend-dot--orange"></span>
                  <span>Air</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray"></span>
                  <span>Road</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray-dark"></span>
                  <span>Sea</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray-light"></span>
                  <span>Rail</span>
                </div>
              </div>

              <div class="donut donut--mix-management">
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
                <div class="legend-item">
                  <span class="legend-dot legend-dot--orange"></span>
                  <span>Air</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray"></span>
                  <span>Road</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray-dark"></span>
                  <span>Sea</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot legend-dot--gray-light"></span>
                  <span>Rail</span>
                </div>
              </div>

              <div class="donut donut--revenue-management">
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
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import "./DashboardPage.css"

type ViewMode = "user" | "management"

type StatCard = {
  key: string
  label: string
  value: string | number
  sub: string
  progress?: number
  progressLabel?: string
}

const router = useRouter()

const activeView = ref<ViewMode>("user")

const filters = reactive({
  date: "month",
  userFocus: "all_users",
  mode: "all",
  search: "",
})

const isManagement = computed(() => activeView.value === "management")

const dateOptions = [
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Last Month", value: "last_month" },
]

const userFocusOptions = [
  { label: "All Users", value: "all_users" },
  { label: "Maral Y.", value: "maral" },
  { label: "Ian H.", value: "ian" },
  { label: "James K.", value: "james" },
  { label: "Nadia R.", value: "nadia" },
]

const modeOptions = [
  { label: "All Modes", value: "all" },
  { label: "Air", value: "air" },
  { label: "Road", value: "road" },
  { label: "Sea", value: "sea" },
  { label: "Rail", value: "rail" },
]

const userStatCards: StatCard[] = [
  { key: "jobs", label: "ALL JOBS", value: 3, sub: "User history" },
  { key: "quotes", label: "QUOTES", value: 2, sub: "Current quotes" },
  { key: "open", label: "OPEN JOBS", value: 2, sub: "Planned + in transit" },
  { key: "delivered", label: "JOBS DELIVERED", value: 1, sub: "Completed jobs" },
  { key: "exceptions", label: "EXCEPTIONS", value: 2, sub: "Operational issues" },
  { key: "sales", label: "TOTAL SALES", value: "£4,940", sub: "Visible sales" },
  { key: "cost", label: "COST", value: "£3,250", sub: "Operational cost" },
  { key: "profit", label: "PROFIT / LOSS", value: "£1,690", sub: "Sales less cost" },
  {
    key: "target_sales",
    label: "SALES TARGET",
    value: "£12,000",
    sub: "£4,940 actual",
    progress: 41,
    progressLabel: "Progress",
  },
  {
    key: "target_profit",
    label: "PROFIT TARGET",
    value: "£3,800",
    sub: "£1,690 actual",
    progress: 44,
    progressLabel: "Progress",
  },
]

const managementStatCards: StatCard[] = [
  { key: "jobs", label: "ALL JOBS", value: 12, sub: "Entire dataset" },
  { key: "quotes", label: "QUOTES", value: 8, sub: "All users" },
  { key: "open", label: "OPEN JOBS", value: 8, sub: "Planned + in transit" },
  { key: "delivered", label: "JOBS DELIVERED", value: 4, sub: "Completed jobs" },
  { key: "exceptions", label: "EXCEPTIONS", value: 8, sub: "Business-wide issues" },
  { key: "sales", label: "TOTAL SALES", value: "£43,790", sub: "Visible sales" },
  { key: "cost", label: "COST", value: "£30,050", sub: "Operational cost" },
  { key: "profit", label: "PROFIT / LOSS", value: "£13,740", sub: "Sales less cost" },
  {
    key: "target_sales",
    label: "SALES TARGET",
    value: "£68,500",
    sub: "£43,790 actual",
    progress: 64,
    progressLabel: "Progress",
  },
  {
    key: "target_profit",
    label: "PROFIT TARGET",
    value: "£21,000",
    sub: "£13,740 actual",
    progress: 65,
    progressLabel: "Progress",
  },
]

const currentStatCards = computed(() =>
  activeView.value === "management" ? managementStatCards : userStatCards,
)

const kanban = [
  {
    key: "planned",
    title: "Planned",
    jobs: [
      { id: 1, ref: "JOB-250301", customer: "Aston Components Ltd" },
      { id: 2, ref: "JOB-250311", customer: "PC Cargo House Account" },
    ],
  },
  {
    key: "transit",
    title: "In Transit",
    jobs: [],
  },
  {
    key: "delivered",
    title: "Delivered",
    jobs: [{ id: 3, ref: "JOB-250306", customer: "Atlas Trade Group" }],
  },
]

const userTodo = [
  {
    id: 1,
    title: "Upload POD for JOB-250301",
    owner: "Maral Y.",
    when: "Due Today",
  },
]

const managementExceptions = [
  {
    id: 1,
    title: "JOB-250301 • Aston Components Ltd",
    owner: "Maral Y.",
    when: "Missing POD",
  },
  {
    id: 2,
    title: "JOB-250302 • Silk Route Trading",
    owner: "Ian H.",
    when: "Customs inspection",
  },
  {
    id: 3,
    title: "JOB-250304 • Northfield Medical",
    owner: "James K.",
    when: "Awaiting booking confirmation",
  },
  {
    id: 4,
    title: "JOB-250305 • EuroMach Systems",
    owner: "Nadia R.",
    when: "Documentation query",
  },
]

const rawPerformance = [
  { name: "Maral", sales: 5000, profit: 1800, target: 12000 },
  { name: "Ian", sales: 15500, profit: 5000, target: 18000 },
  { name: "Sarah", sales: 8500, profit: 2400, target: 14000 },
  { name: "James", sales: 5700, profit: 1900, target: 11000 },
  { name: "Nadia", sales: 9700, profit: 3200, target: 13500 },
]

const maxMetric = Math.max(
  ...rawPerformance.flatMap(item => [item.sales, item.profit, item.target]),
)

const managementPerformance = rawPerformance.map(item => ({
  ...item,
  salesPct: Math.round((item.sales / maxMetric) * 100),
  profitPct: Math.round((item.profit / maxMetric) * 100),
  targetPct: Math.round((item.target / maxMetric) * 100),
}))

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

function exportView() {
  console.log("export dashboard", {
    view: activeView.value,
    ...filters,
  })
}
</script>
