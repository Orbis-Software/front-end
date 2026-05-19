import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"

export type QuoteStatusKey = "all" | "draft" | "sent" | "approved" | "declined"
export type ModeKey = "all" | "air" | "sea" | "road" | "rail"
export type QuoteAction = "sent" | "approve" | "decline" | "convert" | "delete"

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
  status: "draft" | "sent" | "approved" | "declined"
  valid_until: string
  currency: "GBP" | "USD" | "EUR"
  amount: number
  action_notes?: string
}

export function useQuoteListPage() {
  const router = useRouter()
  const toast = useToast()

  const statusOptions: Option<QuoteStatusKey>[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
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

  const actionDialogVisible = ref(false)
  const selectedQuote = ref<QuoteItem | null>(null)
  const selectedAction = ref<QuoteAction | null>(null)
  const actionNotes = ref("")

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
      status: "declined",
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
      const matchStatus = statusFilter.value === "all" || item.status === statusFilter.value
      const matchMode = modeFilter.value === "all" || item.mode_of_transport === modeFilter.value

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

  const actionDialogTitle = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "Mark Quotation as Sent"
      case "approve":
        return "Approve Quotation"
      case "decline":
        return "Decline Quotation"
      case "convert":
        return "Convert to Job"
      case "delete":
        return "Delete Quotation"
      default:
        return "Confirm Action"
    }
  })

  const actionDialogMessage = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "Are you sure you want to mark this draft quotation as sent?"
      case "approve":
        return "Are you sure you want to approve this quotation?"
      case "decline":
        return "Are you sure you want to decline this quotation?"
      case "convert":
        return "This will convert the approved quotation into a job. Continue?"
      case "delete":
        return "Are you sure you want to delete this declined quotation? This action cannot be undone."
      default:
        return "Are you sure you want to continue?"
    }
  })

  const actionConfirmLabel = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "Mark as Sent"
      case "approve":
        return "Approve"
      case "decline":
        return "Decline"
      case "convert":
        return "Convert to Job"
      case "delete":
        return "Delete"
      default:
        return "Confirm"
    }
  })

  const actionConfirmIcon = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "pi pi-send"
      case "approve":
        return "pi pi-check"
      case "decline":
        return "pi pi-times"
      case "convert":
        return "pi pi-briefcase"
      case "delete":
        return "pi pi-trash"
      default:
        return "pi pi-check"
    }
  })

  const actionConfirmClass = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "quotes-list-page__dialog-sent-btn"
      case "approve":
        return "quotes-list-page__dialog-approve-btn"
      case "decline":
        return "quotes-list-page__dialog-decline-btn"
      case "convert":
        return "quotes-list-page__dialog-convert-btn"
      case "delete":
        return "quotes-list-page__dialog-delete-btn"
      default:
        return ""
    }
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
      "status-declined": status === "declined",
    }
  }

  function onNewQuotation() {
    router.push({ name: "tms.quotes.create" })
  }

  function onView(id: number) {
    router.push({
      name: "tms.quotes.show",
      params: { id },
    })
  }

  function onEdit(id: number) {
    router.push({
      name: "tms.quotes.edit",
      params: { id },
    })
  }

  function openSentModal(quote: QuoteItem) {
    openActionDialog(quote, "sent")
  }

  function openApprovalModal(quote: QuoteItem) {
    openActionDialog(quote, "approve")
  }

  function openDeclineModal(quote: QuoteItem) {
    openActionDialog(quote, "decline")
  }

  function openConvertModal(quote: QuoteItem) {
    openActionDialog(quote, "convert")
  }

  function openDeleteModal(quote: QuoteItem) {
    openActionDialog(quote, "delete")
  }

  function openActionDialog(quote: QuoteItem, action: QuoteAction) {
    selectedQuote.value = quote
    selectedAction.value = action
    actionNotes.value = quote.action_notes ?? ""
    actionDialogVisible.value = true
  }

  function closeActionDialog() {
    actionDialogVisible.value = false
    selectedQuote.value = null
    selectedAction.value = null
    actionNotes.value = ""
  }

  function confirmQuoteAction() {
    if (!selectedQuote.value || !selectedAction.value) return

    const quoteId = selectedQuote.value.id
    const quoteNumber = selectedQuote.value.quote_number

    if (selectedAction.value === "delete") {
      items.value = items.value.filter(item => item.id !== quoteId)

      toast.add({
        severity: "error",
        summary: "Quotation Deleted",
        detail: `${quoteNumber} has been deleted.`,
        life: 3000,
      })

      closeActionDialog()
      return
    }

    if (selectedAction.value === "convert") {
      toast.add({
        severity: "success",
        summary: "Job Created",
        detail: `${quoteNumber} has been converted to a job.`,
        life: 3000,
      })

      closeActionDialog()
      return
    }

    const nextStatus =
      selectedAction.value === "sent"
        ? "sent"
        : selectedAction.value === "approve"
          ? "approved"
          : "declined"

    items.value = items.value.map(item => {
      if (item.id !== quoteId) return item

      return {
        ...item,
        status: nextStatus,
        action_notes: actionNotes.value.trim(),
      }
    })

    toast.add({
      severity: nextStatus === "approved" ? "success" : nextStatus === "declined" ? "warn" : "info",
      summary:
        nextStatus === "approved"
          ? "Quotation Approved"
          : nextStatus === "declined"
            ? "Quotation Declined"
            : "Quotation Sent",
      detail: `${quoteNumber} has been ${nextStatus}.`,
      life: 3000,
    })

    closeActionDialog()
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
    actionDialogVisible,
    selectedQuote,
    selectedAction,
    actionNotes,
    actionDialogTitle,
    actionDialogMessage,
    actionConfirmLabel,
    actionConfirmIcon,
    actionConfirmClass,
    onPage,
    onNewQuotation,
    onView,
    onEdit,
    openSentModal,
    openApprovalModal,
    openDeclineModal,
    openConvertModal,
    openDeleteModal,
    closeActionDialog,
    confirmQuoteAction,
    prettify,
    formatAmount,
    statusClass,
  }
}
