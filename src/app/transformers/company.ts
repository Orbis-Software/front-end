import type { Company } from '@/app/types/company'

const companyTransformer = {
  fetch(raw: any): Company {
    return {
      id: raw.id,

      // Identity
      legal_name: raw.legal_name,
      trading_name: raw.trading_name ?? null,
      registration_number: raw.registration_number ?? null,

      // Addresses
      registered_address: raw.registered_address ?? null,
      operational_address: raw.operational_address ?? null,

      // Preferences
      default_currency: raw.default_currency,
      language: raw.language ?? null,
      time_zone: raw.time_zone,

      // Branding
      logo: raw.logo ?? null,
      logo_url: raw.logo_url ?? null, // ✅ IMPORTANT

      // Status
      status: raw.status ?? 'active',

      // Timestamps
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): Company[] {
    return (rawList ?? []).map(this.fetch)
  },
}

export default companyTransformer
