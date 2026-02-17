export interface JobFile {
  id: number
  job_id: number

  path: string
  type?: string | null

  // optional if you expose it later
  url?: string | null

  created_at?: string
  updated_at?: string
}
