export type AccountsCreditTone = "success" | "warning" | "danger" | "neutral"

export type AccountsCreditInvoice = {
  id: number
  invoice: string
  job: string | null
  invoiceDate: string | null
  dueDate: string | null
  currency: string
  amount: number
  daysOverdue: number
}

export type AccountsCreditRow = {
  customerId: number | null
  customer: string
  accountNumber: string | null
  terms: number
  termsLabel: string
  creditLimit: number
  creditLimitLabel: string
  currency: string
  outstanding: number
  outstandingLabel: string
  oldestDebtDays: number
  oldestDebtLabel: string
  status: string
  statusTone: AccountsCreditTone
  onHold: boolean
  hold: string
  holdTone: AccountsCreditTone
  openInvoices: AccountsCreditInvoice[]
}

export type AccountsCreditMeta = {
  totalCustomers: number
  onHoldCustomers: number
  overdueCustomers: number
  totalOutstanding: number
}
