import { defineStore } from "pinia"
import userSignatureService from "@/app/services/user-signature"
import type { UserSignature, UserSignaturePayload } from "@/app/types/user-signature"

type State = {
  signature: UserSignature | null
  loading: boolean
  saving: boolean
  error: string | null
}

export const useUserSignatureStore = defineStore("user-signature", {
  state: (): State => ({
    signature: null,
    loading: false,
    saving: false,
    error: null,
  }),

  actions: {
    async fetch() {
      this.loading = true
      this.error = null

      try {
        this.signature = await userSignatureService.show()
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || "Failed to load signature."
        throw error
      } finally {
        this.loading = false
      }
    },

    async save(payload: UserSignaturePayload) {
      this.saving = true
      this.error = null

      try {
        this.signature = await userSignatureService.update(payload)
        return this.signature
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || "Failed to save signature."
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
