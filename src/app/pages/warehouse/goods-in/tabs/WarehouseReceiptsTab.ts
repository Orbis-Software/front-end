import { ref } from "vue"

type WarehouseReceiptRow = {
  id: string
  wrNumber: string
  jobRef: string
  customer: string
  supplier: string
  date: string
  pieces: number
  grossWeight: string
  attachments: number
}

export function useWarehouseReceiptsTab() {
  const rows = ref<WarehouseReceiptRow[]>([
    {
      id: "wr1",
      wrNumber: "WR-9A73CF",
      jobRef: "PO-2026-441",
      customer: "Greenfield Imports",
      supplier: "TechSource Ltd",
      date: "21 Apr 2026",
      pieces: 4,
      grossWeight: "320",
      attachments: 2,
    },
  ])

  return {
    rows,
  }
}
