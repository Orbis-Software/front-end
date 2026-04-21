import { ref } from "vue"

type ExpectedArrivalRow = {
  id: string
  customer: string
  supplier: string
  description: string
  date: string
  qty: number
  ref: string
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
    },
  ])

  function onAddExpectedArrival() {
    window.alert("Add Expected Arrival modal will be added next.")
  }

  return {
    rows,
    onAddExpectedArrival,
  }
}
