import type {
  AccountsCustomerInvoice,
  AccountsOverviewRow,
  AccountsPendingJob,
  AccountsSummary,
  AccountsSummaryCard,
  AccountsSupplierPayment,
  AccountsSupplierPaymentStatus,
} from "@/app/types/accounts-summary"

function stringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback

  return String(value)
}

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function statusValue(value: unknown): AccountsSupplierPaymentStatus {
  const status = stringValue(value, "pending")

  return ["pending", "approved", "scheduled", "paid", "overdue"].includes(status)
    ? (status as AccountsSupplierPaymentStatus)
    : "pending"
}

function card(raw: any): AccountsSummaryCard {
  return {
    label: stringValue(raw?.label),
    value: stringValue(raw?.value),
  }
}

function overviewRow(raw: any): AccountsOverviewRow {
  return {
    metric: stringValue(raw?.metric),
    value: stringValue(raw?.value),
    comment: stringValue(raw?.comment),
  }
}

function pendingJob(raw: any): AccountsPendingJob {
  return {
    job: stringValue(raw?.job),
    jobId: numberValue(raw?.jobId),
    customer: stringValue(raw?.customer, "Unknown Customer"),
    user: stringValue(raw?.user, "System"),
    mode: stringValue(raw?.mode),
    stage: stringValue(raw?.stage, "In progress"),
    targetInvoiceDate: stringValue(raw?.targetInvoiceDate),
    estimatedSell: numberValue(raw?.estimatedSell),
    estimatedCost: numberValue(raw?.estimatedCost),
    currency: stringValue(raw?.currency, "GBP"),
  }
}

function customerInvoice(raw: any): AccountsCustomerInvoice {
  return {
    id: stringValue(raw?.id),
    jobId: numberValue(raw?.jobId),
    invoice: stringValue(raw?.invoice),
    job: stringValue(raw?.job),
    customer: stringValue(raw?.customer, "Unknown Customer"),
    mode: stringValue(raw?.mode),
    invoiceDate: stringValue(raw?.invoiceDate),
    dueDate: stringValue(raw?.dueDate),
    amount: numberValue(raw?.amount),
    cost: numberValue(raw?.cost),
    currency: stringValue(raw?.currency, "GBP"),
    paid: Boolean(raw?.paid),
    paidDate: stringValue(raw?.paidDate),
    status: stringValue(raw?.status, "printed"),
    postedPlatform: stringValue(raw?.postedPlatform),
    user: stringValue(raw?.user, "System"),
  }
}

function supplierPayment(raw: any): AccountsSupplierPayment {
  return {
    id: stringValue(raw?.id),
    chargeId: numberValue(raw?.chargeId),
    supplierInvoice: stringValue(raw?.supplierInvoice),
    job: stringValue(raw?.job),
    jobId: raw?.jobId === null || raw?.jobId === undefined ? null : numberValue(raw?.jobId),
    supplier: stringValue(raw?.supplier, "Supplier not selected"),
    supplierCode: stringValue(raw?.supplierCode),
    user: stringValue(raw?.user, "System"),
    mode: stringValue(raw?.mode),
    invoiceDate: stringValue(raw?.invoiceDate),
    dueDate: stringValue(raw?.dueDate),
    amount: numberValue(raw?.amount),
    currency: stringValue(raw?.currency, "GBP"),
    approved: Boolean(raw?.approved),
    approvedDate: stringValue(raw?.approvedDate),
    paid: Boolean(raw?.paid),
    paidDate: stringValue(raw?.paidDate),
    status: statusValue(raw?.status),
    paymentMethod: stringValue(raw?.paymentMethod, "Bank Transfer"),
    chargeDescription: stringValue(raw?.chargeDescription),
    taxCode: stringValue(raw?.taxCode),
    bank: {
      bankName: stringValue(raw?.bank?.bankName),
      iban: stringValue(raw?.bank?.iban),
      swift: stringValue(raw?.bank?.swift),
      accountNumber: stringValue(raw?.bank?.accountNumber),
      country: stringValue(raw?.bank?.country),
    },
  }
}

function fetch(raw: any): AccountsSummary {
  return {
    customerInvoices: Array.isArray(raw?.customerInvoices)
      ? raw.customerInvoices.map(customerInvoice)
      : [],
    supplierInvoices: Array.isArray(raw?.supplierInvoices)
      ? raw.supplierInvoices.map(supplierPayment)
      : [],
    overviewSummary: Array.isArray(raw?.overviewSummary) ? raw.overviewSummary.map(card) : [],
    overviewRows: Array.isArray(raw?.overviewRows) ? raw.overviewRows.map(overviewRow) : [],
    creditCashSnapshot: Array.isArray(raw?.creditCashSnapshot)
      ? raw.creditCashSnapshot.map(card)
      : [],
    accountStatusSummary: Array.isArray(raw?.accountStatusSummary)
      ? raw.accountStatusSummary.map(card)
      : [],
    pendingJobs: Array.isArray(raw?.pendingJobs) ? raw.pendingJobs.map(pendingJob) : [],
    supplierLog: [],
  }
}

export default {
  fetch,
}
