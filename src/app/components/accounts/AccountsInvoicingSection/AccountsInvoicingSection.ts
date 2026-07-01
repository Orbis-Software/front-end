import { computed, onMounted, reactive, ref, watch } from "vue"
import type { PageState } from "primevue/paginator"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"

import { downloadCsv, parseCsvFile } from "@/app/composables/useAccountsDemo"
import { useAppLoaderStore } from "@/app/stores/app-loader"
import { useAccountsInvoiceStore } from "@/app/stores/accounts-invoices"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { AccountsInvoice } from "@/app/types/accounts-invoice"

export function useAccountsInvoicingSection() {
  const toast = useToast()
  const router = useRouter()
  const appLoader = useAppLoaderStore()
  const accountsInvoiceStore = useAccountsInvoiceStore()
  const transportJobStore = useTransportJobStore()

  const selectedStatus = ref("all")
  const selectedAccountingPlatform = ref("Xero")
  const selectedTransferMethod = ref("Sales Invoice Push")
  const searchText = ref("")
  const currentPage = ref(1)
  const perPage = ref(25)
  const selectedInvoiceIds = ref<string[]>([])
  const bankImportInput = ref<HTMLInputElement | null>(null)
  const state = reactive({
    selectedInvoiceId: "",
    bankFeed: [] as Array<{
      id: string
      date: string
      reference: string
      description: string
      direction: "IN" | "OUT"
      currency: string
      amount: number
      matchedInvoice: string
    }>,
    postingLog: [] as Array<{ id: string; title: string; ts: string; text: string }>,
  })

  const loading = computed(() => accountsInvoiceStore.loading)
  const error = computed(() => accountsInvoiceStore.error || "")
  const invoices = computed(() => accountsInvoiceStore.invoices)
  const invoiceMeta = computed(() => accountsInvoiceStore.meta)
  const firstRow = computed(() => (currentPage.value - 1) * perPage.value)
  const invoiceCountsText = computed(() => {
    const meta = invoiceMeta.value
    const range = meta.from && meta.to ? `${meta.from}-${meta.to}` : "0"

    return `Showing ${range} of ${meta.filtered} invoice(s)`
  })

  const statusOptions = [
    { label: "All statuses", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Printed", value: "printed" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
    { label: "Posted to finance", value: "posted" },
  ]

  const accountingPlatformOptions = ["Xero", "QuickBooks", "Sage"].map(value => ({
    label: value,
    value,
  }))
  const transferMethodOptions = ["Sales Invoice Push", "Purchase Invoice Push", "Draft Sync"].map(
    value => ({
      label: value,
      value,
    }),
  )

  function money(value: number, currency = "GBP") {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      }).format(Number(value || 0))
    } catch {
      return `${currency} ${Number(value || 0).toFixed(2)}`
    }
  }

  function statusTone(status: AccountsInvoice["status"]) {
    if (status === "paid") return "success"
    if (status === "overdue") return "danger"
    if (status === "printed" || status === "sent") return "warning"
    return "neutral"
  }

  function statusLabel(status: AccountsInvoice["status"], dueDate: string) {
    if (status === "paid") return "Paid"
    if (dueDate && new Date(dueDate) < new Date()) return "Overdue"
    if (status === "printed") return "Printed"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  async function fetchInvoices() {
    try {
      await accountsInvoiceStore.fetch({
        search: searchText.value || undefined,
        status: selectedStatus.value,
        page: currentPage.value,
        perPage: perPage.value,
      })

      const selectedStillVisible = invoices.value.some(
        invoice => invoice.id === state.selectedInvoiceId,
      )
      const firstInvoice = invoices.value[0]

      if ((!state.selectedInvoiceId || !selectedStillVisible) && firstInvoice) {
        state.selectedInvoiceId = firstInvoice.id
      } else if (!firstInvoice) {
        state.selectedInvoiceId = ""
      }
    } catch {
      state.selectedInvoiceId = ""
    }
  }

  const selectedInvoice = computed<AccountsInvoice | null>(() => {
    return (
      invoices.value.find(invoice => invoice.id === state.selectedInvoiceId) ??
      invoices.value[0] ??
      null
    )
  })

  const invoiceSummary = computed(() => {
    const total = invoices.value.reduce((sum, row) => sum + row.baseAmount, 0)
    const paid = invoices.value
      .filter(row => row.paid)
      .reduce((sum, row) => sum + row.baseAmount, 0)
    const posted = invoices.value.filter(row => row.postedPlatform).length

    return [
      { label: "Printed Invoices", value: String(invoices.value.length) },
      { label: "Invoice Total", value: money(total) },
      { label: "Paid", value: money(paid) },
      { label: "Posted to Finance", value: String(posted) },
    ]
  })

  const filteredInvoices = computed(() => {
    return invoices.value
  })

  const allVisibleSelected = computed(
    () =>
      filteredInvoices.value.length > 0 &&
      filteredInvoices.value.every(invoice => selectedInvoiceIds.value.includes(invoice.id)),
  )

  function toggleAllInvoices(event: Event) {
    const checked = (event.target as HTMLInputElement).checked
    const visibleIds = filteredInvoices.value.map(invoice => invoice.id)
    selectedInvoiceIds.value = checked
      ? Array.from(new Set([...selectedInvoiceIds.value, ...visibleIds]))
      : selectedInvoiceIds.value.filter(id => !visibleIds.includes(id))
  }

  async function onInvoicePage(event: PageState) {
    currentPage.value = event.page + 1
    perPage.value = event.rows
    await fetchInvoices()
  }

  function requireSelection() {
    if (selectedInvoiceIds.value.length) return selectedInvoiceIds.value
    return selectedInvoice.value ? [selectedInvoice.value.id] : []
  }

  function postSelected() {
    const ids = requireSelection()
    invoices.value.forEach(invoice => {
      if (ids.includes(invoice.id)) invoice.postedPlatform = selectedAccountingPlatform.value
    })
    state.postingLog.unshift({
      id: `LOG-${Date.now()}`,
      title: "Marked for finance posting",
      ts: new Date().toLocaleString(),
      text: `${ids.length} invoice(s) marked for ${selectedAccountingPlatform.value}.`,
    })
  }

  function markSelectedPaid() {
    const ids = requireSelection()
    const paidDate = new Date().toISOString().slice(0, 10)

    invoices.value.forEach(invoice => {
      if (ids.includes(invoice.id)) {
        invoice.paid = true
        invoice.paidDate = paidDate
        invoice.status = "paid"
      }
    })
  }

  async function printInvoice() {
    const invoice = selectedInvoice.value
    await openInvoicePdf(invoice)
  }

  async function openInvoicePdf(invoice: AccountsInvoice | null) {
    if (!invoice?.jobId) return

    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank", "noopener,noreferrer")
      return
    }

    try {
      const blob = await appLoader.withLoader(
        {
          title: "Preparing invoice",
          message: "Wait for your invoice...",
          messages: [
            "Wait for your invoice...",
            "Checking the saved invoice file...",
            "Generating a fresh PDF if needed...",
            "Opening the invoice...",
          ],
          iconClass: "pi pi-file-pdf",
          footer: "Invoice documents are checked before opening",
        },
        () => transportJobStore.jobPdf(invoice.jobId, "invoice"),
      )
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank", "noopener,noreferrer")
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
      await fetchInvoices()
    } catch (nextError: any) {
      toast.add({
        severity: "error",
        summary: "Invoice failed",
        detail:
          nextError?.response?.data?.message || nextError?.message || "Unable to open invoice.",
        life: 4500,
      })
    }
  }

  function invoiceHref(invoice: AccountsInvoice) {
    return invoice.pdfUrl || "#"
  }

  async function onInvoiceLinkClick(event: MouseEvent, invoice: AccountsInvoice) {
    if (invoice.pdfUrl) return

    event.preventDefault()
    await openInvoicePdf(invoice)
  }

  function jobUrl(invoice: AccountsInvoice) {
    if (!invoice.jobId) return "#"

    return router.resolve({ name: "tms.jobs.show", params: { id: invoice.jobId } }).href
  }

  function exportBankFeed() {
    downloadCsv("bank_feed_export.csv", [
      ["Date", "Reference", "Description", "Direction", "Currency", "Amount", "MatchedInvoice"],
      ...state.bankFeed.map(row => [
        row.date,
        row.reference,
        row.description,
        row.direction,
        row.currency,
        row.amount,
        row.matchedInvoice,
      ]),
    ])
  }

  async function importBankCsv(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const [, ...rows] = await parseCsvFile(file)
    rows.forEach(row => {
      state.bankFeed.push({
        id: `BF-${Date.now()}-${row[1]}`,
        date: row[0] || "",
        reference: row[1] || "",
        description: row[2] || "",
        direction: row[3] === "OUT" ? "OUT" : "IN",
        currency: row[4] || "GBP",
        amount: Number(row[5] || 0),
        matchedInvoice: row[6] || "",
      })
    })
    ;(event.target as HTMLInputElement).value = ""
  }

  watch([selectedStatus, searchText], () => {
    currentPage.value = 1
    fetchInvoices()
  })
  onMounted(fetchInvoices)

  return {
    selectedStatus,
    selectedAccountingPlatform,
    selectedTransferMethod,
    searchText,
    selectedInvoiceIds,
    bankImportInput,
    loading,
    error,
    invoiceMeta,
    invoiceCountsText,
    firstRow,
    state,
    statusOptions,
    accountingPlatformOptions,
    transferMethodOptions,
    money,
    statusTone,
    statusLabel,
    selectedInvoice,
    invoiceSummary,
    filteredInvoices,
    allVisibleSelected,
    toggleAllInvoices,
    onInvoicePage,
    postSelected,
    markSelectedPaid,
    printInvoice,
    openInvoicePdf,
    invoiceHref,
    onInvoiceLinkClick,
    jobUrl,
    exportBankFeed,
    importBankCsv,
  }
}
