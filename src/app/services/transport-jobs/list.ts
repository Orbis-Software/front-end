import http from "@/api/http"
import transportJobTransformer from "@/app/transformers/transport-job"
import type { TransportJob, PaginatedResponse } from "@/app/types/transport-job"
import type { ListTransportJobsParams } from "@/app/types/transport-job-service"

export default async function listTransportJobs(
  params: ListTransportJobsParams = {},
): Promise<PaginatedResponse<TransportJob>> {
  const response = await http.get("/transport-jobs", { params })

  return {
    ...response.data,
    data: transportJobTransformer.fetchCollection(response.data.data),
  }
}
