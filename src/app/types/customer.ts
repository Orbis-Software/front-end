import type { JobInvoiceSummary, TransportJob } from "@/app/types/transport-job"

export interface CustomerCompany {
  id: number
  name: string | null
}

export interface CustomerContactAccount {
  id: number
  contact_id: number

  name: string
  email: string
  role: string

  is_primary: boolean
  is_active: boolean

  email_verified_at: string | null
  last_login_at: string | null

  created_at: string
  updated_at: string
}

export interface CustomerContact {
  id: number
  company_id: number | null
  company_name: string
  account_number: string | null
  registration_number: string | null
  vat_number: string | null
  eori: string | null
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  address_line_4: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
  email: string | null
  phone: string | null
  mobile: string | null
  website: string | null
  credit_limit: string | null
  currency_preference: string | null
  status: string | null
  accounts: CustomerContactAccount[]
  company: CustomerCompany | null
}

export interface CustomerAccount {
  id: number
  contact_id: number

  name: string
  email: string
  role: string

  is_primary: boolean
  is_active: boolean

  contact: CustomerContact | null
  transport_jobs: TransportJob[]
  supplier_invoices: JobInvoiceSummary[]

  created_at: string
  updated_at: string
}
