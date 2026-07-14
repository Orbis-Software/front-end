import http from "@/api/http"
import type { JobPdfDocument, JobPdfOptions } from "@/app/types/transport-job-service"

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
