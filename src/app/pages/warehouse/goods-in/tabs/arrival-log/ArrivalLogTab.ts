import { computed, ref } from "vue"

type ArrivalLogRow = {
  id: string
  customer: string
  supplier: string
  description: string
  qty: number
  weight: string
  location: string
  date: string
}

type Option = {
  label: string
  value: string
}

export function useArrivalLogTab() {
  const search = ref("")
  const selectedCustomer = ref("")
  const selectedSupplier = ref("")

  const rows = ref<ArrivalLogRow[]>([
    {
      id: "CON-A1B2C3",
      customer: "Greenfield Imports",
      supplier: "TechSource Ltd",
      description: "Consumer electronics - earbuds & chargers",
      qty: 4,
      weight: "320kg",
      location: "A01-L1",
      date: "21 Apr 2026",
    },
    {
      id: "CON-D4E5F6",
      customer: "Greenfield Imports",
      supplier: "Global Imports Co",
      description: "Ceramic kitchenware assortment",
      qty: 12,
      weight: "180kg",
      location: "A01-L3",
      date: "20 Apr 2026",
    },
    {
      id: "CON-G7H8I9",
      customer: "NovaTech Solutions",
      supplier: "TechSource Ltd",
      description: "Server rack components",
      qty: 2,
      weight: "540kg",
      location: "A02-L1",
      date: "18 Apr 2026",
    },
  ])

  const customerOptions = computed<Option[]>(() => [
    { label: "All Customers", value: "" },
    ...Array.from(new Set(rows.value.map(row => row.customer))).map(value => ({
      label: value,
      value,
    })),
  ])

  const supplierOptions = computed<Option[]>(() => [
    { label: "All Suppliers", value: "" },
    ...Array.from(new Set(rows.value.map(row => row.supplier))).map(value => ({
      label: value,
      value,
    })),
  ])

  const filteredRows = computed(() => {
    return rows.value.filter(row => {
      const matchesSearch =
        !search.value ||
        [row.id, row.customer, row.supplier, row.description, row.location, row.date]
          .join(" ")
          .toLowerCase()
          .includes(search.value.toLowerCase())

      const matchesCustomer = !selectedCustomer.value || row.customer === selectedCustomer.value

      const matchesSupplier = !selectedSupplier.value || row.supplier === selectedSupplier.value

      return matchesSearch && matchesCustomer && matchesSupplier
    })
  })

  function onSearchInput(value: string) {
    search.value = value
  }

  return {
    search,
    selectedCustomer,
    selectedSupplier,
    customerOptions,
    supplierOptions,
    rows,
    filteredRows,
    onSearchInput,
  }
}
