import http from "@/api/http";
import transportJobTransformer from "@/app/transformers/transport-job";
import type { TransportJob } from "@/app/types/transport-job";

export default async function showTransportJob(id: number): Promise<TransportJob> {
  const response = await http.get(`/transport-jobs/${id}`);
  return transportJobTransformer.fetch(response.data.data);
}
