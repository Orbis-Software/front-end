import { computed, inject, onMounted, reactive, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"

import contactsService from "@/app/services/contacts"
import { useAuthStore } from "@/app/stores/auth"
import { useAccountSettingsStore } from "@/app/stores/account-settings"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useTransportJobStore } from "@/app/stores/transport-job"
import { useInvoiceGenerationStore } from "@/app/stores/invoice-generation"
import type { AccountSetting, AccountingSystem } from "@/app/types/account-setting"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Contact } from "@/app/types/contact"
import type { JobDetailsContext } from "@/app/types/job-details"
import type { InvoiceEmailRecipientOption } from "@/app/types/invoice-email"
import { isValidInvoiceEmail } from "@/app/utils/invoice-email"

export function useJobNormalSupplierInvoicesTab() {
  const context = inject<JobDetailsContext>("jobDetails")

  if (!context) {
    throw new Error("useJobNormalSupplierInvoicesTab must be used inside JobDetailsPage.")
  }

  const jobContext = context
  const toast = useToast()
  const auth = useAuthStore()
  const accountSettingsStore = useAccountSettingsStore()
  const chargeCodeStore = useChargeCodeStore()
  const transportJobStore = useTransportJobStore()
  const invoiceGenerationStore = useInvoiceGenerationStore()
  const supplierContacts = ref<Contact[]>([])
  const suppliersLoading = ref(false)
  const uploadDialogVisible = ref(false)
  const uploadSaving = ref(false)
  const generateDialogVisible = ref(false)
  type SupplierInvoiceStep = "bill" | "email" | "accounting" | "finish"

  const generateStep = ref<SupplierInvoiceStep>("bill")
  const generateSupplierId = ref<number | null>(null)
  const generateLoading = ref(false)
  const autoSupplierInvoiceNumber = ref(true)
  const emailSending = ref(false)
  const passDialogVisible = ref(false)
  const passSaving = ref(false)
  const pendingInvoiceBlob = ref<Blob | null>(null)
  const emailInvoice = ref<any | null>(null)
  const deleteDialogVisible = ref(false)
  const deleteBlockedDialogVisible = ref(false)
  const deleteInvoiceTarget = ref<any | null>(null)
  const deleteConfirmation = ref("")
  const deletingInvoice = ref(false)

  type SupplierInvoiceLineDraft = {
    id: number
    description: string
    quantity: number
    unitCost: number
    currency: string
  }

  const invoiceDraft = reactive({
    supplierId: null as number | null,
    lines: [] as SupplierInvoiceLineDraft[],
  })
  const passDraft = reactive({
    supplierId: null as number | null,
    datePassed: new Date(),
    currency: currencyCode(jobContext.form.currency || "GBP"),
    invoiceNumber: "",
    reference: jobContext.form.job_number || "",
    invoiceDate: new Date(),
    dueDate: addDays(new Date(), 30),
    invoiceAmount: 0,
    taxAmount: 0,
    residualAmount: false,
    attachedInvoice: null as File | null,
  })
  const supplierEmailDraft = reactive({
    recipients: [] as string[],
    manualEmail: "",
    subject: "",
    body: "",
  })
  const supplierInvoiceProgress = reactive({
    emailSent: false,
    accountingPrepared: false,
  })
  const generateActionInProgress = computed(() => generateLoading.value || emailSending.value)
  const accountingSystemLabels: Record<AccountingSystem, string> = {
    xero: "Xero",
    sage: "Sage",
    quickbooks: "QuickBooks",
  }

  function numberValue(value: unknown, fallback = 0): number {
    const numeric = Number(value)

    return Number.isFinite(numeric) ? numeric : fallback
  }

  function currencyCode(value: unknown): string {
    return String(value || jobContext.form.currency || "GBP").toUpperCase()
  }

  function addDays(date: Date, days: number): Date {
    const next = new Date(date)

    next.setDate(next.getDate() + days)

    return next
  }

  function formatDate(value: Date | string | null | undefined): string {
    if (!value) return ""

    const date = value instanceof Date ? value : new Date(value)

    if (Number.isNaN(date.getTime())) return ""

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-")
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

  function displayContactName(contact: Contact): string {
    return (
      contact.company_name ||
      (contact as any)?.name ||
      [(contact as any)?.first_name, (contact as any)?.last_name].filter(Boolean).join(" ") ||
      "Unnamed Contact"
    )
  }

  function makeLineDraft(): SupplierInvoiceLineDraft {
    return {
      id: Date.now() + Math.floor(Math.random() * 10000),
      description: "",
      quantity: 1,
      unitCost: 0,
      currency: currencyCode(jobContext.form.currency || "GBP"),
    }
  }

  const rows = computed(() => jobContext.form.buy_costs)
  const invoices = computed(() =>
    ((jobContext.form as any).invoices ?? []).filter((invoice: any) => {
      return (invoice.invoiceType ?? invoice.invoice_type) === "supplier"
    }),
  )
  const invoiceCurrency = computed(() =>
    currencyCode(jobContext.form.currency || rows.value[0]?.currency),
  )
  const supplierOptions = computed(() =>
    supplierContacts.value.map(contact => ({
      label: displayContactName(contact),
      value: Number(contact.id),
    })),
  )
  const supplierNameById = computed(() => {
    const names = new Map<number, string>()

    supplierContacts.value.forEach(contact => {
      names.set(Number(contact.id), displayContactName(contact))
    })

    return names
  })
  const supplierInvoiceOptions = computed(() => {
    const ids = new Set<number>()

    rows.value.forEach((row: any) => {
      const supplierId = Number(row.supplier_id ?? row.supplierId)

      if (isAvailableSupplierBillRow(row, supplierId)) {
        ids.add(supplierId)
      }
    })

    return [...ids].map(id => ({
      label: supplierName(id) || `Supplier #${id}`,
      value: id,
    }))
  })
  const passSupplierOptions = computed(() => {
    const ids = new Set<number>()

    rows.value.forEach((row: any) => {
      const supplierId = Number(row.supplier_id ?? row.supplierId)

      if (isAvailableSupplierBillRow(row, supplierId)) {
        ids.add(supplierId)
      }
    })

    return [...ids].map(id => ({
      label: supplierName(id) || `Supplier #${id}`,
      value: id,
    }))
  })
  const chargeDescriptionOptions = computed(() =>
    chargeCodeStore.chargeCodes.map(charge => ({
      label: charge.description,
      value: charge.description,
    })),
  )
  const currencyOptions = computed(() => {
    const options = new Set(["GBP", "EUR", "USD", currencyCode(jobContext.form.currency || "GBP")])

    supplierContacts.value.forEach(contact => {
      if (contact.currency_preference) options.add(currencyCode(contact.currency_preference))
    })

    rows.value.forEach((row: any) => {
      if (row.currency) options.add(currencyCode(row.currency))
    })

    return [...options].map(code => ({ label: code, value: code }))
  })
  const totalCost = computed(() =>
    availableSupplierBillRows.value.reduce((sum, row: any) => {
      const quantity = numberValue(row.quantity)
      const unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount)

      return sum + quantity * unitCost
    }, 0),
  )
  const passTotalInvoiceAmount = computed(() => {
    return numberValue(passDraft.invoiceAmount) + numberValue(passDraft.taxAmount)
  })
  const supplierBillReference = computed(
    () =>
      passDraft.reference ||
      jobContext.form.job_number ||
      (jobContext.job.value as any)?.job_number ||
      "",
  )
  const availableSupplierBillRows = computed(() =>
    rows.value.filter((row: any) => isAvailableSupplierBillRow(row)),
  )
  const selectedSupplierBillRows = computed(() => {
    const supplierId = Number(passDraft.supplierId)

    if (!Number.isFinite(supplierId) || supplierId <= 0) return []

    return rows.value
      .filter((row: any) => isAvailableSupplierBillRow(row, supplierId))
      .map(normalizeBillRow)
  })
  const billSubtotal = computed(() =>
    selectedSupplierBillRows.value.reduce((sum: number, row: any) => sum + billLineNet(row), 0),
  )
  const billTaxTotal = computed(() =>
    selectedSupplierBillRows.value.reduce((sum: number, row: any) => sum + billLineTax(row), 0),
  )
  const billTotal = computed(() => billSubtotal.value + billTaxTotal.value)
  const activeAccountingSetting = computed<AccountSetting | null>(() => {
    const connectedSettings = accountSettingsStore.settings.filter(
      setting => setting.isActive && setting.isConnected,
    )

    return connectedSettings.find(setting => setting.isDefault) ?? connectedSettings[0] ?? null
  })
  const accountingProviderLabel = computed(() => {
    const system = activeAccountingSetting.value?.accountingSystem

    return system ? accountingSystemLabels[system] : "Xero, Sage, or QuickBooks"
  })
  const supplierInvoiceStepSummary = computed(() => {
    return [
      {
        label: "Billing Details",
        value: emailInvoice.value?.id ? "Invoice generated" : "Ready",
      },
      {
        label: "Send Invoice",
        value: supplierInvoiceProgress.emailSent ? "Email sent" : "Not sent",
      },
      {
        label: "Third Party",
        value: activeAccountingSetting.value
          ? `${accountingProviderLabel.value} handoff prepared`
          : "No accounting system configured",
      },
      {
        label: "Total",
        value: money(passDraft.currency, billTotal.value),
      },
    ]
  })
  const passSupplierOutstanding = computed(() => {
    const supplierId = Number(passDraft.supplierId)

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      return { total: 0, passed: 0, outstandingBefore: 0, outstandingAfter: 0 }
    }

    const totals = supplierCostTotals(supplierId)
    const total = totals.net + totals.tax
    const passed = supplierPassedTotal(supplierId)
    const outstandingBefore = Math.max(0, total - passed)
    const outstandingAfter = Math.max(0, outstandingBefore - passTotalInvoiceAmount.value)

    return { total, passed, outstandingBefore, outstandingAfter }
  })

  function invoiceNumber(row: any): string {
    return row?.invoice?.invoiceNumber ?? row?.invoice?.invoice_number ?? row?.invoiceNumber ?? ""
  }

  function invoiceDisplayNumber(row: any): string {
    const number = invoiceNumber(row)
    const id = row?.invoice_id ?? row?.invoiceId

    return number || (id ? `Invoice #${id}` : "")
  }

  function invoicePdfUrl(row: any): string {
    return row?.invoice?.pdfUrl ?? row?.invoice?.pdf_url ?? ""
  }

  function isPrinted(row: any): boolean {
    return isRowAlreadyInvoiced(row)
  }

  function hasSupplierInvoice(row: any): boolean {
    return isRowAlreadyInvoiced(row) && !!invoiceNumber(row)
  }

  function isRowAlreadyInvoiced(row: any): boolean {
    const status = String(row?.invoice_status ?? row?.invoiceStatus ?? "not_invoiced")
      .toLowerCase()
      .replace(/\s+/g, "_")

    return Boolean(row?.invoice_id ?? row?.invoiceId) || ["printed", "passed"].includes(status)
  }

  function isAvailableSupplierBillRow(row: any, supplierId?: number | null): boolean {
    const rowSupplierId = Number(row?.supplier_id ?? row?.supplierId)
    const targetSupplierId = supplierId == null ? rowSupplierId : Number(supplierId)

    return (
      (row?.type ?? "buy") === "buy" &&
      Number.isFinite(rowSupplierId) &&
      rowSupplierId > 0 &&
      Number.isFinite(targetSupplierId) &&
      targetSupplierId > 0 &&
      rowSupplierId === targetSupplierId &&
      !isRowAlreadyInvoiced(row)
    )
  }

  function invoiceStatusLabel(status: unknown): string {
    const normalized = String(status || "printed").replace(/_/g, " ")

    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  function supplierName(supplierId: unknown): string {
    const id = Number(supplierId)

    return Number.isFinite(id) && supplierNameById.value.has(id)
      ? supplierNameById.value.get(id)!
      : ""
  }

  function findChargeCode(description: string): ChargeCode | null {
    const normalized = description.trim().toLowerCase()

    return (
      chargeCodeStore.chargeCodes.find(charge => {
        return (
          String(charge.description ?? "")
            .trim()
            .toLowerCase() === normalized
        )
      }) ?? null
    )
  }

  function normalizeBillRow(row: any) {
    row.type = "buy"
    row.description = row.description ?? ""
    row.supplier_id = row.supplier_id ?? row.supplierId ?? passDraft.supplierId ?? null
    row.chargeCodeId = row.chargeCodeId ?? row.charge_code_id ?? null
    row.quantity = numberValue(row.quantity, 1) || 1
    row.unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount, 0)
    row.currency = currencyCode(
      row.currency || passDraft.currency || jobContext.form.currency || "GBP",
    )
    row.exchangeRate = numberValue(row.exchangeRate ?? row.exchange_rate, 1) || 1
    row.vatRate = numberValue(row.vatRate ?? row.vat_rate, 0)
    row.taxCode = row.taxCode ?? row.tax_code ?? ""

    return row
  }

  function billLineNet(row: any): number {
    return numberValue(row.quantity, 1) * numberValue(row.unitCost ?? row.unit_amount ?? row.amount)
  }

  function billLineTax(row: any): number {
    return billLineNet(row) * (numberValue(row.vatRate ?? row.vat_rate) / 100)
  }

  function billLineTotal(row: any): number {
    return billLineNet(row) + billLineTax(row)
  }

  function chargeCodeAccount(row: any): string {
    const chargeId = Number(row.chargeCodeId ?? row.charge_code_id)
    const charge =
      chargeCodeStore.chargeCodes.find(item => Number(item.id) === chargeId) ??
      findChargeCode(String(row.description ?? ""))

    return String(charge?.purchaseNominal || charge?.salesNominal || row.account || "")
  }

  function updateBillLineDescription(row: any, value: unknown) {
    const description = String(value ?? "").trim()
    const charge = findChargeCode(description)

    row.description = description
    row.chargeCodeId = charge?.id ?? null
    row.charge_code_id = charge?.id ?? null

    if (charge?.defaultTaxCode && !row.taxCode) {
      row.taxCode = charge.defaultTaxCode
      row.tax_code = charge.defaultTaxCode
    }
  }

  function addBillLine() {
    const supplierId = Number(passDraft.supplierId)

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      toast.add({
        severity: "warn",
        summary: "From required",
        detail: "Select the supplier before adding a line.",
        life: 3000,
      })
      return
    }

    jobContext.form.buy_costs.push({
      id: `supplier-bill-${Date.now()}`,
      type: "buy",
      description: "",
      supplier_id: supplierId,
      chargeCodeId: null,
      charge_code_id: null,
      quantity: 1,
      unitCost: 0,
      currency: currencyCode(passDraft.currency || jobContext.form.currency || "GBP"),
      exchangeRate: 1,
      amount: 0,
      vatRate: 0,
      taxCode: "",
    })
  }

  function removeBillLine(row: any) {
    jobContext.form.buy_costs = jobContext.form.buy_costs.filter((item: any) => item.id !== row.id)

    if (!selectedSupplierBillRows.value.length) {
      addBillLine()
    }
  }

  function resetDraft() {
    invoiceDraft.supplierId = null
    invoiceDraft.lines = [makeLineDraft()]
  }

  function openUploadDialog() {
    resetDraft()
    uploadDialogVisible.value = true
  }

  function onPassInvoiceFileSelected(event: Event) {
    const input = event.target as HTMLInputElement

    passDraft.attachedInvoice = input.files?.[0] ?? null
  }

  function clearPassInvoiceAttachment() {
    passDraft.attachedInvoice = null
  }

  function addInvoiceLine() {
    invoiceDraft.lines.push(makeLineDraft())
  }

  function removeInvoiceLine(id: number) {
    invoiceDraft.lines = invoiceDraft.lines.filter(line => line.id !== id)

    if (!invoiceDraft.lines.length) {
      addInvoiceLine()
    }
  }

  async function loadSuppliers() {
    suppliersLoading.value = true

    try {
      const firstResponse = await contactsService.list({
        page: 1,
        per_page: 500,
      })
      const contacts = [...(firstResponse.data ?? [])]
      const lastPage = Number(firstResponse.meta?.last_page ?? 1)

      for (let page = 2; page <= lastPage; page += 1) {
        const response = await contactsService.list({
          page,
          per_page: 500,
        })

        contacts.push(...(response.data ?? []))
      }

      supplierContacts.value = contacts
    } finally {
      suppliersLoading.value = false
    }
  }

  async function saveSupplierInvoice() {
    const supplierId = Number(invoiceDraft.supplierId)
    const validLines = invoiceDraft.lines.filter(line => {
      return line.description.trim() || numberValue(line.unitCost) > 0
    })

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      toast.add({
        severity: "warn",
        summary: "Supplier required",
        detail: "Select one supplier for this supplier invoice.",
        life: 3000,
      })
      return
    }

    if (!validLines.length) {
      toast.add({
        severity: "warn",
        summary: "Cost rows required",
        detail: "Add at least one cost description row.",
        life: 3000,
      })
      return
    }

    uploadSaving.value = true

    try {
      validLines.forEach(line => {
        const charge = findChargeCode(line.description)

        jobContext.form.buy_costs.push({
          id: `supplier-invoice-${Date.now()}-${line.id}`,
          type: "buy",
          description: line.description.trim(),
          supplier_id: supplierId,
          chargeCodeId: charge?.id ?? null,
          quantity: numberValue(line.quantity, 1) || 1,
          unitCost: numberValue(line.unitCost),
          currency: currencyCode(line.currency),
          exchangeRate: 1,
          amount: numberValue(line.quantity, 1) * numberValue(line.unitCost),
        })
      })

      await jobContext.save({
        successSummary: "Supplier invoice uploaded",
        successDetail: "Supplier invoice cost rows were added to Buy Costs.",
        successLife: 2200,
      })

      uploadDialogVisible.value = false
      resetDraft()
    } catch {
      // save() already displays the exact error toast.
    } finally {
      uploadSaving.value = false
    }
  }

  function openBlob(blob: Blob) {
    const url = URL.createObjectURL(blob)

    window.open(url, "_blank", "noopener,noreferrer")
    window.setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  async function openPendingInvoice() {
    const jobId = Number(jobContext.job.value?.id)
    const invoiceId = Number(emailInvoice.value?.id)

    if (Number.isFinite(jobId) && jobId > 0 && Number.isFinite(invoiceId) && invoiceId > 0) {
      try {
        const blob = await transportJobStore.downloadInvoicePdf(jobId, invoiceId)
        openBlob(blob)
        return
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Invoice failed",
          detail:
            error?.response?.data?.message ??
            error?.message ??
            "Unable to open the supplier invoice PDF.",
          life: 4500,
        })
      }
    }

    if (pendingInvoiceBlob.value) {
      openBlob(pendingInvoiceBlob.value)
    }
  }

  function invoiceListHref(invoice: any): string {
    return invoice?.id ? `#invoice-${invoice.id}` : "#"
  }

  async function openInvoiceFromList(event: MouseEvent, invoice: any) {
    event.preventDefault()

    const jobId = Number(jobContext.job.value?.id)
    const invoiceId = Number(invoice?.id)

    if (!Number.isFinite(jobId) || jobId <= 0 || !Number.isFinite(invoiceId) || invoiceId <= 0) {
      toast.add({
        severity: "warn",
        summary: "Invoice unavailable",
        detail: "This supplier invoice cannot be opened yet.",
        life: 3000,
      })
      return
    }

    try {
      const blob = await transportJobStore.downloadInvoicePdf(jobId, invoiceId)
      openBlob(blob)
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Invoice failed",
        detail:
          error?.response?.data?.message ??
          error?.message ??
          "Unable to open the supplier invoice PDF.",
        life: 4500,
      })
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
    const selectedSupplier = supplierContacts.value.find(contact => {
      return (
        Number(contact.id) ===
        Number(passDraft.supplierId ?? generateSupplierId.value ?? emailInvoice.value?.supplierId)
      )
    })

    addRecipient(
      recipients,
      seen,
      "Supplier",
      selectedSupplier?.company_name || "Supplier",
      selectedSupplier?.email,
    )
    addRecipient(recipients, seen, "Employee", auth.user?.name || "Current user", auth.user?.email)

    supplierContacts.value.forEach(contact => {
      const typeText = contactTypeText(contact)
      const name = contact.company_name || `Contact #${contact.id}`

      if (typeText.includes("haulier") || typeText.includes("carrier")) {
        addRecipient(recipients, seen, "Hauliers", name, contact.email)
      }
    })

    return recipients
  })

  function latestSupplierInvoice(supplierId: number) {
    return (
      [...invoices.value]
        .filter((invoice: any) => Number(invoice.supplierId ?? invoice.supplier_id) === supplierId)
        .sort((a: any, b: any) => Number(b.id ?? 0) - Number(a.id ?? 0))[0] ?? null
    )
  }

  function latestSupplierInvoiceAny() {
    return (
      [...invoices.value].sort((a: any, b: any) => Number(b.id ?? 0) - Number(a.id ?? 0))[0] ?? null
    )
  }

  function openDeleteInvoice(invoice: any) {
    const latest = latestSupplierInvoiceAny()

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
        detail: "The latest supplier invoice was deleted and linked cost rows were reset.",
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

  function supplierRows(supplierId: number) {
    return rows.value.filter((row: any) => {
      return isAvailableSupplierBillRow(row, supplierId)
    })
  }

  function supplierCostCurrency(supplierId: number): string {
    const supplier = supplierContacts.value.find(contact => Number(contact.id) === supplierId)

    return currencyCode(supplier?.currency_preference || jobContext.form.currency || "GBP")
  }

  function supplierCostTotals(supplierId: number) {
    return supplierRows(supplierId).reduce(
      (totals, row: any) => {
        const quantity = numberValue(row.quantity, 1)
        const unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount)
        const net = quantity * unitCost
        const tax = net * (numberValue(row.vatRate ?? row.vat_rate) / 100)

        totals.net += net
        totals.tax += tax

        return totals
      },
      { net: 0, tax: 0 },
    )
  }

  function supplierPassedTotal(supplierId: number) {
    return invoices.value
      .filter((invoice: any) => {
        const invoiceSupplierId = Number(invoice.supplierId ?? invoice.supplier_id)
        const status = String(invoice.status ?? "").toLowerCase()
        const source = String(invoice.metadata?.source ?? "")

        return (
          invoiceSupplierId === supplierId &&
          status === "passed" &&
          source === "pass_supplier_invoice"
        )
      })
      .reduce((sum: number, invoice: any) => sum + numberValue(invoice.total), 0)
  }

  async function extractPdfError(error: any) {
    const data = error?.response?.data

    if (data instanceof Blob) {
      const text = await data.text()

      try {
        const parsed = JSON.parse(text)
        return parsed?.message ?? text
      } catch {
        return text || "Unable to generate the supplier invoice."
      }
    }

    return (
      error?.response?.data?.message ?? error?.message ?? "Unable to generate the supplier invoice."
    )
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

  function supplierInvoiceDefaultNumber(supplierId: unknown = passDraft.supplierId): string {
    const reference = (
      passDraft.reference ||
      jobContext.form.job_number ||
      (jobContext.job.value as any)?.job_number ||
      ""
    ).trim()
    const supplier = supplierName(supplierId).trim()

    return [reference, supplier].filter(Boolean).join("/")
  }

  function syncSupplierInvoiceNumber() {
    if (!generateDialogVisible.value || !autoSupplierInvoiceNumber.value) return

    passDraft.invoiceNumber = supplierInvoiceDefaultNumber()
  }

  function setSupplierInvoiceNumber(value: string) {
    passDraft.invoiceNumber = value
    autoSupplierInvoiceNumber.value = false
  }

  function prepareSupplierBillDraft(supplierId: number | null, invoice: any | null = null) {
    const today = new Date()
    const selectedSupplierId = supplierId || passSupplierOptions.value[0]?.value || null
    const existingInvoiceNumber =
      invoice?.metadata?.actualSupplierInvoiceNumber || invoice?.invoiceNumber || ""

    passDraft.supplierId = selectedSupplierId
    passDraft.datePassed = invoice?.metadata?.billFields?.datePassed
      ? new Date(invoice.metadata.billFields.datePassed)
      : today
    passDraft.invoiceDate = invoice?.invoiceDate ? new Date(invoice.invoiceDate) : today
    passDraft.dueDate = invoice?.dueDate ? new Date(invoice.dueDate) : addDays(today, 30)
    passDraft.reference =
      invoice?.metadata?.billFields?.reference ||
      invoice?.metadata?.reference ||
      jobContext.form.job_number ||
      (jobContext.job.value as any)?.job_number ||
      ""
    autoSupplierInvoiceNumber.value = !existingInvoiceNumber
    passDraft.invoiceNumber =
      existingInvoiceNumber || supplierInvoiceDefaultNumber(selectedSupplierId)
    passDraft.residualAmount = Boolean(invoice?.metadata?.billFields?.residualAmount ?? false)
    passDraft.attachedInvoice = null

    if (selectedSupplierId) {
      const totals = supplierCostTotals(selectedSupplierId)
      passDraft.currency = currencyCode(
        invoice?.currency || supplierCostCurrency(selectedSupplierId),
      )
      passDraft.invoiceAmount = numberValue(invoice?.subtotal, Number(totals.net.toFixed(2)))
      passDraft.taxAmount = numberValue(invoice?.totalVat, Number(totals.tax.toFixed(2)))
    } else {
      passDraft.currency = currencyCode(invoice?.currency || jobContext.form.currency || "GBP")
      passDraft.invoiceAmount = numberValue(invoice?.subtotal)
      passDraft.taxAmount = numberValue(invoice?.totalVat)
    }
  }

  function openGenerateDialog() {
    generateStep.value = "bill"
    emailInvoice.value = null
    pendingInvoiceBlob.value = null
    supplierInvoiceProgress.emailSent = false
    supplierInvoiceProgress.accountingPrepared = false
    generateSupplierId.value = supplierInvoiceOptions.value[0]?.value ?? null
    prepareSupplierBillDraft(generateSupplierId.value)
    generateDialogVisible.value = true
  }

  function openSupplierBillForInvoice(invoice: any) {
    const supplierId = Number(invoice?.supplierId ?? invoice?.supplier_id)

    generateStep.value = "bill"
    emailInvoice.value = invoice
    pendingInvoiceBlob.value = null
    supplierInvoiceProgress.emailSent = false
    supplierInvoiceProgress.accountingPrepared = false
    generateSupplierId.value = Number.isFinite(supplierId) && supplierId > 0 ? supplierId : null
    prepareSupplierBillDraft(generateSupplierId.value, invoice)
    generateDialogVisible.value = true
  }

  function openSupplierInvoiceEmailStep(invoice: any) {
    openSupplierBillForInvoice(invoice)
    generateStep.value = "email"
    prepareSupplierEmailDraft()
  }

  function resetGenerateDialogProcess() {
    clearInvoiceProgressToast()
    pendingInvoiceBlob.value = null
    emailInvoice.value = null
    supplierEmailDraft.recipients = []
    supplierEmailDraft.manualEmail = ""
    supplierEmailDraft.subject = ""
    supplierEmailDraft.body = ""
    supplierInvoiceProgress.emailSent = false
    supplierInvoiceProgress.accountingPrepared = false
    generateStep.value = "bill"
    generateSupplierId.value = null
  }

  function closeGenerateDialog() {
    if (generateActionInProgress.value) return

    generateDialogVisible.value = false
    resetGenerateDialogProcess()
  }

  function setGenerateDialogVisible(value: boolean) {
    if (value) {
      generateDialogVisible.value = true
      return
    }

    closeGenerateDialog()
  }

  function openPassDialog() {
    const supplierId = generateSupplierId.value || passSupplierOptions.value[0]?.value || null
    const today = new Date()

    autoSupplierInvoiceNumber.value = false
    passDraft.supplierId = supplierId
    passDraft.datePassed = today
    passDraft.invoiceDate = today
    passDraft.dueDate = addDays(today, 30)
    passDraft.invoiceNumber = ""
    passDraft.residualAmount = false
    passDraft.attachedInvoice = null

    if (supplierId) {
      const totals = supplierCostTotals(supplierId)
      const passed = supplierPassedTotal(supplierId)
      const outstanding = Math.max(0, totals.net + totals.tax - passed)

      passDraft.currency = supplierCostCurrency(supplierId)
      passDraft.invoiceAmount = Number(Math.max(0, outstanding - totals.tax).toFixed(2))
      passDraft.taxAmount = Number(totals.tax.toFixed(2))
    } else {
      passDraft.currency = currencyCode(jobContext.form.currency || "GBP")
      passDraft.invoiceAmount = 0
      passDraft.taxAmount = 0
    }

    passDialogVisible.value = true
  }

  async function passSupplierInvoice() {
    const id = Number(jobContext.job.value?.id)
    const supplierId = Number(passDraft.supplierId)
    const invoiceNumber = passDraft.invoiceNumber.trim()

    if (!Number.isFinite(id) || id <= 0) {
      toast.add({
        severity: "warn",
        summary: "Save job first",
        detail: "The job must be saved before a supplier invoice can be passed.",
        life: 3500,
      })
      return
    }

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      toast.add({
        severity: "warn",
        summary: "Supplier required",
        detail: "Select the supplier for this supplier invoice.",
        life: 3000,
      })
      return
    }

    if (!invoiceNumber) {
      toast.add({
        severity: "warn",
        summary: "Invoice number required",
        detail: "Enter the supplier's invoice number.",
        life: 3000,
      })
      return
    }

    const outstanding = passSupplierOutstanding.value.outstandingBefore
    const invoiceTotal = Number(passTotalInvoiceAmount.value.toFixed(2))

    if (invoiceTotal <= 0) {
      toast.add({
        severity: "warn",
        summary: "Invoice amount required",
        detail: "Enter the supplier invoice amount before passing the invoice.",
        life: 3000,
      })
      return
    }

    if (invoiceTotal > Number((outstanding + 0.01).toFixed(2))) {
      toast.add({
        severity: "warn",
        summary: "Amount exceeds outstanding",
        detail: "The total invoice amount cannot be greater than the supplier outstanding amount.",
        life: 3500,
      })
      return
    }

    passSaving.value = true

    try {
      if (passDraft.attachedInvoice) {
        jobContext.form.upload_files.push(passDraft.attachedInvoice)
        jobContext.form.upload_file_types.push("supplier_invoice")
      }

      await jobContext.save({
        successSummary: "Supplier costs saved",
        successDetail: "Buy Costs saved before passing the supplier invoice.",
        successLife: 1800,
      })

      await transportJobStore.passSupplierInvoice(id, {
        supplier_id: supplierId,
        date_passed: formatDate(passDraft.datePassed),
        currency: currencyCode(passDraft.currency),
        invoice_number: invoiceNumber,
        invoice_date: formatDate(passDraft.invoiceDate),
        due_date: formatDate(passDraft.dueDate),
        invoice_amount: numberValue(passDraft.invoiceAmount),
        tax_amount: numberValue(passDraft.taxAmount),
        total_invoice_amount: invoiceTotal,
        residual_amount: Boolean(passDraft.residualAmount),
      })

      await jobContext.load()
      passDialogVisible.value = false
      toast.add({
        severity: "success",
        summary: "Supplier invoice passed",
        detail: "The supplier invoice has been linked to this job.",
        life: 2600,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Pass supplier invoice failed",
        detail: await extractPdfError(error),
        life: 4500,
      })
    } finally {
      passSaving.value = false
    }
  }

  async function generateSupplierInvoice() {
    const id = Number(jobContext.job.value?.id)
    const supplierId = Number(passDraft.supplierId ?? generateSupplierId.value)
    const invoiceNumber = passDraft.invoiceNumber.trim()

    if (!Number.isFinite(id) || id <= 0) {
      toast.add({
        severity: "warn",
        summary: "Save job first",
        detail: "The job must be saved before a supplier invoice can be generated.",
        life: 3500,
      })
      return
    }

    if (!Number.isFinite(supplierId) || supplierId <= 0) {
      toast.add({
        severity: "warn",
        summary: "Supplier required",
        detail: "Select the supplier for this supplier invoice.",
        life: 3000,
      })
      return
    }

    if (!invoiceNumber) {
      toast.add({
        severity: "warn",
        summary: "Invoice number required",
        detail: "Enter the supplier invoice number before generating.",
        life: 3000,
      })
      return
    }

    if (!selectedSupplierBillRows.value.length) {
      toast.add({
        severity: "warn",
        summary: "Line required",
        detail: "Add at least one bill line before generating.",
        life: 3000,
      })
      return
    }

    generateLoading.value = true
    showInvoiceProgressToast("Saving buy costs, then building the supplier invoice PDF...")

    try {
      await jobContext.save({
        successSummary: "Supplier invoice ready",
        successDetail: "Buy Costs saved before generating the supplier invoice.",
        successLife: 1800,
      })

      showInvoiceProgressToast(
        "Supplier invoice PDF is still processing. It will open as soon as it is ready...",
      )
      const invoiceTotal = Number(billTotal.value.toFixed(2))
      const generation = await transportJobStore.generateSupplierInvoice(id, supplierId, {
        reference: passDraft.reference.trim() || supplierBillReference.value,
        invoice_number: invoiceNumber,
        invoice_date: formatDate(passDraft.invoiceDate),
        due_date: formatDate(passDraft.dueDate),
        date_passed: formatDate(passDraft.datePassed),
        currency: currencyCode(passDraft.currency),
        invoice_amount: Number(billSubtotal.value.toFixed(2)),
        tax_amount: Number(billTaxTotal.value.toFixed(2)),
        total_invoice_amount: invoiceTotal,
        residual_amount: Boolean(passDraft.residualAmount),
      })
      if (generation.generation?.id) {
        invoiceGenerationStore.track(generation.generation.id, generation.generation)
      }

      const generatedInvoice = generation.data ?? {
        id: generation.invoice_id,
        supplierId,
        invoiceNumber,
        invoiceDate: formatDate(passDraft.invoiceDate),
        dueDate: formatDate(passDraft.dueDate),
        currency: currencyCode(passDraft.currency),
        subtotal: Number(billSubtotal.value.toFixed(2)),
        totalVat: Number(billTaxTotal.value.toFixed(2)),
        total: invoiceTotal,
      }
      emailInvoice.value = generatedInvoice
      prepareSupplierEmailDraft()
      generateStep.value = "email"
      generateDialogVisible.value = true
      await jobContext.load()
      emailInvoice.value = emailInvoice.value ?? generatedInvoice
      generateStep.value = "email"
      generateDialogVisible.value = true
      toast.add({
        severity: "info",
        summary: "Supplier invoice ready",
        detail: "The supplier invoice PDF has been generated. Review the email details next.",
        life: 3500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Supplier invoice failed",
        detail: await extractPdfError(error),
        life: 4500,
      })
    } finally {
      clearInvoiceProgressToast()
      generateLoading.value = false
    }
  }

  function prepareSupplierEmailDraft() {
    const invoiceNumber = emailInvoice.value?.invoiceNumber || passDraft.invoiceNumber || "Invoice"
    supplierEmailDraft.recipients = emailRecipientOptions.value
      .filter(option => option.group === "Supplier")
      .map(option => option.value)
      .slice(0, 1)
    supplierEmailDraft.manualEmail = ""
    supplierEmailDraft.subject = `Supplier Invoice ${invoiceNumber}`
    supplierEmailDraft.body = [
      "Hello,",
      "",
      `Please find attached supplier invoice ${invoiceNumber} for job ${supplierBillReference.value}.`,
      "",
      "Kind regards,",
    ].join("\n")
  }

  function addManualEmailRecipient() {
    const email = supplierEmailDraft.manualEmail.trim()

    if (!isValidInvoiceEmail(email)) {
      toast.add({
        severity: "warn",
        summary: "Invalid email",
        detail: "Enter a valid manual email address.",
        life: 3000,
      })
      return
    }

    if (!supplierEmailDraft.recipients.includes(email)) {
      supplierEmailDraft.recipients = [...supplierEmailDraft.recipients, email]
    }

    supplierEmailDraft.manualEmail = ""
  }

  async function sendSupplierInvoiceEmail() {
    const jobId = Number(jobContext.job.value?.id)
    const invoiceId = Number(emailInvoice.value?.id)

    if (!Number.isFinite(jobId) || jobId <= 0 || !Number.isFinite(invoiceId) || invoiceId <= 0) {
      toast.add({
        severity: "warn",
        summary: "Invoice required",
        detail: "Generate the supplier invoice before sending the email.",
        life: 3000,
      })
      return
    }

    if (!supplierEmailDraft.recipients.length) {
      toast.add({
        severity: "warn",
        summary: "Recipient required",
        detail: "Select or add at least one email recipient.",
        life: 3000,
      })
      return
    }

    emailSending.value = true

    try {
      await transportJobStore.emailInvoice(jobId, {
        invoiceId,
        recipients: supplierEmailDraft.recipients,
        subject: supplierEmailDraft.subject,
        body: supplierEmailDraft.body,
      })
      supplierInvoiceProgress.emailSent = true
      generateStep.value = "accounting"
      toast.add({
        severity: "success",
        summary: "Email queued",
        detail: "Supplier invoice email has been queued. Continue to the accounting handoff.",
        life: 3500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Email failed",
        detail:
          error?.response?.data?.message ?? error?.message ?? "Unable to send the invoice email.",
        life: 4500,
      })
    } finally {
      emailSending.value = false
    }
  }

  function continueSupplierInvoiceAccounting() {
    supplierInvoiceProgress.accountingPrepared = Boolean(activeAccountingSetting.value)
    generateStep.value = "finish"
  }

  onMounted(async () => {
    resetDraft()
    await Promise.all([
      loadSuppliers(),
      chargeCodeStore.fetchAll({ sort: "description", direction: "asc", perPage: 1000 }),
    ])
    if (!accountSettingsStore.loaded) {
      accountSettingsStore.fetch().catch(() => undefined)
    }
  })

  watch(
    () => passDraft.invoiceDate,
    value => {
      passDraft.dueDate = addDays(value instanceof Date ? value : new Date(value), 30)
    },
  )

  watch(
    () => passDraft.supplierId,
    value => {
      const supplierId = Number(value)

      if (!Number.isFinite(supplierId) || supplierId <= 0) return

      const totals = supplierCostTotals(supplierId)
      const passed = supplierPassedTotal(supplierId)
      const outstanding = Math.max(0, totals.net + totals.tax - passed)

      passDraft.currency = supplierCostCurrency(supplierId)
      passDraft.invoiceAmount = Number(Math.max(0, outstanding - totals.tax).toFixed(2))
      passDraft.taxAmount = Number(totals.tax.toFixed(2))
      passDraft.residualAmount = false
      passDraft.attachedInvoice = null
      syncSupplierInvoiceNumber()
    },
  )

  watch(() => passDraft.reference, syncSupplierInvoiceNumber)

  return {
    addBillLine,
    addInvoiceLine,
    addManualEmailRecipient,
    billLineTotal,
    billSubtotal,
    billTaxTotal,
    billTotal,
    chargeDescriptionOptions,
    chargeCodeAccount,
    accountingProviderLabel,
    activeAccountingSetting,
    availableSupplierBillRows,
    closeGenerateDialog,
    continueSupplierInvoiceAccounting,
    currencyOptions,
    emailInvoice,
    emailSending,
    emailRecipientOptions,
    confirmDeleteInvoice,
    deleteBlockedDialogVisible,
    deleteConfirmation,
    deleteDialogVisible,
    deleteInvoiceTarget,
    deletingInvoice,
    generateDialogVisible,
    generateActionInProgress,
    generateLoading,
    generateStep,
    generateSupplierId,
    generateSupplierInvoice,
    invoiceDraft,
    currencyCode,
    invoiceCurrency,
    invoiceDisplayNumber,
    invoiceListHref,
    invoiceNumber,
    invoicePdfUrl,
    invoiceStatusLabel,
    invoices,
    isPrinted,
    jobContext,
    money,
    numberValue,
    openDeleteInvoice,
    openGenerateDialog,
    openInvoiceFromList,
    openPassDialog,
    openUploadDialog,
    openPendingInvoice,
    openSupplierBillForInvoice,
    openSupplierInvoiceEmailStep,
    onPassInvoiceFileSelected,
    passSupplierOptions,
    passDialogVisible,
    passDraft,
    passSupplierOutstanding,
    passTotalInvoiceAmount,
    passSaving,
    passSupplierInvoice,
    removeBillLine,
    removeInvoiceLine,
    rows,
    saveSupplierInvoice,
    clearPassInvoiceAttachment,
    setSupplierInvoiceNumber,
    setGenerateDialogVisible,
    supplierInvoiceOptions,
    supplierBillReference,
    supplierEmailDraft,
    supplierInvoiceProgress,
    supplierInvoiceStepSummary,
    supplierName,
    supplierOptions,
    suppliersLoading,
    selectedSupplierBillRows,
    totalCost,
    updateBillLineDescription,
    uploadDialogVisible,
    uploadSaving,
    sendSupplierInvoiceEmail,
  }
}
