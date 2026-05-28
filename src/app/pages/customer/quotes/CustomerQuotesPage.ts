import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

type QuoteTab = "all" | "pending" | "accepted" | "declined" | "converted"
type QuoteStatusColor = "amber" | "green" | "red" | "gray"

type CustomerQuote = {
  id: number
  reference: string
  route: string
  mode: string
  cargo: string
  weight: string
  cbm: string
  amount: string | null
  status: string
  statusKey: QuoteTab
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
  const router = useRouter()
  const toast = useToast()
  const quoteStore = useTransportQuoteStore()

  const activeTab = ref<QuoteTab>("all")
  const actionProcessingId = ref<number | null>(null)

  const quotes = computed<CustomerQuote[]>(() => quoteStore.quotes.map(mapQuoteToCustomerQuote))
  const loading = computed(() => quoteStore.loading)

  const tabs = computed<QuoteTabItem[]>(() => [
    {
      label: "All Quotes",
      value: "all",
      count: quotes.value.length,
    },
    {
      label: "Pending Response",
      value: "pending",
      count: quotes.value.filter(quote => quote.statusKey === "pending").length,
    },
    {
      label: "Accepted",
      value: "accepted",
      count: quotes.value.filter(quote => quote.statusKey === "accepted").length,
    },
    {
      label: "Declined",
      value: "declined",
      count: quotes.value.filter(quote => quote.statusKey === "declined").length,
    },
    {
      label: "Converted",
      value: "converted",
      count: quotes.value.filter(quote => quote.statusKey === "converted").length,
    },
  ])

  const filteredQuotes = computed(() => {
    if (activeTab.value === "all") return quotes.value

    return quotes.value.filter(quote => quote.statusKey === activeTab.value)
  })

  function isActive(tab: QuoteTab) {
    return activeTab.value === tab
  }

  function setActiveTab(tab: QuoteTab) {
    activeTab.value = tab
  }

  function openQuote(reference: string) {
    const quote = quotes.value.find(item => item.reference === reference)
    if (!quote) return

    router.push({
      name: "customer.quotes.show",
      params: { id: quote.id },
    })
  }

  async function declineQuote(reference: string) {
    await respondToQuote(reference, "rejected")
  }

  function downloadQuote(reference: string) {
    toast.add({
      severity: "info",
      summary: "Download Unavailable",
      detail: `${reference} is available in the portal, but PDF download is not configured yet.`,
      life: 3000,
    })
  }

  async function respondToQuote(reference: string, status: "accepted" | "rejected") {
    const quote = quotes.value.find(item => item.reference === reference)
    if (!quote || actionProcessingId.value) return

    actionProcessingId.value = quote.id

    try {
      await quoteStore.updateQuote(quote.id, { status })
      await loadQuotes()

      toast.add({
        severity: status === "accepted" ? "success" : "warn",
        summary: status === "accepted" ? "Quote Accepted" : "Quote Declined",
        detail: `${reference} has been ${status}.`,
        life: 3000,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Quote Update Failed",
        detail: error?.response?.data?.message ?? "Unable to update this quote.",
        life: 4000,
      })
    } finally {
      actionProcessingId.value = null
    }
  }

  async function loadQuotes() {
    try {
      await quoteStore.fetchQuotes({
        per_page: 100,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Failed to Load Quotes",
        detail: error?.response?.data?.message ?? "Unable to load your quotes.",
        life: 4000,
      })
    }
  }

  function mapQuoteToCustomerQuote(quote: TransportQuote): CustomerQuote {
    const status = String(quote.status || "sent").toLowerCase()
    const totalWeight = quote.dimensions.reduce((sum, item) => {
      return sum + Number(item.weight || 0) * Number(item.pieces || 1)
    }, 0)
    const totalCbm = quote.dimensions.reduce((sum, item) => sum + Number(item.cbm || 0), 0)

    return {
      id: quote.id,
      reference: quote.quote_ref || `QUOTE-${quote.id}`,
      route: [quote.origin, quote.destination].filter(Boolean).join(" -> ") || "Route pending",
      mode: formatMode(quote.mode_of_transport, quote.load_type),
      cargo: quote.goods_description || quote.commodity || "Cargo pending",
      weight: totalWeight > 0 ? `${formatNumber(totalWeight)} kg` : "Weight pending",
      cbm: totalCbm > 0 ? formatNumber(totalCbm, 2) : "0.00",
      amount: formatAmount(quote),
      status: statusLabel(status),
      statusKey: statusKey(status),
      statusColor: statusColor(status),
      submitted: formatDate(quote.quote_date || quote.created_at),
      validUntil: formatDate(quote.valid_until),
      canApprove: status === "sent",
      canDecline: status === "sent",
    }
  }

  function statusKey(status: string): QuoteTab {
    if (status === "sent") return "pending"
    if (status === "accepted") return "accepted"
    if (status === "rejected") return "declined"
    if (status === "converted") return "converted"

    return "all"
  }

  function statusLabel(status: string): string {
    if (status === "sent") return "Pending"
    if (status === "accepted") return "Accepted"
    if (status === "rejected") return "Declined"
    if (status === "converted") return "Converted"

    return "Pending"
  }

  function statusColor(status: string): QuoteStatusColor {
    if (status === "sent") return "amber"
    if (status === "accepted") return "green"
    if (status === "rejected") return "red"

    return "gray"
  }

  function formatMode(mode: string | null, loadType: string | null) {
    return [prettify(mode), loadType?.toUpperCase()].filter(Boolean).join(" ")
  }

  function formatAmount(quote: TransportQuote) {
    const amount = Number(quote.totals?.total_incl_tax || 0)
    if (!amount) return null

    return `${quote.currency || "GBP"} ${formatNumber(amount, 2)}`
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "-"

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value))
  }

  function formatNumber(value: number, fractionDigits = 0) {
    return new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  }

  function prettify(value: unknown): string {
    return String(value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  onMounted(() => {
    loadQuotes()
  })

  return {
    tabs,
    activeTab,
    filteredQuotes,
    loading,
    actionProcessingId,
    isActive,
    setActiveTab,
    openQuote,
    declineQuote,
    downloadQuote,
  }
}
