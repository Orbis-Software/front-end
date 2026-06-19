import type { ContactCollectionAddress } from "@/app/types/contact"
import type {
  JobAirDetail,
  JobConsolidationDetails,
  JobCourierDetail,
  JobRailDetail,
  JobRoadDetail,
  JobSeaDetail,
  JobType,
  TransportMode,
} from "@/app/types/transport-job"

export type JobDetailsTab = {
  label: string
  name: string
  key: string
  showCount?: boolean
}

export type SelectOption = {
  label: string
  value: string
}

export type AddressTarget = "origin" | "destination"

export type AddressSelectOption = {
  label: string
  value: number
  address: ContactCollectionAddress
}

export type AddressSourceType = "collection_address" | "branch"

export type AddressChoice = {
  id: number
  sourceType: AddressSourceType
  label: string
  ownerName: string
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
  country_name: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  is_collection: boolean
  is_delivery: boolean
  special_instructions: string | null
}

export type JobDetailsForm = {
  customer_id: number | null
  account_number: string
  quote_ref: string
  job_number: string
  job_date: Date | null
  job_type: JobType | ""
  mode_of_transport: TransportMode | null
  status: string
  note: string

  order_type: string
  consignment_number: string
  service_type: string
  incoterms: string
  currency: string
  declared_value: number | null
  description_of_goods: string
  commodity_code: string
  hs_code: string
  insurance_level: string
  is_hazardous: boolean | null
  hazardous_class: string
  un_number: string
  temperature_requirement: string

  customer_po_number: string
  customer_booking_ref: string
  our_reference: string
  supplier_ref: string

  consignee_name: string
  consignee_contact: string
  consignee_phone: string
  consignee_email: string

  origin_contact_collection_address_id: number | null
  destination_contact_collection_address_id: number | null
  destination_address_source_type: AddressSourceType | null
  destination_address_source_id: number | null
  collection_date: Date | null
  collection_time: string
  latest_collection_time: string
  delivery_date: Date | null
  delivery_from_time: string
  delivery_by_time: string
  loading_reference: string
  delivery_booking_ref: string
  collection_instructions: string
  delivery_instructions: string

  packages: any[]
  charges: any[]
  buy_costs: any[]
  sell_costs: any[]
  files: any[]

  road_detail: JobRoadDetail
  sea_detail: JobSeaDetail
  air_detail: JobAirDetail
  rail_detail: JobRailDetail
  courier_detail: JobCourierDetail

  transport_legs: any[]
  multi_modal_legs: any[]
  consolidation_details: JobConsolidationDetails
}

export type JobTransportTabMode = "" | "road" | "rail" | "sea" | "air" | "courier" | "multi_modal"

export type MultiModalLegMode = "road" | "rail" | "sea" | "air" | "courier"

export type MultiModalLeg = {
  id: number
  mode: MultiModalLegMode

  carrier: string
  reference: string
  origin: string
  destination: string
  etd: string
  eta: string
  notes: string

  vehicle_type: string
  driver_name: string
  driver_mobile: string

  vessel: string
  voyage: string
  container: string

  airline: string
  flight: string
  awb: string

  train: string
  wagon: string

  tracking: string
  service: string
  extra_data: Record<string, any>
}

export type PackageRow = {
  id: number | string
  package_type: string | null
  description: string | null
  stackable: boolean
  atTheTop: boolean
  adr: boolean
  quantity: number
  lengthCm: number
  widthCm: number
  heightCm: number
  grossWeightKg: number
  volumeWeightKg: number
  cbm: number
}

export type BuyCostRow = {
  id: number | string
  type: "buy"
  description: string
  supplier_id: number | null
  chargeCodeId: number | null
  quantity: number
  unitCost: number
  currency: string
  exchangeRate: number
  amount?: number | null
}

export type SellChargeRow = {
  id: number | string
  type: "sell"
  description: string
  chargeCodeId: number | null
  chargeCode: string
  quantity: number
  unitPrice: number
  currency: string
  exchangeRate: number
  vatRate: number
  taxCode: string
  amount?: number | null
}
