import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Company, CompanyUpdatePayload } from '@/app/types/company'
import companyService from '@/app/services/company'
import { useAuthStore } from '@/app/stores/auth'

type UpdatePayload = CompanyUpdatePayload | FormData

export const useCompanyStore = defineStore('company', () => {
  const item = ref<Company | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  function hydrateFromAuth() {
    const auth = useAuthStore()
    item.value = auth.user?.company ?? null
    return item.value
  }

  async function fetch() {
    loading.value = true
    try {
      item.value = await companyService.show()
      return item.value
    } finally {
      loading.value = false
    }
  }

  async function update(payload: UpdatePayload) {
    saving.value = true
    try {
      const updated = await companyService.update(payload)
      item.value = updated

      const auth = useAuthStore()
      if (auth.user) auth.user.company = updated

      return updated
    } finally {
      saving.value = false
    }
  }

  return {
    item,
    loading,
    saving,
    hydrateFromAuth,
    fetch,
    update,
  }
})
