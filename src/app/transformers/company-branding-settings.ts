import type { CompanyBrandingSettings } from "@/app/types/company-branding-settings"

function fetch(data: any): CompanyBrandingSettings | null {
  if (!data) return null

  return {
    id: data.id ?? null,
    documentSections: data.documentSections ?? [],
    headerSettings: data.headerSettings ?? null,
    headerImageUrl: data.headerImageUrl ?? null,
    updatedAt: data.updatedAt ?? null,
  }
}

export default { fetch }
