export type AccountsDemoTone = "neutral" | "warning" | "danger" | "success" | "info"

export type AccountsDemoInvoice = {
  id: string
  invoice: string
  job: string
  customer: string
  customerCode: string
  user: string
  mode: string
  invoiceDate: string
  dueDate: string
  amount: number
  cost: number
  currency: string
  paid: boolean
  paidDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  postedPlatform: string
  postedAt: string
  route: string
  transportRefs: string[]
  lines: { description: string; amount: number; taxCode: string }[]
}

export type AccountsDemoSupplierInvoice = {
  id: string
  supplierInvoice: string
  job: string
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
  status: "pending" | "approved" | "scheduled" | "paid" | "overdue"
  paymentMethod: string
  chargeDescription: string
  taxCode: string
  bank: { bankName: string; iban: string; swift: string; accountNumber: string; country: string }
}

export type AccountsDemoPendingJob = {
  job: string
  customer: string
  user: string
  mode: string
  stage: string
  targetInvoiceDate: string
  estimatedSell: number
  estimatedCost: number
  currency: string
}

export type AccountsDemoCreditCustomer = {
  customer: string
  terms: number
  creditLimit: number
  onHold: boolean
}

export type AccountsDemoExchangeRate = {
  id: string
  base: string
  quote: string
  rate: number
  effectiveDate: string
}

export type AccountsDemoChargeCode = {
  id: string
  chargeDescription: string
  purchaseNominal: string
  salesNominal: string
  mot: string
  taxCode: string
}

export type AccountsDemoTaxCode = {
  id: string
  country: string
  code: string
  taxCode: string
  rate: number
  description: string
}

export type AccountsDemoBankAccount = {
  id: string
  account: string
  branch: string
  prefix: string
  currency: string
  accountNo: string
  sortCode: string
  bic: string
  swift: string
  iban: string
  bank: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  countyState: string
  postCodeZip: string
  country: string
}

export type AccountsDemoBankFeedRow = {
  id: string
  date: string
  reference: string
  description: string
  direction: "IN" | "OUT"
  currency: string
  amount: number
  matchedInvoice: string
}
