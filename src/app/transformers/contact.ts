import type { Contact, ContactType } from '@/app/types/contact'
import contactPersonTransformer from '@/app/transformers/contact-person'

const contactTransformer = {
  fetch(raw: any): Contact {
    const contactTypes: ContactType[] = (raw.types ?? [])
      .map((t: any) => t?.contact_type)
      .filter(Boolean)

    return {
      id: raw.id,
      company_id: raw.company_id,

      // ✅ NEW
      contact_types: contactTypes,

      address: raw.address ?? null,
      country: raw.country ?? null,
      eori: raw.eori ?? null,
      credit_limit:
        raw.credit_limit === null || raw.credit_limit === undefined
          ? null
          : Number(raw.credit_limit),
      currency_preference: raw.currency_preference ?? null,
      status: raw.status ?? 'active',
      people: contactPersonTransformer.fetchCollection(raw.people),
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): Contact[] {
    return (rawList ?? []).map((row: any) => this.fetch(row))
  },
}

export default contactTransformer
