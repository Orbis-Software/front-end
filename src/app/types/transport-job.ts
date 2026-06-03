import type { Contact, ContactCollectionAddress } from "@/app/types/contact"
import type { JobFile } from "@/app/types/job-file"

export type JobType =
  | "import"
  | "export"
  | "domestic"
  | "courier"
  | "multi_modal"
  | "consolidation"
  | "cross_trade"

export type TransportMode =
  | "air"
  | "rail"
  | "road"
  | "sea"
  | "courier"
  | "multi_modal"

export const TRANSPORT_MODES: TransportMode[] = [
  "air",
  "rail",
  "road",
  "sea",
  "courier",
  "multi_modal",
]

export interface TransportJobCreator {
  id: number
  name: string | null
  email: string | null
}

export interface JobRoadDetail {
  id?: number
  job_id?: number
  service_type?: string | null
  vehicle_type?: string | null
  origin_city?: string | null
  destination_city?: string | null
  final_destination?: string | null
  estimated_transit_days?: number | null
  estimated_distance_km?: number | null
  carrier?: string | null
  trailer_number?: string | null
  driver_name?: string | null
  driver_mobile?: string | null
  pallet_spaces?: number | null
  pallet_type?: string | null
  cmr_number?: string | null
  pod_method?: string | null
  notes?: string | null
}

export interface JobSeaDetail {
  id?: number
  job_id?: number
  shipping_line?: string | null
  vessel_name?: string | null
  voyage_number?: string | null
  shipment_type?: string | null
  container_number?: string | null
  container_size?: string | null
  seal_number?: string | null
  container_tare_kg?: number | null
  master_bl_number?: string | null
  house_bl_number?: string | null
  bl_type?: string | null
  freight_terms?: string | null
  port_of_loading?: string | null
  port_of_discharge?: string | null
  transhipment_port?: string | null
  final_destination?: string | null
  etd?: string | null
  eta?: string | null
  cut_off_date?: string | null
  cut_off_time?: string | null
  free_days_demurrage?: number | null
  free_days_detention?: number | null
  return_depot?: string | null
  return_date?: string | null
  notes?: string | null
}

export interface JobAirDetail {
  id?: number
  job_id?: number
  airline?: string | null
  flight_number?: string | null
  mawb_number?: string | null
  hawb_number?: string | null
  airport_of_departure?: string | null
  airport_of_arrival?: string | null
  via_transhipment?: string | null
  final_destination?: string | null
  shipment_type?: string | null
  etd?: string | null
  eta?: string | null
  cut_off_date?: string | null
  cut_off_time?: string | null
  uld_type?: string | null
  uld_number?: string | null
  chargeable_weight?: number | null
  rate_per_kg?: number | null
  notes?: string | null
}

export interface JobRailDetail {
  id?: number
  job_id?: number
  rail_operator?: string | null
  train_number?: string | null
  wagon_number?: string | null
  container_number?: string | null
  container_type?: string | null
  loading_terminal?: string | null
  discharge_terminal?: string | null
  final_destination?: string | null
  estimated_transit_days?: number | null
  departure_date?: string | null
  departure_time?: string | null
  arrival_date?: string | null
  arrival_time?: string | null
  notes?: string | null
}

export interface JobCourierDetail {
  id?: number
  job_id?: number
  courier_service?: string | null
  carrier?: string | null
  tracking_number?: string | null
  final_destination?: string | null
  vehicle_type?: string | null
  driver_name?: string | null
  driver_mobile?: string | null
  estimated_distance_miles?: number | null
  rate_per_mile?: number | null
  signature_required?: boolean | number | null
  pod_method?: string | null
  exact_delivery_time?: string | null
  parking_access_code?: string | null
  notes?: string | null
}

export interface JobTransportLeg {
  id?: number
  job_id?: number
  sequence?: number | null
  mode: Exclude<TransportMode, "multi_modal">
  carrier?: string | null
  reference?: string | null
  origin?: string | null
  destination?: string | null
  etd?: string | null
  eta?: string | null
  notes?: string | null
  extra_data?: Record<string, any> | null
}

export interface JobPackage {
  id?: number
  job_id?: number

  package_type?: string | null
  stackable?: boolean | null
  at_the_top?: boolean | null
  adr?: boolean | null
  quantity?: number | null

  length_cm?: number | null
  width_cm?: number | null
  height_cm?: number | null

  weight?: number | null
  volume?: number | null
  volume_weight_kg?: number | null

  description?: string | null
}

