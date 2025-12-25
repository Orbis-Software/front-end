import { onMounted, computed /* ref */ } from 'vue'
// import { useRouter } from 'vue-router'
// import { useToast } from 'primevue/usetoast'
// import { useConfirm } from 'primevue/useconfirm'
import { useClientStore } from '@/app/stores/client'

export function useClientPage() {
  const clientStore = useClientStore()

  // ACTION DEPENDENCIES (disabled for now)
  // const router = useRouter()
  // const toast = useToast()
  // const confirm = useConfirm()

  // ACTION STATE (disabled for now)
  // const showViewModal = ref(false)
  // const selectedClient = ref<any | null>(null)

  /**
   * Load clients
   */
  onMounted(() => {
    clientStore.fetchAll()
  })

  /**
   * Table rows (UI model)
   * Strictly matches Client type
   */
  const clients = computed(() =>
    clientStore.list.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email ?? '',
      phone: client.phone ?? '',
      status: client.status,
      createdAt: client.createdAt,
    }))
  )

  /**
   * KPI widgets (simple + safe)
   */
  const kpis = computed(() => [
    {
      label: 'Total Clients',
      value: clientStore.list.length,
      icon: 'pi pi-users',
    },
  ])

  /**
   * ACTIONS (disabled for now)
   */
  /*
  function createClient() {
    router.push('/clients/create')
  }

  function viewClient(id: number) {
    selectedClient.value = clientStore.getById(id) ?? null
    showViewModal.value = true
  }

  function editClient(id: number) {
    router.push(`/clients/${id}/edit`)
  }

  function confirmDelete(client: { id: number; name: string }) {
    confirm.require({
      header: 'Delete Client',
      message: `Are you sure you want to delete client ${client.name}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptClass: 'p-button-danger',

      accept: async () => {
        try {
          await clientStore.deleteClient(client.id)

          toast.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `Client ${client.name} deleted successfully`,
            life: 4000,
          })
        } catch {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete client',
            life: 6000,
          })
        }
      },
    })
  }
  */

  return {
    clients,
    kpis,

    // ACTION EXPORTS (disabled for now)
    // showViewModal,
    // selectedClient,
    // createClient,
    // viewClient,
    // editClient,
    // confirmDelete,
  }
}
