import type { SelectOption } from "@/app/types/select-option"

export type WarehouseGoodsOption = SelectOption

export type AddExpectedArrivalPayload = {
  customer: string
  supplier: string
  description: string
  expectedDate: Date | null
  qty: number | null
  reference: string
  status: string
  notes: string
}

export type WarehouseGoodsLine = {
  description: string
  qty: number | null
  unit: string
}

export type ReceiveConsignmentLine = WarehouseGoodsLine

export type ReceiveConsignmentPayload = {
  customer: string
  supplier: string
  reference: string
  description: string
  goodsType: string
  packagingType: string
  qty: number | null
  unit: string
  weight: number | null
  cbm: number | null
  location: string
  receivedBy: string
  notes: string
  lines: ReceiveConsignmentLine[]
}

export type WarehouseReceiptLine = WarehouseGoodsLine

export type WarehouseReceiptPayload = {
  receiptNumber: string
  jobReference: string
  receivedDate: Date | null
  customer: string
  supplier: string
  location: string
  receivedBy: string
  notes: string
  lines: WarehouseReceiptLine[]
}
