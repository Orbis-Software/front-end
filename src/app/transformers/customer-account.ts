import type { CustomerAccount, CustomerContact } from "@/app/types/customer"

function fetchContact(data: any): CustomerContact | null {
  if (!data) return null

  return {
    id: data.id,
    company_name: data.company_name,
    account_number: data.account_number ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    status: data.status ?? null,
  }
}

export default {
  fetch(data: any): CustomerAccount {
    return {
      id: data.id,
      contact_id: data.contact_id,

      name: data.name,
      email: data.email,
      role: data.role,

      is_primary: !!data.is_primary,
      is_active: !!data.is_active,

      contact: fetchContact(data.contact),

      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },
}
