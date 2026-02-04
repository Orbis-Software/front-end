import type { TransportJob } from '@/app/types/transport-job'
import jobFileTransformer from '@/app/transformers/job-file'

// If you already have a contact transformer, you can optionally import it:
// import contactTransformer from '@/app/transformers/contact'

const transportJobTransformer = {
  fetch(raw: any): TransportJob {
    const filesRaw = raw.files ?? raw.job_files ?? []
    const customerRaw = raw.customer_contact ?? raw.customerContact ?? raw.customer ?? null

    return {
      id: Number(raw.id),
      company_id: Number(raw.company_id),
      customer_id: raw.customer_id === null || raw.customer_id === undefined ? null : Number(raw.customer_id),

      quote_ref: raw.quote_ref ?? null,
      job_number: String(raw.job_number ?? ''),
      job_date: raw.job_date ?? null,

      mode_of_transport: raw.mode_of_transport,
      job_type: raw.job_type,

      note: raw.note ?? null,

      // If you want normalized contact:
      // customer_contact: customerRaw ? contactTransformer.fetch(customerRaw) : null,
      customer_contact: customerRaw ?? null,

      files: jobFileTransformer.fetchCollection(filesRaw),
    }
  },

  fetchCollection(raw: any): TransportJob[] {
    if (!Array.isArray(raw)) return []
    return raw.map((x) => transportJobTransformer.fetch(x))
  },
}

export default transportJobTransformer
