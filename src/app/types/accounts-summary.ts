export type AccountsSummaryCard = {
  label: string
  value: string
}

export type AccountsOverviewRow = {
  metric: string
  value: string
  comment: string
}

export type AccountsPendingJob = {
  job: string
  jobId: number
  customer: string
  user: string
  mode: string
  stage: string
  targetInvoiceDate: string
  estimatedSell: number
  estimatedCost: number
  currency: string
}

export type AccountsCustomerInvoice = {
  id: string
  jobId: number
  invoice: string
  job: string
  customer: string
  mode: string
  invoiceDate: string
  dueDate: string
  amount: number
  cost: number
  currency: string
  paid: boolean
  paidDate: string
  status: string
  postedPlatform: string
  user: string
}

export type AccountsSupplierPaymentStatus =
  | "pending"
  | "approved"
  | "scheduled"
  | "paid"
  | "overdue"

export type AccountsSupplierPayment = {
  id: string
  chargeId: number
  supplierInvoice: string
  job: string
  jobId: number | null
  supplier: string
  supplierCode: string
  user: string
  mode: string
  invoiceDate: string
  dueDate: string
  amount: number
  currency: string
  approved: boolean
  approvedDate: string
  paid: boolean
  paidDate: string
  status: AccountsSupplierPaymentStatus
  paymentMethod: string
  chargeDescription: string
  taxCode: string
  bank: {
    bankName: string
    iban: string
    swift: string
    accountNumber: string
    country: string
  }
}

export type AccountsSupplierLog = {
  id: string
  title: string
  ts: string
  text: string
}

export type AccountsSummary = {
  customerInvoices: AccountsCustomerInvoice[]
  supplierInvoices: AccountsSupplierPayment[]
  overviewSummary: AccountsSummaryCard[]
  overviewRows: AccountsOverviewRow[]
  creditCashSnapshot: AccountsSummaryCard[]
  accountStatusSummary: AccountsSummaryCard[]
  pendingJobs: AccountsPendingJob[]
  supplierLog: AccountsSupplierLog[]
}
