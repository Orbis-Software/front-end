import { computed } from "vue"

type Tone = "default" | "warn" | "ok"

type StatCard = {
  label: string
  value: string
  subtext: string
  tone?: Tone
}

type ActivityItem = {
  dot: string
  text: string
  time: string
}

type PendingAction = {
  count: number
  label: string
  to: string
  tone?: Tone
}

export function useWmsDashboardPage() {
  const dashboardDate = computed(() => {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  })

  /**
   * Temporary mock data based on the WMS HTML reference.
   * We can later replace this with a Pinia store / API response.
   */
  const consignments = [
    { status: "In Storage", customerId: "c1", weight: 320 },
    { status: "In Storage", customerId: "c1", weight: 180 },
    { status: "Allocated", customerId: "c2", weight: 540 },
  ]

  const expectedArrivals = [
    { status: "Expected", estDate: "2026-04-20" },
    { status: "Expected", estDate: "2026-04-25" },
  ]

  const shipments = [{ status: "Building" }, { status: "Ready" }, { status: "Dispatched" }]

  const stock = [
    { qty: 250, minQty: 20, status: "Active" },
    { qty: 500, minQty: 50, status: "Active" },
    { qty: 8, minQty: 30, status: "Active" },
  ]

  const recentActivity = computed<ActivityItem[]>(() => [
    {
      dot: "#2E7D32",
      text: "Consignment CON-A1B2C3 received from TechSource Ltd for Greenfield Imports",
      time: "Today 09:14",
    },
    {
      dot: "#2E7D32",
      text: "Consignment CON-D4E5F6 received from Global Imports Co for Greenfield Imports",
      time: "20 Mar 16:30",
    },
    {
      dot: "#1565C0",
      text: "Consignment CON-G7H8I9 received from TechSource Ltd for NovaTech Solutions",
      time: "18 Mar 11:02",
    },
  ])

  const statCards = computed<StatCard[]>(() => {
    const inStorage = consignments.filter(item => item.status === "In Storage").length
    const allocated = consignments.filter(item => item.status === "Allocated").length
    const activeShipments = shipments.filter(item => item.status !== "Dispatched").length
    const ready = shipments.filter(item => item.status === "Ready").length
    const customerCount = new Set(consignments.map(item => item.customerId)).size
    const totalWeight = consignments.reduce((sum, item) => sum + item.weight, 0)
    const expectedCount = expectedArrivals.filter(item => item.status === "Expected").length
    const overdueCount = expectedArrivals.filter(item => {
      return item.status === "Expected" && new Date(item.estDate) <= new Date()
    }).length
    const lowStock = stock.filter(
      item => item.qty <= item.minQty && item.status !== "Discontinued",
    ).length

    return [
      {
        label: "Consignments Stored",
        value: String(inStorage + allocated),
        subtext: `${customerCount} customer${customerCount !== 1 ? "s" : ""} / ${totalWeight.toFixed(0)} kg`,
      },
      {
        label: "Expected Arrivals",
        value: String(expectedCount),
        subtext: `${overdueCount} due today or overdue`,
        tone: "warn",
      },
      {
        label: "Active Shipments",
        value: String(activeShipments),
        subtext: ready > 0 ? `${ready} ready to dispatch` : "No shipments ready",
        tone: ready > 0 ? "warn" : "ok",
      },
      {
        label: "Stock Catalogue",
        value: `${stock.length} SKUs`,
        subtext: lowStock > 0 ? `${lowStock} low stock alerts` : "All stock OK",
        tone: lowStock > 0 ? "warn" : "ok",
      },
    ]
  })

  const pendingActions = computed<PendingAction[]>(() => {
    const overdueCount = expectedArrivals.filter(item => {
      return item.status === "Expected" && new Date(item.estDate) <= new Date()
    }).length

    const readyCount = shipments.filter(item => item.status === "Ready").length

    const lowStockCount = stock.filter(item => {
      return item.qty <= item.minQty && item.status !== "Discontinued"
    }).length

    const actions: PendingAction[] = []

    if (overdueCount > 0) {
      actions.push({
        count: overdueCount,
        label: `arrival${overdueCount !== 1 ? "s" : ""} due today/overdue`,
        to: "/warehouse/goods-in/expected-arrivals",
        tone: "warn",
      })
    }

    if (readyCount > 0) {
      actions.push({
        count: readyCount,
        label: `shipment${readyCount !== 1 ? "s" : ""} ready to dispatch`,
        to: "/warehouse/consolidation/active-shipments",
      })
    }

    if (lowStockCount > 0) {
      actions.push({
        count: lowStockCount,
        label: `product${lowStockCount !== 1 ? "s" : ""} low on stock`,
        to: "/inventory/stock/low-stock",
        tone: "warn",
      })
    }

    return actions
  })

  return {
    dashboardDate,
    statCards,
    recentActivity,
    pendingActions,
  }
}
