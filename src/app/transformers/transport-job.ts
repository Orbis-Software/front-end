import type { TransportJob } from "@/app/types/transport-job";
import jobFileTransformer from "@/app/transformers/job-file";

// If you already have contact transformer you can use it.
// For now we accept raw customer_contact into Contact type shape.
const transportJobTransformer = {
  fetch(raw: any): TransportJob {
    const filesRaw = raw.files ?? raw.job_files ?? [];
    const customerRaw =
      raw.customer_contact ?? raw.customerContact ?? raw.customer ?? null;

    return {
      id: Number(raw.id),
      company_id: Number(raw.company_id),

      customer_id:
        raw.customer_id === null || raw.customer_id === undefined
          ? null
          : Number(raw.customer_id),

      account_number: raw.account_number ?? null,

      quote_ref: raw.quote_ref ?? null,
      job_number: String(raw.job_number ?? ""),
      job_date: raw.job_date ?? null,

      mode_of_transport: raw.mode_of_transport,
      job_type: raw.job_type,

      note: raw.note ?? null,

      customer_contact: customerRaw ? (customerRaw as any) : null,

      files: jobFileTransformer.fetchCollection(filesRaw),

      created_at: raw.created_at ?? undefined,
      updated_at: raw.updated_at ?? undefined,
      deleted_at: raw.deleted_at ?? undefined,
    };
  },

  fetchCollection(raw: any): TransportJob[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((x) => transportJobTransformer.fetch(x));
  },
};

export default transportJobTransformer;
