import type { ContactType } from "@/app/types/contact-type";

export interface Contact {
  id: number;
  company_id: number | null;

  // ✅ DB-driven types
  contact_types: ContactType[];

  // Company / identity
  company_name?: string | null;
  account_number?: string | null;

  // Registration
  registration_number?: string | null;
  vat_number?: string | null;
  eori?: string | null;

  // Address
  address_line_1?: string | null;
  address_line_2?: string | null;
  address_line_3?: string | null;
  address_line_4?: string | null;
  city?: string | null;
  county_state?: string | null;
  postal_code?: string | null;
  country_id?: number | null;

  // Contact methods
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;

  // Finance
  credit_limit?: number | null;
  currency_preference?: string | null;

  // Address usage flags (MVP)
  is_delivery?: boolean;
  is_collection?: boolean;
  is_consignee?: boolean;
  is_accounts?: boolean;
  is_headoffice?: boolean;

  // System
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContactCreatePayload {
  // ✅ send IDs (pivot)
  contact_type_ids: number[];

  // Relations
  company_id?: number | null;

  // Company / identity
  company_name?: string | null;
  account_number?: string | null;

  // Registration
  registration_number?: string | null;
  vat_number?: string | null;
  eori?: string | null;

  // Address
  address_line_1?: string | null;
  address_line_2?: string | null;
  address_line_3?: string | null;
  address_line_4?: string | null;
  city?: string | null;
  county_state?: string | null;
  postal_code?: string | null;
  country_id?: number | null;

  // Contact methods
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;

  // Finance
  credit_limit?: number | null;
  currency_preference?: string | null;

  // Address usage flags
  is_delivery?: boolean;
  is_collection?: boolean;
  is_consignee?: boolean;
  is_accounts?: boolean;
  is_headoffice?: boolean;

  // System
  status?: string;
}

export interface ContactUpdatePayload extends Partial<ContactCreatePayload> {}

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
