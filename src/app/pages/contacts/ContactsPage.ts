import { computed, onMounted, ref } from "vue"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import { useRouter } from "vue-router"
import { useContactStore } from "@/app/stores/contact"

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
  page: number
  pageCount: number
}

export function useContactsPage() {
  const store = useContactStore()
  const confirm = useConfirm()
  const toast = useToast()
  const router = useRouter()

  const search = ref(store.search ?? "")
  const exporting = ref(false)

  const headerTitle = computed(() => {
    if (store.activeTypeId === null) return "Contacts"

    const t = store.types.find(x => x.id === store.activeTypeId)

    return t?.name ?? "Contacts"
  })

  const filterTabs = computed(() => {
    return store.types.map(type => ({
      id: type.id,
      label: type.name,
    }))
  })

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
    search.value = v ?? ""
    applySearch(search.value)
  }

  function onCreate() {
    router.push("/contacts/new")
  }

  function onEdit(id: number) {
    router.push(`/contacts/${id}/edit`)
  }

  function onImportContacts() {
    router.push("/contacts/import")
  }

  function onOpenCompany(id: number) {
    router.push({
      name: "crm.contacts.show",
      params: { id },
    })
  }

  async function onExportContacts() {
    exporting.value = true

    try {
      const blob = await store.exportContacts()

      const date = new Date().toISOString().slice(0, 10)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `contacts-full-export-${date}.csv`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      toast.add({
        severity: "success",
        summary: "Export ready",
        detail: "Contacts exported successfully.",
        life: 2500,
      })
    } catch {
      toast.add({
        severity: "error",
        summary: "Export failed",
        detail: "Unable to export contacts. Please try again.",
        life: 4500,
      })
    } finally {
      exporting.value = false
    }
  }

  function onDelete(contactId: number) {
    confirm.require({
      header: "Delete Contact",
      message: "Are you sure you want to delete this contact?",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      acceptClass: "p-button-danger",
      accept: async () => {
        await store.remove(contactId)
      },
    })
  }

  async function onPage(e: DataTablePageEvent) {
    const nextPerPage = e.rows
    const nextPage = e.page + 1

    if (nextPerPage !== store.perPage) {
      await store.setPerPage(nextPerPage)
      return
    }

    await store.setPage(nextPage)
  }

  return {
    store,
    search,
    exporting,
    headerTitle,
    filterTabs,
    firstRow,
    onPage,
    onSearchInput,
    setTypeId,
    onCreate,
    onEdit,
    onDelete,
    onOpenCompany,
    onImportContacts,
    onExportContacts,
  }
}
