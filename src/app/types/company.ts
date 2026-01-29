export type CompanyStatus = 'active' | 'inactive'

export interface Company {
  id: number

  // Identity
  legal_name: string
  trading_name: string | null
  registration_number: string | null

  // Addresses
  registered_address: string | null
  operational_address: string | null

  // Preferences
  default_currency: string
  language: string | null
  time_zone: string

  // Branding (backend response)
  logo: string | null            // stored path / filename
  logo_url: string | null        // ✅ full public URL from API

  // Status
  status: CompanyStatus

  // Timestamps
  created_at: string
  updated_at: string
}

export interface CompanyUpdatePayload {
  legal_name?: string
  trading_name?: string | null
  registration_number?: string | null
  registered_address?: string | null
  operational_address?: string | null
  default_currency?: string
  language?: string | null
  time_zone?: string

  // Upload
  logo?: File | null

  status?: CompanyStatus
}
