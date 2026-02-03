import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ContactType } from '@/app/types/contact-type'
import contactTypesApi from '@/app/services/contact-types'
import contactTypeTransformer from '@/app/transformers/contact-type'

export const useContactTypeStore = defineStore('contactType', () => {
  const items = ref<ContactType[]>([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      // allow both shapes:
      // - { data: [...] }
      // - [...] directly
      const res: any = await contactTypesApi.list({ per_page: 200 })

      const rows = Array.isArray(res) ? res : (res?.data ?? [])
      items.value = contactTypeTransformer.fetchCollection(rows)

      return res
    } finally {
      loading.value = false
    }
  }

  function findByCode(code: string) {
    return items.value.find((t) => t.code === code) ?? null
  }

  function findById(id: number) {
    return items.value.find((t) => t.id === id) ?? null
  }

  return {
    items,
    loading,
    fetch,
    findByCode,
    findById,
  }
})
