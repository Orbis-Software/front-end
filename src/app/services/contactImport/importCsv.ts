import http from '@/api/http'
import contactImportTransformer from '@/app/transformers/contactImport'
import type { ContactImportCsvPayload, ContactImportResult } from '@/app/types/contactImport'

export default async function importContactsCsv(
  payload: ContactImportCsvPayload,
): Promise<ContactImportResult> {
  const form = new FormData()
  form.append('company_id', String(payload.company_id))
  form.append('file', payload.file)

  const response = await http.post('/imports/contacts/csv', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return contactImportTransformer.fetch(response.data)
}
