import type { ContactType } from '@/app/types/contact-type'

const contactTypeTransformer = {
  fetch(raw: any): ContactType {
    return {
      id: Number(raw.id),
      code: String(raw.code ?? ''),
      name: String(raw.name ?? ''),
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): ContactType[] {
    return (rawList ?? []).map((row: any) => this.fetch(row))
  },
}

export default contactTypeTransformer
