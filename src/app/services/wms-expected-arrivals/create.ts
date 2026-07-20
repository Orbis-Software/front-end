import http from "@/api/http"
import type {
  WmsExpectedArrival,
  WmsExpectedArrivalCreatePayload,
} from "@/app/types/wms-expected-arrival"

export default async function createExpectedArrival(
  payload: WmsExpectedArrivalCreatePayload,
): Promise<WmsExpectedArrival> {
  const response = await http.post("/wms/expected-arrivals", payload)

  return response.data.data
}
