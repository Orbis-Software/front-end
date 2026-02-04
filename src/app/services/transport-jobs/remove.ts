import http from "@/api/http";

export default async function removeTransportJob(id: number): Promise<{ deleted: boolean }> {
  const response = await http.delete(`/transport-jobs/${id}`);
  return response.data;
}
