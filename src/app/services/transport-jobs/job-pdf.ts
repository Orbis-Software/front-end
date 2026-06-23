import http from "@/api/http"

export type JobPdfDocument =
  | "job_details"
  | "collection_order"
  | "transport_order"
  | "invoice"
  | "job_financials"
  | "supplier_invoice"

export type JobPdfOptions = {
  supplierId?: number | null
}

export default async function jobPdf(
  id: number,
  document: JobPdfDocument = "job_details",
  options: JobPdfOptions = {},
): Promise<Blob> {
  const response = await http.get(`/transport-jobs/${id}/pdf`, {
    params: {
      document,
      ...(options.supplierId ? { supplier_id: options.supplierId } : {}),
    },
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  return response.data
}
