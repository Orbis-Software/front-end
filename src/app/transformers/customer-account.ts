import type { CustomerAccount, CustomerContact, CustomerContactAccount } from "@/app/types/customer"
import transportJobTransformer from "@/app/transformers/transport-job"

function nullableNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function nullableString(value: any): string | null {
  if (value === null || value === undefined) return null
  return String(value)
}

function fetchContact(data: any): CustomerContact | null {
  if (!data) return null

  return {
    id: Number(data.id),
    company_id: nullableNumber(data.company_id),
    company_name: data.company_name ?? "",
    account_number: data.account_number ?? null,
    registration_number: data.registration_number ?? null,
    vat_number: data.vat_number ?? null,
    eori: data.eori ?? null,
    address_line_1: data.address_line_1 ?? null,
    address_line_2: data.address_line_2 ?? null,
    address_line_3: data.address_line_3 ?? null,
    address_line_4: data.address_line_4 ?? null,
    city: data.city ?? null,
    county_state: data.county_state ?? null,
    postal_code: data.postal_code ?? null,
    country_id: nullableNumber(data.country_id),
    email: nullableString(data.email),
    phone: nullableString(data.phone),
    mobile: nullableString(data.mobile),
    website: nullableString(data.website),
    credit_limit: nullableString(data.credit_limit),
    currency_preference: nullableString(data.currency_preference),
    status: nullableString(data.status),
    accounts: fetchContactAccounts(data.accounts),
    company: data.company
      ? {
          id: Number(data.company.id),
          name: nullableString(data.company.name),
        }
      : null,
  }
}

function fetchContactAccounts(data: any): CustomerContactAccount[] {
  if (!Array.isArray(data)) return []

  return data.map(account => ({
    id: Number(account.id),
    contact_id: Number(account.contact_id),
    name: account.name ?? "",
    email: account.email ?? "",
    role: account.role ?? "customer",
    is_primary: !!account.is_primary,
    is_active: !!account.is_active,
    email_verified_at: nullableString(account.email_verified_at),
    last_login_at: nullableString(account.last_login_at),
    created_at: account.created_at,
    updated_at: account.updated_at,
  }))
}

export default {
  fetch(data: any): CustomerAccount {
    const raw = data?.data ?? data

    return {
      id: raw.id,
      contact_id: raw.contact_id,

      name: raw.name,
      email: raw.email,
      role: raw.role,

      is_primary: !!raw.is_primary,
      is_active: !!raw.is_active,

      contact: fetchContact(raw.contact),
      transport_jobs: transportJobTransformer.fetchCollection(raw.transport_jobs),

      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },
}
