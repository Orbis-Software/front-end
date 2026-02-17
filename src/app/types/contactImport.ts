export type ContactImportError = {
  row: number
  message: string
}

export type ContactImportResult = {
  created: number
  updated: number
  skipped: number
  errors: ContactImportError[]
}

export type ContactImportCsvPayload = {
  company_id: number
  file: File
}
