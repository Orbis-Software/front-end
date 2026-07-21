import { computed, onMounted, ref } from "vue"
import expectedArrivalsService from "@/app/services/wms-expected-arrivals"
import type { WmsExpectedArrival } from "@/app/types/wms-expected-arrival"
import type {
  WmsDashboardActivityItem as ActivityItem,
  WmsDashboardPendingAction as PendingAction,
  WmsDashboardStatCard as StatCard,
} from "@/app/types/wms"

export function useWmsDashboardPage() {
  const expectedArrivals = ref<WmsExpectedArrival[]>([])
  const receivedConsignments = ref<WmsExpectedArrival[]>([])

  const dashboardDate = computed(() =>
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  )

  const recentActivity = computed<ActivityItem[]>(() =>
    receivedConsignments.value.slice(0, 5).map(arrival => ({
      dot: "#2E7D32",
      text: `${arrival.wms_reference} received${arrival.supplier_name ? ` from ${arrival.supplier_name}` : ""} for ${arrival.customer_name}`,
      time: arrival.received_at
        ? new Date(arrival.received_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Received",
    })),
  )

  const statCards = computed<StatCard[]>(() => {
    const customerCount = new Set(receivedConsignments.value.map(item => item.customer_name)).size
    const totalWeight = receivedConsignments.value.reduce(
      (sum, item) => sum + Number(item.received_weight_kg ?? 0),
      0,
    )
    const overdueCount = expectedArrivals.value.filter(isDueOrOverdue).length

    return [
      {
        label: "Consignments Stored",
        value: String(receivedConsignments.value.length),
        subtext: `${customerCount} customer${customerCount !== 1 ? "s" : ""} / ${totalWeight.toFixed(0)} kg`,
      },
      {
        label: "Expected Arrivals",
        value: String(expectedArrivals.value.length),
        subtext: `${overdueCount} due today or overdue`,
        tone: overdueCount > 0 ? "warn" : "ok",
      },
      { label: "Active Shipments", value: "0", subtext: "No shipments ready", tone: "ok" },
      {
        label: "Stock Catalogue",
        value: "0 SKUs",
        subtext: "No stock catalogue entries",
        tone: "ok",
      },
    ]
  })

  const pendingActions = computed<PendingAction[]>(() => {
    const overdueCount = expectedArrivals.value.filter(isDueOrOverdue).length
    return overdueCount > 0
      ? [
          {
            count: overdueCount,
            label: `arrival${overdueCount !== 1 ? "s" : ""} due today/overdue`,
            to: "/warehouse/goods-in/expected-arrivals",
            tone: "warn",
          },
        ]
      : []
  })

  onMounted(async () => {
    const [expected, received] = await Promise.all([
      expectedArrivalsService.list({ per_page: 100, status: "open" }),
      expectedArrivalsService.list({ per_page: 100, status: "booked_in" }),
    ])
    expectedArrivals.value = expected.data
    receivedConsignments.value = received.data
  })

  return { dashboardDate, statCards, recentActivity, pendingActions }
}

function isDueOrOverdue(arrival: WmsExpectedArrival): boolean {
  if (!arrival.expected_date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${arrival.expected_date}T00:00:00`) <= today
}