export interface JobCharge {
  id?: number
  job_id?: number
  type: "buy" | "sell"
  description?: string | null
  currency?: string | null
  amount?: number | null
}

export type JobConsolidationCurrency = "GBP" | "USD" | "EUR" | string

export interface JobConsolidationPackageLine {
  id: number
  packageType: string
  stackable: boolean
  atTheTop: boolean
  qty: number
  length: number
  width: number
  height: number
  netWeight: number
  grossWeight: number
  adr: boolean
}

export interface JobConsolidationSupplierItem {
  id: number
  packageType: string
  collie: number
  length: number
  width: number
  height: number
  stackable: boolean
  atTheTop: boolean
  net: number
  gross: number
  adr: "Yes" | "No"
}

export interface JobConsolidationSupplierInvoice {
  id: number
  supplierName: string
  customerPoRef: string
  supplierInvoiceNumber: string
  invoiceDate: string
  currency: JobConsolidationCurrency
  invoiceValue: number
  collectionRef: string
  label: string
  items: JobConsolidationSupplierItem[]
}

export interface JobConsolidationCollectionOrder {
  id: number
  coRef: string
  customerRef: string
  collectionRef: string
  supplier: string
  pickupDate: string
  pickupTime: string
  vehicle: string
  collectionAddress: string
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
  goodsDescription: string
  hazardous: boolean
  adrClass: string
  freight: number
  fscPct: number
  additional: number
  pcs: number
  weightKg: number
  volumeCbm: number
  ldm: number
  status: string
  notes: string
  wmsRef: string
  lines: JobConsolidationPackageLine[]
}

export interface JobConsolidationGoodsRow {
  id: number
  grn: string
  supplier: string
  supplierInvoice: string
  supplierPO: string
  partNo: string
  desc: string
  pcs: number
  weightKg: number
  cbm: number
  location: string
  status: string
}

export interface JobConsolidationInvoiceLine {
  id: number
  invoiceCurrency: JobConsolidationCurrency
  poRef: string
  shippingLabelNo: string
  description: string
  qty: number
  uom: string
  countryOfOrigin: string
  hsCode: string
  unitPrice: number
  supplier: string
  grn: string
}

export interface JobConsolidationChargeLine {
  id: number
  description: string
  qty: number
  unit: string
  rate: number
  sourceType?: "domestic" | "export" | "manual"
  sourceId?: number | string
}

export interface JobConsolidationPostedInvoice {
  posted: boolean
  ref: string
  date: string
}

export interface JobConsolidationFinalDelivery {
  deliveryRef: string
  plannedDate: string
  plannedTime: string
  carrier: string
  address: string
  instructions: string
}

export interface JobConsolidationQuoteDetails {
  reference: string
  validUntil: string
  status: string
  notes: string
  terms: string
}

export interface JobConsolidationOverviewSnapshot {
  jobNo: string
  jobDate: string
  mode: string
  invoiceCurrency: JobConsolidationCurrency
  shipDate: string
  shipFrom: string
  exitIncoterm: string
  entryIncoterm: string
  customer: string
  notifyParty: string
  shipper: string
  deliveryAddress: string
  goodsDescription: string
  instructions: string
  exportCustomsRef: string
  importCustomsRef: string
}

export interface JobConsolidationTransportSnapshot {
  bookingRef: string
  carrier: string
  originPort: string
  destinationPort: string
  finalDestination: string
  etd: string
  eta: string
}

export interface JobConsolidationDetails {
  overview: JobConsolidationOverviewSnapshot
  transport: JobConsolidationTransportSnapshot
  supplierInvoices: JobConsolidationSupplierInvoice[]
  supplierExaNumbers: Record<string, string>
  collectionOrders: JobConsolidationCollectionOrder[]
  goodsRows: JobConsolidationGoodsRow[]
  consolidatedLines: JobConsolidationInvoiceLine[]
  domesticChargeRows: JobConsolidationChargeLine[]
  exportChargeRows: JobConsolidationChargeLine[]
  quoteLines: JobConsolidationChargeLine[]
  domesticInvoice: JobConsolidationPostedInvoice
  exportInvoice: JobConsolidationPostedInvoice
  finalDelivery: JobConsolidationFinalDelivery
  quote: JobConsolidationQuoteDetails
  selectedInvoiceCurrency: JobConsolidationCurrency
  consolidatedFreightCharge: number
  taxRate: number
  showQuotePanel: boolean
}

export interface TransportJob {
  id: number
  company_id: number

  created_by?: number | null
  creator?: TransportJobCreator | null

