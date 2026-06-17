import { defineStore } from "pinia"
import referenceDataService from "@/app/services/reference-data"
import type { ReferenceDataCategory, ReferenceDataOption } from "@/app/types/referenceData"

type State = {
  categories: ReferenceDataCategory[]
  loading: boolean
  saving: boolean
  error: string | null
}

export const useReferenceDataStore = defineStore("reference-data", {
  state: (): State => ({
    categories: [],
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    getByGroup: state => {
      return (group: string): ReferenceDataCategory[] => {
        return state.categories.filter(category => category.group === group)
      }
    },

    getByKey: state => {
      return (key: string): ReferenceDataCategory | undefined => {
        return state.categories.find(category => category.key === key)
      }
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null

      try {
        this.categories = await referenceDataService.getAll()
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load reference data."
      } finally {
        this.loading = false
      }
    },

    async fetchCategory(key: string) {
      this.loading = true
      this.error = null

      try {
        const category = await referenceDataService.getCategory(key)
        const index = this.categories.findIndex(item => item.key === key)

        if (index >= 0) {
          this.categories[index] = category
        } else {
          this.categories.push(category)
        }

        return category
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load reference data category."

        throw error
      } finally {
        this.loading = false
      }
    },

    async createOption(
      categoryKey: string,
      payload: {
        name: string
        is_default?: boolean
        metadata?: Record<string, unknown> | null
      },
    ) {
      this.saving = true
      this.error = null

      try {
        const option = await referenceDataService.createOption(categoryKey, payload)

        const category = this.getByKey(categoryKey)

        if (category) {
          if (option.is_default) {
            category.options = category.options.map(item => ({
              ...item,
              is_default: false,
            }))
          }

          category.options.push(option)
          category.options.sort((a, b) => a.sort_order - b.sort_order)
        }

        return option
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create reference data option."

        throw error
      } finally {
        this.saving = false
      }
    },

    async updateOption(
      categoryKey: string,
      optionId: number,
      payload: Partial<ReferenceDataOption>,
    ) {
      this.saving = true
      this.error = null

      try {
        const option = await referenceDataService.updateOption(categoryKey, optionId, payload)

        const category = this.getByKey(categoryKey)

        if (category) {
          if (option.is_default) {
            category.options = category.options.map(item => ({
              ...item,
              is_default: item.id === option.id,
            }))
          }

          const index = category.options.findIndex(item => item.id === optionId)

          if (index >= 0) {
            category.options[index] = option
          }
        }

        return option
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update reference data option."

        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteOption(categoryKey: string, optionId: number) {
      this.saving = true
      this.error = null

      try {
        await referenceDataService.deleteOption(categoryKey, optionId)

        const category = this.getByKey(categoryKey)

        if (category) {
          category.options = category.options.filter(item => item.id !== optionId)
        }
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to remove reference data option."

        throw error
      } finally {
        this.saving = false
      }
    },

    async restoreOption(categoryKey: string, optionId: number) {
      this.saving = true
      this.error = null

      try {
        const option = await referenceDataService.restoreOption(categoryKey, optionId)

        const category = this.getByKey(categoryKey)

        if (category) {
          const exists = category.options.some(item => item.id === option.id)

          if (!exists) {
            category.options.push(option)
            category.options.sort((a, b) => a.sort_order - b.sort_order)
          }
        }

        return option
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to restore reference data option."

        throw error
      } finally {
        this.saving = false
      }
    },

    async setDefault(categoryKey: string, optionId: number) {
      this.saving = true
      this.error = null

      try {
        const option = await referenceDataService.setDefault(categoryKey, optionId)

        const category = this.getByKey(categoryKey)

        if (category) {
          category.options = category.options.map(item => ({
            ...item,
            is_default: item.id === option.id,
          }))
        }

        return option
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to set default option."

        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
