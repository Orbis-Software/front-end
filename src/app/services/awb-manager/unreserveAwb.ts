import http from "@/api/http"
import awbStockTransformer from "@/app/transformers/awb-stock"
import type { AwbStock } from "@/app/types/awb-manager"

export default async function unreserveAwb(awbId: number): Promise<AwbStock> {
  const response = await http.post(`/awb-stock-manager/awbs/${awbId}/unreserve`)

  return awbStockTransformer.fetch(response.data.data)
}
