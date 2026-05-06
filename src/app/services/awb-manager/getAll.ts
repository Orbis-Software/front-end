import http from "@/api/http"
import awbAirlineTransformer from "@/app/transformers/awb-airline"
import awbSummaryTransformer from "@/app/transformers/awb-summary"
import type { AwbAirline, AwbSummary } from "@/app/types/awb-manager"

export default async function getAll(): Promise<{
  airlines: AwbAirline[]
  summary: AwbSummary
}> {
  const response = await http.get("/airlines")

  return {
    airlines: awbAirlineTransformer.fetchCollection(response.data.data),
    summary: awbSummaryTransformer.fetch(response.data.summary ?? {}),
  }
}
