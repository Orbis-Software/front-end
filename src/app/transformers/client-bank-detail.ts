import type { ClientBankDetail, ClientBankDetailContact } from "@/app/types/client-bank-detail"

function fetchContact(raw: any): ClientBankDetailContact | null {
  if (!raw) return null

  return {
    id: Number(raw?.id ?? 0),
    companyName: raw?.companyName ?? raw?.company_name ?? "",
    accountNumber: raw?.accountNumber ?? raw?.account_number ?? "",
    email: raw?.email ?? "",
  }
}

function fetch(raw: any): ClientBankDetail {
  return {
    id: Number(raw?.id ?? 0),
    contactId: raw?.contactId == null ? null : Number(raw.contactId),
    account: raw?.account ?? "",
    branch: raw?.branch ?? "",
    prefix: raw?.prefix ?? "",
    currency: raw?.currency ?? "",
    accountNo: raw?.accountNo ?? "",
    sortCode: raw?.sortCode ?? "",
    bic: raw?.bic ?? "",
    swift: raw?.swift ?? "",
    iban: raw?.iban ?? "",
    bank: raw?.bank ?? "",
    addressLine1: raw?.addressLine1 ?? "",
    addressLine2: raw?.addressLine2 ?? "",
    addressLine3: raw?.addressLine3 ?? "",
    city: raw?.city ?? "",
    countyState: raw?.countyState ?? "",
    postCodeZip: raw?.postCodeZip ?? "",
    country: raw?.country ?? "",
    isActive: raw?.isActive !== false,
    contact: fetchContact(raw?.contact),
  }
}

function fetchCollection(rows: any[] = []): ClientBankDetail[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
