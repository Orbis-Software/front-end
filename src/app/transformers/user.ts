import type { User } from '@/app/types/user'
import companyTransformer from '@/app/transformers/company'

export default {
  fetch(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,

      roles: data.roles ?? [],
      permissions: data.permissions ?? [],

      is_admin: !!data.is_admin,
      is_dev: !!data.is_dev,

      company: data.company
        ? companyTransformer.fetch(data.company)
        : null,

      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  fetchCollection(data: any[]): User[] {
    return (data ?? []).map((row: any) => this.fetch(row))
  },
}
