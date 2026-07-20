import http from "@/api/http"
import type { WmsExpectedArrivalListResponse } from "@/app/types/wms-expected-arrival"

export default async function listExpectedArrivals(
  params: { page?: number; per_page?: number; q?: string; status?: string } = {},
): Promise<WmsExpectedArrivalListResponse> {
  const response = await http.get("/wms/expected-arrivals", { params })

  return response.data
}
