import type { Contact } from '@/app/types/contact'
import contactTypeTransformer from '@/app/transformers/contact-type'

const contactTransformer = {
  fetch(raw: any): Contact {
    const rawTypes = raw.contact_types ?? raw.types ?? []

    const normalizedTypes = Array.isArray(rawTypes)
      ? rawTypes.map((t: any) => t?.contact_type ?? t).filter(Boolean)
      : []

    return {
      id: Number(raw.id),
      company_id: raw.company_id === null || raw.company_id === undefined ? null : Number(raw.company_id),

      // ✅ DB-driven types
      contact_types: contactTypeTransformer.fetchCollection(normalizedTypes),

      // Company / identity
      company_name: raw.company_name ?? null,
      account_number: raw.account_number ?? null,

      // Registration
      registration_number: raw.registration_number ?? null,
      vat_number: raw.vat_number ?? null,
      eori: raw.eori ?? null,

      // Address
      address_line_1: raw.address_line_1 ?? null,
      address_line_2: raw.address_line_2 ?? null,
      address_line_3: raw.address_line_3 ?? null,
      address_line_4: raw.address_line_4 ?? null,
      city: raw.city ?? null,
      county_state: raw.county_state ?? null,
      postal_code: raw.postal_code ?? null,
      country_id: raw.country_id ?? null,

      // Contact methods
      phone: raw.phone ?? null,
      mobile: raw.mobile ?? null,
      email: raw.email ?? null,
      website: raw.website ?? null,

      // Finance
      credit_limit:
        raw.credit_limit === null || raw.credit_limit === undefined
          ? null
          : Number(raw.credit_limit),

      currency_preference: raw.currency_preference ?? null,

      // System
      status: raw.status ?? 'active',

      // ✅ address usage flags (MVP columns)
      is_delivery: Boolean(raw.is_delivery),
      is_collection: Boolean(raw.is_collection),
      is_consignee: Boolean(raw.is_consignee),
      is_accounts: Boolean(raw.is_accounts),
      is_headoffice: Boolean(raw.is_headoffice),

      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): Contact[] {
    return (rawList ?? []).map((row: any) => this.fetch(row))
  },
}

export default contactTransformer
