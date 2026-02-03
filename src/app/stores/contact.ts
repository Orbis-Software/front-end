import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Contact, PaginatedResponse } from '@/app/types/contact'
import contacts from '@/app/services/contacts'
import { useContactTypeStore } from '@/app/stores/contact-type'

export const useContactStore = defineStore('contact', () => {
  const items = ref<Contact[]>([])
  const loading = ref(false)

  // ✅ single source of truth for types
  const typeStore = useContactTypeStore()
  const types = computed(() => typeStore.items)
  const typesLoading = computed(() => typeStore.loading)

  const activeTypeId = ref<number | null>(null)
  const search = ref('')

  const page = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  async function ensureTypesLoaded() {
    if (!typeStore.items.length) {
      await typeStore.fetch()
    }

    // ❌ IMPORTANT: do NOT auto set first type here,
    // because ALL uses activeTypeId = null
  }

  async function fetch() {
    loading.value = true
    try {
      await ensureTypesLoaded()

      const params: any = {
        page: page.value,
        per_page: perPage.value,
        q: search.value.trim() || undefined,
      }

      // ✅ only send filter when not ALL
      if (activeTypeId.value !== null) {
        params.contact_type_id = activeTypeId.value
      }

      const res: PaginatedResponse<Contact> = await contacts.list(params)

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

  async function fetchTypes() {
    await ensureTypesLoaded()
    return typeStore.items
  }

  async function setTypeId(typeId: number | null) {
    activeTypeId.value = typeId
    page.value = 1
    return fetch()
  }

  async function setSearch(q: string) {
    search.value = q
    page.value = 1
    return fetch()
  }

  async function find(id: number) {
    return contacts.show(id)
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

    types,
    typesLoading,
    fetchTypes,

    activeTypeId,
    search,

    page,
    perPage,
    total,
    lastPage,

    fetch,
    setTypeId,
    setSearch,
    setPage,
    setPerPage,

    find,
    create,
    update,
    remove,
  }
})
