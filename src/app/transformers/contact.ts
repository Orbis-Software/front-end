import type {
  Contact,
  ContactBranch,
  ContactCollectionAddress,
} from "@/app/types/contact"
import contactTypeTransformer from "@/app/transformers/contact-type"

function asArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : []
}

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizeBranch(raw: any): ContactBranch {
  return {
    id: Number(raw.id),

    name: raw.name ?? null,

    contact_person: raw.contact_person ?? null,
    email: raw.email ?? null,
    phone: raw.phone ?? null,

    delivery_address_line_1: raw.delivery_address_line_1 ?? null,
    delivery_address_line_2: raw.delivery_address_line_2 ?? null,
    delivery_address_line_3: raw.delivery_address_line_3 ?? null,
    delivery_city: raw.delivery_city ?? null,
    delivery_county_state: raw.delivery_county_state ?? null,
    delivery_postal_code: raw.delivery_postal_code ?? null,
    delivery_country_id: toNumberOrNull(raw.delivery_country_id),

    billing_same_as_delivery: Boolean(raw.billing_same_as_delivery),

    billing_address_line_1: raw.billing_address_line_1 ?? null,
    billing_address_line_2: raw.billing_address_line_2 ?? null,
    billing_address_line_3: raw.billing_address_line_3 ?? null,
    billing_city: raw.billing_city ?? null,
    billing_county_state: raw.billing_county_state ?? null,
    billing_postal_code: raw.billing_postal_code ?? null,
    billing_country_id: toNumberOrNull(raw.billing_country_id),
  }
}

function normalizeCollectionAddress(raw: any): ContactCollectionAddress {
  return {
    id: Number(raw.id),

    label: raw.label ?? null,

    address_line_1: raw.address_line_1 ?? null,
    address_line_2: raw.address_line_2 ?? null,
    address_line_3: raw.address_line_3 ?? null,
    city: raw.city ?? null,
    county_state: raw.county_state ?? null,
    postal_code: raw.postal_code ?? null,
    country_id: toNumberOrNull(raw.country_id),
  }
}

const contactTransformer = {
  fetch(rawAny: any): Contact {
    // ✅ supports Laravel resources that wrap { data: ... }
    const raw = rawAny?.data ?? rawAny

    const rawTypes = raw.contact_types ?? raw.types ?? []
    const normalizedTypes = Array.isArray(rawTypes)
      ? rawTypes.map((t: any) => t?.contact_type ?? t).filter(Boolean)
      : []

    // ✅ branches + collection addresses (support alt key names)
    const rawBranches =
      raw.branches ??
      raw.branch_addresses ?? // fallback just in case
      []

    const rawCollections =
      raw.collection_addresses ??
      raw.collectionAddresses ?? // fallback camelCase
      []

    return {
      id: Number(raw.id),
      company_id:
        raw.company_id === null || raw.company_id === undefined
          ? null
          : Number(raw.company_id),

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
      country_id: toNumberOrNull(raw.country_id),

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

      // ✅ address usage flags (MVP columns)
      is_delivery: Boolean(raw.is_delivery),
      is_collection: Boolean(raw.is_collection),
      is_consignee: Boolean(raw.is_consignee),
      is_accounts: Boolean(raw.is_accounts),
      is_headoffice: Boolean(raw.is_headoffice),

      // ✅ NEW: relations
      branches: asArray(rawBranches).map(normalizeBranch),
      collection_addresses: asArray(rawCollections).map(normalizeCollectionAddress),

      // System
      status: raw.status ?? "active",
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): Contact[] {
    return (rawList ?? []).map((row: any) => this.fetch(row))
  },
}

export default contactTransformer