// src/app/services/awb-manager/createAirline.ts

import http from "@/api/http"
import awbAirlineTransformer from "@/app/transformers/awb-airline"
import type { AwbAirline, AwbAirlinePayload } from "@/app/types/awb-manager"

export default async function createAirline(payload: AwbAirlinePayload): Promise<AwbAirline> {
  const response = await http.post("/airlines", payload)

  return awbAirlineTransformer.fetch(response.data.data)
}
