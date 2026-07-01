import { computed, inject, onMounted, reactive, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"

import contactsService from "@/app/services/contacts"
import { useAuthStore } from "@/app/stores/auth"
import { useChargeCodeStore } from "@/app/stores/charge-codes"
import { useTransportJobStore } from "@/app/stores/transport-job"
import { useInvoiceGenerationStore } from "@/app/stores/invoice-generation"
import type { ChargeCode } from "@/app/types/charge-code"
import type { Contact } from "@/app/types/contact"
import type { JobDetailsContext } from "../../../JobDetailsPage.logic"
import type { InvoiceEmailRecipientOption } from "@/app/types/invoice-email"

export function useJobNormalSupplierInvoicesTab() {
  const context = inject<JobDetailsContext>("jobDetails")

  if (!context) {
    throw new Error("useJobNormalSupplierInvoicesTab must be used inside JobDetailsPage.")
  }

  const jobContext = context
  const toast = useToast()
  const auth = useAuthStore()
  const chargeCodeStore = useChargeCodeStore()
  const transportJobStore = useTransportJobStore()
  const invoiceGenerationStore = useInvoiceGenerationStore()
  const supplierContacts = ref<Contact[]>([])
  const suppliersLoading = ref(false)
  const uploadDialogVisible = ref(false)
  const uploadSaving = ref(false)
  const generateDialogVisible = ref(false)
  const generateSupplierId = ref<number | null>(null)
  const generateLoading = ref(false)
  const passDialogVisible = ref(false)
  const passSaving = ref(false)
  const pendingInvoiceBlob = ref<Blob | null>(null)
  const emailDialogVisible = ref(false)
  const emailInvoice = ref<any | null>(null)

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
    invoiceDate: new Date(),
    dueDate: addDays(new Date(), 30),
    netAmount: 0,
    taxAmount: 0,
  })

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

      if (Number.isFinite(supplierId) && supplierId > 0 && !hasSupplierInvoice(row)) {
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

      if (Number.isFinite(supplierId) && supplierId > 0) {
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

    rows.value.forEach((row: any) => {
      if (row.currency) options.add(currencyCode(row.currency))
    })

    return [...options].map(code => ({ label: code, value: code }))
  })
  const totalCost = computed(() =>
    rows.value.reduce((sum, row: any) => {
      const quantity = numberValue(row.quantity)
      const unitCost = numberValue(row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount)

      return sum + quantity * unitCost
    }, 0),
  )
  const passGrossAmount = computed(() => {
    return numberValue(passDraft.netAmount) + numberValue(passDraft.taxAmount)
  })

  function invoiceNumber(row: any): string {
    return row?.invoice?.invoiceNumber ?? row?.invoice?.invoice_number ?? row?.invoiceNumber ?? ""
  }

  function invoicePdfUrl(row: any): string {
    return row?.invoice?.pdfUrl ?? row?.invoice?.pdf_url ?? ""
  }

  function isPrinted(row: any): boolean {
    const status = row?.invoice_status ?? row?.invoiceStatus ?? "not_invoiced"

    return ["printed", "passed"].includes(status) && !!invoiceNumber(row)
  }

  function hasSupplierInvoice(row: any): boolean {
    const status = String(row?.invoice_status ?? row?.invoiceStatus ?? "not_invoiced")
      .toLowerCase()
      .replace(/\s+/g, "_")

    return ["printed", "passed"].includes(status) && !!invoiceNumber(row)
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

  function resetDraft() {
    invoiceDraft.supplierId = null
    invoiceDraft.lines = [makeLineDraft()]
  }

  function openUploadDialog() {
    resetDraft()
    uploadDialogVisible.value = true
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

  function openPendingInvoice() {
    if (emailInvoice.value?.pdfUrl) {
      window.open(emailInvoice.value.pdfUrl, "_blank", "noopener,noreferrer")
      return
    }

    if (pendingInvoiceBlob.value) {
      openBlob(pendingInvoiceBlob.value)
    }
  }

  function invoiceListHref(invoice: any): string {
    return invoice?.pdfUrl || "#"
  }

  async function openInvoiceFromList(event: MouseEvent, invoice: any) {
    if (invoice?.pdfUrl) return

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
        Number(contact.id) === Number(generateSupplierId.value ?? emailInvoice.value?.supplierId)
      )
    })
    const job = jobContext.job.value as any
    const customer = job?.customer_contact

    addRecipient(
      recipients,
      seen,
      "Supplier",
      selectedSupplier?.company_name || "Supplier",
      selectedSupplier?.email,
    )
    addRecipient(
      recipients,
      seen,
      "Customer",
      customer?.company_name || "Customer",
      customer?.email,
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

  const emailJobSummary = computed(() => {
    const job = jobContext.job.value as any
    const supplierId = Number(emailInvoice.value?.supplierId ?? emailInvoice.value?.supplier_id)

    return {
      "Job Number": jobContext.form.job_number || job?.job_number,
      Supplier: supplierName(supplierId) || emailInvoice.value?.metadata?.supplierName,
      Customer: job?.customer_contact?.company_name,
      Consignee: jobContext.form.consignee_name,
      "Collection Date": jobContext.form.collection_date,
      "Delivery Date": jobContext.form.delivery_date,
      "Invoice Total": emailInvoice.value
        ? money(emailInvoice.value.currency, numberValue(emailInvoice.value.total))
        : money(invoiceCurrency.value, totalCost.value),
    }
  })

  function latestSupplierInvoice(supplierId: number) {
    return (
      [...invoices.value]
        .filter((invoice: any) => Number(invoice.supplierId ?? invoice.supplier_id) === supplierId)
        .sort((a: any, b: any) => Number(b.id ?? 0) - Number(a.id ?? 0))[0] ?? null
    )
  }

  function supplierRows(supplierId: number) {
    return rows.value.filter((row: any) => {
      return Number(row.supplier_id ?? row.supplierId) === supplierId
    })
  }

  function supplierCostCurrency(supplierId: number): string {
    return currencyCode(supplierRows(supplierId)[0]?.currency || jobContext.form.currency || "GBP")
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

  function openGenerateDialog() {
    generateSupplierId.value = supplierInvoiceOptions.value[0]?.value ?? null
    generateDialogVisible.value = true
  }

  function openPassDialog() {
    const supplierId = generateSupplierId.value || passSupplierOptions.value[0]?.value || null
    const today = new Date()

    passDraft.supplierId = supplierId
    passDraft.datePassed = today
    passDraft.invoiceDate = today
    passDraft.dueDate = addDays(today, 30)
    passDraft.invoiceNumber = ""

    if (supplierId) {
      const totals = supplierCostTotals(supplierId)

      passDraft.currency = supplierCostCurrency(supplierId)
      passDraft.netAmount = Number(totals.net.toFixed(2))
      passDraft.taxAmount = Number(totals.tax.toFixed(2))
    } else {
      passDraft.currency = currencyCode(jobContext.form.currency || "GBP")
      passDraft.netAmount = 0
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

    passSaving.value = true

    try {
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
        net_amount: numberValue(passDraft.netAmount),
        tax_amount: numberValue(passDraft.taxAmount),
        gross_amount: Number(passGrossAmount.value.toFixed(2)),
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
    const supplierId = Number(generateSupplierId.value)

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

    generateLoading.value = true
    generateDialogVisible.value = false
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
      const generation = await transportJobStore.generateSupplierInvoice(id, supplierId)
      if (generation.generation?.id) {
        invoiceGenerationStore.track(generation.generation.id, generation.generation)
      }

      await jobContext.load()
      toast.add({
        severity: "info",
        summary: "Supplier invoice ready",
        detail: "The supplier invoice PDF has been generated.",
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

  onMounted(async () => {
    resetDraft()
    await Promise.all([
      loadSuppliers(),
      chargeCodeStore.fetchAll({ sort: "description", direction: "asc", perPage: 1000 }),
    ])
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

      passDraft.currency = supplierCostCurrency(supplierId)
      passDraft.netAmount = Number(totals.net.toFixed(2))
      passDraft.taxAmount = Number(totals.tax.toFixed(2))
    },
  )

  return {
    addInvoiceLine,
    chargeDescriptionOptions,
    currencyOptions,
    emailDialogVisible,
    emailInvoice,
    emailJobSummary,
    emailRecipientOptions,
    generateDialogVisible,
    generateLoading,
    generateSupplierId,
    generateSupplierInvoice,
    invoiceDraft,
    currencyCode,
    invoiceCurrency,
    invoiceListHref,
    invoiceNumber,
    invoicePdfUrl,
    invoiceStatusLabel,
    invoices,
    isPrinted,
    jobContext,
    money,
    numberValue,
    openGenerateDialog,
    openInvoiceFromList,
    openPassDialog,
    openUploadDialog,
    openPendingInvoice,
    passSupplierOptions,
    passDialogVisible,
    passDraft,
    passGrossAmount,
    passSaving,
    passSupplierInvoice,
    removeInvoiceLine,
    rows,
    saveSupplierInvoice,
    supplierInvoiceOptions,
    supplierName,
    supplierOptions,
    suppliersLoading,
    totalCost,
    uploadDialogVisible,
    uploadSaving,
  }
}
