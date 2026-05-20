import http from "@/api/http"
import type { ConvertQuoteToJobPayload } from "@/app/types/transportQuote"

export default async function convertToJob(id: number, payload: ConvertQuoteToJobPayload = {}) {
  const response = await http.post(`/quotes/${id}/convert-to-job`, payload)

  return response.data?.data ?? response.data
}
