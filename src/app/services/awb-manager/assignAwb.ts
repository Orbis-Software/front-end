// src/app/services/awb-manager/assignAwb.ts

import http from "@/api/http"
import awbStockTransformer from "@/app/transformers/awb-stock"
import type { AssignAwbPayload, AwbStock } from "@/app/types/awb-manager"

export default async function assignAwb(
  awbId: number,
  payload: AssignAwbPayload,
): Promise<AwbStock> {
  const response = await http.post(`/awbs/${awbId}/assign`, payload)

  return awbStockTransformer.fetch(response.data.data)
}
