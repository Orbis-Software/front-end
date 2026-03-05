import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeListParams,
  EmployeeUpdatePayload,
} from "@/app/types/employee"
import employeeService from "@/app/services/employees"

export const useEmployeeStore = defineStore("employee", () => {
  const items = ref<Employee[]>([])
  const roles = ref<string[]>([])

  const loading = ref(false)
  const saving = ref(false)

  const search = ref("")
  const perPage = ref(15)
  const page = ref(1)

  const filtered = computed(() => items.value)

  async function fetch(params: EmployeeListParams = {}) {
    loading.value = true
    try {
      const finalParams: EmployeeListParams = {
        search: params.search ?? search.value ?? undefined,
        per_page: params.per_page ?? perPage.value,
        page: params.page ?? page.value,
      }

      items.value = await employeeService.list(finalParams)
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function fetchRoles() {
    loading.value = true
    try {
      roles.value = await employeeService.roles()
      return roles.value
    } finally {
      loading.value = false
    }
  }

  async function create(payload: EmployeeCreatePayload) {
    saving.value = true
    try {
      const created = await employeeService.create(payload)
      // quick optimistic insert
      items.value = [created, ...items.value]
      return created
    } finally {
      saving.value = false
    }
  }

  async function update(id: number, payload: EmployeeUpdatePayload) {
    saving.value = true
    try {
      const updated = await employeeService.update(id, payload)
      const idx = items.value.findIndex(x => x.id === id)
      if (idx !== -1) items.value[idx] = updated
      return updated
    } finally {
      saving.value = false
    }
  }

  return {
    // state
    items,
    roles,
    loading,
    saving,

    // ui state
    search,
    perPage,
    page,

    // getters
    filtered,

    // actions
    fetch,
    fetchRoles,
    create,
    update,
  }
})
