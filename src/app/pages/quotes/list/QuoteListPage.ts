import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

export type QuoteStatusKey = "all" | "draft" | "sent" | "approved" | "rejected"
export type ModeKey = "all" | "air" | "sea" | "road" | "rail"

type Option<T> = {
  label: string
  value: T
}

type QuoteItem = {
  id: number
  quote_number: string
  customer_name: string
  account_number: string
  quote_type: "import" | "export" | "domestic" | "cross_trade"
  mode_of_transport: "air" | "sea" | "road" | "rail"
  status: "draft" | "sent" | "approved" | "rejected"
  valid_until: string
  currency: "GBP" | "USD" | "EUR"
  amount: number
}

export function useQuoteListPage() {
  const router = useRouter()

  const statusOptions: Option<QuoteStatusKey>[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ]

  const modeOptions: Option<ModeKey>[] = [
    { label: "All", value: "all" },
    { label: "Air", value: "air" },
    { label: "Sea", value: "sea" },
    { label: "Road", value: "road" },
    { label: "Rail", value: "rail" },
  ]

  const searchText = ref("")
  const statusFilter = ref<QuoteStatusKey>("all")
  const modeFilter = ref<ModeKey>("all")

  const page = ref(1)
  const rows = ref(10)

  const items = ref<QuoteItem[]>([
    {
      id: 1,
      quote_number: "QUO-2026-0001",
      customer_name: "ABC Logistics Ltd",
      account_number: "CUS-0001",
      quote_type: "import",
      mode_of_transport: "air",
      status: "draft",
      valid_until: "2026-04-15",
      currency: "GBP",
      amount: 1250,
    },
    {
      id: 2,
      quote_number: "QUO-2026-0002",
      customer_name: "Northlane Traders",
      account_number: "CUS-0002",
      quote_type: "export",
      mode_of_transport: "sea",
      status: "sent",
      valid_until: "2026-04-18",
      currency: "USD",
      amount: 3480,
    },
    {
      id: 3,
      quote_number: "QUO-2026-0003",
      customer_name: "Swift Cargo PH",
      account_number: "CUS-0003",
      quote_type: "domestic",
      mode_of_transport: "road",
      status: "approved",
      valid_until: "2026-04-20",
      currency: "GBP",
      amount: 860,
    },
    {
      id: 4,
      quote_number: "QUO-2026-0004",
      customer_name: "Eastern Freight Co",
      account_number: "CUS-0004",
      quote_type: "cross_trade",
      mode_of_transport: "rail",
      status: "rejected",
      valid_until: "2026-04-10",
      currency: "EUR",
      amount: 2140,
    },
    {
      id: 5,
      quote_number: "QUO-2026-0005",
      customer_name: "Global Reach Cargo",
      account_number: "CUS-0005",
      quote_type: "import",
      mode_of_transport: "sea",
      status: "draft",
      valid_until: "2026-04-25",
      currency: "USD",
      amount: 5125,
    },
    {
      id: 6,
      quote_number: "QUO-2026-0006",
      customer_name: "Manila Haulage Inc",
      account_number: "CUS-0006",
      quote_type: "export",
      mode_of_transport: "road",
      status: "sent",
      valid_until: "2026-04-22",
      currency: "GBP",
      amount: 1795,
    },
  ])

  const filteredItems = computed(() => {
    const keyword = searchText.value.trim().toLowerCase()

    return items.value.filter(item => {
      const matchStatus = statusFilter.value === "all" ? true : item.status === statusFilter.value

      const matchMode =
        modeFilter.value === "all" ? true : item.mode_of_transport === modeFilter.value

      const matchSearch =
        !keyword ||
        item.quote_number.toLowerCase().includes(keyword) ||
        item.customer_name.toLowerCase().includes(keyword) ||
        item.account_number.toLowerCase().includes(keyword)

      return matchStatus && matchMode && matchSearch
    })
  })

  const firstRow = computed(() => (page.value - 1) * rows.value)

  const paginatedItems = computed(() => {
    const start = firstRow.value
    const end = start + rows.value
    return filteredItems.value.slice(start, end)
  })

  function prettify(value: unknown): string {
    return String(value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  function formatAmount(value: number): string {
    return new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  function statusClass(status: QuoteItem["status"]) {
    return {
      "status-draft": status === "draft",
      "status-sent": status === "sent",
      "status-approved": status === "approved",
      "status-rejected": status === "rejected",
    }
  }

  function onNewQuotation() {
    router.push("/quotes/new")
  }

  function onEdit(id: number) {
    router.push(`/quotes/${id}`)
  }

  function onDelete(id: number) {
    items.value = items.value.filter(item => item.id !== id)

    const maxPage = Math.max(1, Math.ceil(filteredItems.value.length / rows.value))
    if (page.value > maxPage) {
      page.value = maxPage
    }
  }

  function onPage(event: { first?: number; rows?: number }) {
    const nextRows = Number(event.rows ?? rows.value)
    const nextPage = Math.floor(Number(event.first ?? 0) / nextRows) + 1

    rows.value = nextRows
    page.value = nextPage
  }

  watch(
    () => [searchText.value, statusFilter.value, modeFilter.value],
    () => {
      page.value = 1
    },
  )

  return {
    searchText,
    statusFilter,
    modeFilter,
    statusOptions,
    modeOptions,
    filteredItems,
    paginatedItems,
    rows,
    firstRow,
    onPage,
    onNewQuotation,
    onEdit,
    onDelete,
    prettify,
    formatAmount,
    statusClass,
  }
}
