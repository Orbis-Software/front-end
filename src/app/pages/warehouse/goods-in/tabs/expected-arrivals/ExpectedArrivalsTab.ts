import { ref } from "vue"

type ExpectedArrivalRow = {
  id: string
  customer: string
  supplier: string
  description: string
  date: string
  qty: number
  ref: string
  status: string
}

export function useExpectedArrivalsTab() {
  const rows = ref<ExpectedArrivalRow[]>([
    {
      id: "exp1",
      customer: "NovaTech Solutions",
      supplier: "TechSource Ltd",
      description: "Network switches batch 2",
      date: "25 Apr 2026",
      qty: 6,
      ref: "NT-0882",
      status: "Expected",
    },
  ])

  const expectedArrivalOpen = ref(false)

  function onAddExpectedArrival() {
    expectedArrivalOpen.value = true
  }

  function onCloseExpectedArrival() {
    expectedArrivalOpen.value = false
  }

  function onSavedExpectedArrival(payload: any) {
    rows.value.unshift({
      id: `exp-${Date.now()}`,
      customer: payload.customer,
      supplier: payload.supplier,
      description: payload.description,
      date: payload.expectedDate
        ? new Date(payload.expectedDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      qty: payload.qty ?? 0,
      ref: payload.reference || "-",
      status: payload.status || "Expected",
    })

    expectedArrivalOpen.value = false
  }

  return {
    rows,
    expectedArrivalOpen,
    onAddExpectedArrival,
    onCloseExpectedArrival,
    onSavedExpectedArrival,
  }
}
