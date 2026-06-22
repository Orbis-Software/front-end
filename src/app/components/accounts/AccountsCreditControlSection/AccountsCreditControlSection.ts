import { computed, onMounted, ref } from "vue"

import contactsService from "@/app/services/contacts"
import { useAccountsCreditControlStore } from "@/app/stores/accounts-credit-control"

export function useAccountsCreditControlSection() {
  const creditControlStore = useAccountsCreditControlStore()
  const selectedCustomerId = ref<number | null>(null)
  const savingHold = ref(false)
  const localErrorMessage = ref("")

  const rows = computed(() => creditControlStore.rows)
  const loading = computed(() => creditControlStore.loading)
  const errorMessage = computed(() => localErrorMessage.value || creditControlStore.error || "")

  const selectedCustomer = computed(() => {
    if (selectedCustomerId.value !== null) {
      const selected = rows.value.find(row => row.customerId === selectedCustomerId.value)
      if (selected) return selected
    }

    return rows.value[0] ?? null
  })

  function money(value: number, currency = "GBP") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0)
  }

  async function fetchCreditControl(preferredCustomerId = selectedCustomerId.value) {
    localErrorMessage.value = ""

    try {
      await creditControlStore.fetch()

      if (rows.value.some(row => row.customerId === preferredCustomerId)) {
        selectedCustomerId.value = preferredCustomerId
      } else {
        selectedCustomerId.value = rows.value[0]?.customerId ?? null
      }
    } catch {
      selectedCustomerId.value = null
    }
  }

  async function toggleHold() {
    if (!selectedCustomer.value) return
    if (!selectedCustomer.value.customerId) {
      localErrorMessage.value =
        "This invoice is not linked to a customer contact, so hold cannot be changed."
      return
    }

    const customerId = selectedCustomer.value.customerId
    const nextStatus = selectedCustomer.value.onHold ? "active" : "on_hold"

    savingHold.value = true
    localErrorMessage.value = ""

    try {
      await contactsService.update(customerId, { status: nextStatus })
      await fetchCreditControl(customerId)
    } catch {
      localErrorMessage.value = "Unable to update customer hold status."
    } finally {
      savingHold.value = false
    }
  }

  onMounted(() => {
    void fetchCreditControl()
  })

  return {
    rows,
    selectedCustomerId,
    loading,
    savingHold,
    errorMessage,
    selectedCustomer,
    money,
    toggleHold,
  }
}
