import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Contact, ContactType, PaginatedResponse } from '@/app/types/contact'
import contacts from '@/app/services/contacts'

export const useContactStore = defineStore('contact', () => {
  const items = ref<Contact[]>([])
  const loading = ref(false)

  const activeType = ref<ContactType>('customer')

  const page = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  async function fetch() {
    loading.value = true
    try {
      const res: PaginatedResponse<Contact> = await contacts.list({
        page: page.value,
        per_page: perPage.value,
        contact_type: activeType.value,
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

  async function setType(type: ContactType) {
    activeType.value = type
    page.value = 1
    return fetch()
  }

  async function create(payload: any) {
    const created = await contacts.create(payload)
    await fetch()
    return created
  }

  async function update(id: number, payload: any) {
    const updated = await contacts.update(id, payload)
    await fetch()
    return updated
  }

  async function remove(id: number) {
    await contacts.remove(id)
    await fetch()
  }

  function setPage(nextPage: number) {
    page.value = nextPage
    return fetch()
  }

  function setPerPage(nextPerPage: number) {
    perPage.value = nextPerPage
    page.value = 1
    return fetch()
  }

  return {
    items,
    loading,
    activeType,

    page,
    perPage,
    total,
    lastPage,

    fetch,
    setType,
    setPage,
    setPerPage,

    create,
    update,
    remove,
  }
})
