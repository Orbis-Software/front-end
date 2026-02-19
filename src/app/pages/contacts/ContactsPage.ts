import { computed, onMounted, ref } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/app/stores/contact'

/** tiny debounce (no extra deps) */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 350) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), wait)
  }
}

type DataTablePageEvent = {
  first: number
  rows: number
  page: number // 0-based
  pageCount: number
}

export function useContactsPage() {
  const store = useContactStore()
  const confirm = useConfirm()
  const router = useRouter()

  const search = ref(store.search ?? '')

  const headerTitle = computed(() => {
    if (store.activeTypeId === null) return 'Contacts'
    const t = store.types.find((x) => x.id === store.activeTypeId)
    return t?.name ?? 'Contacts'
  })

  // PrimeVue paginator "first" (0-based index)
  const firstRow = computed(() => (store.page - 1) * store.perPage)

  onMounted(async () => {
    await store.fetchTypes()
    await store.fetch()
  })

  async function setTypeId(id: number | null) {
    await store.setTypeId(id)
  }

  const applySearch = debounce(async (q: string) => {
    await store.setSearch(q)
  }, 350)

  function onSearchInput(v: string) {
    search.value = v ?? ''
    applySearch(search.value)
  }

  function onCreate() {
    router.push('/contacts/new')
  }

  function onEdit(id: number) {
    router.push(`/contacts/${id}/edit`)
  }

 function onOpenCompany(id: number) {
    const route = router.resolve(`/contacts/${id}`)
    window.open(route.href, '_blank')
  }



  function onDelete(contactId: number) {
    confirm.require({
      header: 'Delete Contact',
      message: 'Are you sure you want to delete this contact?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptClass: 'p-button-danger',
      accept: async () => {
        await store.remove(contactId)
      },
    })
  }

  async function onPage(e: DataTablePageEvent) {
    const nextPerPage = e.rows
    const nextPage = e.page + 1 // convert to 1-based

    if (nextPerPage !== store.perPage) {
      await store.setPerPage(nextPerPage)
      return
    }

    await store.setPage(nextPage)
  }

  return {
    store,
    search,
    headerTitle,
    firstRow,
    onPage,
    onSearchInput,
    setTypeId,
    onCreate,
    onEdit,
    onDelete,
    onOpenCompany,
  }
}
