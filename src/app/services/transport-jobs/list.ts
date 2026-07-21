import http from "@/api/http"
import transportJobTransformer from "@/app/transformers/transport-job"
import type { TransportJob } from "@/app/types/transport-job"
import type { ListTransportJobsParams } from "@/app/types/transport-job-service"
import type { PaginatedResponse } from "@/app/types/pagination"

export default async function listTransportJobs(
  params: ListTransportJobsParams = {},
): Promise<PaginatedResponse<TransportJob>> {
  const response = await http.get("/transport-jobs", { params })

  return {
    ...response.data,
    data: transportJobTransformer.fetchCollection(response.data.data),
  }
}
