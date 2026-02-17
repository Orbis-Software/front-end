import { defineStore } from 'pinia'
import contactImportService from '@/app/services/contactImport'
import type { ContactImportResult } from '@/app/types/contactImport'
import { useAuthStore } from '@/app/stores/auth'

type State = {
  importing: boolean
  result: ContactImportResult | null
  errorMessage: string | null
}

export const useContactImportStore = defineStore('contactImport', {
  state: (): State => ({
    importing: false,
    result: null,
    errorMessage: null,
  }),

  actions: {
    reset() {
      this.result = null
      this.errorMessage = null
    },

    async importCsv(file: File) {
      const auth = useAuthStore()
      const companyId = auth.user?.company?.id

      if (!companyId) {
        this.errorMessage = 'No company found on your user account.'
        throw new Error(this.errorMessage)
      }

      this.importing = true
      this.reset()

      try {
        const res = await contactImportService.importCsv({
          company_id: companyId,
          file,
        })

        this.result = res
        return res
      } catch (err: any) {
        this.errorMessage =
          err?.response?.data?.message ??
          err?.message ??
          'Import failed. Please try again.'
        throw err
      } finally {
        this.importing = false
      }
    },
  },
})
