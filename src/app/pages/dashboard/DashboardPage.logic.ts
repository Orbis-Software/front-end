import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import dashboardService from "@/app/services/dashboard"
import { useAuthStore } from "@/app/stores/auth"
import type {
  DashboardDateRange,
  DashboardJobStatus,
  DashboardQuoteReminder,
  DashboardTransportSummary,
  DashboardUserFocus,
} from "@/app/types/dashboard"
import type { TransportMode } from "@/app/types/transport-job"

export function useDashboardPage() {
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
      {
        key: "open",
        label: "OPEN JOBS",
        value: stats?.open_jobs ?? 0,
        sub: "Planned + in transit",
      },
      {
        key: "delivered",
        label: "JOBS DELIVERED",
        value: stats?.delivered_jobs ?? 0,
        sub: "Completed jobs",
      },
      {
        key: "exceptions",
        label: "EXCEPTIONS",
        value: stats?.exceptions ?? 0,
        sub: "Needs review",
      },
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
  const creditAlerts = computed(() => summary.value?.credit_alerts ?? [])
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
      credit_alerts: filterActiveRecords(data.credit_alerts),
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

  function formatCredit(value: number, currency = "GBP") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
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

  function openContact(id: number) {
    router.push({ name: "crm.contacts.show", params: { id } })
  }

  function reminderLabel(reminder: DashboardQuoteReminder) {
    if (reminder.reminder_type === "accepted") return "Accepted"
    if (reminder.urgency === "overdue") return "Follow-up overdue"
    if (reminder.urgency === "today") return "Follow up today"

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

  return {
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
  }
}
