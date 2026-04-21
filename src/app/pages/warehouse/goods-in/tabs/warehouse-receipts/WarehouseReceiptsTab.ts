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

type WarehouseReceiptPayload = {
  receiptNumber: string
  jobReference: string
  receivedDate: Date | null
  customer: string
  supplier: string
  location: string
  receivedBy: string
  notes: string
  lines: Array<{
    description: string
    qty: number | null
    unit: string
  }>
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

  const warehouseReceiptOpen = ref(false)

  function onOpenWarehouseReceipt() {
    warehouseReceiptOpen.value = true
  }

  function onCloseWarehouseReceipt() {
    warehouseReceiptOpen.value = false
  }

  function onSavedWarehouseReceipt(payload: WarehouseReceiptPayload) {
    const totalPieces = payload.lines.reduce((sum, line) => {
      return sum + (line.qty ?? 0)
    }, 0)

    rows.value.unshift({
      id: `wr-${Date.now()}`,
      wrNumber: payload.receiptNumber,
      jobRef: payload.jobReference,
      customer: payload.customer,
      supplier: payload.supplier,
      date: payload.receivedDate
        ? new Date(payload.receivedDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      pieces: totalPieces,
      grossWeight: "-",
      attachments: 0,
    })

    warehouseReceiptOpen.value = false
  }

  return {
    rows,
    warehouseReceiptOpen,
    onOpenWarehouseReceipt,
    onCloseWarehouseReceipt,
    onSavedWarehouseReceipt,
  }
}
