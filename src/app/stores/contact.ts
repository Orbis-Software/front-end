import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { Contact, PaginatedResponse } from "@/app/types/contact"
import contacts from "@/app/services/contacts"
import { useContactTypeStore } from "@/app/stores/contact-type"

export const useContactStore = defineStore("contact", () => {
  const items = ref<Contact[]>([])
  const loading = ref(false)

  // ✅ optional: current contact (details page)
  const current = ref<Contact | null>(null)
  const currentLoading = ref(false)

  // ✅ single source of truth for types
  const typeStore = useContactTypeStore()
  const types = computed(() => typeStore.items)
  const typesLoading = computed(() => typeStore.loading)

  const activeTypeId = ref<number | null>(null)
  const search = ref("")

  const page = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  async function ensureTypesLoaded() {
    if (!typeStore.items.length) {
      await typeStore.fetch()
    }
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

      items.value = res.data ?? []

      // ✅ support BOTH shapes:
      // A) { data, meta: { current_page, per_page, total, last_page } }
      // B) Laravel paginator: { data, current_page, per_page, total, last_page }
      const meta: any = (res as any).meta ?? (res as any)

      page.value = Number(meta.current_page ?? page.value)
      perPage.value = Number(meta.per_page ?? perPage.value)
      total.value = Number(meta.total ?? total.value)
      lastPage.value = Number(meta.last_page ?? lastPage.value)

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

  // ✅ Details helpers
  async function find(id: number) {
    return contacts.show(id)
  }

  async function load(id: number) {
    currentLoading.value = true
    try {
      current.value = await contacts.show(id)
      return current.value
    } finally {
      currentLoading.value = false
    }
  }

  async function refreshCurrent() {
    if (!current.value) return null
    return load(current.value.id)
  }

  // ✅ Core CRUD
  async function create(payload: any) {
    const created = await contacts.create(payload)
    await fetch()
    return created
  }

  async function update(id: number, payload: any) {
    const updated = await contacts.update(id, payload)
    await fetch()

    // keep details page in sync if open
    if (current.value?.id === id) current.value = updated

    return updated
  }

  async function remove(id: number) {
    await contacts.remove(id)
    await fetch()

    if (current.value?.id === id) current.value = null
  }

  // ✅ NEW: Branch endpoints
  async function createBranch(contactId: number, payload: any) {
    const updatedContact = await contacts.createBranch(contactId, payload)
    if (current.value?.id === contactId) current.value = updatedContact
    return updatedContact
  }

  async function updateBranch(contactId: number, branchId: number, payload: any) {
    const updatedContact = await contacts.updateBranch(contactId, branchId, payload)
    if (current.value?.id === contactId) current.value = updatedContact
    return updatedContact
  }

  async function removeBranch(contactId: number, branchId: number) {
    const updatedContact = await contacts.removeBranch(contactId, branchId)
    if (current.value?.id === contactId) current.value = updatedContact
    return updatedContact
  }

  // ✅ NEW: Collection Address endpoints
  async function createCollectionAddress(contactId: number, payload: any) {
    const updatedContact = await contacts.createCollectionAddress(contactId, payload)
    if (current.value?.id === contactId) current.value = updatedContact
    return updatedContact
  }

  async function updateCollectionAddress(contactId: number, addressId: number, payload: any) {
    const updatedContact = await contacts.updateCollectionAddress(contactId, addressId, payload)
    if (current.value?.id === contactId) current.value = updatedContact
    return updatedContact
  }

  async function removeCollectionAddress(contactId: number, addressId: number) {
    const updatedContact = await contacts.removeCollectionAddress(contactId, addressId)
    if (current.value?.id === contactId) current.value = updatedContact
    return updatedContact
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

    // details
    current,
    currentLoading,
    load,
    refreshCurrent,

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

    // ✅ new actions exposed
    createBranch,
    updateBranch,
    removeBranch,

    createCollectionAddress,
    updateCollectionAddress,
    removeCollectionAddress,
  }
})
