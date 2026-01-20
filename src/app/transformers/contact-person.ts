import type { ContactPerson } from '@/app/types/contact-person'

const contactPersonTransformer = {
  fetch(raw: any): ContactPerson {
    return {
      id: raw.id,
      contact_id: raw.contact_id,
      name: raw.name,
      email: raw.email ?? null,
      phone: raw.phone ?? null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): ContactPerson[] {
    return (rawList ?? []).map((r: any) => this.fetch(r))
  },
}

export default contactPersonTransformer
