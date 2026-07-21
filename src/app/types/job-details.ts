import type { Contact, ContactCollectionAddress } from "@/app/types/contact"
import type { ComputedRef, Ref } from "vue"
import type { JobPdfDocument } from "@/app/types/transport-job-service"
import type { SelectOption } from "@/app/types/select-option"
import type {
  JobAirDetail,
  JobConsolidationDetails,
  JobCourierDetail,
  JobInvoiceSummary,
  JobRailDetail,
  JobRoadDetail,
  JobSeaDetail,
  JobType,
  TransportJob,
  TransportMode,
} from "@/app/types/transport-job"

export type JobDetailsTab = {
  label: string
  name: string
  key: string
  showCount?: boolean
  activeNames?: string[]
  children?: JobDetailsTab[]
}

export type JobSelectOption = SelectOption

export type JobStatusStageForm = {
  notes: string
  start_date: string | null
  completion_date: string | null
  pod_receiver_name?: string
  pod_time?: string | null
  pod_date?: string | null
}

export type AddressTarget = "origin" | "destination"

export type AddressSelectOption = {
  label: string
  value: string
  sourceType: AddressSourceType
  sourceId: number
  address: ContactCollectionAddress
}

export type AddressSourceType = "collection_address" | "branch"

export type AddressChoice = {
  id: number
  contact_id: number | null
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
  status_notes: Record<string, JobStatusStageForm>
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
  origin_address_source_type: AddressSourceType | null
  origin_address_source_id: number | null
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
  invoices: JobInvoiceSummary[]
  files: any[]
  upload_files: File[]
  upload_file_types: (string | null)[]
  replace_file_types: string[]

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
  supplier_id: number | "house_account" | null
  chargeCodeId: number | null
  addToSellCharges?: boolean
  linkedSellChargeId?: number | string | null
  quantity: number
  unitCost: number
  markupPercentage: number
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
  unitPrice: number | null
  currency: string
  exchangeRate: number
  vatRate: number
  taxCode: string
  sourceBuyCostId?: number | string | null
  linkedWeightCharge?: boolean
  amount?: number | null
}

export type JobSelectorCardItem<K extends string = string> = {
  key: K
  title: string
  subtitle: string
}

export type JobListTypeFilter = JobType | "all"
export type JobListModeFilter = "all" | "air" | "sea" | "road" | "rail"

export type JobTransportOption = {
  label: string
  value: string | null
}

export type JobTransportDimensionRow = {
  packaging: string | null
  qty: number
  length_cm: number
  width_cm: number
  height_cm: number
  gross_kg: number
  ldm: number
}

export type ExistingTransportOrder = {
  id: string
  carrier: string
  pickup: string
  ref: string
  type: string
  customer?: string
  status: "Confirmed" | "Draft" | "Sent"
}

export type JobTransportOrderFormState = {
  type: string
  collection_address: number | null
  delivery_address: number | null
  order_reference: string
  customer_ref: string
  collection_ref: string
  carrier: string
  pickup_date: Date | null
  pickup_time: string
  delivery_date: Date | null
  delivery_time: string
  hazardous: boolean
  hazardous_class: string | null
  goods_description: string
  dimensions: JobTransportDimensionRow[]
}

export type JobTransportTotals = {
  qty: number
  gross: number
  cube: number
  vol: number
  ldm: number
}

export type JobTransportChargeDisplayRow = {
  id: string
  source: "weight_break" | "customer_flat"
  table_name: string
  description: string
  basis: string
  amount: number
}

export type JobTransportChargeDisplaySummary = {
  weight_table_name: string | null
  customer_table_name: string | null
  rows: JobTransportChargeDisplayRow[]
  total: number
}

export type JobTransportAddressTarget = "collection" | "delivery"

export type JobTransportCustomerOption = SelectOption<number>

export type JobTransportAddressPayload = {
  label: string | null
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
  contact_person: string | null
  phone: string | null
  email: string | null
  special_instructions: string | null
  is_collection: boolean
  is_delivery: boolean
}

export type JobProgressStep = {
  key: string
  number: number
  title: string
  subtitle?: string
  done?: boolean
  active?: boolean
}

export type JobMilestoneStatus = "done" | "active" | "pending"

export type JobMilestone = {
  id: string
  title: string
  subtitle?: string | null
  status: JobMilestoneStatus
  start_date?: string | null
  end_date?: string | null
}

export type JobDocFileType = "pdf" | "doc" | "xls" | "img" | "other"

export type JobUploadedDocument = {
  id: number | string
  name: string
  size_label?: string | null
  uploaded_at_label?: string | null
  uploaded_by?: string | null
  type?: JobDocFileType
}

export type JobExportDoc = {
  key: string
  title: string
  icon?: string
  status?: "ready" | "generate"
}

