export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "converted" | string
export type QuoteAddressSourceType = "collection_address" | "branch"

export interface QuoteAddressSource {
  id: number
  contact_id: number | null
  source_type: QuoteAddressSourceType
  label: string | null
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
  country_name?: string | null
  is_collection: boolean
  is_delivery: boolean
}

export interface QuoteTypeSelectorItem {
  key: string
  title: string
  subtitle: string
}

export interface TransportQuoteTotals {
  subtotal_sell: number | string | null
  subtotal_cost: number | string | null
  total_excl_tax: number | string | null
  tax_amount: number | string | null
  total_incl_tax: number | string | null
  profit_total: number | string | null
  profit_percent: number | string | null
}

export interface TransportQuoteDimension {
  id?: number
  package_type?: string | null
  pieces: number | null
  length: number | null
  width: number | null
  height: number | null
  stackable?: boolean | null
  at_the_top?: boolean | null
  adr?: boolean | null
  weight: number | null
  cbm?: number | string | null
  volume_weight_kg?: number | string | null
  loading_metres?: number | string | null
  container_type?: string | null
}

export interface TransportQuote {
  id: number
  company_id: number
  created_by: number | null
  customer_id: number | null
  transport_job_id: number | null

  quote_ref: string | null
  quote_type: string | null
  mode_of_transport: string | null
  status: QuoteStatus

  account_number: string | null
  customer_ref: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null

  quote_date: string | null
  follow_up_date: string | null
  valid_until: string | null
  currency: string | null
  incoterm: string | null

  origin: string | null
  destination: string | null
  origin_address_source_type: QuoteAddressSourceType | null
  origin_address_source_id: number | null
  destination_address_source_type: QuoteAddressSourceType | null
  destination_address_source_id: number | null
  origin_address?: QuoteAddressSource | null
  destination_address?: QuoteAddressSource | null
  etd: string | null
  eta: string | null

  commodity: string | null
  insurance_level: string | null
  vehicle_type: string | null
  cargo_class: string | null
  container_type: string | null
  load_type: string | null
  load_planner_enabled: boolean
  goods_description: string | null

  is_hazardous: boolean
  hazardous_class: string | null
  un_number: string | null
  packing_group: string | null

  conditions_preset: string | null
  terms_conditions: string | null
  validity_period: string | number | null
  note: string | null

  discount: number | string | null
  tax_rate: number | string | null
  totals: TransportQuoteTotals

  customer_contact?: {
    id: number
    company_name: string | null
    account_number: string | null
    email: string | null
    phone: string | null
    mobile: string | null
    collection_addresses?: QuoteAddressSource[]
    branches?: Array<{
      id: number
      contact_id: number | null
      source_type: "branch"
      label: string | null
      address_line_1: string | null
      address_line_2: string | null
      address_line_3: string | null
      city: string | null
      county_state: string | null
      postal_code: string | null
      country_id: number | null
      country_name?: string | null
      is_collection: boolean
      is_delivery: boolean
    }>
  }

  creator?: {
    id: number
    name: string
    email: string
  }

  transport_job?: {
    id: number
    job_number: string
    status: string
  }

  dimensions: TransportQuoteDimension[]
  charges: any[]

  converted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface TransportQuoteFilters {
  customer_id?: number | string | null
  quote_type?: string | null
  mode_of_transport?: string | null
  status?: string | null
  q?: string | null
  per_page?: number
  page?: number
}

export interface TransportQuotePayload {
  customer_id?: number | null
  quote_type?: string | null
  mode_of_transport?: string | null
  status?: string | null

  account_number?: string | null
  customer_ref?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null

  quote_date?: string | null
  follow_up_date?: string | null
  valid_until?: string | null
  currency?: string | null
  incoterm?: string | null

  origin?: string | null
  destination?: string | null
  origin_address_source_type?: QuoteAddressSourceType | null
  origin_address_source_id?: number | null
  destination_address_source_type?: QuoteAddressSourceType | null
  destination_address_source_id?: number | null
  etd?: string | null
  eta?: string | null

  commodity?: string | null
  insurance_level?: string | null
  vehicle_type?: string | null
  cargo_class?: string | null
  container_type?: string | null
  load_type?: string | null
  load_planner_enabled?: boolean
  goods_description?: string | null

  is_hazardous?: boolean
  hazardous_class?: string | null
  un_number?: string | null
  packing_group?: string | null

  conditions_preset?: string | null
  terms_conditions?: string | null
  validity_period?: number | string | null
  note?: string | null

  discount?: number | string | null
  tax_rate?: number | string | null

  dimensions?: TransportQuoteDimension[]
  charges?: any[]
}

export interface ConvertQuoteToJobPayload {
  job_date?: string | null
  job_type?: string | null
  status?: string | null
  note?: string | null
}
