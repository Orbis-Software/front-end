import type { Contact } from "@/app/types/contact";
import type { JobFile } from "@/app/types/job-file";

export type TransportMode = "air" | "sea" | "road" | "rail";
export type JobType = "import" | "export" | "cross_trade" | "domestic";

export interface TransportJob {
  id: number;
  company_id: number;

  customer_id?: number | null;

  // ✅ API returns this (currently null in your example, but exists)
  account_number?: string | null;

  quote_ref?: string | null;
  job_number: string;
  job_date?: string | null;

  mode_of_transport: TransportMode;
  job_type: JobType;

  note?: string | null;

  // relations (because your API loads: files + customer_contact)
  customer_contact?: Contact | null;
  files: JobFile[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface TransportJobCreatePayload {
  customer_id?: number | null;

  quote_ref?: string | null;
  job_number: string;
  job_date?: string | null;

  mode_of_transport: TransportMode;
  job_type: JobType;

  note?: string | null;

  // uploads (same as your request rules)
  files?: File[];
  file_types?: (string | null)[];
}

export interface TransportJobUpdatePayload extends Partial<TransportJobCreatePayload> {}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
  links?: any;
}
