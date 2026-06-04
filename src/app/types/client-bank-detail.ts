export type ClientBankDetailContact = {
  id: number
  companyName: string
  accountNumber: string
  email: string
}

export type ClientBankDetail = {
  id: number
  contactId: number | null
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
  isActive: boolean
  contact: ClientBankDetailContact | null
}

export type ClientBankDetailPayload = {
  contactId?: number | null
  account: string
  branch?: string
  prefix?: string
  currency: string
  accountNo?: string
  sortCode?: string
  bic?: string
  swift?: string
  iban?: string
  bank?: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  city?: string
  countyState?: string
  postCodeZip?: string
  country?: string
  isActive?: boolean
}

export type ClientBankDetailFilters = {
  search?: string
  contactId?: number | null
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  perPage?: number
}

export type ClientBankDetailMeta = {
  total: number
  filtered: number
  currentPage: number
  lastPage: number
  perPage: number
  from: number | null
  to: number | null
}
