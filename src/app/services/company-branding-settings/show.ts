import http from "@/api/http"
import transformer from "@/app/transformers/company-branding-settings"
import type { CompanyBrandingSettings } from "@/app/types/company-branding-settings"

export default async function show(): Promise<CompanyBrandingSettings | null> {
  const response = await http.get("/company-branding-settings")

  return transformer.fetch(response.data.data)
}
