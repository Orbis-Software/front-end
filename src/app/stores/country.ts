import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Country, PaginatedResponse } from '@/app/types/country'
import listCountries from '@/app/services/countries/list'

export const useCountryStore = defineStore('country', () => {
  const items = ref<Country[]>([])
  const loading = ref(false)

  const page = ref(1)
  const perPage = ref(200)
  const total = ref(0)
  const lastPage = ref(1)

  const q = ref('')

  async function fetch() {
    loading.value = true
    try {
      const res: PaginatedResponse<Country> = await listCountries({
        page: page.value,
        per_page: perPage.value,
        q: q.value,
      })

      items.value = res.data

      if (res.meta) {
        page.value = res.meta.current_page
        perPage.value = res.meta.per_page
        total.value = res.meta.total
        lastPage.value = res.meta.last_page
      }

      return res
    } finally {
      loading.value = false
    }
  }

  function setSearch(value: string) {
    q.value = value
    page.value = 1
  }

  return {
    items,
    loading,

    page,
    perPage,
    total,
    lastPage,
    q,

    fetch,
    setSearch,
  }
})
