import { computed, inject, onMounted, ref } from "vue"
import { useToast } from "primevue/usetoast"

import type { JobDetailsContext } from "@/app/types/job-details"
import contactsService from "@/app/services/contacts"
import { useAuthStore } from "@/app/stores/auth"
import { useTransportJobStore } from "@/app/stores/transport-job"
import { useInvoiceGenerationStore } from "@/app/stores/invoice-generation"
import { useXeroIntegrationStore } from "@/app/stores/xero-integration"
import type { Contact } from "@/app/types/contact"
import type { InvoiceEmailRecipientOption } from "@/app/types/invoice-email"

export function useJobNormalCustomerInvoiceTab() {
  const context = inject<JobDetailsContext>("jobDetails")

  if (!context) {
    throw new Error("useJobNormalCustomerInvoiceTab must be used inside JobDetailsPage.")
  }

  const jobContext = context
  const toast = useToast()
  const auth = useAuthStore()
  const transportJobStore = useTransportJobStore()
  const invoiceGenerationStore = useInvoiceGenerationStore()
  const xeroStore = useXeroIntegrationStore()
  const generating = ref(false)
  const contacts = ref<Contact[]>([])
  const pendingInvoiceBlob = ref<Blob | null>(null)
  const emailDialogVisible = ref(false)
  const emailInvoice = ref<any | null>(null)
  const deleteDialogVisible = ref(false)
  const deleteBlockedDialogVisible = ref(false)
  const deleteInvoiceTarget = ref<any | null>(null)
  const deleteConfirmation = ref("")
  const deletingInvoice = ref(false)

  function numberValue(value: unknown, fallback = 0): number {
    const numeric = Number(value)

    return Number.isFinite(numeric) ? numeric : fallback
  }

  function currencyCode(value: unknown): string {
    return String(value || jobContext.form.currency || "GBP").toUpperCase()
  }

  function money(currency: string, value: number): string {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currencyCode(currency),
        currencyDisplay: "narrowSymbol",
      }).format(Number.isFinite(value) ? value : 0)
    } catch {
      return `${currencyCode(currency)} ${new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number.isFinite(value) ? value : 0)}`
    }
  }

  const rows = computed(() => jobContext.form.sell_costs)
  const invoices = computed(() =>
    ((jobContext.form as any).invoices ?? []).filter((invoice: any) => {
      return (invoice.invoiceType ?? invoice.invoice_type ?? "customer") === "customer"
    }),
  )
  const invoiceCurrency = computed(() =>
    currencyCode(jobContext.form.currency || rows.value[0]?.currency),
  )
  const subtotal = computed(() =>
    rows.value.reduce((sum, row: any) => {
      const quantity = numberValue(row.quantity)
      const unitPrice = numberValue(
        row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
      )

      return sum + quantity * unitPrice
    }, 0),
  )
  const vatTotal = computed(() =>
    rows.value.reduce((sum, row: any) => {
      const quantity = numberValue(row.quantity)
      const unitPrice = numberValue(
        row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount,
      )
      const vatRate = numberValue(row.vatRate ?? row.vat_rate)

      return sum + quantity * unitPrice * (vatRate / 100)
    }, 0),
  )
  const grandTotal = computed(() => subtotal.value + vatTotal.value)
  const canManageXero = computed(
    () => auth.hasPermission("mgmt.system.master_settings.manage") || auth.isAdmin || auth.isDev,
  )
  const xeroReady = computed(
    () => xeroStore.status?.status === "connected" && xeroStore.status.settingsComplete,
  )

  function xeroSync(invoice: any) {
    const local = xeroStore.syncResults[Number(invoice.id)]
    if (local) {
      return {
        status: local.syncStatus,
        externalInvoiceId: local.externalEntityId,
        externalReference: local.externalReference,
        lastSyncedAt: local.lastSyncedAt,
        error: local.error,
      }
    }
    return invoice.xeroSync ?? invoice.xero_sync ?? null
  }

  function xeroSyncLabel(invoice: any) {
    const status = String(xeroSync(invoice)?.status ?? "")
    if (
      xeroStore.syncingInvoiceId === Number(invoice.id) ||
      ["queued", "processing"].includes(status)
    )
      return "Syncing…"
    if (status === "synced") return "Synced"
    if (status === "failed") return "Resync"
    return "Sync to Xero"
  }

  async function syncToXero(invoice: any) {
    try {
      const result = await xeroStore.syncInvoice(Number(invoice.id))
      toast.add({
        severity: result.externalEntityId ? "info" : "success",
        summary: result.externalEntityId ? "Already synced" : "Xero sync queued",
        detail: result.externalEntityId
          ? "This invoice already has a Xero invoice mapping."
          : "The customer invoice will be transferred by the accounting queue.",
        life: 3800,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Xero sync failed",
        detail:
          error?.response?.data?.message ||
          error?.message ||
          "The invoice could not be synchronised.",
        life: 5000,
      })
    }
  }

  function invoiceNumber(row: any): string {
    return row?.invoice?.invoiceNumber ?? row?.invoice?.invoice_number ?? row?.invoiceNumber ?? ""
  }

  function invoicePdfUrl(row: any): string {
    return row?.invoice?.pdfUrl ?? row?.invoice?.pdf_url ?? ""
  }

  function isPrinted(row: any): boolean {
    const status = row?.invoice_status ?? row?.invoiceStatus ?? "not_invoiced"

    return status === "printed" && !!invoiceNumber(row)
  }

  function invoiceStatusLabel(status: unknown): string {
    const normalized = String(status || "printed").replace(/_/g, " ")

    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  function openBlob(blob: Blob) {
    const url = URL.createObjectURL(blob)

    window.open(url, "_blank", "noopener,noreferrer")
    window.setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  function openPendingInvoice() {
    if (emailInvoice.value?.pdfUrl) {
      window.open(emailInvoice.value.pdfUrl, "_blank", "noopener,noreferrer")
      return
    }

    if (pendingInvoiceBlob.value) {
      openBlob(pendingInvoiceBlob.value)
    }
  }

  function normalizeEmail(email: unknown): string {
    return String(email || "").trim()
  }

  function addRecipient(
    recipients: InvoiceEmailRecipientOption[],
    seen: Set<string>,
    group: string,
    label: string,
    email: unknown,
  ) {
    const value = normalizeEmail(email)

    if (!value || seen.has(value.toLowerCase())) return

    seen.add(value.toLowerCase())
    recipients.push({
      group,
      label: `${label} <${value}>`,
      value,
    })
  }

  function contactTypeText(contact: Contact): string {
    return (contact.contact_types ?? [])
      .map((type: any) => `${type?.code ?? ""} ${type?.name ?? ""}`.toLowerCase())
      .join(" ")
  }

  const emailRecipientOptions = computed<InvoiceEmailRecipientOption[]>(() => {
    const recipients: InvoiceEmailRecipientOption[] = []
    const seen = new Set<string>()
    const job = jobContext.job.value as any
    const customer =
      job?.customer_contact ??
      contacts.value.find(contact => Number(contact.id) === Number(jobContext.form.customer_id))

    addRecipient(
      recipients,
      seen,
      "Customer",
      customer?.company_name || "Customer",
      customer?.email,
    )
    addRecipient(recipients, seen, "Customer", "Consignee", jobContext.form.consignee_email)
    addRecipient(recipients, seen, "Employee", auth.user?.name || "Current user", auth.user?.email)

    const supplierIds = new Set(
      jobContext.form.buy_costs
        .map((row: any) => Number(row.supplier_id ?? row.supplierId))
        .filter(id => Number.isFinite(id) && id > 0),
    )

    contacts.value.forEach(contact => {
      const typeText = contactTypeText(contact)
      const name = contact.company_name || `Contact #${contact.id}`

      if (supplierIds.has(Number(contact.id))) {
        addRecipient(recipients, seen, "Suppliers", name, contact.email)
      }

      if (typeText.includes("haulier") || typeText.includes("carrier")) {
        addRecipient(recipients, seen, "Hauliers", name, contact.email)
      }
    })

    return recipients
  })

  const emailJobSummary = computed(() => {
    const job = jobContext.job.value as any

    return {
      "Job Number": jobContext.form.job_number || job?.job_number,
      Customer: job?.customer_contact?.company_name,
      Consignee: jobContext.form.consignee_name,
      "Collection Date": jobContext.form.collection_date,
      "Delivery Date": jobContext.form.delivery_date,
      "Customer Ref": jobContext.form.customer_po_number || jobContext.form.customer_booking_ref,
      "Invoice Total": emailInvoice.value
        ? money(emailInvoice.value.currency, numberValue(emailInvoice.value.total))
        : money(invoiceCurrency.value, grandTotal.value),
    }
  })

  async function loadContacts() {
    try {
      const response = await contactsService.list({ page: 1, per_page: 500 })
      contacts.value = response.data ?? []
    } catch {
      contacts.value = []
    }
  }

  function latestCustomerInvoice() {
    return (
      [...invoices.value].sort((a: any, b: any) => Number(b.id ?? 0) - Number(a.id ?? 0))[0] ?? null
    )
  }

  function openDeleteInvoice(invoice: any) {
    const latest = latestCustomerInvoice()

    deleteInvoiceTarget.value = invoice
    deleteConfirmation.value = ""

    if (!latest || Number(latest.id) !== Number(invoice?.id)) {
      deleteBlockedDialogVisible.value = true
      return
    }

    deleteDialogVisible.value = true
  }

  async function confirmDeleteInvoice() {
    const jobId = Number(jobContext.job.value?.id)
    const invoiceId = Number(deleteInvoiceTarget.value?.id)
    const invoiceNumber = String(deleteInvoiceTarget.value?.invoiceNumber ?? "")

    if (!Number.isFinite(jobId) || jobId <= 0 || !Number.isFinite(invoiceId) || invoiceId <= 0) {
      return
    }

    if (deleteConfirmation.value.trim() !== invoiceNumber) {
      toast.add({
        severity: "warn",
        summary: "Confirmation required",
        detail: "Type the exact invoice number before deleting.",
        life: 3000,
      })
      return
    }

    deletingInvoice.value = true

    try {
      await transportJobStore.deleteInvoice(jobId, invoiceId, deleteConfirmation.value.trim())
      await jobContext.load()
      deleteDialogVisible.value = false
      deleteInvoiceTarget.value = null
      deleteConfirmation.value = ""
      toast.add({
        severity: "success",
        summary: "Invoice deleted",
        detail:
          "The latest invoice was deleted and the invoice sequence was rolled back where applicable.",
        life: 3500,
      })
    } catch (error: any) {
      if (Number(error?.response?.status) === 409) {
        deleteDialogVisible.value = false
        deleteBlockedDialogVisible.value = true
        return
      }

      toast.add({
        severity: "error",
        summary: "Delete failed",
        detail:
          error?.response?.data?.message ?? error?.message ?? "Unable to delete this invoice.",
        life: 4500,
      })
    } finally {
      deletingInvoice.value = false
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
        return text || "Unable to generate the invoice."
      }
    }

    return error?.response?.data?.message ?? error?.message ?? "Unable to generate the invoice."
  }

  function showInvoiceProgressToast(detail: string) {
    ;(toast as any).removeGroup?.("invoice-progress")
    toast.add({
      group: "invoice-progress",
      severity: "info",
      summary: "Generating invoice",
      detail,
      life: 60000,
      closable: false,
    } as any)
  }

  function clearInvoiceProgressToast() {
    ;(toast as any).removeGroup?.("invoice-progress")
  }

  async function generateInvoice() {
    const id = Number(jobContext.job.value?.id)

    if (!Number.isFinite(id) || id <= 0) {
      toast.add({
        severity: "warn",
        summary: "Save job first",
        detail: "The job must be saved before an invoice can be generated.",
        life: 3500,
      })
      return
    }

    if (!rows.value.length) {
      toast.add({
        severity: "warn",
        summary: "No sell charges",
        detail: "Add at least one sell charge before generating the invoice.",
        life: 3500,
      })
      return
    }

    generating.value = true
    showInvoiceProgressToast("Saving sell charges, then building the customer invoice PDF...")

    try {
      await jobContext.save({
        successSummary: "Invoice ready",
        successDetail: "Sell Charges saved before generating the invoice.",
        successLife: 1800,
      })

      showInvoiceProgressToast(
        "Customer invoice PDF is still processing. It will open as soon as it is ready...",
      )
      const generation = await transportJobStore.generateCustomerInvoice(id)
      if (generation.generation?.id) {
        invoiceGenerationStore.track(generation.generation.id, generation.generation)
      }

      await jobContext.load()
      toast.add({
        severity: "info",
        summary: "Invoice ready",
        detail: "The invoice PDF has been generated.",
        life: 3500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Invoice failed",
        detail: await extractPdfError(error),
        life: 4500,
      })
    } finally {
      clearInvoiceProgressToast()
      generating.value = false
    }
  }

  onMounted(() => {
    void loadContacts()
    if (!xeroStore.status) void xeroStore.fetchStatus(false)
  })

  return {
    emailDialogVisible,
    emailInvoice,
    emailJobSummary,
    emailRecipientOptions,
    confirmDeleteInvoice,
    deleteBlockedDialogVisible,
    deleteConfirmation,
    deleteDialogVisible,
    deleteInvoiceTarget,
    deletingInvoice,
    generateInvoice,
    generating,
    grandTotal,
    currencyCode,
    invoiceCurrency,
    invoiceNumber,
    invoicePdfUrl,
    invoiceStatusLabel,
    invoices,
    isPrinted,
    jobContext,
    money,
    numberValue,
    openDeleteInvoice,
    openPendingInvoice,
    rows,
    subtotal,
    vatTotal,
    canManageXero,
    xeroReady,
    xeroStore,
    xeroSync,
    xeroSyncLabel,
    syncToXero,
  }
}
