import http from "@/api/http"
import awbSummaryTransformer from "@/app/transformers/awb-summary"
import type { AwbSummary } from "@/app/types/awb-manager"

export default async function getSummary(): Promise<AwbSummary> {
  const response = await http.get("/awb-stock-manager/summary")

  return awbSummaryTransformer.fetch(response.data.data)
}
