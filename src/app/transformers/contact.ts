import type { Contact } from '@/app/types/contact'

const contactTransformer = {
  fetch(raw: any): Contact {
    return {
      id: raw.id,
      company_id: raw.company_id,
      contact_type: raw.contact_type,
      address: raw.address ?? null,
      country: raw.country ?? null,
      eori: raw.eori ?? null,
      credit_limit:
        raw.credit_limit === null || raw.credit_limit === undefined
          ? null
          : Number(raw.credit_limit),
      currency_preference: raw.currency_preference ?? null,
      status: raw.status ?? 'active',
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): Contact[] {
    return (rawList ?? []).map((row: any) => this.fetch(row))
  },
}

export default contactTransformer
