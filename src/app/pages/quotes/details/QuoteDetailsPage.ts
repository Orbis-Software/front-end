import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

type QuoteAction = "sent" | "approve" | "decline" | "convert"

type ChargeLine = {
  id: number
  description: string
  quantity: number
  uom: string
  cost: number
  markup_percent: number
  total_sell: number
}

type QuoteDetails = {
  id: number
  quote_number: string
  customer_name: string
  account_number: string
  contact_name: string
  contact_email: string
  contact_phone: string
  customer_reference: string
  quote_type: string
  mode_of_transport: string
  status: string
  quote_date: string | null
  follow_up_date: string | null
  validity: string
  currency: string
  incoterms: string
  origin: string | null
  destination: string | null
  etd: string | null
  eta: string | null
  goods_description: string | null
  is_hazardous: boolean
  hazard_class: string
  un_number: string
  packing_group: string
  terms_conditions: string | null
  internal_notes: string | null
  charge_lines: ChargeLine[]
  totals: {
    sell: number
    cost: number
    discount: number
    tax: number
    excl_tax: number
    incl_tax: number
    profit: number
    profit_percentage: number
  }
}

export function useQuoteDetailsPage() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const quoteStore = useTransportQuoteStore()

  const actionDialogVisible = ref(false)
  const selectedAction = ref<QuoteAction | null>(null)
  const actionNotes = ref("")
  const actionProcessing = ref(false)

  const quoteId = computed(() => {
    const id = Number(route.params.id)
    return Number.isFinite(id) ? id : null
  })

  const loading = computed(() => quoteStore.loading)

  const quote = computed<QuoteDetails | null>(() => {
    if (!quoteStore.selectedQuote) return null

    return mapTransportQuoteToDetails(quoteStore.selectedQuote)
  })
  const loadPlannerPackages = computed(() =>
    (quoteStore.selectedQuote?.dimensions ?? []).map((row, index) => ({
      id: row.id ?? index,
      type:
        quoteStore.selectedQuote?.mode_of_transport === "road"
          ? "Pallet"
          : row.container_type || "Package",
      desc:
        quoteStore.selectedQuote?.mode_of_transport === "road"
          ? `Pallet ${index + 1}`
          : `Package ${index + 1}`,
      length: row.length ?? 0,
      width: row.width ?? 0,
      height: row.height ?? 0,
      qty: row.pieces ?? 1,
      weight: row.weight ?? 0,
      stackable: row.stackable ?? true,
      adr: Boolean(quoteStore.selectedQuote?.is_hazardous),
    })),
  )
  const loadPlannerReference = computed(() => quote.value?.quote_number || "Quote Load Plan")

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
      default:
        return "pi pi-check"
    }
  })

  const actionConfirmClass = computed(() => {
    switch (selectedAction.value) {
      case "sent":
        return "quote-details-page__dialog-approve-btn"
      case "approve":
        return "quote-details-page__dialog-approve-btn"
      case "decline":
        return "quote-details-page__dialog-decline-btn"
      case "convert":
        return "quote-details-page__dialog-approve-btn"
      default:
        return ""
    }
  })

  async function loadQuote() {
    if (!quoteId.value) {
      toast.add({
        severity: "error",
        summary: "Invalid Quote",
        detail: "Quotation ID is missing or invalid.",
        life: 4000,
      })

      router.push({ name: "tms.quotes.index" })
      return
    }

    try {
      await quoteStore.fetchQuote(quoteId.value)
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Failed to Load Quotation",
        detail: error?.response?.data?.message ?? "Unable to load quotation details.",
        life: 4000,
      })
    }
  }

  function onBack() {
    router.push({
      name: "tms.quotes.index",
    })
  }

  function onEdit() {
    if (!quote.value) return

    router.push({
      name: "tms.quotes.edit",
      params: { id: quote.value.id },
    })
  }

  function openActionModal(action: QuoteAction) {
    selectedAction.value = action
    actionNotes.value = ""
    actionDialogVisible.value = true
  }

  function closeActionModal() {
    selectedAction.value = null
    actionNotes.value = ""
    actionDialogVisible.value = false
  }

  async function confirmAction() {
    if (!selectedAction.value || !quote.value) return

    actionProcessing.value = true

    try {
      if (selectedAction.value === "convert") {
        const job = await quoteStore.convertQuoteToJob(quote.value.id, {
          status: "draft",
        })

        toast.add({
          severity: "success",
          summary: "Job Created",
          detail: `${quote.value.quote_number} has been converted to a job.`,
          life: 3000,
        })

        await quoteStore.fetchQuote(quote.value.id)
        closeActionModal()

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

      await quoteStore.updateQuote(quote.value.id, {
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
            ? `${quote.value.quote_number} has been sent to the customer user.`
            : `${quote.value.quote_number} has been ${nextStatus}.`,
        life: 3000,
      })

      await quoteStore.fetchQuote(quote.value.id)
      closeActionModal()
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

  function prettify(value: unknown): string {
    return String(value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  function statusClass(status: string) {
    return {
      "status-draft": status === "draft",
      "status-sent": status === "sent",
      "status-approved": status === "accepted",
      "status-declined": status === "rejected",
      "status-converted": status === "converted",
    }
  }

  function money(value: number) {
    return `${quote.value?.currency ?? "GBP"} ${new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)}`
  }

  function mapTransportQuoteToDetails(item: TransportQuote): QuoteDetails {
    const totals = item.totals ?? {
      subtotal_sell: 0,
      subtotal_cost: 0,
      total_excl_tax: 0,
      tax_amount: 0,
      total_incl_tax: 0,
      profit_total: 0,
      profit_percent: 0,
    }

    return {
      id: item.id,
      quote_number: item.quote_ref || `QUOTE-${item.id}`,
      customer_name:
        item.customer_contact?.company_name ||
        item.contact_name ||
        item.customer_ref ||
        "No customer",
      account_number: item.account_number || item.customer_contact?.account_number || "—",
      contact_name: item.contact_name || "—",
      contact_email: item.contact_email || "—",
      contact_phone: item.contact_phone || "—",
      customer_reference: item.customer_ref || "—",
      quote_type: item.quote_type || "—",
      mode_of_transport: item.mode_of_transport || "—",
      status: item.status || "draft",
      quote_date: item.quote_date,
      follow_up_date: item.follow_up_date,
      validity: item.validity_period ? `Valid for ${item.validity_period} days` : "—",
      currency: item.currency || "GBP",
      incoterms: item.incoterm || "—",
      origin: item.origin,
      destination: item.destination,
      etd: item.etd,
      eta: item.eta,
      goods_description: item.goods_description,
      is_hazardous: Boolean(item.is_hazardous),
      hazard_class: item.hazardous_class || "—",
      un_number: item.un_number || "—",
      packing_group: item.packing_group || "—",
      terms_conditions: item.terms_conditions,
      internal_notes: item.note,
      charge_lines: mapChargeLines(item.charges),
      totals: {
        sell: Number(totals.subtotal_sell || 0),
        cost: Number(totals.subtotal_cost || 0),
        discount: Number(item.discount || 0),
        tax: Number(totals.tax_amount || 0),
        excl_tax: Number(totals.total_excl_tax || 0),
        incl_tax: Number(totals.total_incl_tax || 0),
        profit: Number(totals.profit_total || 0),
        profit_percentage: Number(totals.profit_percent || 0),
      },
    }
  }

  function mapChargeLines(charges: any[]): ChargeLine[] {
    if (!Array.isArray(charges)) return []

    return charges.map((charge, index) => {
      const qty = Number(charge.qty ?? charge.quantity ?? 0)
      const cost = Number(charge.cost ?? 0)
      const markup = Number(charge.markup_percent ?? 0)
      const totalSell = qty * cost * (1 + markup / 100)

      return {
        id: Number(charge.id ?? index + 1),
        description: charge.description ?? "—",
        quantity: qty,
        uom: charge.uom ?? "—",
        cost,
        markup_percent: markup,
        total_sell: Number(charge.total_sell ?? totalSell),
      }
    })
  }

  onMounted(() => {
    loadQuote()
  })

  return {
    quote,
    loadPlannerPackages,
    loadPlannerReference,
    loading,
    actionProcessing,
    actionDialogVisible,
    selectedAction,
    actionNotes,
    actionDialogTitle,
    actionDialogMessage,
    actionConfirmLabel,
    actionConfirmIcon,
    actionConfirmClass,
    onBack,
    onEdit,
    openActionModal,
    closeActionModal,
    confirmAction,
    prettify,
    statusClass,
    money,
  }
}
