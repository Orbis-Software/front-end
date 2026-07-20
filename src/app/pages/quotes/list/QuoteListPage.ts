import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

export type QuoteStatusKey = "all" | "draft" | "sent" | "accepted" | "rejected" | "converted"
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
  quote_type: string
  mode_of_transport: string
  status: string
  valid_until: string | null
  currency: string
  amount: number
  action_notes?: string
}

export function useQuoteListPage() {
  const router = useRouter()
  const toast = useToast()
  const quoteStore = useTransportQuoteStore()

  const statusOptions: Option<QuoteStatusKey>[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
    { label: "Converted", value: "converted" },
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
  const actionProcessing = ref(false)
  const copyingQuoteId = ref<number | null>(null)

  const actionDialogVisible = ref(false)
  const selectedQuote = ref<QuoteItem | null>(null)
  const selectedAction = ref<QuoteAction | null>(null)
  const actionNotes = ref("")

  const loading = computed(() => quoteStore.loading)

  const items = computed<QuoteItem[]>(() => {
    return quoteStore.quotes.map(mapQuoteToItem)
  })

  const filteredItems = computed(() => {
    const keyword = searchText.value.trim().toLowerCase()

    return items.value.filter(item => {
      const matchStatus = statusFilter.value === "all" || item.status === statusFilter.value
      const matchMode = modeFilter.value === "all" || item.mode_of_transport === modeFilter.value

      const matchSearch =
        !keyword ||
        item.quote_number.toLowerCase().includes(keyword) ||
        item.customer_name.toLowerCase().includes(keyword) ||
        item.account_number.toLowerCase().includes(keyword) ||
        item.quote_type.toLowerCase().includes(keyword) ||
        item.mode_of_transport.toLowerCase().includes(keyword)

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
        return "Send Quotation to User"
      case "approve":
        return "Accept Quotation"
      case "decline":
        return "Reject Quotation"
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
        return "This will send the draft quotation to the customer portal user and notify them by email. Continue?"
      case "approve":
        return "Are you sure you want to accept this quotation?"
      case "decline":
        return "Are you sure you want to reject this quotation?"
      case "convert":
        return "This will convert the accepted quotation into a transport job. Continue?"
      case "delete":
        return "Are you sure you want to delete this rejected quotation?"
      default:
        return "Are you sure you want to continue?"
    }
  })

  const actionConfirmLabel = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "Send to User"
      case "approve":
        return "Accept"
      case "decline":
        return "Reject"
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

  function mapQuoteToItem(quote: TransportQuote): QuoteItem {
    return {
      id: quote.id,
      quote_number: quote.quote_ref || `QUOTE-${quote.id}`,
      customer_name:
        quote.customer_contact?.company_name ||
        quote.contact_name ||
        quote.customer_ref ||
        "No customer",
      account_number: quote.account_number || quote.customer_contact?.account_number || "—",
      quote_type: quote.quote_type || "—",
      mode_of_transport: quote.mode_of_transport || "—",
      status: quote.status || "draft",
      valid_until: quote.valid_until,
      currency: quote.currency || "GBP",
      amount: Number(quote.totals?.total_incl_tax || 0),
    }
  }

  function prettify(value: unknown): string {
    return String(value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  function formatAmount(value: number): string {
    return new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0))
  }

  function statusClass(status: string) {
    return {
      "status-draft": status === "draft",
      "status-sent": status === "sent",
      "status-approved": status === "accepted",
      "status-declined": status === "rejected",
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

  async function onCopy(quote: QuoteItem) {
    if (copyingQuoteId.value) return

    copyingQuoteId.value = quote.id

    try {
      const copy = await quoteStore.duplicateQuote(quote.id)

      toast.add({
        severity: "success",
        summary: "Quotation Copied",
        detail: `${quote.quote_number} was copied to ${copy.quote_ref}.`,
        life: 3000,
      })

      router.push({ name: "tms.quotes.edit", params: { id: copy.id } })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Copy Failed",
        detail: error?.response?.data?.message ?? "Unable to copy this quotation.",
        life: 4000,
      })
    } finally {
      copyingQuoteId.value = null
    }
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

  async function confirmQuoteAction() {
    if (!selectedQuote.value || !selectedAction.value) return

    actionProcessing.value = true

    const quoteId = selectedQuote.value.id
    const quoteNumber = selectedQuote.value.quote_number

    try {
      if (selectedAction.value === "delete") {
        await quoteStore.deleteQuote(quoteId)

        toast.add({
          severity: "success",
          summary: "Quotation Deleted",
          detail: `${quoteNumber} has been deleted.`,
          life: 3000,
        })

        closeActionDialog()
        return
      }

      if (selectedAction.value === "convert") {
        const job = await quoteStore.convertQuoteToJob(quoteId, {
          status: "draft",
        })

        toast.add({
          severity: "success",
          summary: "Job Created",
          detail: `${quoteNumber} has been converted to a job.`,
          life: 3000,
        })

        await quoteStore.fetchQuotes()
        closeActionDialog()

        if (job?.id) {
          router.push({
            name: "tms.jobs.show",
            params: { id: job.id },
          })
        }

        return
      }

      const nextStatus =
        selectedAction.value === "sent"
          ? "sent"
          : selectedAction.value === "approve"
            ? "accepted"
            : "rejected"

      await quoteStore.updateQuote(quoteId, {
        status: nextStatus,
        note: actionNotes.value.trim() || undefined,
      })

      toast.add({
        severity:
          nextStatus === "accepted" ? "success" : nextStatus === "rejected" ? "warn" : "info",
        summary:
          nextStatus === "accepted"
            ? "Quotation Accepted"
            : nextStatus === "rejected"
              ? "Quotation Rejected"
              : "Quotation Sent",
        detail:
          nextStatus === "sent"
            ? `${quoteNumber} has been sent to the customer user.`
            : `${quoteNumber} has been ${prettify(nextStatus).toLowerCase()}.`,
        life: 3000,
      })

      closeActionDialog()
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Action Failed",
        detail: error?.response?.data?.message ?? "Unable to complete this action.",
        life: 4000,
      })
    } finally {
      actionProcessing.value = false
    }
  }

  function onPage(event: { first?: number; rows?: number }) {
    const nextRows = Number(event.rows ?? rows.value)
    const nextPage = Math.floor(Number(event.first ?? 0) / nextRows) + 1

    rows.value = nextRows
    page.value = nextPage
  }

  async function loadQuotes() {
    try {
      await quoteStore.fetchQuotes({
        per_page: 100,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Failed to Load Quotations",
        detail: error?.response?.data?.message ?? "Unable to load quotations.",
        life: 4000,
      })
    }
  }

  watch(
    () => [searchText.value, statusFilter.value, modeFilter.value],
    () => {
      page.value = 1
    },
  )

  onMounted(() => {
    loadQuotes()
  })

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
    loading,
    actionProcessing,
    copyingQuoteId,
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
    onCopy,
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
