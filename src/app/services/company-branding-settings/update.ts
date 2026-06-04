import http from "@/api/http"
import transformer from "@/app/transformers/company-branding-settings"
import type {
  CompanyBrandingSettings,
  CompanyBrandingSettingsPayload,
} from "@/app/types/company-branding-settings"

function shouldUseFormData(payload: CompanyBrandingSettingsPayload) {
  return Boolean(payload.header_image || payload.clear_header_image)
}

function buildFormData(payload: CompanyBrandingSettingsPayload): FormData {
  const formData = new FormData()

  if (payload.document_sections) {
    formData.append("document_sections", JSON.stringify(payload.document_sections))
  }

  if (payload.header_settings) {
    formData.append("header_settings", JSON.stringify(payload.header_settings))
  }

  formData.append("clear_header_image", payload.clear_header_image ? "1" : "0")

  if (payload.header_image) {
    formData.append("header_image", payload.header_image)
  }

  return formData
}

export default async function update(
  payload: CompanyBrandingSettingsPayload,
): Promise<CompanyBrandingSettings> {
  const response = shouldUseFormData(payload)
    ? await http.post("/company-branding-settings", buildFormData(payload), {
        headers: { "Content-Type": "multipart/form-data" },
      })
    : await http.put("/company-branding-settings", payload)

  return transformer.fetch(response.data.data) as CompanyBrandingSettings
}
