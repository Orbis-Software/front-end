import type { AccountsCreditRow } from "@/app/types/accounts-credit-control"

function money(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function fetch(raw: any): AccountsCreditRow {
  const currency = raw?.currency || "GBP"

  return {
    customerId: raw?.customerId ?? null,
    customer: raw?.customer ?? "Unknown Customer",
    accountNumber: raw?.accountNumber ?? null,
    terms: Number(raw?.terms ?? 30),
    termsLabel: `${Number(raw?.terms ?? 30)} days`,
    creditLimit: Number(raw?.creditLimit ?? 0),
    creditLimitLabel: money(Number(raw?.creditLimit ?? 0), currency),
    currency,
    outstanding: Number(raw?.outstanding ?? 0),
    outstandingLabel: money(Number(raw?.outstanding ?? 0), currency),
    oldestDebtDays: Number(raw?.oldestDebtDays ?? 0),
    oldestDebtLabel: `${Number(raw?.oldestDebtDays ?? 0)} days`,
    status: raw?.status ?? "OK",
    statusTone: raw?.statusTone ?? "neutral",
    onHold: Boolean(raw?.onHold),
    hold: raw?.hold ?? "Active",
    holdTone: raw?.holdTone ?? "neutral",
    openInvoices: Array.isArray(raw?.openInvoices) ? raw.openInvoices : [],
  }
}

function fetchCollection(rows: any[] = []): AccountsCreditRow[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
