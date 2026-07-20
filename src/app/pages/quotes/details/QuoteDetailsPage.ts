import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"
import { useCompanyStore } from "@/app/stores/company"
import { useTransportQuoteStore } from "@/app/stores/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

type QuoteAction = "sent" | "approve" | "decline" | "convert"

type ChargeLine = {
  id: number
  type: string
  description: string
  quantity: number
  uom: string
  cost: number
  unit_price: number
  markup_percent: number
  total_sell: number
  currency: string
  exchange_rate: number
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
  load_planner_enabled: boolean
  customer_facing: boolean
  charge_lines: ChargeLine[]
  totals: {
    sell: number
    cost: number
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
  const companyStore = useCompanyStore()
  const quoteStore = useTransportQuoteStore()

  companyStore.hydrateFromAuth()

  const actionDialogVisible = ref(false)
  const selectedAction = ref<QuoteAction | null>(null)
  const actionNotes = ref("")
  const actionProcessing = ref(false)
  const pdfLoading = ref(false)
  const copying = ref(false)
  const activeView = ref<"buying" | "quotation">("quotation")

  const quoteId = computed(() => {
    const id = Number(route.params.id)
    return Number.isFinite(id) ? id : null
  })

  const loading = computed(() => quoteStore.loading)

  const quote = computed<QuoteDetails | null>(() => {
    if (!quoteStore.selectedQuote) return null

    return mapTransportQuoteToDetails(quoteStore.selectedQuote)
  })
  const baseCurrency = computed(() =>
    String(
      companyStore.item?.settings?.main_currency_code ??
        companyStore.item?.default_currency_code ??
        "GBP",
    ).toUpperCase(),
  )
  const showViewTabs = computed(() => Boolean(quote.value && quote.value.status !== "draft"))
  const buyingCostsView = computed(() => !showViewTabs.value || activeView.value === "buying")
  const visibleChargeLines = computed(() => {
    const lines = quote.value?.charge_lines ?? []
    if (!showViewTabs.value) return lines

    return lines.filter(line => line.type === (buyingCostsView.value ? "buy" : "sell"))
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

  async function onCopy() {
    if (!quote.value || copying.value) return

    copying.value = true
    try {
      const copy = await quoteStore.duplicateQuote(quote.value.id)
      router.push({ name: "tms.quotes.edit", params: { id: copy.id } })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Copy Failed",
        detail: error?.response?.data?.message ?? "Unable to copy this quotation.",
        life: 4000,
      })
    } finally {
      copying.value = false
    }
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

  async function openQuotePdf() {
    if (!quote.value || pdfLoading.value) return

    pdfLoading.value = true

    try {
      const blob = await quoteStore.quotePdf(quote.value.id)

      if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
        const text = blob instanceof Blob ? await blob.text() : ""
        throw new Error(text || "The server did not return a PDF.")
      }

      const url = URL.createObjectURL(blob)

      window.open(url, "_blank", "noopener,noreferrer")
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "PDF failed",
        detail: await extractPdfError(error),
        life: 4500,
      })
    } finally {
      pdfLoading.value = false
    }
  }

  async function extractPdfError(error: any) {
    const data = error?.response?.data

    if (data instanceof Blob) {
      const text = await data.text()

      try {
        const parsed = JSON.parse(text)
        return parsed?.message ?? text
      } catch {
        return text || "Unable to generate the quote PDF."
      }
    }

    return error?.response?.data?.message ?? error?.message ?? "Unable to generate the quote PDF."
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

  function money(value: number, currency = quote.value?.currency ?? "GBP") {
    return `${currency} ${new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)}`
  }

  function baseMoney(value: number) {
    return money(value, baseCurrency.value)
  }

  function mapTransportQuoteToDetails(item: TransportQuote): QuoteDetails {
    const customerFacing = isCustomerFacingStatus(item.status)
    const totals = item.totals ?? {
      subtotal_sell: 0,
      subtotal_cost: 0,
      total_excl_tax: 0,
      tax_amount: 0,
      total_incl_tax: 0,
      profit_total: 0,
      profit_percent: 0,
    }
    const chargeLines = mapChargeLines(item.charges, false, item.currency ?? "GBP")
    const sellLines = chargeLines.filter(line => line.type === "sell")
    const customerSubtotalSell = sellLines.length
      ? sellLines.reduce((sum, line) => sum + Number(line.total_sell || 0), 0)
      : Number(totals.subtotal_sell || 0)
    const subtotalSell = customerFacing ? customerSubtotalSell : Number(totals.subtotal_sell || 0)
    const taxAmount = customerFacing
      ? subtotalSell * (Number(item.tax_rate || 0) / 100)
      : Number(totals.tax_amount || 0)
    const totalExclTax = customerFacing ? subtotalSell : Number(totals.total_excl_tax || 0)
    const totalInclTax = customerFacing
      ? totalExclTax + taxAmount
      : Number(totals.total_incl_tax || 0)

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
      load_planner_enabled: item.load_planner_enabled !== false,
      customer_facing: customerFacing,
      charge_lines: chargeLines,
      totals: {
        sell: subtotalSell,
        cost: Number(totals.subtotal_cost || 0),
        tax: taxAmount,
        excl_tax: totalExclTax,
        incl_tax: totalInclTax,
        profit: Number(totals.profit_total || 0),
        profit_percentage: Number(totals.profit_percent || 0),
      },
    }
  }

  function isCustomerFacingStatus(status: unknown) {
    return ["sent", "accepted", "rejected", "converted"].includes(
      String(status ?? "").toLowerCase(),
    )
  }

  function mapChargeLines(
    charges: any[],
    customerFacing: boolean,
    quoteCurrency: string,
  ): ChargeLine[] {
    if (!Array.isArray(charges)) return []

    return charges
      .filter(charge => !customerFacing || String(charge.type ?? "sell").toLowerCase() === "sell")
      .map((charge, index) => {
        const qty = Number(charge.qty ?? charge.quantity ?? 0)
        const type = String(charge.type ?? "sell").toLowerCase()
        const cost = Number(charge.unit_cost ?? charge.cost ?? 0)
        const unitPrice = Number(charge.unit_price ?? charge.sell_unit_price ?? 0)
        const markup = Number(charge.markup_percent ?? 0)
        const totalSell = unitPrice > 0 ? qty * unitPrice : qty * cost * (1 + markup / 100)

        return {
          id: Number(charge.id ?? index + 1),
          type,
          description: charge.description ?? "—",
          quantity: qty,
          uom: charge.uom ?? "—",
          cost,
          unit_price: unitPrice,
          markup_percent: markup,
          total_sell: Number(charge.sell_total ?? charge.total_sell ?? totalSell),
          currency: String(charge.currency ?? quoteCurrency).toUpperCase(),
          exchange_rate: Number(charge.exchange_rate || 1),
        }
      })
  }

  onMounted(() => {
    loadQuote()
  })

  return {
    quote,
    baseCurrency,
    activeView,
    showViewTabs,
    buyingCostsView,
    visibleChargeLines,
    loadPlannerPackages,
    loadPlannerReference,
    loading,
    actionProcessing,
    pdfLoading,
    copying,
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
    onCopy,
    openActionModal,
    closeActionModal,
    confirmAction,
    openQuotePdf,
    prettify,
    statusClass,
    money,
    baseMoney,
  }
}
