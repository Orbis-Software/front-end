import http from "@/api/http";
import transportJobTransformer from "@/app/transformers/transport-job";
import type { TransportJob, PaginatedResponse } from "@/app/types/transport-job";
import type { TransportMode, JobType } from "@/app/types/transport-job";

export interface ListTransportJobsParams {
  page?: number;
  per_page?: number;

  customer_id?: number;
  mode_of_transport?: TransportMode;
  job_type?: JobType;
  status?: string;
  q?: string;
}

export default async function listTransportJobs(
  params: ListTransportJobsParams = {}
): Promise<PaginatedResponse<TransportJob>> {
  const response = await http.get("/transport-jobs", { params });

  return {
    ...response.data,
    data: transportJobTransformer.fetchCollection(response.data.data),
  };
}
