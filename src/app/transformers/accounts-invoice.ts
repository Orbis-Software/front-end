import type {
  AccountsInvoice,
  AccountsInvoiceMeta,
  AccountsInvoiceStatus,
} from "@/app/types/accounts-invoice"

function status(raw: any): AccountsInvoiceStatus {
  const value = raw?.paid ? "paid" : (raw?.status ?? "printed")

  return ["draft", "sent", "paid", "overdue", "printed"].includes(value) ? value : "printed"
}

function fetch(raw: any): AccountsInvoice {
  const lines = Array.isArray(raw?.lines) ? raw.lines : []

  return {
    id: String(raw?.id ?? ""),
    jobId: Number(raw?.jobId ?? raw?.job?.id ?? 0),
    invoice: raw?.invoiceNumber ?? "",
    job: raw?.job?.jobNumber ?? "",
    customer: raw?.job?.customer ?? "Customer",
    mode: raw?.job?.mode ?? "",
    invoiceDate: raw?.invoiceDate ?? "",
    dueDate: raw?.dueDate ?? "",
    amount: Number(raw?.total ?? 0),
    cost: Number(raw?.costTotal ?? 0),
    currency: raw?.currency ?? "GBP",
    paid: Boolean(raw?.paid),
    paidDate: raw?.paidDate ?? "",
    status: status(raw),
    postedPlatform: raw?.postedPlatform ?? "",
    pdfUrl: raw?.pdfUrl ?? null,
    pdfGeneratedAt: raw?.pdfGeneratedAt ?? null,
    pdfCacheReady: Boolean(raw?.pdfCacheReady),
    user: raw?.printedBy?.name ?? "System",
    route: raw?.job?.route || "-",
    transportRefs: [raw?.job?.shipmentRef ? `Shipment: ${raw.job.shipmentRef}` : ""].filter(
      Boolean,
    ),
    lines: lines.map((line: any) => ({
      description: line?.description ?? "Charge",
      amount: Number(line?.net ?? line?.amount ?? 0),
      taxCode: `${Number(line?.vatRate ?? 0).toFixed(2)}%`,
    })),
  }
}

function fetchCollection(rows: any[] = []): AccountsInvoice[] {
  return rows.map(fetch)
}

function meta(raw: any): AccountsInvoiceMeta {
  return {
    total: Number(raw?.total ?? 0),
    filtered: Number(raw?.filtered ?? 0),
    currentPage: Number(raw?.currentPage ?? 1),
    lastPage: Number(raw?.lastPage ?? 1),
    perPage: Number(raw?.perPage ?? 25),
    from: raw?.from ?? null,
    to: raw?.to ?? null,
  }
}

export default {
  fetch,
  fetchCollection,
  meta,
}
