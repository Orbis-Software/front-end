import { computed, ref, watch } from "vue"
import { useToast } from "primevue/usetoast"
import { useEmployeeStore } from "@/app/stores/employee"
import type { Employee } from "@/app/types/employee"

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 350) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), wait)
  }
}

export function useEmployeeListPage() {
  const toast = useToast()
  const store = useEmployeeStore()

  // realtime search (local input so we can debounce without UI lag)
  const searchLocal = ref(store.search ?? "")
  const searching = ref(false)

  const showCreate = ref(false)
  const showEdit = ref(false)

  const createForm = ref({
    name: "",
    email: "",
    password: "",
    roles: [] as string[],
  })

  const editForm = ref({
    id: 0,
    name: "",
    email: "",
    password: "",
    roles: [] as string[],
  })

  const canCreate = computed(() => {
    return (
      createForm.value.name.trim().length > 0 &&
      createForm.value.email.trim().length > 0 &&
      createForm.value.password.length >= 8
    )
  })

  function openCreate() {
    createForm.value = { name: "", email: "", password: "", roles: [] }
    showCreate.value = true
  }

  function closeCreate() {
    showCreate.value = false
  }

  function openEdit(row: Employee) {
    editForm.value = {
      id: row.id,
      name: row.name,
      email: row.email,
      password: "",
      roles: [...(row.roles ?? [])],
    }
    showEdit.value = true
  }

  function closeEdit() {
    showEdit.value = false
  }

  async function submitCreate() {
    if (!canCreate.value) return

    try {
      await store.create({
        name: createForm.value.name,
        email: createForm.value.email.trim().toLowerCase(),
        password: createForm.value.password,
        roles: createForm.value.roles,
      })

      toast.add({
        severity: "success",
        summary: "Employee created",
        detail: "User added to your company.",
        life: 2500,
      })

      closeCreate()
      await store.fetch()
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Create failed",
        detail: e?.response?.data?.message ?? "Please check inputs and try again.",
        life: 3500,
      })
    }
  }

  async function submitEdit() {
    try {
      await store.update(editForm.value.id, {
        name: editForm.value.name,
        email: editForm.value.email.trim().toLowerCase(),
        password: editForm.value.password ? editForm.value.password : null,
        roles: editForm.value.roles,
      })

      toast.add({
        severity: "success",
        summary: "Employee updated",
        detail: "Changes saved.",
        life: 2500,
      })

      closeEdit()
      await store.fetch()
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Update failed",
        detail: e?.response?.data?.message ?? "Please check inputs and try again.",
        life: 3500,
      })
    }
  }

  const runSearch = debounce(async (val: string) => {
    searching.value = true
    try {
      store.search = val
      await store.fetch({ search: val, page: 1 })
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Search failed",
        detail: e?.response?.data?.message ?? "Please try again.",
        life: 3000,
      })
    } finally {
      searching.value = false
    }
  }, 300)

  watch(
    searchLocal,
    (val) => {
      // realtime search, but debounced
      runSearch(val ?? "")
    },
    { immediate: false }
  )

  function clearSearch() {
    searchLocal.value = ""
    // watcher will trigger fetch
  }

  async function initEmployeePage() {
    try {
      await store.fetchRoles()
    } catch {
      // ignore (roles endpoint optional)
    }

    try {
      await store.fetch()
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "Failed to load employees",
        detail: e?.response?.data?.message ?? "Please refresh and try again.",
        life: 3500,
      })
    }
  }

  return {
    store,

    // realtime search
    searchLocal,
    searching,
    clearSearch,

    showCreate,
    showEdit,

    createForm,
    editForm,

    canCreate,

    openCreate,
    openEdit,
    closeCreate,
    closeEdit,

    submitCreate,
    submitEdit,

    initEmployeePage,
  }
}