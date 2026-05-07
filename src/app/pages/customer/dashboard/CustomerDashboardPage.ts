export type DashboardStat = {
  label: string
  value: string
  note: string
  icon: string
  color: string
  noteColor?: string
}

export type ActiveShipment = {
  reference: string
  route: string
  mode: string
  modeColor: string
  eta: string
  status: string
  statusColor: string
}

export type RecentQuote = {
  reference: string
  route: string
  amount: string
  status: string
  statusColor: string
}

export type RecentActivity = {
  text: string
  time: string
  color: string
}

export const dashboardStats: DashboardStat[] = [
  {
    label: "Active Shipments",
    value: "8",
    note: "3 arriving this week",
    icon: "🚢",
    color: "blue",
    noteColor: "green-text",
  },
  {
    label: "Stock on Hand",
    value: "1,284",
    note: "Units across 3 SKUs",
    icon: "📦",
    color: "green",
  },
  {
    label: "Open Quotes",
    value: "3",
    note: "1 awaiting response",
    icon: "📋",
    color: "amber",
    noteColor: "amber-text",
  },
  {
    label: "Documents",
    value: "24",
    note: "4 new this month",
    icon: "📄",
    color: "purple",
    noteColor: "green-text",
  },
]

export const activeShipments: ActiveShipment[] = [
  {
    reference: "SHP-2041",
    route: "Shanghai → Manchester",
    mode: "Sea FCL",
    modeColor: "blue",
    eta: "28 Mar",
    status: "In Transit",
    statusColor: "amber",
  },
  {
    reference: "SHP-2040",
    route: "Hong Kong → Liverpool",
    mode: "Sea LCL",
    modeColor: "blue",
    eta: "26 Mar",
    status: "Customs",
    statusColor: "orange",
  },
  {
    reference: "SHP-2039",
    route: "Shenzhen → Heathrow",
    mode: "Air",
    modeColor: "purple",
    eta: "25 Mar",
    status: "Arrived",
    statusColor: "green",
  },
  {
    reference: "SHP-2038",
    route: "Rotterdam → Birmingham",
    mode: "Road",
    modeColor: "grey",
    eta: "30 Mar",
    status: "In Transit",
    statusColor: "amber",
  },
  {
    reference: "SHP-2037",
    route: "Dubai → Manchester",
    mode: "Air",
    modeColor: "purple",
    eta: "27 Mar",
    status: "In Transit",
    statusColor: "amber",
  },
]

export const recentQuotes: RecentQuote[] = [
  {
    reference: "QT-0088",
    route: "Shanghai → Manchester",
    amount: "£3,240",
    status: "Pending",
    statusColor: "amber",
  },
  {
    reference: "QT-0087",
    route: "Hong Kong → Leeds",
    amount: "£1,850",
    status: "Accepted",
    statusColor: "green",
  },
  {
    reference: "QT-0086",
    route: "Shenzhen → Heathrow",
    amount: "£980",
    status: "Expired",
    statusColor: "grey",
  },
]

export const recentActivities: RecentActivity[] = [
  {
    text: "<strong>SHP-2039</strong> arrived at Heathrow",
    time: "2 hours ago",
    color: "green",
  },
  {
    text: "Quote <strong>QT-0088</strong> ready for review",
    time: "4 hours ago",
    color: "orange",
  },
  {
    text: "<strong>SHP-2040</strong> in customs clearance",
    time: "Yesterday",
    color: "blue",
  },
  {
    text: "Invoice <strong>INV-0821</strong> available to download",
    time: "Yesterday",
    color: "grey",
  },
]
