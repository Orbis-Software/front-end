import http from "@/api/http"
import type { DashboardTransportParams, DashboardTransportSummary } from "@/app/types/dashboard"

export default async function getDashboardTransportSummary(
  params: DashboardTransportParams = {},
): Promise<DashboardTransportSummary> {
  const response = await http.get("/dashboard/transport", { params })

  return response.data.data
}
