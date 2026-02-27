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

  branches?: ContactBranch[]
  collection_addresses?: ContactCollectionAddress[]

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

export interface ContactBranch {
  id: number
  name: string | null

  contact_person: string | null
  email: string | null
  phone: string | null

  delivery_address_line_1: string | null
  delivery_address_line_2: string | null
  delivery_address_line_3: string | null
  delivery_city: string | null
  delivery_county_state: string | null
  delivery_postal_code: string | null
  delivery_country_id: number | null

  billing_same_as_delivery: boolean

  billing_address_line_1: string | null
  billing_address_line_2: string | null
  billing_address_line_3: string | null
  billing_city: string | null
  billing_county_state: string | null
  billing_postal_code: string | null
  billing_country_id: number | null
}

export interface ContactCollectionAddress {
  id: number
  label: string | null

  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
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
