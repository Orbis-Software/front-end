import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type {
  Contact,
  ContactChargeTable,
  ContactChargeTableListParams,
  ContactChargeTablePayload,
  PaginatedResponse,
} from "@/app/types/contact"
import contacts from "@/app/services/contacts"
import { useContactTypeStore } from "@/app/stores/contact-type"

export const useContactStore = defineStore("contact", () => {
  const items = ref<Contact[]>([])
  const loading = ref(false)

  const current = ref<Contact | null>(null)
  const currentLoading = ref(false)

  const chargeTables = ref<ContactChargeTable[]>([])
  const chargeTablesLoading = ref(false)

  const currentChargeTable = ref<ContactChargeTable | null>(null)
  const currentChargeTableLoading = ref(false)

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

      if (activeTypeId.value !== null) {
        params.contact_type_id = activeTypeId.value
      }

      const res: PaginatedResponse<Contact> = await contacts.list(params)

      items.value = res.data ?? []

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

  async function create(payload: any) {
    const created = await contacts.create(payload)
    await fetch()
    return created
  }

  async function update(id: number, payload: any) {
    const updated = await contacts.update(id, payload)
    await fetch()

    if (current.value?.id === id) current.value = updated

    return updated
  }

  async function remove(id: number) {
    await contacts.remove(id)
    await fetch()

    if (current.value?.id === id) current.value = null
  }

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

  async function fetchChargeTables(contactId: number, params: ContactChargeTableListParams = {}) {
    chargeTablesLoading.value = true
    try {
      const res = await contacts.listChargeTables(contactId, params)
      chargeTables.value = res.data ?? []
      return chargeTables.value
    } finally {
      chargeTablesLoading.value = false
    }
  }

  async function loadChargeTable(contactId: number, tableId: number) {
    currentChargeTableLoading.value = true
    try {
      currentChargeTable.value = await contacts.showChargeTable(contactId, tableId)
      return currentChargeTable.value
    } finally {
      currentChargeTableLoading.value = false
    }
  }

  async function createChargeTable(contactId: number, payload: ContactChargeTablePayload) {
    const created = await contacts.createChargeTable(contactId, payload)
    await fetchChargeTables(contactId)
    currentChargeTable.value = created
    return created
  }

  async function updateChargeTable(
    contactId: number,
    tableId: number,
    payload: Partial<ContactChargeTablePayload>,
  ) {
    const updated = await contacts.updateChargeTable(contactId, tableId, payload)
    await fetchChargeTables(contactId)

    if (currentChargeTable.value?.id === tableId) {
      currentChargeTable.value = updated
    }

    return updated
  }

  async function removeChargeTable(contactId: number, tableId: number) {
    await contacts.removeChargeTable(contactId, tableId)
    await fetchChargeTables(contactId)

    if (currentChargeTable.value?.id === tableId) {
      currentChargeTable.value = null
    }
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

    current,
    currentLoading,

    chargeTables,
    chargeTablesLoading,
    currentChargeTable,
    currentChargeTableLoading,

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

    createBranch,
    updateBranch,
    removeBranch,

    createCollectionAddress,
    updateCollectionAddress,
    removeCollectionAddress,

    fetchChargeTables,
    loadChargeTable,
    createChargeTable,
    updateChargeTable,
    removeChargeTable,
  }
})
