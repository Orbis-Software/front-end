import { computed, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"

type QuoteStatus = "draft" | "sent" | "approved" | "declined"
type QuoteAction = "approve" | "decline"

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
  status: QuoteStatus
  quote_date: string
  follow_up_date: string
  validity: string
  currency: string
  incoterms: string
  origin: string
  destination: string
  etd: string
  eta: string
  goods_description: string
  is_hazardous: boolean
  hazard_class: string
  un_number: string
  packing_group: string
  terms_conditions: string
  internal_notes: string
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

  const actionDialogVisible = ref(false)
  const selectedAction = ref<QuoteAction | null>(null)
  const actionNotes = ref("")

  const quote = reactive<QuoteDetails>({
    id: Number(route.params.id ?? 1),
    quote_number: `QUO-2026-${String(route.params.id ?? 1).padStart(4, "0")}`,
    customer_name: "ABC Logistics Ltd",
    account_number: "CUS-0001",
    contact_name: "James Thornton",
    contact_email: "j.thornton@acme.com",
    contact_phone: "+44 20 7123 4500",
    customer_reference: "PO-2026-001",
    quote_type: "export",
    mode_of_transport: "air",
    status: "sent",
    quote_date: "2026-05-01",
    follow_up_date: "2026-05-08",
    validity: "Valid for 30 days",
    currency: "GBP",
    incoterms: "DAP",
    origin: "London Heathrow",
    destination: "Dubai DXB",
    etd: "2026-05-15",
    eta: "2026-05-16",
    goods_description: "General Cargo - Electronic Components",
    is_hazardous: false,
    hazard_class: "",
    un_number: "",
    packing_group: "",
    terms_conditions:
      "1. All rates quoted are subject to space and equipment availability.\n2. Rates are valid for the period stated and subject to change without notice thereafter.\n3. All charges are exclusive of applicable taxes unless otherwise stated.\n4. Claims for loss or damage must be submitted within 14 days of delivery.",
    internal_notes: "Customer requested direct flights if available.",
    charge_lines: [
      {
        id: 1,
        description: "Freight Charge",
        quantity: 1,
        uom: "Per Shipment",
        cost: 850,
        markup_percent: 25,
        total_sell: 1062.5,
      },
      {
        id: 2,
        description: "Fuel Surcharge",
        quantity: 120,
        uom: "Per KG",
        cost: 0.4,
        markup_percent: 20,
        total_sell: 57.6,
      },
      {
        id: 3,
        description: "Security Surcharge",
        quantity: 120,
        uom: "Per KG",
        cost: 0.1,
        markup_percent: 20,
        total_sell: 14.4,
      },
    ],
    totals: {
      sell: 1134.5,
      cost: 926,
      discount: 0,
      tax: 0,
      excl_tax: 1134.5,
      incl_tax: 1134.5,
      profit: 208.5,
      profit_percentage: 18.38,
    },
  })

  const canTakeAction = computed(() => {
    return quote.status !== "approved" && quote.status !== "declined"
  })

  const actionDialogTitle = computed(() => {
    return selectedAction.value === "approve" ? "Approve Quotation" : "Decline Quotation"
  })

  const actionDialogMessage = computed(() => {
    if (selectedAction.value === "approve") {
      return "Are you sure you want to approve this quotation?"
    }

    return "Are you sure you want to decline this quotation?"
  })

  const actionConfirmLabel = computed(() => {
    return selectedAction.value === "approve" ? "Approve" : "Decline"
  })

  const actionConfirmIcon = computed(() => {
    return selectedAction.value === "approve" ? "pi pi-check" : "pi pi-times"
  })

  const actionConfirmClass = computed(() => {
    return selectedAction.value === "approve"
      ? "quote-details-page__dialog-approve-btn"
      : "quote-details-page__dialog-decline-btn"
  })

  function onBack() {
    router.push({
      name: "tms.quotes.index",
    })
  }

  function onEdit() {
    router.push({
      name: "tms.quotes.edit",
      params: { id: quote.id },
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

  function confirmAction() {
    if (!selectedAction.value) return

    quote.status = selectedAction.value === "approve" ? "approved" : "declined"

    toast.add({
      severity: quote.status === "approved" ? "success" : "warn",
      summary: quote.status === "approved" ? "Quotation Approved" : "Quotation Declined",
      detail: `${quote.quote_number} has been ${quote.status}.`,
      life: 3000,
    })

    closeActionModal()
  }

  function prettify(value: unknown): string {
    return String(value ?? "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  function statusClass(status: QuoteStatus) {
    return {
      "status-draft": status === "draft",
      "status-sent": status === "sent",
      "status-approved": status === "approved",
      "status-declined": status === "declined",
    }
  }

  function money(value: number) {
    return `${quote.currency} ${new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)}`
  }

  return {
    quote,
    actionDialogVisible,
    actionNotes,
    actionDialogTitle,
    actionDialogMessage,
    actionConfirmLabel,
    actionConfirmIcon,
    actionConfirmClass,
    canTakeAction,
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
