// src/app/services/awb-manager/voidAwb.ts

import http from "@/api/http"
import awbStockTransformer from "@/app/transformers/awb-stock"
import type { AwbStock } from "@/app/types/awb-manager"

export default async function voidAwb(awbId: number): Promise<AwbStock> {
  const response = await http.post(`/awbs/${awbId}/void`)

  return awbStockTransformer.fetch(response.data.data)
}
