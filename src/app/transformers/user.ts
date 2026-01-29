import type { User } from '@/app/types/user'
import companyTransformer from '@/app/transformers/company'

export default {
  /**
   * Transform a single user record
   */
  fetch(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,

      // ✅ new
      company: data.company ? companyTransformer.fetch(data.company) : null,

      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  /**
   * Transform a collection of users
   */
  fetchCollection(data: any[]): User[] {
    return (data ?? []).map((row: any) => this.fetch(row))
  },
}
