import { computed, ref } from "vue"

type QuoteTab = "all" | "pending" | "awaiting" | "accepted" | "declined"
type QuoteStatusColor = "amber" | "green" | "blue" | "red" | "gray"

type CustomerQuote = {
  reference: string
  route: string
  mode: string
  cargo: string
  weight: string
  cbm: string
  amount: string | null
  status: string
  statusColor: QuoteStatusColor
  submitted: string
  validUntil: string
  canApprove: boolean
  canDecline: boolean
}

type QuoteTabItem = {
  label: string
  value: QuoteTab
  count: number
}

export function useCustomerQuotesPage() {
  const activeTab = ref<QuoteTab>("all")

  const quotes = ref<CustomerQuote[]>([
    {
      reference: "QT-0088",
      route: "Shanghai → Manchester",
      mode: "Sea FCL",
      cargo: "General Cargo",
      weight: "12,400 kg",
      cbm: "28.4",
      amount: "£3,240",
      status: "Pending",
      statusColor: "amber",
      submitted: "20 Mar 2026",
      validUntil: "31 Mar 2026",
      canApprove: true,
      canDecline: true,
    },
    {
      reference: "QT-0087",
      route: "Hong Kong → Leeds",
      mode: "Sea LCL",
      cargo: "Electronics",
      weight: "3,200 kg",
      cbm: "8.2",
      amount: "£1,850",
      status: "Accepted",
      statusColor: "green",
      submitted: "15 Mar 2026",
      validUntil: "30 Mar 2026",
      canApprove: false,
      canDecline: false,
    },
    {
      reference: "QT-0085",
      route: "Mumbai → Manchester",
      mode: "Sea FCL",
      cargo: "Machinery",
      weight: "18,000 kg",
      cbm: "38.0",
      amount: null,
      status: "Awaiting Quote",
      statusColor: "blue",
      submitted: "23 Mar 2026",
      validUntil: "—",
      canApprove: false,
      canDecline: false,
    },
  ])

  const tabs = computed<QuoteTabItem[]>(() => [
    {
      label: "All Quotes",
      value: "all",
      count: quotes.value.length,
    },
    {
      label: "Pending Response",
      value: "pending",
      count: quotes.value.filter(quote => quote.status === "Pending").length,
    },
    {
      label: "Awaiting Quote",
      value: "awaiting",
      count: quotes.value.filter(quote => quote.status === "Awaiting Quote").length,
    },
    {
      label: "Accepted",
      value: "accepted",
      count: quotes.value.filter(quote => quote.status === "Accepted").length,
    },
    {
      label: "Declined",
      value: "declined",
      count: quotes.value.filter(quote => quote.status === "Declined").length,
    },
  ])

  const filteredQuotes = computed(() => {
    if (activeTab.value === "all") return quotes.value

    if (activeTab.value === "pending") {
      return quotes.value.filter(quote => quote.status === "Pending")
    }

    if (activeTab.value === "awaiting") {
      return quotes.value.filter(quote => quote.status === "Awaiting Quote")
    }

    if (activeTab.value === "accepted") {
      return quotes.value.filter(quote => quote.status === "Accepted")
    }

    if (activeTab.value === "declined") {
      return quotes.value.filter(quote => quote.status === "Declined")
    }

    return quotes.value
  })

  function isActive(tab: QuoteTab) {
    return activeTab.value === tab
  }

  function setActiveTab(tab: QuoteTab) {
    activeTab.value = tab
  }

  function openQuote(reference: string) {
    console.log(`Open quote: ${reference}`)
  }

  function approveQuote(reference: string) {
    const quote = quotes.value.find(item => item.reference === reference)
    if (!quote) return

    quote.status = "Accepted"
    quote.statusColor = "green"
    quote.canApprove = false
    quote.canDecline = false
  }

  function declineQuote(reference: string) {
    const quote = quotes.value.find(item => item.reference === reference)
    if (!quote) return

    quote.status = "Declined"
    quote.statusColor = "red"
    quote.canApprove = false
    quote.canDecline = false
  }

  function downloadQuote(reference: string) {
    console.log(`Download quote: ${reference}`)
  }

  return {
    tabs,
    activeTab,
    filteredQuotes,
    isActive,
    setActiveTab,
    openQuote,
    approveQuote,
    declineQuote,
    downloadQuote,
  }
}
