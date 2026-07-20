import http from "@/api/http"
import type {
  WmsExpectedArrival,
  WmsExpectedArrivalReceivePayload,
} from "@/app/types/wms-expected-arrival"

export default async function receiveExpectedArrival(
  id: number,
  payload: WmsExpectedArrivalReceivePayload,
): Promise<WmsExpectedArrival> {
  const response = await http.post(`/wms/expected-arrivals/${id}/receive`, payload)

  return response.data.data
}