export type JobPdfActions = {
  pdfLoading: Ref<JobPdfDocument | null>
  isPdfLoading: ComputedRef<boolean>
  loadPdf: (document: JobPdfDocument) => Promise<void>
}

export type JobDetailsSaveOptions = {
  successSummary?: string
  successDetail?: string
  successLife?: number
  silent?: boolean
}

export type JobAddressCustomerOption = {
  label: string
  value: number
  account_number: string
}

export type JobDestinationAddressOwner = "selected_customer" | "other_customer"

export type JobDestinationCustomerOption = JobTransportCustomerOption

export type JobDestinationAddressOption = JobSelectOption

export type JobTransportReferenceOption = {
  label: string
  value: string
  subLabel?: string
  searchText: string
}

export type JobTransportContactOption = {
  label: string
  value: number
  subLabel?: string
  contact: Contact
}

export type JobTransportCountryOption = {
  label: string
  value: string
  subLabel: string
  searchText: string
}

export type JobTransportMultiDropStop = {
  id: number
  company_location: string
  city_postcode: string
  date: string
  stop_type: string
}

export type JobCostSelectOption = {
  label: string
  value: string | number | null
  rate?: number
  calculationType?: "percentage" | "withholding_tax"
  backCalculatedRate?: number | null
}

export type JobCostRow = BuyCostRow | SellChargeRow

export type JobChargeBasisTotals = {
  qty: number
  gross: number
  volume: number
  volumeWeight: number
}

export type JobReferenceOptions = {
  serviceTypeOptions: ComputedRef<JobSelectOption[]>
  incotermOptions: ComputedRef<JobSelectOption[]>
  currencyOptions: ComputedRef<JobSelectOption[]>
  commodityTypeOptions: ComputedRef<JobSelectOption[]>
  insuranceLevelOptions: ComputedRef<JobSelectOption[]>
  dangerousGoodsOptions: ComputedRef<JobSelectOption[]>
  roadLocalCollectionTypeOptions: ComputedRef<JobSelectOption[]>
  roadServiceLevelOptions: ComputedRef<JobSelectOption[]>
  roadLoadTypeOptions: ComputedRef<JobSelectOption[]>
  roadServiceTypeOptions: ComputedRef<JobSelectOption[]>
  vehicleTypeOptions: ComputedRef<JobSelectOption[]>
  palletTypeOptions: ComputedRef<JobSelectOption[]>
  podMethodOptions: ComputedRef<JobSelectOption[]>
  temperatureRequirementOptions: ComputedRef<JobSelectOption[]>
}

export type JobDetailsContext = {
  job: Ref<TransportJob | null>
  form: JobDetailsForm
  loading: ComputedRef<boolean>
  isConsolidationJob: ComputedRef<boolean>
  saving: Ref<boolean>
  save: (options?: JobDetailsSaveOptions) => Promise<void>
  load: () => Promise<void>
  originAddressOptions: ComputedRef<AddressSelectOption[]>
  destinationAddressOptions: ComputedRef<AddressSelectOption[]>
  originAddressSelection: ComputedRef<string | null>
  destinationAddressSelection: ComputedRef<string | null>
  addressContactOptions: ComputedRef<JobAddressCustomerOption[]>
  addressContactsLoading: Ref<boolean>
  addressModalVisible: Ref<boolean>
  addressModalTarget: Ref<AddressTarget>
  addressModalSaving: Ref<boolean>
  addressModalCustomerId: Ref<number | null>
  addressModalCustomerName: Ref<string>
  addressPickerVisible: Ref<boolean>
  addressPickerTarget: Ref<AddressTarget>
  addressPickerContact: Ref<Contact | null>
  selectedDestinationContactId: Ref<number | null>
  destinationAddressOwner: Ref<JobDestinationAddressOwner>
  destinationCustomerOptions: ComputedRef<JobAddressCustomerOption[]>
  selectedCustomerName: ComputedRef<string>
  selectedOriginAddress: ComputedRef<ContactCollectionAddress | null>
  selectedDestinationAddress: ComputedRef<ContactCollectionAddress | null>
  openAddressModal: (target: AddressTarget) => void
  createAndSelectAddress: (payload: JobTransportAddressPayload) => Promise<void>
  selectDestinationAddress: (addressId: number | null) => void
  selectAddressSource: (target: AddressTarget, value: string | null) => void
  onAddressContactFilter: (event: { value?: string }) => void
  selectAddressContact: (target: AddressTarget, contactId: number | null) => Promise<void>
  selectDestinationCustomer: (contactId: number | null) => Promise<void>
  setDestinationAddressOwner: (owner: JobDestinationAddressOwner) => void
  setAddressModalCustomer: (contactId: number | null) => Promise<void>
  chooseAddressSource: (choice: AddressChoice) => void
  referenceOptions: JobReferenceOptions
}
