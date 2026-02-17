import type { ContactImportError, ContactImportResult } from '@/app/types/contactImport'

const contactImportTransformer = {
  fetch(raw: any): ContactImportResult {
    const errorsRaw = Array.isArray(raw?.errors) ? raw.errors : []

    const errors: ContactImportError[] = errorsRaw.map((e: any) => ({
      row: Number(e?.row ?? 0),
      message: String(e?.message ?? ''),
    }))

    return {
      created: Number(raw?.created ?? 0),
      updated: Number(raw?.updated ?? 0),
      skipped: Number(raw?.skipped ?? 0),
      errors,
    }
  },
}

export default contactImportTransformer
