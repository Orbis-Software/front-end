import { onMounted, computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import type { ContactBranch, ContactCollectionAddress } from "@/app/types/contact"
import { useContactStore } from "@/app/stores/contact"

function blankBranch(): Omit<ContactBranch, "id"> {
  return {
    name: null,

    contact_person: null,
    email: null,
    phone: null,

    delivery_address_line_1: null,
    delivery_address_line_2: null,
    delivery_address_line_3: null,
    delivery_city: null,
    delivery_county_state: null,
    delivery_postal_code: null,
    delivery_country_id: null,

    billing_same_as_delivery: true,

    billing_address_line_1: null,
    billing_address_line_2: null,
    billing_address_line_3: null,
    billing_city: null,
    billing_county_state: null,
    billing_postal_code: null,
    billing_country_id: null,
  }
}

function blankCollectionAddress(): Omit<ContactCollectionAddress, "id"> {
  return {
    label: null,
    address_line_1: null,
    address_line_2: null,
    address_line_3: null,
    city: null,
    county_state: null,
    postal_code: null,
    country_id: null,
  }
}

function errMsg(e: any): string {
  return e?.response?.data?.message || e?.message || "Something went wrong."
}

export function useContactDetailsPage() {
  const route = useRoute()
  const router = useRouter()
  const confirm = useConfirm()
  const toast = useToast()

  const contactStore = useContactStore()

  const contact = computed(() => contactStore.current)
  const loading = computed(() => contactStore.currentLoading)

  const busy = ref(false)
  const activeTab = ref<"branches" | "collections">("branches")

  function setTab(tab: "branches" | "collections") {
    activeTab.value = tab
  }

  async function load() {
    try {
      const id = Number(route.params.id)
      await contactStore.load(id)
    } catch (e) {
      toast.add({
        severity: "error",
        summary: "Failed to load contact",
        detail: errMsg(e),
        life: 4000,
      })
    }
  }

  function onEditContact() {
    if (!contact.value) return
    router.push({ name: "crm.contacts.edit", params: { id: contact.value.id } })
  }

  function onSendInvoice() {
    toast.add({
      severity: "info",
      summary: "Send invoice",
      detail: `Contact ID: ${contact.value?.id ?? "-"}`,
      life: 2500,
    })
  }

  // ✅ SAVE branch patch
  async function saveBranch(branchId: number, patch: Partial<ContactBranch>) {
    if (!contact.value) return
    if (!branchId || branchId <= 0) return // must exist in backend

    try {
      await contactStore.updateBranch(contact.value.id, branchId, patch)

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Branch updated",
        life: 1500,
      })
    } catch (e) {
      toast.add({
        severity: "error",
        summary: "Failed to save branch",
        detail: errMsg(e),
        life: 4000,
      })
    }
  }

  // ---------------------------
  // BRANCHES
  // ---------------------------
  async function addBranch() {
    if (!contact.value) return
    busy.value = true
    try {
      await contactStore.createBranch(contact.value.id, {
        ...blankBranch(),
        name: "Head Office",
        billing_same_as_delivery: true,
      })

      toast.add({
        severity: "success",
        summary: "Added",
        detail: "Branch added successfully",
        life: 2500,
      })
    } catch (e) {
      toast.add({
        severity: "error",
        summary: "Failed to add branch",
        detail: errMsg(e),
        life: 4000,
      })
    } finally {
      busy.value = false
    }
  }

  function removeBranch(index: number) {
    if (!contact.value) return

    const branch = contact.value.branches?.[index]
    if (!branch) return

    confirm.require({
      header: "Delete Branch",
      message: "Are you sure you want to delete this branch?",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: async () => {
        busy.value = true
        try {
          if (!branch.id || branch.id < 0) {
            contact.value!.branches!.splice(index, 1)
          } else {
            await contactStore.removeBranch(contact.value!.id, branch.id)
          }

          toast.add({
            severity: "success",
            summary: "Deleted",
            detail: "Branch deleted successfully",
            life: 2500,
          })
        } catch (e) {
          toast.add({
            severity: "error",
            summary: "Failed to delete branch",
            detail: errMsg(e),
            life: 4000,
          })
        } finally {
          busy.value = false
        }
      },
    })
  }

  // ---------------------------
  // COLLECTION ADDRESSES
  // ---------------------------
  async function addCollectionAddress() {
    if (!contact.value) return
    busy.value = true
    try {
      await contactStore.createCollectionAddress(contact.value.id, {
        ...blankCollectionAddress(),
        label: "New collection point",
      })

      toast.add({
        severity: "success",
        summary: "Added",
        detail: "Collection address added successfully",
        life: 2500,
      })
    } catch (e) {
      toast.add({
        severity: "error",
        summary: "Failed to add collection address",
        detail: errMsg(e),
        life: 4000,
      })
    } finally {
      busy.value = false
    }
  }

  async function saveCollectionAddress(id: number, payload: Partial<ContactCollectionAddress>) {
  if (!contact.value) return
  if (!id || id <= 0) return

  try {
    await contactStore.updateCollectionAddress(contact.value.id, id, payload)
    toast.add({ severity: "success", summary: "Saved", detail: "Collection address updated", life: 1500 })
  } catch (e) {
    toast.add({ severity: "error", summary: "Failed to save", detail: errMsg(e), life: 4000 })
  }
}

  function removeCollectionAddressById(id: number) {
    if (!contact.value) return
    if (!id || id <= 0) return

    confirm.require({
      header: "Delete Collection Address",
      message: "Are you sure you want to delete this collection address?",
      icon: "pi pi-exclamation-triangle",
      acceptClass: "p-button-danger",
      accept: async () => {
        busy.value = true
        try {
          await contactStore.removeCollectionAddress(contact.value!.id, id)
          toast.add({ severity: "success", summary: "Deleted", detail: "Collection address deleted", life: 2500 })
        } catch (e) {
          toast.add({ severity: "error", summary: "Failed to delete", detail: errMsg(e), life: 4000 })
        } finally {
          busy.value = false
        }
      },
    })
  }

  onMounted(load)

  return {
    loading,
    contact,
    busy,

    activeTab,
    setTab,

    onEditContact,
    onSendInvoice,

    addBranch,
    removeBranch,
    saveBranch, // ✅ expose

    addCollectionAddress,
    saveCollectionAddress,
    removeCollectionAddressById,

    load,
  }
}