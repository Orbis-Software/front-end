export type CompanyStatus = "active" | "inactive"

export type AddressType = "trading" | "registered" | "operational"

export type CompanyAddress = {
  type: AddressType
  building: string | null
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  address_line_4: string | null
  city: string | null
  state: string | null
  postcode: string | null
  country_code: string | null
}

export type CompanyPrimaryContact = {
  name: string
  email: string
  mobile: string | null
  telephones: string[]
}

export type CompanySettings = {
  time_zone: string
  main_currency_code: string
  start_period: string | null // YYYY-MM-DD
  invoicing_period: "monthly" | "weekly" | "quarterly" | "annually"
}

export type CompanyReferenceType =
  | "job"
  | "invoice"
  | "quote"
  | "purchase_order"
  | "collection_order"
  | "transport_order"
  | "booking_reference"
  | "account"

export type CompanyReferenceSequence = {
  type: CompanyReferenceType
  prefix: string
  year_digits: number | null

  min_width: number
  next_number: number
  next_number_formatted: string

  use_system: boolean
}

export interface Company {
  id: number

  // Identity
  legal_name: string
  trading_name: string | null
  registration_number: string | null
  vat_number: string | null
  eori_number: string | null
  iata_code: string | null

  // Preferences
  default_currency_code: string | null
  language: string | null
  time_zone: string | null

  // Status
  status: CompanyStatus

  // Branding
  logo_path: string | null
  logo_url: string | null

  // Profile sections
  addresses: CompanyAddress[]
  primary_contact: CompanyPrimaryContact | null
  settings: CompanySettings | null
  additional_currencies: string[]
  reference_sequences: CompanyReferenceSequence[]

  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * ✅ Payload the frontend sends to PATCH /company
 * - legal_name optional (you said update everything except it)
 * - addresses is array
 * - reference_sequences accepts start_number (string, can have leading zeros, max 9 digits)
 */
export interface CompanyUpdatePayload {
  // core
  legal_name?: string
  trading_name?: string | null
  registration_number?: string | null
  vat_number?: string | null
  eori_number?: string | null
  iata_code?: string | null

  default_currency_code?: string | null
  language?: string | null
  time_zone?: string | null
  status?: CompanyStatus

  // logo upload (optional)
  logo?: File | null

  // profile
  addresses?: Partial<CompanyAddress>[]

  primary_contact?: {
    name: string
    email: string
    mobile?: string | null
    telephones?: string[]
  } | null

  settings?: Partial<CompanySettings> | null

  additional_currencies?: string[]

  reference_sequences?: Array<{
    type: CompanyReferenceType
    prefix?: string
    year_digits?: number | null

    // ✅ important
    start_number?: string | null

    use_system?: boolean
  }>
}
