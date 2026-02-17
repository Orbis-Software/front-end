import http from "@/api/http";
import transportJobTransformer from "@/app/transformers/transport-job";
import type { TransportJob, TransportJobUpdatePayload } from "@/app/types/transport-job";

function toFormData(payload: TransportJobUpdatePayload): FormData {
  const fd = new FormData();

  if (payload.customer_id !== undefined) {
    fd.append("customer_id", payload.customer_id === null ? "" : String(payload.customer_id));
  }

  if (payload.quote_ref !== undefined) fd.append("quote_ref", payload.quote_ref ?? "");
  if (payload.job_number !== undefined) fd.append("job_number", payload.job_number);
  if (payload.job_date !== undefined) fd.append("job_date", payload.job_date ?? "");
  if (payload.mode_of_transport !== undefined) fd.append("mode_of_transport", payload.mode_of_transport);
  if (payload.job_type !== undefined) fd.append("job_type", payload.job_type);
  if (payload.note !== undefined) fd.append("note", payload.note ?? "");

  const files = payload.files ?? [];
  const fileTypes = payload.file_types ?? [];

  files.forEach((file, idx) => {
    fd.append(`files[${idx}]`, file);
    const type = fileTypes[idx];
    if (type !== undefined) fd.append(`file_types[${idx}]`, type ?? "");
  });

  return fd;
}

export default async function updateTransportJob(
  id: number,
  payload: TransportJobUpdatePayload
): Promise<TransportJob> {
  const fd = toFormData(payload);
  fd.append("_method", "PATCH");

  const response = await http.post(`/transport-jobs/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return transportJobTransformer.fetch(response.data.data);
}
