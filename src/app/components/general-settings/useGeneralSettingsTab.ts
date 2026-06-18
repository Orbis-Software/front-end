import { computed, onMounted, reactive } from "vue"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type { CreateReferenceDataOptionPayload } from "@/app/types/referenceData"

export function useGeneralSettingsTab(group: string) {
  const referenceDataStore = useReferenceDataStore()
  const newItemValues = reactive<Record<number, string>>({})

  const sections = computed(() => referenceDataStore.getByGroup(group))

  const totalOptions = computed(() => {
    return sections.value.reduce((total, section) => {
      return total + section.options.length
    }, 0)
  })

  async function addItem(
    categoryKey: string,
    categoryId: number,
    payload?: CreateReferenceDataOptionPayload,
  ) {
    const name = (payload?.name ?? newItemValues[categoryId])?.trim()

    if (!name) return

    await referenceDataStore.createOption(categoryKey, {
      name,
      is_default: payload?.is_default,
      metadata: payload?.metadata,
    })

    newItemValues[categoryId] = ""
  }

  async function hideItem(categoryKey: string, optionId: number) {
    await referenceDataStore.deleteOption(categoryKey, optionId)
  }

  async function setDefault(categoryKey: string, optionId: number) {
    await referenceDataStore.setDefault(categoryKey, optionId)
  }

  onMounted(() => {
    if (!referenceDataStore.categories.length) {
      referenceDataStore.fetchAll()
    }
  })

  return {
    sections,
    totalOptions,
    newItemValues,

    loading: computed(() => referenceDataStore.loading),
    saving: computed(() => referenceDataStore.saving),
    error: computed(() => referenceDataStore.error),

    addItem,
    hideItem,
    setDefault,
  }
}
