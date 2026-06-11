import { inject } from "vue"

import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import type {
  JobConsolidationChargeLine,
  JobConsolidationCollectionOrder,
  JobConsolidationCurrency,
  JobConsolidationGoodsRow,
  JobConsolidationInvoiceLine,
  JobConsolidationPackageLine,
  JobConsolidationSupplierInvoice,
  JobConsolidationSupplierItem,
} from "@/app/types/transport-job"

export const currencyOptions: JobConsolidationCurrency[] = ["GBP", "USD", "EUR"]
export const packageOptions = ["Carton", "Pallet", "Crate", "Jiffy", "Loose"]
export const unitOptions = [
  "Fixed",
  "Per kg",
  "Per CBM",
  "Per Piece",
  "Per Pallet",
  "Per Container",
]
export const vehicleOptions = ["Van", "7.5t", "18t", "Artic", "Container"]
export const carrierOptions = ["DHL", "Kuehne+Nagel", "DSV", "FedEx", "Manual Entry"]
export const chargeOptions = [
  "Consolidation handling",
  "Export documentation",
  "Domestic collection",
  "Fuel surcharge",
  "Customs clearance",
  "Delivery",
]
export const quoteStatusOptions = ["Draft", "Sent", "Accepted", "Declined"]
export const adrClassOptions = [
  { label: "Class 1 - Explosives", value: "1" },
  { label: "Class 2.1 - Flammable Gas", value: "2.1" },
  { label: "Class 2.2 - Non-Flammable Gas", value: "2.2" },
  { label: "Class 3 - Flammable Liquid", value: "3" },
  { label: "Class 4.1 - Flammable Solid", value: "4.1" },
  { label: "Class 5.1 - Oxidising Substance", value: "5.1" },
  { label: "Class 6.1 - Toxic Substance", value: "6.1" },
  { label: "Class 8 - Corrosive Substance", value: "8" },
  { label: "Class 9 - Miscellaneous Dangerous Goods", value: "9" },
]

export function useJobConsolidationContext() {
  const context = inject<JobDetailsContext>("jobDetails")

  if (!context) {
    throw new Error("Consolidation tabs must be used inside JobDetailsPage.")
  }

  return context
}

export function makeId(): number {
  return Math.floor(Date.now() + Math.random() * 100000)
}

export function money(currency: string, value: number | string | null | undefined): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
  }).format(Number(value || 0))
}

export function nextRef(prefix: string, count: number, width = 3): string {
  return `${prefix}-${String(count + 1).padStart(width, "0")}`
}

export function packageCbm(line: JobConsolidationPackageLine): number {
  return (
    (Number(line.qty || 0) *
      Number(line.length || 0) *
      Number(line.width || 0) *
      Number(line.height || 0)) /
    1_000_000
  )
}

export function packageLdm(line: JobConsolidationPackageLine): number {
  return (Number(line.qty || 0) * Number(line.length || 0) * Number(line.width || 0)) / 24000
}

export function supplierItemCbm(item: JobConsolidationSupplierItem): number {
  return (
    (Number(item.collie || 0) *
      Number(item.length || 0) *
      Number(item.width || 0) *
      Number(item.height || 0)) /
    1_000_000
  )
}

export function collectionTotals(lines: JobConsolidationPackageLine[]) {
  return lines.reduce(
    (sum, line) => {
      sum.pieces += Number(line.qty || 0)
      sum.weight += Number(line.grossWeight || 0)
      sum.volume += packageCbm(line)
      sum.ldm += packageLdm(line)
      return sum
    },
    { pieces: 0, weight: 0, volume: 0, ldm: 0 },
  )
}

export function supplierInvoiceTotals(invoice: JobConsolidationSupplierInvoice) {
  return invoice.items.reduce(
    (sum, item) => {
      sum.collies += Number(item.collie || 0)
      sum.net += Number(item.net || 0)
      sum.gross += Number(item.gross || 0)
      sum.cbm += supplierItemCbm(item)
      return sum
    },
    { collies: 0, net: 0, gross: 0, cbm: 0 },
  )
}

export function calcWeightBreakCost(weightKg: number): number {
  if (weightKg <= 0) return 0
  if (weightKg <= 50) return 45
  if (weightKg <= 250) return weightKg * 0.85
  if (weightKg <= 500) return weightKg * 0.72
  return weightKg * 0.62
}

export function createPackageLine(): JobConsolidationPackageLine {
  return {
    id: makeId(),
    packageType: "Carton",
    stackable: true,
    atTheTop: false,
    qty: 1,
    length: 0,
    width: 0,
    height: 0,
    netWeight: 0,
    grossWeight: 0,
    adr: false,
  }
}

export function createSupplierItem(): JobConsolidationSupplierItem {
  return {
    id: makeId(),
    packageType: "Carton",
    collie: 1,
    length: 0,
    width: 0,
    height: 0,
    stackable: true,
    atTheTop: false,
    net: 0,
    gross: 0,
    adr: "No",
  }
}

export function createCollectionOrder(): JobConsolidationCollectionOrder {
  return {
    id: makeId(),
    coRef: "",
    customerRef: "",
    collectionRef: "",
    supplier: "DHL",
    pickupDate: "",
    pickupTime: "",
    vehicle: null,
    collectionAddress: "",
    deliveryAddress: "",
    deliveryDate: "",
    deliveryTime: "",
    goodsDescription: "",
    hazardous: false,
    adrClass: "",
    freight: 0,
    fscPct: 0,
    additional: 0,
    pcs: 0,
    weightKg: 0,
    volumeCbm: 0,
    ldm: 0,
    status: "Created",
    notes: "",
    wmsRef: "",
    lines: [createPackageLine()],
  }
}

export function createGoodsRow(): JobConsolidationGoodsRow {
  return {
    id: makeId(),
    grn: "",
    supplier: "",
    supplierInvoice: "",
    supplierPO: "",
    partNo: "-",
    desc: "",
    pcs: 0,
    weightKg: 0,
    cbm: 0,
    location: "STAGING",
    status: "Received",
  }
}

export function createConsolidatedLine(
  currency: JobConsolidationCurrency,
): JobConsolidationInvoiceLine {
  return {
    id: makeId(),
    invoiceCurrency: currency,
    poRef: "",
    shippingLabelNo: "",
    description: "New consolidated item",
    qty: 1,
    uom: "Fixed",
    countryOfOrigin: "",
    hsCode: "",
    unitPrice: 0,
    supplier: "",
    grn: "",
  }
}

export function createChargeLine(
  description = "Consolidation handling",
): JobConsolidationChargeLine {
  return {
    id: makeId(),
    description,
    qty: 1,
    unit: "Fixed",
    rate: 0,
    sourceType: "manual",
    sourceId: makeId(),
  }
}
