import { computed, ref } from "vue"

export type BuyCostRow = {
  id: number
  description: string
  supplier: string
  quantity: number
  unitCost: number
  currency: string
}

export type SellChargeRow = {
  id: number
  description: string
  chargeCode: string
  quantity: number
  unitPrice: number
  currency: string
  vatRate: number
}

let buyId = 1
let sellId = 1

function createBuyRow(): BuyCostRow {
  return {
    id: buyId++,
    description: "",
    supplier: "",
    quantity: 1,
    unitCost: 0,
    currency: "GBP",
  }
}

function createSellRow(): SellChargeRow {
  return {
    id: sellId++,
    description: "",
    chargeCode: "",
    quantity: 1,
    unitPrice: 0,
    currency: "GBP",
    vatRate: 20,
  }
}

export function useJobCostsTab() {
  const buyRows = ref<BuyCostRow[]>([createBuyRow()])
  const sellRows = ref<SellChargeRow[]>([createSellRow()])

  function addBuyRow() {
    buyRows.value.push(createBuyRow())
  }

  function addSellRow() {
    sellRows.value.push(createSellRow())
  }

  function removeBuyRow(id: number) {
    buyRows.value = buyRows.value.filter(row => row.id !== id)
  }

  function removeSellRow(id: number) {
    sellRows.value = sellRows.value.filter(row => row.id !== id)
  }

  const totals = computed(() => {
    const totalBuy = buyRows.value.reduce((sum, row) => {
      return sum + Number(row.quantity || 0) * Number(row.unitCost || 0)
    }, 0)

    const totalSell = sellRows.value.reduce((sum, row) => {
      return sum + Number(row.quantity || 0) * Number(row.unitPrice || 0)
    }, 0)

    return {
      totalBuy,
      totalSell,
      margin: totalSell - totalBuy,
    }
  })

  return {
    buyRows,
    sellRows,
    totals,
    addBuyRow,
    addSellRow,
    removeBuyRow,
    removeSellRow,
  }
}
