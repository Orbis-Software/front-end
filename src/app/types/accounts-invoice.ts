import type { TablePaginationMeta } from "@/app/types/pagination"

export type AccountsInvoiceStatus =
  | "approved"
  | "draft"
  | "paid"
  | "overdue"
  | "passed"
  | "printed"
  | "scheduled"
  | "sent"

export type AccountsInvoiceLine = {
  description: string
  amount: number
  taxCode: string
}

export type AccountsInvoice = {
  id: string
  jobId: number
  invoiceType: "customer" | "supplier"
  documentType: string
  supplierId: number | null
  invoice: string
  job: string
  customer: string
  supplier: string
  mode: string
  invoiceDate: string
  dueDate: string
  amount: number
  baseAmount: number
  baseCurrency: string
  exchangeRate: number
  cost: number
  currency: string
  paid: boolean
  paidDate: string
  status: AccountsInvoiceStatus
  postedPlatform: string
  pdfUrl: string | null
  pdfGeneratedAt: string | null
  pdfCacheReady: boolean
  user: string
  route: string
  transportRefs: string[]
  lines: AccountsInvoiceLine[]
}

export type AccountsInvoiceFilters = {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

export type AccountsInvoiceMeta = TablePaginationMeta
