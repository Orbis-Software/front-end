import type { SelectOption } from "@/app/types/select-option"
import type {
  JobConsolidationChargeLine,
  JobConsolidationDetails,
  JobConsolidationPackageLine,
  JobConsolidationSupplierItem,
  TransportMode,
} from "@/app/types/transport-job"

export type TabId =
  | "overview"
  | "orders"
  | "collections"
  | "load-planner"
  | "invoices"
  | "custinv"
  | "goodsin"

export type Currency = "GBP" | "USD" | "EUR"

export type TransportKey =
  | "bookingRef"
  | "carrier"
  | "originPort"
  | "destinationPort"
  | "finalDestination"
  | "etd"
  | "eta"

export type OverviewDateKey = "jobDate" | "shipDate"

export type ConsolidationSelectOption = SelectOption

export type ConsolidationReferenceOption = ConsolidationSelectOption & {
  subLabel?: string
  searchText: string
}

export type ConsolidationPackageLine = JobConsolidationPackageLine

export type ConsolidationSupplierItem = JobConsolidationSupplierItem

export type ConsolidationSupplierInvoice = {
  id: number
  supplierName: string
  customerPoRef: string
  supplierInvoiceNumber: string
  invoiceDate: string
  currency: Currency
  invoiceValue: number
  collectionRef: string
  label: string
  items: ConsolidationSupplierItem[]
}

export type ConsolidationInvoiceChargeLine = JobConsolidationChargeLine

export type ConsolidationPageOptions = {
  initialDetails?: JobConsolidationDetails | null
  onDetailsChange?: (details: JobConsolidationDetails) => void
  jobNumber?: string | null
  jobDate?: string | Date | null
  mode?: TransportMode | string | null
}