  customer_id?: number | null
  account_number?: string | null
  customer_account_number?: string | null

  quote_ref?: string | null
  job_number: string
  job_date?: string | null

  mode_of_transport: TransportMode | null
  job_type: JobType
  status?: string | null

  service_type?: string | null
  incoterms?: string | null
  currency?: string | null
  declared_value?: number | null
  description_of_goods?: string | null
  commodity_code?: string | null
  insurance_level?: string | null

  customer_po_number?: string | null
  customer_booking_ref?: string | null
  our_reference?: string | null
  supplier_ref?: string | null

  consignee_name?: string | null
  consignee_contact?: string | null
  consignee_phone?: string | null
  consignee_email?: string | null

  note?: string | null

  customer_contact?: Contact | null
  origin_contact_collection_address_id?: number | null
  destination_contact_collection_address_id?: number | null
  origin_address?: ContactCollectionAddress | null
  destination_address?: ContactCollectionAddress | null
  collection_date?: string | null
  collection_time?: string | null

  road_detail?: JobRoadDetail | null
  sea_detail?: JobSeaDetail | null
  air_detail?: JobAirDetail | null
  rail_detail?: JobRailDetail | null
  courier_detail?: JobCourierDetail | null

  transport_legs?: JobTransportLeg[]
  packages?: JobPackage[]
  charges?: JobCharge[]
  consolidation_details?: JobConsolidationDetails | null

  files: JobFile[]

  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface BaseTransportJobCreatePayload {
  customer_id?: number | null
  account_number?: string | null
  quote_ref?: string | null
  job_number?: string | null
  job_date?: string | null
  status?: string | null

  service_type?: string | null
  incoterms?: string | null
  currency?: string | null
  declared_value?: number | null
  description_of_goods?: string | null
  commodity_code?: string | null
  insurance_level?: string | null

  customer_po_number?: string | null
  customer_booking_ref?: string | null
  our_reference?: string | null
  supplier_ref?: string | null

  consignee_name?: string | null
  consignee_contact?: string | null
  consignee_phone?: string | null
  consignee_email?: string | null

  note?: string | null
  origin_contact_collection_address_id?: number | null
  destination_contact_collection_address_id?: number | null
  collection_date?: string | null
  collection_time?: string | null
  road_detail?: JobRoadDetail | null
  sea_detail?: JobSeaDetail | null
  air_detail?: JobAirDetail | null
  rail_detail?: JobRailDetail | null
  courier_detail?: JobCourierDetail | null
  transport_legs?: JobTransportLeg[] | null
  packages?: JobPackage[] | null
  charges?: JobCharge[] | null
  consolidation_details?: JobConsolidationDetails | null

  files?: File[]
  file_types?: (string | null)[]
}

export type TransportJobCreatePayload =
  | (BaseTransportJobCreatePayload & {
      job_type: "multi_modal"
      mode_of_transport: "multi_modal"
    })
  | (BaseTransportJobCreatePayload & {
      job_type: "consolidation"
      mode_of_transport: TransportMode
    })
  | (BaseTransportJobCreatePayload & {
      job_type: Exclude<JobType, "multi_modal" | "consolidation">
      mode_of_transport: TransportMode
    })

export interface TransportJobUpdatePayload extends Partial<BaseTransportJobCreatePayload> {
  account_number?: string | null
  job_type?: JobType
  mode_of_transport?: TransportMode | null
  status?: string | null

  service_type?: string | null
  incoterms?: string | null
  currency?: string | null
  declared_value?: number | null
  description_of_goods?: string | null
  commodity_code?: string | null
  insurance_level?: string | null

  customer_po_number?: string | null
  customer_booking_ref?: string | null
  our_reference?: string | null
  supplier_ref?: string | null

  consignee_name?: string | null
  consignee_contact?: string | null
  consignee_phone?: string | null
  consignee_email?: string | null

  origin_contact_collection_address_id?: number | null
  destination_contact_collection_address_id?: number | null
  collection_date?: string | null
  collection_time?: string | null

  road_detail?: JobRoadDetail | null
  sea_detail?: JobSeaDetail | null
  air_detail?: JobAirDetail | null
  rail_detail?: JobRailDetail | null
  courier_detail?: JobCourierDetail | null

  transport_legs?: JobTransportLeg[] | null
  packages?: JobPackage[] | null
  charges?: JobCharge[] | null
  consolidation_details?: JobConsolidationDetails | null
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: PaginationMeta
  links?: any
}
