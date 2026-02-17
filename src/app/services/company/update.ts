import http from '@/api/http'
import companyTransformer from '@/app/transformers/company'
import type { Company, CompanyUpdatePayload } from '@/app/types/company'

type UpdatePayload = CompanyUpdatePayload | FormData

function isFormData(payload: UpdatePayload): payload is FormData {
  return typeof FormData !== 'undefined' && payload instanceof FormData
}

function hasLogoFile(payload: CompanyUpdatePayload): boolean {
  return !!payload && payload.logo instanceof File
}

/**
 * Build FormData for multipart requests.
 * IMPORTANT: Laravel will not parse nested arrays/objects automatically from raw FormData
 * unless you send them as JSON strings (which we do here).
 */
function buildCompanyFormData(payload: CompanyUpdatePayload): FormData {
  const fd = new FormData()

  // basic fields (top-level)
  const simpleKeys: (keyof CompanyUpdatePayload)[] = [
    'legal_name',
    'trading_name',
    'registration_number',
    'vat_number',
    'eori_number',
    'iata_code',
    'default_currency_code',
    'language',
    'time_zone',
    'status',
  ]

  for (const key of simpleKeys) {
    const v: any = (payload as any)[key]
    if (v === undefined) continue
    if (v === null) fd.append(String(key), '')
    else fd.append(String(key), String(v))
  }

  // file upload
  if (payload.logo instanceof File) {
    fd.append('logo', payload.logo)
  }

  // nested structures -> JSON strings
  const jsonKeys: (keyof CompanyUpdatePayload)[] = [
    'addresses',
    'primary_contact',
    'settings',
    'additional_currencies',
    'reference_sequences',
  ]

  for (const key of jsonKeys) {
    const v: any = (payload as any)[key]
    if (v === undefined) continue
    fd.append(String(key), JSON.stringify(v))
  }

  return fd
}

export default async function updateCompany(payload: UpdatePayload): Promise<Company> {
  // ✅ If caller already provides FormData
  if (isFormData(payload)) {
    // Best case: PATCH multipart works (it should with Laravel)
    const response = await http.patch('/company', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return companyTransformer.fetch(response.data)
  }

  // ✅ If JSON payload includes logo File -> switch to FormData
  if (hasLogoFile(payload)) {
    const fd = buildCompanyFormData(payload)

    const response = await http.patch('/company', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return companyTransformer.fetch(response.data)
  }

  // ✅ Standard JSON PATCH (recommended for most saves)
  const response = await http.patch('/company', payload)
  return companyTransformer.fetch(response.data)
}
