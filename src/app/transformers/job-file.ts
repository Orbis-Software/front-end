import type { JobFile } from '@/app/types/job-file'

const jobFileTransformer = {
  fetch(raw: any): JobFile {
    return {
      id: Number(raw.id),
      job_id: Number(raw.job_id ?? raw.transport_job_id ?? raw.jobId ?? 0),
      path: String(raw.path ?? ''),

      type: raw.type ?? null,
      url: raw.url ?? raw.public_url ?? null,
      created_at: raw.created_at ?? null,
    }
  },

  fetchCollection(raw: any): JobFile[] {
    if (!Array.isArray(raw)) return []
    return raw.map((x) => jobFileTransformer.fetch(x))
  },
}

export default jobFileTransformer
