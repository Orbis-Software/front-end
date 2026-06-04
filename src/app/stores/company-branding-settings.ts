import { defineStore } from "pinia"
import brandingSettingsService from "@/app/services/company-branding-settings"
import type {
  BrandingDocumentSection,
  BrandingHeaderSettings,
  CompanyBrandingSettings,
  CompanyBrandingSettingsPayload,
} from "@/app/types/company-branding-settings"

type State = {
  settings: CompanyBrandingSettings | null
  loading: boolean
  saving: boolean
  error: string | null
}

export const useCompanyBrandingSettingsStore = defineStore("company-branding-settings", {
  state: (): State => ({
    settings: null,
    loading: false,
    saving: false,
    error: null,
  }),

  actions: {
    async fetch() {
      this.loading = true
      this.error = null

      try {
        this.settings = await brandingSettingsService.show()
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load branding settings."
        throw error
      } finally {
        this.loading = false
      }
    },

    async save(payload: CompanyBrandingSettingsPayload) {
      this.saving = true
      this.error = null

      try {
        this.settings = await brandingSettingsService.update(payload)
        return this.settings
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to save branding settings."
        throw error
      } finally {
        this.saving = false
      }
    },

    async saveDocuments(documentSections: BrandingDocumentSection[]) {
      return this.save({ document_sections: documentSections })
    },

    async saveHeader(
      headerSettings: BrandingHeaderSettings,
      headerImage?: File | null,
      clearHeaderImage?: boolean,
    ) {
      return this.save({
        document_sections: this.settings?.documentSections ?? [],
        header_settings: headerSettings,
        header_image: headerImage,
        clear_header_image: clearHeaderImage,
      })
    },
  },
})
