import http from "@/api/http"
import awbAirlineTransformer from "@/app/transformers/awb-airline"
import type { AwbAirline, AwbAirlinePayload } from "@/app/types/awb-manager"

export default async function updateAirline(
  id: number,
  payload: AwbAirlinePayload,
): Promise<AwbAirline> {
  const response = await http.put(`/airlines/${id}`, payload)

  return awbAirlineTransformer.fetch(response.data.data)
}
