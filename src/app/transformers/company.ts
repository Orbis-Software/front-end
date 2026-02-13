import type {
  Company,
  CompanyAddress,
  CompanyPrimaryContact,
  CompanySettings,
  CompanyReferenceSequence,
} from "@/app/types/company"

function normalizeAddress(raw: any): CompanyAddress {
  return {
    type: raw.type,
    building: raw.building ?? null,
    address_line_1: raw.address_line_1 ?? null,
    address_line_2: raw.address_line_2 ?? null,
    address_line_3: raw.address_line_3 ?? null,
    address_line_4: raw.address_line_4 ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    postcode: raw.postcode ?? null,
    country_code: raw.country_code ?? null,
  }
}

function normalizePrimaryContact(raw: any): CompanyPrimaryContact | null {
  if (!raw) return null
  return {
    name: raw.name ?? "",
    email: raw.email ?? "",
    mobile: raw.mobile ?? null,
    telephones: Array.isArray(raw.telephones) ? raw.telephones.filter(Boolean) : [],
  }
}

function normalizeSettings(raw: any): CompanySettings | null {
  if (!raw) return null
  return {
    time_zone: raw.time_zone ?? "",
    main_currency_code: raw.main_currency_code ?? "",
    start_period: raw.start_period ?? null,
    invoicing_period: raw.invoicing_period ?? "monthly",
  }
}

function normalizeRef(raw: any): CompanyReferenceSequence {
  return {
    type: raw.type,
    prefix: raw.prefix ?? "",
    year_digits: raw.year_digits ?? null,
    min_width: Number(raw.min_width ?? 1),
    next_number: Number(raw.next_number ?? 1),
    next_number_formatted: raw.next_number_formatted ?? String(raw.next_number ?? ""),
    use_system: Boolean(raw.use_system ?? true),
  }
}

const companyTransformer = {
  fetch(raw: any): Company {
    return {
      id: Number(raw.id),

      legal_name: raw.legal_name,
      trading_name: raw.trading_name ?? null,
      registration_number: raw.registration_number ?? null,
      vat_number: raw.vat_number ?? null,
      eori_number: raw.eori_number ?? null,
      iata_code: raw.iata_code ?? null,

      default_currency_code: raw.default_currency_code ?? null,
      language: raw.language ?? null,
      time_zone: raw.time_zone ?? null,

      status: raw.status ?? "active",

      logo_path: raw.logo_path ?? null,
      logo_url: raw.logo_url ?? null,

      addresses: Array.isArray(raw.addresses) ? raw.addresses.map(normalizeAddress) : [],
      primary_contact: normalizePrimaryContact(raw.primary_contact),
      settings: normalizeSettings(raw.settings),
      additional_currencies: Array.isArray(raw.additional_currencies)
        ? raw.additional_currencies.filter(Boolean)
        : [],
      reference_sequences: Array.isArray(raw.reference_sequences)
        ? raw.reference_sequences.map(normalizeRef)
        : [],

      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  },

  fetchCollection(rawList: any[]): Company[] {
    return (rawList ?? []).map(this.fetch)
  },
}

export default companyTransformer
