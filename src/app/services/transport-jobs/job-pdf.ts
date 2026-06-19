import http from "@/api/http"

export type JobPdfDocument = "job_details" | "collection_order" | "transport_order" | "invoice"

export default async function jobPdf(
  id: number,
  document: JobPdfDocument = "job_details",
): Promise<Blob> {
  const response = await http.get(`/transport-jobs/${id}/pdf`, {
    params: { document },
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  return response.data
}
