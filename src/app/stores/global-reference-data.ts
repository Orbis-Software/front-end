import { defineStore } from "pinia"
import globalReferenceDataService from "@/app/services/global-reference-data"
import type {
  GlobalReferenceDataListParams,
  GlobalReferenceDataSet,
} from "@/app/types/globalReferenceData"

type State = {
  data: GlobalReferenceDataSet
  loading: boolean
  error: string | null
}

function emptyData(): GlobalReferenceDataSet {
  return {
    terminals: [],
    airlines: [],
    cities: [],
  }
}

export const useGlobalReferenceDataStore = defineStore("global-reference-data", {
  state: (): State => ({
    data: emptyData(),
    loading: false,
    error: null,
  }),

  actions: {
    async list(params: GlobalReferenceDataListParams) {
      return globalReferenceDataService.list(params)
    },

    async fetchAll() {
      this.loading = true
      this.error = null

      try {
        this.data = await globalReferenceDataService.getAll()
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load global reference data."

        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
