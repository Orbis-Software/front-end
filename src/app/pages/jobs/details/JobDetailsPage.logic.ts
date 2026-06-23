import { computed, nextTick, onMounted, onUnmounted, provide, reactive, ref, watch } from "vue"
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"

import { useTransportJobStore } from "@/app/stores/transport-job"
import { useContactStore } from "@/app/stores/contact"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type { Contact, ContactBranch, ContactCollectionAddress } from "@/app/types/contact"
import contactsService from "@/app/services/contacts"
import type {
  AddressChoice,
  AddressSelectOption,
  AddressSourceType,
  AddressTarget,
  JobDetailsForm,
  JobDetailsTab,
  SelectOption,
} from "@/app/types/job-details"

import {
  TRANSPORT_MODES,
  type JobConsolidationChargeLine,
  type JobConsolidationCollectionOrder,
  type JobConsolidationDetails,
  type JobConsolidationGoodsRow,
  type JobConsolidationInvoiceLine,
  type JobConsolidationOverviewSnapshot,
  type JobConsolidationPackageLine,
  type JobConsolidationPostedInvoice,
  type JobConsolidationQuoteDetails,
  type JobConsolidationSupplierInvoice,
  type JobConsolidationSupplierItem,
  type JobConsolidationTransportSnapshot,
  type JobAirDetail,
  type JobCharge,
  type JobCourierDetail,
  type JobRailDetail,
  type JobRoadDetail,
  type JobSeaDetail,
  type TransportJob,
  type TransportJobUpdatePayload,
  type TransportMode,
} from "@/app/types/transport-job"
import type { JobTransportAddressPayload } from "@/app/components/jobs/details/JobTransportTab/JobTransportAddressModal.vue"

const jobRef = ref<TransportJob | null>(null)
const savingRef = ref(false)
const selectedCustomerRef = ref<Contact | null>(null)
const addressModalVisibleRef = ref(false)
const addressModalTargetRef = ref<AddressTarget>("origin")
const addressModalSavingRef = ref(false)
const addressPickerVisibleRef = ref(false)
const addressPickerTargetRef = ref<AddressTarget>("destination")
const addressPickerContactRef = ref<Contact | null>(null)
const selectedDestinationContactIdRef = ref<number | null>(null)
const initialLoadingRef = ref(false)
const customerContactsRef = ref<Contact[]>([])
const destinationContactsRef = ref<Contact[]>([])
const customerOptionsLoadingRef = ref(false)
const addressContactsLoadingRef = ref(false)
let customerSearchTimer: ReturnType<typeof setTimeout> | null = null
let addressContactSearchTimer: ReturnType<typeof setTimeout> | null = null

const AUTOSAVE_IDLE_DELAY_MS = 30000
const AUTOSAVE_ACTIVE_FIELD_RETRY_MS = 5000

export type JobDetailsContext = {
  job: typeof jobRef
  form: JobDetailsForm
  loading: any
  isConsolidationJob: any
  saving: typeof savingRef
  save: (options?: SaveOptions) => Promise<void>
  load: () => Promise<void>
  originAddressOptions: any
  destinationAddressOptions: any
  addressContactOptions: any
  addressContactsLoading: any
  addressModalVisible: any
  addressModalTarget: any
  addressModalSaving: any
  addressPickerVisible: any
  addressPickerTarget: any
  addressPickerContact: any
  selectedDestinationContactId: any
  selectedOriginAddress: any
  selectedDestinationAddress: any
  openAddressModal: (target: AddressTarget) => void
  createAndSelectAddress: (payload: JobTransportAddressPayload) => Promise<void>
  onAddressContactFilter: (event: { value?: string }) => void
  selectAddressContact: (target: AddressTarget, contactId: number | null) => Promise<void>
  chooseAddressSource: (choice: AddressChoice) => void
  referenceOptions: {
    serviceTypeOptions: any
    incotermOptions: any
    currencyOptions: any
    commodityTypeOptions: any
    insuranceLevelOptions: any
    dangerousGoodsOptions: any
    roadLocalCollectionTypeOptions: any
    roadServiceLevelOptions: any
    roadLoadTypeOptions: any
    roadServiceTypeOptions: any
    vehicleTypeOptions: any
    palletTypeOptions: any
    podMethodOptions: any
    temperatureRequirementOptions: any
  }
}

type SaveOptions = {
  successSummary?: string
  successDetail?: string
  successLife?: number
  silent?: boolean
}

const payloadLabelMap: Record<string, string> = {
  customer_id: "Customer",
  account_number: "Account No.",
  quote_ref: "Customer Quote Ref",
  job_number: "Job Number",
  job_date: "Job Date",
  job_type: "Job Type",
  mode_of_transport: "Mode of Transport",
  status: "Status",
  order_type: "Order Type",
  consignment_number: "Shipment Ref",
  service_type: "Service Type",
  incoterms: "Incoterms",
  currency: "Shipment Currency",
  declared_value: "Declared Value",
  description_of_goods: "Description of Goods",
  commodity_code: "Commodity Type",
  hs_code: "Commodity Code",
  insurance_level: "Insurance Level",
  is_hazardous: "Hazardous",
  hazardous_class: "Hazmat Class",
  un_number: "UN Number",
  temperature_requirement: "Temperature Requirement",
  customer_po_number: "Customer PO Number",
  customer_booking_ref: "Customer Booking Ref",
  our_reference: "Our Reference",
  supplier_ref: "Supplier Ref",
  consignee_name: "Consignee Name",
  consignee_contact: "Consignee Contact",
  consignee_phone: "Consignee Phone",
  consignee_email: "Consignee Email",
  origin_contact_collection_address_id: "Origin Address",
  destination_contact_collection_address_id: "Destination Address",
  collection_date: "Collection Date",
  collection_time: "Ready Time",
  latest_collection_time: "Latest Collection",
  delivery_date: "Delivery Date",
  delivery_from_time: "Delivery From",
  delivery_by_time: "Delivery By",
  loading_reference: "Loading Ref",
  delivery_booking_ref: "Delivery Booking Ref",
  collection_instructions: "Collection Instructions",
  delivery_instructions: "Delivery Instructions",
  note: "Notes",
  road_detail: "Road Details",
  sea_detail: "Sea Details",
  air_detail: "Air Details",
  rail_detail: "Rail Details",
  courier_detail: "Courier Details",
  packages: "Packages",
  charges: "Costs & Charges",
  transport_legs: "Transport Legs",
  consolidation_details: "Consolidation Details",
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => stableStringify(item)).join(",")}]`
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))

    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`
  }

  return JSON.stringify(value)
}

function changedPayloadLabels(beforeSnapshot: string, afterSnapshot: string): string[] {
  try {
    const before = JSON.parse(beforeSnapshot || "{}") as Record<string, unknown>
    const after = JSON.parse(afterSnapshot || "{}") as Record<string, unknown>
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])

    return Array.from(keys)
      .filter(key => stableStringify(before[key]) !== stableStringify(after[key]))
      .map(key => payloadLabelMap[key] ?? key.replace(/_/g, " "))
  } catch {
    return []
  }
}

function autosaveSuccessDetail(beforeSnapshot: string, afterSnapshot: string): string {
  const labels = changedPayloadLabels(beforeSnapshot, afterSnapshot)

  if (!labels.length) return "Job changes saved."
  if (labels.length === 1) return `${labels[0]} saved.`
  if (labels.length === 2) return `${labels[0]} and ${labels[1]} saved.`

  return `${labels[0]}, ${labels[1]} and ${labels.length - 2} more saved.`
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value: Date | null): string | null {
  if (!value) return null

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function displayContactName(contact: any): string {
  return (
    contact?.company_name ??
    contact?.name ??
    [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") ??
    ""
  )
}

function extractErrorMessage(error: any): string {
  const errors = error?.response?.data?.errors

  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0]
    if (Array.isArray(first) && first.length) return String(first[0])
  }

  return error?.response?.data?.message ?? "Something went wrong while saving the job."
}

function addressSummary(address: ContactCollectionAddress): string {
  return [
    address.address_line_1,
    address.address_line_2,
    address.address_line_3,
    address.city,
    address.county_state,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
}

function addressOption(address: ContactCollectionAddress, ownerName = ""): AddressSelectOption {
  const label = address.label || address.city || addressSummary(address) || "Unnamed Address"
  const owner = ownerName || ""

  return {
    label: label || owner || "Unnamed Address",
    value: Number(address.id),
    address,
  }
}

function contactAddressChoice(address: ContactCollectionAddress, ownerName = ""): AddressChoice {
  return {
    id: Number(address.id),
    sourceType: "collection_address",
    label: address.label || address.city || addressSummary(address) || "Unnamed Address",
    ownerName,
    address_line_1: address.address_line_1 ?? null,
    address_line_2: address.address_line_2 ?? null,
    address_line_3: address.address_line_3 ?? null,
    city: address.city ?? null,
    county_state: address.county_state ?? null,
    postal_code: address.postal_code ?? null,
    country_id: address.country_id ?? null,
    country_name: address.country_name ?? null,
    contact_person: address.contact_person ?? null,
    phone: address.phone ?? null,
    email: address.email ?? null,
    is_collection: Boolean(address.is_collection),
    is_delivery: Boolean(address.is_delivery),
    special_instructions: address.special_instructions ?? null,
  }
}

function branchAddressChoice(branch: ContactBranch, ownerName = ""): AddressChoice {
  return {
    id: Number(branch.id),
    sourceType: "branch",
    label: branch.name || branch.delivery_city || "Branch",
    ownerName,
    address_line_1: branch.delivery_address_line_1,
    address_line_2: branch.delivery_address_line_2,
    address_line_3: branch.delivery_address_line_3,
    city: branch.delivery_city,
    county_state: branch.delivery_county_state,
    postal_code: branch.delivery_postal_code,
    country_id: branch.delivery_country_id,
    country_name: null,
    contact_person: branch.contact_person,
    phone: branch.phone,
    email: branch.email,
    is_collection: true,
    is_delivery: true,
    special_instructions: null,
  }
}

function addressChoiceToDisplay(choice: AddressChoice | null): ContactCollectionAddress | null {
  if (!choice) return null

  return {
    id: choice.id,
    contact_id: null,
    label: [choice.ownerName, choice.label].filter(Boolean).join(" - ") || choice.label,
    address_line_1: choice.address_line_1,
    address_line_2: choice.address_line_2,
    address_line_3: choice.address_line_3,
    city: choice.city,
    county_state: choice.county_state,
    postal_code: choice.postal_code,
    country_id: choice.country_id,
    country_name: choice.country_name,
    is_collection: choice.is_collection,
    is_delivery: choice.is_delivery,
    contact_person: choice.contact_person,
    phone: choice.phone,
    email: choice.email,
    special_instructions: choice.special_instructions,
  }
}

function isHazardousCommodity(value: unknown): boolean {
  return String(value ?? "")
    .toLowerCase()
    .includes("hazard")
}

function cleanReferenceName(value: string): string {
  return String(value ?? "")
    .replace(/\*$/, "")
    .trim()
}

function labelFromMode(mode: TransportMode): string {
  return mode
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function defaultCmrFromJobNumber(jobNumber: string | null | undefined): string {
  const digits = String(jobNumber ?? "").replace(/\D+/g, "")

  return digits ? digits.slice(-4).padStart(4, "0") : ""
}

function normalizeTransportMode(value: unknown): TransportMode | null {
  if (typeof value !== "string") return null

  return TRANSPORT_MODES.includes(value as TransportMode) ? (value as TransportMode) : null
}

function optionFromReference(option: any): SelectOption {
  const name = cleanReferenceName(option?.name ?? option?.label ?? option)

  return {
    label: name,
    value: name,
  }
}

function normalizePackageRow(row: any) {
  return {
    id: row.id ?? `new-${Date.now()}-${Math.random()}`,
    package_type: row.package_type ?? "Pallet",
    description: row.description ?? "",
    stackable: row.stackable ?? true,
    atTheTop: row.atTheTop ?? row.at_the_top ?? false,
    adr: Boolean(row.adr ?? false),
    quantity: Number(row.quantity ?? 1),

    lengthCm: Number(row.lengthCm ?? row.length_cm ?? 0),
    widthCm: Number(row.widthCm ?? row.width_cm ?? 0),
    heightCm: Number(row.heightCm ?? row.height_cm ?? 0),

    grossWeightKg: Number(row.grossWeightKg ?? row.weight ?? 0),
    volumeWeightKg: Number(row.volumeWeightKg ?? row.volume_weight_kg ?? 0),
    cbm: Number(row.cbm ?? row.volume ?? 0),
  }
}

function serializePackageRow(row: any) {
  return {
    id: typeof row.id === "number" ? row.id : undefined,
    package_type: row.package_type ?? null,
    stackable: row.stackable ?? true,
    at_the_top: row.atTheTop ?? row.at_the_top ?? false,
    adr: Boolean(row.adr ?? false),
    quantity: row.quantity ?? 1,

    length_cm: row.lengthCm ?? 0,
    width_cm: row.widthCm ?? 0,
    height_cm: row.heightCm ?? 0,

    weight: row.grossWeightKg ?? 0,
    volume: row.cbm ?? 0,
    volume_weight_kg: row.volumeWeightKg ?? 0,

    description: row.description ?? null,
  }
}

function serializeChargeRow(row: any): JobCharge {
  const type: "buy" | "sell" = row.type === "buy" ? "buy" : "sell"
  const quantity = Number(row.quantity ?? 0)
  const unitAmount = Number(
    type === "buy"
      ? (row.unitCost ?? row.unit_cost ?? row.unit_amount ?? row.amount)
      : (row.unitPrice ?? row.unit_price ?? row.unit_amount ?? row.amount),
  )
  const amount =
    Number.isFinite(quantity) && Number.isFinite(unitAmount)
      ? quantity * unitAmount
      : Number(row.amount ?? 0)
  const id = Number(row.id)
  const chargeCodeId = Number(row.chargeCodeId ?? row.charge_code_id)
  const supplierId = Number(row.supplierId ?? row.supplier_id)
  const exchangeRate = Number(row.exchangeRate ?? row.exchange_rate)

  return {
    ...(Number.isFinite(id) && id > 0 ? { id } : {}),
    type,
    description: row.description || null,
    currency: row.currency || null,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unit_amount: Number.isFinite(unitAmount) ? unitAmount : 0,
    exchange_rate: Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : null,
    amount: Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0,
    vat_rate: type === "sell" ? Number(row.vatRate ?? row.vat_rate ?? 0) : null,
    tax_code: type === "sell" ? row.taxCode || row.tax_code || null : null,
    ...(Number.isFinite(chargeCodeId) && chargeCodeId > 0 ? { charge_code_id: chargeCodeId } : {}),
    ...(Number.isFinite(supplierId) && supplierId > 0 ? { supplier_id: supplierId } : {}),
  }
}

function normalizeChargeRow(row: any) {
  const type: "buy" | "sell" = row?.type === "buy" ? "buy" : "sell"
  const quantity = numberValue(row?.quantity, 1) || 1
  const unitAmount =
    type === "buy"
      ? numberValue(row?.unitCost ?? row?.unit_cost ?? row?.unit_amount ?? row?.amount, 0)
      : numberValue(row?.unitPrice ?? row?.unit_price ?? row?.unit_amount ?? row?.amount, 0)

  return {
    ...row,
    type,
    description: row?.description ?? "",
    currency: row?.currency || "GBP",
    quantity,
    exchangeRate: numberValue(row?.exchangeRate ?? row?.exchange_rate, 0),
    ...(type === "buy"
      ? {
          supplier_id: row?.supplier_id ?? row?.supplierId ?? null,
          chargeCodeId: row?.chargeCodeId ?? row?.charge_code_id ?? null,
          unitCost: unitAmount,
        }
      : {
          chargeCodeId: row?.chargeCodeId ?? row?.charge_code_id ?? null,
          chargeCode: row?.chargeCode ?? row?.charge_code ?? "",
          unitPrice: unitAmount,
          vatRate: numberValue(row?.vatRate ?? row?.vat_rate, 0),
          taxCode: row?.taxCode ?? row?.tax_code ?? "",
        }),
  }
}

function serializeTransportLegs(legs: any[], existingIds: Set<number>) {
  return legs.map((leg, index) => {
    const id = Number(leg.id)

    return {
      ...(Number.isFinite(id) && existingIds.has(id) ? { id } : {}),
      sequence: Number(leg.sequence ?? index + 1),
      mode: leg.mode,
      carrier: leg.carrier || null,
      reference: leg.reference || null,
      origin: leg.origin || null,
      destination: leg.destination || null,
      etd: leg.etd || null,
      eta: leg.eta || null,
      notes: leg.notes || null,
      extra_data: leg.extra_data && typeof leg.extra_data === "object" ? leg.extra_data : {},
    }
  })
}

function emptyRoadDetail(): JobRoadDetail {
  return {
    order_type: null,
    local_collection_type: null,
    local_service_level: null,
    local_vehicle_required: null,
    local_zone_area: null,
    local_estimated_distance_miles: null,
    local_estimated_duration_hours: null,
    local_rate_per_mile: null,
    local_estimated_mileage_cost: null,
    local_round_trip: null,
    local_signature_required: null,
    local_pod_method: null,
    local_parking_access_code: null,
    local_time_critical: null,
    local_exact_delivery_time: null,
    local_driver_assigned: null,
    local_driver_mobile: null,
    local_collection_notes: null,
    full_load_type: null,
    full_load_plan_ref: null,
    full_max_stack_height_cm: null,
    full_multi_drop: null,
    full_multi_drop_stops: [],
    full_intermodal_leg: null,
    full_customs_required: null,
    full_subcontractor_used: null,
    customs_direction: null,
    customs_document_type: null,
    customs_mrn_declaration_ref: null,
    customs_export_entry_ref: null,
    customs_status: null,
    customs_port_border: null,
    customs_ferry_booking_ref: null,
    customs_exporter_eori: null,
    customs_importer_eori: null,
    customs_broker_agent: null,
    customs_broker_reference: null,
    customs_deferment_account: null,
    customs_duty_rate_percent: null,
    customs_country_of_origin: null,
    customs_country_of_destination: null,
    customs_goods_procedure_code: null,
    customs_export_licence_no: null,
    customs_notes: null,
    customs_paperwork_company: null,
    customs_paperwork_address_line_1: null,
    customs_paperwork_city: null,
    customs_paperwork_postcode: null,
    customs_paperwork_country: null,
    customs_paperwork_contact_name: null,
    customs_paperwork_phone: null,
    customs_paperwork_email: null,
    customs_paperwork_opening_hours: null,
    customs_paperwork_appointment_required: null,
    customs_paperwork_appointment_ref: null,
    customs_paperwork_documents: null,
    customs_paperwork_notes: null,
    customs_departure_office: null,
    customs_departure_office_ref: null,
    customs_departure_status: null,
    customs_departure_estimated_at: null,
    customs_departure_notes: null,
    customs_delivery_clearance_company: null,
    customs_delivery_clearance_address_line_1: null,
    customs_delivery_clearance_city: null,
    customs_delivery_clearance_postcode: null,
    customs_delivery_clearance_country: null,
    customs_delivery_clearance_office_code: null,
    customs_delivery_clearance_contact_name: null,
    customs_delivery_clearance_phone: null,
    customs_delivery_clearance_opening_hours: null,
    customs_delivery_clearance_appointment_ref: null,
    customs_delivery_clearance_status: null,
    customs_delivery_clearance_notes: null,
    subcontractor_contact_id: null,
    subcontractor_name: null,
    subcontractor_ref: null,
    subcontractor_contact_name: null,
    subcontractor_contact_phone: null,
    subcontractor_buy_rate: null,
    subcontractor_buy_currency: null,
    subcontractor_charge_description: null,
    subcontractor_po_instruction_ref: null,
    subcontractor_status: null,
    subcontractor_notes: null,
    full_vehicle_registration: null,
    full_seal_number: null,
    full_route_via: null,
    service_type: null,
    vehicle_type: null,
    vehicle_length_cm: null,
    vehicle_width_cm: null,
    vehicle_height_cm: null,
    vehicle_max_weight_kg: null,
    vehicle_pallet_base_cm: null,
    origin_city: null,
    destination_city: null,
    final_destination: null,
    estimated_transit_days: null,
    estimated_distance_km: null,
    carrier: null,
    trailer_number: null,
    driver_name: null,
    driver_mobile: null,
    pallet_spaces: null,
    pallet_type: null,
    cmr_number: null,
    pod_method: null,
    notes: null,
  }
}

function emptySeaDetail(): JobSeaDetail {
  return {
    shipping_line: null,
    vessel_name: null,
    voyage_number: null,
    shipment_type: null,
    container_number: null,
    container_size: null,
    seal_number: null,
    container_tare_kg: null,
    master_bl_number: null,
    house_bl_number: null,
    bl_type: null,
    freight_terms: null,
    port_of_loading: null,
    port_of_discharge: null,
    transhipment_port: null,
    final_destination: null,
    etd: null,
    eta: null,
    cut_off_date: null,
    cut_off_time: null,
    free_days_demurrage: null,
    free_days_detention: null,
    return_depot: null,
    return_date: null,
    notes: null,
  }
}

function emptyAirDetail(): JobAirDetail {
  return {
    airline: null,
    flight_number: null,
    mawb_number: null,
    hawb_number: null,
    airport_of_departure: null,
    airport_of_arrival: null,
    via_transhipment: null,
    final_destination: null,
    shipment_type: null,
    etd: null,
    eta: null,
    cut_off_date: null,
    cut_off_time: null,
    uld_type: null,
    uld_number: null,
    chargeable_weight: null,
    rate_per_kg: null,
    notes: null,
  }
}

function emptyRailDetail(): JobRailDetail {
  return {
    rail_operator: null,
    train_number: null,
    wagon_number: null,
    container_number: null,
    container_type: null,
    loading_terminal: null,
    discharge_terminal: null,
    final_destination: null,
    estimated_transit_days: null,
    departure_date: null,
    departure_time: null,
    arrival_date: null,
    arrival_time: null,
    notes: null,
  }
}

function emptyCourierDetail(): JobCourierDetail {
  return {
    courier_service: null,
    carrier: null,
    tracking_number: null,
    final_destination: null,
    vehicle_type: null,
    driver_name: null,
    driver_mobile: null,
    estimated_distance_miles: null,
    rate_per_mile: null,
    signature_required: null,
    pod_method: null,
    exact_delivery_time: null,
    parking_access_code: null,
    notes: null,
  }
}

function numberValue(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

function stringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback

  return String(value)
}

function booleanValue(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined || value === "") return fallback
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase())
}

function arrayValue<T>(value: unknown, mapper: (item: any) => T): T[] {
  if (!Array.isArray(value)) return []

  return value.map(item => mapper(item))
}

function normalizeConsolidationPackageLine(row: any): JobConsolidationPackageLine {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    packageType: stringValue(row?.packageType ?? row?.package_type, "Carton"),
    stackable: booleanValue(row?.stackable, true),
    atTheTop: booleanValue(row?.atTheTop ?? row?.at_the_top, false),
    qty: numberValue(row?.qty ?? row?.quantity, 1),
    length: numberValue(row?.length ?? row?.length_cm),
    width: numberValue(row?.width ?? row?.width_cm),
    height: numberValue(row?.height ?? row?.height_cm),
    netWeight: numberValue(row?.netWeight ?? row?.net_weight),
    grossWeight: numberValue(row?.grossWeight ?? row?.gross_weight ?? row?.weightKg),
    adr: booleanValue(row?.adr, false),
  }
}

function normalizeConsolidationSupplierItem(row: any): JobConsolidationSupplierItem {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    packageType: stringValue(row?.packageType ?? row?.package_type, "Carton"),
    collie: numberValue(row?.collie ?? row?.qty, 1),
    length: numberValue(row?.length),
    width: numberValue(row?.width),
    height: numberValue(row?.height),
    stackable: booleanValue(row?.stackable, true),
    atTheTop: booleanValue(row?.atTheTop ?? row?.at_the_top, false),
    net: numberValue(row?.net),
    gross: numberValue(row?.gross),
    adr: stringValue(row?.adr, "No") === "Yes" ? "Yes" : "No",
  }
}

function normalizeConsolidationSupplierInvoice(row: any): JobConsolidationSupplierInvoice {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    supplierName: stringValue(row?.supplierName ?? row?.supplier_name),
    customerPoRef: stringValue(row?.customerPoRef ?? row?.customer_po_ref),
    supplierInvoiceNumber: stringValue(row?.supplierInvoiceNumber ?? row?.supplier_invoice_number),
    invoiceDate: stringValue(row?.invoiceDate ?? row?.invoice_date),
    currency: stringValue(row?.currency, "GBP"),
    invoiceValue: numberValue(row?.invoiceValue ?? row?.invoice_value),
    collectionRef: stringValue(row?.collectionRef ?? row?.collection_ref),
    label: stringValue(row?.label),
    items: arrayValue(row?.items, normalizeConsolidationSupplierItem),
  }
}

function normalizeConsolidationCollectionOrder(row: any): JobConsolidationCollectionOrder {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    coRef: stringValue(row?.coRef ?? row?.co_ref),
    customerRef: stringValue(row?.customerRef ?? row?.customer_ref),
    collectionRef: stringValue(row?.collectionRef ?? row?.collection_ref),
    supplier: stringValue(row?.supplier, "DHL"),
    pickupDate: stringValue(row?.pickupDate ?? row?.pickup_date),
    pickupTime: stringValue(row?.pickupTime ?? row?.pickup_time),
    vehicle: stringValue(row?.vehicle) || null,
    collectionAddress: stringValue(row?.collectionAddress ?? row?.collection_address),
    deliveryAddress: stringValue(row?.deliveryAddress ?? row?.delivery_address),
    deliveryDate: stringValue(row?.deliveryDate ?? row?.delivery_date),
    deliveryTime: stringValue(row?.deliveryTime ?? row?.delivery_time),
    goodsDescription: stringValue(row?.goodsDescription ?? row?.goods_description),
    hazardous: booleanValue(row?.hazardous, false),
    adrClass: stringValue(row?.adrClass ?? row?.adr_class),
    freight: numberValue(row?.freight),
    fscPct: numberValue(row?.fscPct ?? row?.fsc_pct),
    additional: numberValue(row?.additional),
    pcs: numberValue(row?.pcs),
    weightKg: numberValue(row?.weightKg ?? row?.weight_kg),
    volumeCbm: numberValue(row?.volumeCbm ?? row?.volume_cbm),
    ldm: numberValue(row?.ldm),
    status: stringValue(row?.status, "Created"),
    notes: stringValue(row?.notes),
    wmsRef: stringValue(row?.wmsRef ?? row?.wms_ref),
    lines: arrayValue(row?.lines, normalizeConsolidationPackageLine),
  }
}

function normalizeConsolidationGoodsRow(row: any): JobConsolidationGoodsRow {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    grn: stringValue(row?.grn),
    supplier: stringValue(row?.supplier),
    supplierInvoice: stringValue(row?.supplierInvoice ?? row?.supplier_invoice),
    supplierPO: stringValue(row?.supplierPO ?? row?.supplier_po),
    partNo: stringValue(row?.partNo ?? row?.part_no, "-"),
    desc: stringValue(row?.desc),
    pcs: numberValue(row?.pcs),
    weightKg: numberValue(row?.weightKg ?? row?.weight_kg),
    cbm: numberValue(row?.cbm),
    location: stringValue(row?.location, "STAGING"),
    status: stringValue(row?.status, "Received"),
  }
}

function normalizeConsolidationInvoiceLine(row: any): JobConsolidationInvoiceLine {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    invoiceCurrency: stringValue(row?.invoiceCurrency ?? row?.invoice_currency, "GBP"),
    poRef: stringValue(row?.poRef ?? row?.po_ref),
    shippingLabelNo: stringValue(row?.shippingLabelNo ?? row?.shipping_label_no),
    description: stringValue(row?.description),
    qty: numberValue(row?.qty, 1),
    uom: stringValue(row?.uom, "Fixed"),
    countryOfOrigin: stringValue(row?.countryOfOrigin ?? row?.country_of_origin),
    hsCode: stringValue(row?.hsCode ?? row?.hs_code),
    unitPrice: numberValue(row?.unitPrice ?? row?.unit_price),
    supplier: stringValue(row?.supplier),
    grn: stringValue(row?.grn),
  }
}

function normalizeConsolidationChargeLine(row: any): JobConsolidationChargeLine {
  return {
    id: numberValue(row?.id, Date.now() + Math.floor(Math.random() * 10000)),
    description: stringValue(row?.description, "Consolidation handling"),
    qty: numberValue(row?.qty, 1),
    unit: stringValue(row?.unit, "Fixed"),
    rate: numberValue(row?.rate),
    sourceType: row?.sourceType ?? row?.source_type,
    sourceId: row?.sourceId ?? row?.source_id,
  }
}

function normalizePostedInvoice(row: any): JobConsolidationPostedInvoice {
  return {
    posted: booleanValue(row?.posted, false),
    ref: stringValue(row?.ref),
    date: stringValue(row?.date),
  }
}

function normalizeQuote(row: any): JobConsolidationQuoteDetails {
  return {
    reference: stringValue(row?.reference),
    validUntil: stringValue(row?.validUntil ?? row?.valid_until),
    status: stringValue(row?.status, "Draft"),
    notes: stringValue(row?.notes),
    terms: stringValue(
      row?.terms,
      "Rates are subject to carrier availability and standard terms of trading.",
    ),
  }
}

function normalizeConsolidationOverview(row: any): JobConsolidationOverviewSnapshot {
  return {
    jobNo: stringValue(row?.jobNo ?? row?.job_no),
    jobDate: stringValue(row?.jobDate ?? row?.job_date),
    mode: stringValue(row?.mode, "Road"),
    invoiceCurrency: stringValue(row?.invoiceCurrency ?? row?.invoice_currency, "GBP"),
    shipDate: stringValue(row?.shipDate ?? row?.ship_date),
    shipFrom: stringValue(row?.shipFrom ?? row?.ship_from),
    exitIncoterm: stringValue(row?.exitIncoterm ?? row?.exit_incoterm),
    entryIncoterm: stringValue(row?.entryIncoterm ?? row?.entry_incoterm),
    customer: stringValue(row?.customer),
    notifyParty: stringValue(row?.notifyParty ?? row?.notify_party),
    shipper: stringValue(row?.shipper),
    deliveryAddress: stringValue(row?.deliveryAddress ?? row?.delivery_address),
    goodsDescription: stringValue(row?.goodsDescription ?? row?.goods_description),
    instructions: stringValue(row?.instructions),
    exportCustomsRef: stringValue(row?.exportCustomsRef ?? row?.export_customs_ref),
    importCustomsRef: stringValue(row?.importCustomsRef ?? row?.import_customs_ref),
  }
}

function normalizeConsolidationTransport(row: any): JobConsolidationTransportSnapshot {
  return {
    bookingRef: stringValue(row?.bookingRef ?? row?.booking_ref),
    carrier: stringValue(row?.carrier),
    originPort: stringValue(row?.originPort ?? row?.origin_port),
    destinationPort: stringValue(row?.destinationPort ?? row?.destination_port),
    finalDestination: stringValue(
      row?.finalDestination ??
        row?.final_destination ??
        row?.lastDestination ??
        row?.last_destination,
    ),
    etd: stringValue(row?.etd),
    eta: stringValue(row?.eta),
  }
}

function emptyConsolidationDetails(): JobConsolidationDetails {
  return {
    overview: normalizeConsolidationOverview(null),
    transport: normalizeConsolidationTransport(null),
    supplierInvoices: [],
    supplierExaNumbers: {},
    collectionOrders: [],
    goodsRows: [],
    consolidatedLines: [],
    domesticChargeRows: [],
    exportChargeRows: [],
    quoteLines: [],
    domesticInvoice: { posted: false, ref: "", date: "" },
    exportInvoice: { posted: false, ref: "", date: "" },
    finalDelivery: {
      deliveryRef: "",
      plannedDate: "",
      plannedTime: "",
      carrier: "",
      address: "",
      instructions: "",
    },
    quote: {
      reference: "",
      validUntil: "",
      status: "Draft",
      notes: "",
      terms: "Rates are subject to carrier availability and standard terms of trading.",
    },
    selectedInvoiceCurrency: "GBP",
    consolidatedFreightCharge: 0,
    taxRate: 20,
    showQuotePanel: false,
  }
}

function normalizeConsolidationDetails(raw: any): JobConsolidationDetails {
  const base = emptyConsolidationDetails()
  if (!raw || typeof raw !== "object") return base

  return {
    ...base,
    overview: normalizeConsolidationOverview(raw.overview),
    transport: normalizeConsolidationTransport(raw.transport),
    supplierInvoices: arrayValue(
      raw.supplierInvoices ?? raw.supplier_invoices,
      normalizeConsolidationSupplierInvoice,
    ),
    supplierExaNumbers: { ...(raw.supplierExaNumbers ?? raw.supplier_exa_numbers ?? {}) },
    collectionOrders: arrayValue(
      raw.collectionOrders ?? raw.collection_orders,
      normalizeConsolidationCollectionOrder,
    ),
    goodsRows: arrayValue(raw.goodsRows ?? raw.goods_rows, normalizeConsolidationGoodsRow),
    consolidatedLines: arrayValue(
      raw.consolidatedLines ?? raw.consolidated_lines,
      normalizeConsolidationInvoiceLine,
    ),
    domesticChargeRows: arrayValue(
      raw.domesticChargeRows ?? raw.domestic_charge_rows,
      normalizeConsolidationChargeLine,
    ),
    exportChargeRows: arrayValue(
      raw.exportChargeRows ?? raw.export_charge_rows,
      normalizeConsolidationChargeLine,
    ),
    quoteLines: arrayValue(raw.quoteLines ?? raw.quote_lines, normalizeConsolidationChargeLine),
    domesticInvoice: normalizePostedInvoice(raw.domesticInvoice ?? raw.domestic_invoice),
    exportInvoice: normalizePostedInvoice(raw.exportInvoice ?? raw.export_invoice),
    finalDelivery: {
      ...base.finalDelivery,
      ...(raw.finalDelivery ?? raw.final_delivery ?? {}),
    },
    quote: normalizeQuote(raw.quote),
    selectedInvoiceCurrency: stringValue(
      raw.selectedInvoiceCurrency ?? raw.selected_invoice_currency,
      "GBP",
    ),
    consolidatedFreightCharge: numberValue(
      raw.consolidatedFreightCharge ?? raw.consolidated_freight_charge,
    ),
    taxRate: numberValue(raw.taxRate ?? raw.tax_rate, 20),
    showQuotePanel: booleanValue(raw.showQuotePanel ?? raw.show_quote_panel, false),
  }
}

function detailPayloadForMode(form: JobDetailsForm): Partial<TransportJobUpdatePayload> {
  if (form.mode_of_transport === "road") {
    form.order_type = "Full Transport Order"
    form.road_detail.order_type = "Full Transport Order"
    form.road_detail.local_estimated_mileage_cost = localMileageCost(form)

    return { road_detail: form.road_detail }
  }
  if (form.mode_of_transport === "sea") return { sea_detail: form.sea_detail }
  if (form.mode_of_transport === "air") return { air_detail: form.air_detail }
  if (form.mode_of_transport === "rail") return { rail_detail: form.rail_detail }
  if (form.mode_of_transport === "courier") return { courier_detail: form.courier_detail }

  return {}
}

function localMileageCost(form: JobDetailsForm): number | null {
  const distance = Number(form.road_detail.local_estimated_distance_miles ?? 0)
  const rate = Number(form.road_detail.local_rate_per_mile ?? 0)
  const cost = distance * rate

  return cost > 0 ? Number(cost.toFixed(2)) : null
}

export function useJobDetailsPage() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const transportJobStore = useTransportJobStore()
  const contactStore = useContactStore()
  const referenceDataStore = useReferenceDataStore()

  const jobId = computed(() => {
    const raw = route.params.id
    const value = Number(Array.isArray(raw) ? raw[0] : raw)

    return Number.isFinite(value) && value > 0 ? value : null
  })

  const job = jobRef
  const loading = computed(() => initialLoadingRef.value)
  const saving = savingRef
  const lastSavedPayloadSnapshot = ref("")
  const autosaveWatchSnapshot = ref("")
  const lastAutoCmrRef = ref("")
  const autosaveTimers = new Set<number>()
  let autosaveWatchTimer: number | null = null

  const form = reactive<JobDetailsForm>({
    customer_id: null,
    account_number: "",
    quote_ref: "",
    job_number: "",
    job_date: null,
    job_type: "",
    mode_of_transport: null,
    status: "Draft",
    note: "",

    order_type: "",
    consignment_number: "",
    service_type: "",
    incoterms: "",
    currency: "",
    declared_value: null,
    description_of_goods: "",
    commodity_code: "",
    hs_code: "",
    insurance_level: "",
    is_hazardous: null,
    hazardous_class: "",
    un_number: "",
    temperature_requirement: "",

    customer_po_number: "",
    customer_booking_ref: "",
    our_reference: "",
    supplier_ref: "",

    consignee_name: "",
    consignee_contact: "",
    consignee_phone: "",
    consignee_email: "",
    origin_contact_collection_address_id: null,
    destination_contact_collection_address_id: null,
    destination_address_source_type: null,
    destination_address_source_id: null,
    collection_date: null,
    collection_time: "",
    latest_collection_time: "",
    delivery_date: null,
    delivery_from_time: "",
    delivery_by_time: "",
    loading_reference: "",
    delivery_booking_ref: "",
    collection_instructions: "",
    delivery_instructions: "",

    packages: [],
    charges: [],
    buy_costs: [],
    sell_costs: [],
    files: [],

    road_detail: emptyRoadDetail(),
    sea_detail: emptySeaDetail(),
    air_detail: emptyAirDetail(),
    rail_detail: emptyRailDetail(),
    courier_detail: emptyCourierDetail(),

    transport_legs: [],
    multi_modal_legs: [],
    consolidation_details: emptyConsolidationDetails(),
  })

  const baseTabs: JobDetailsTab[] = [
    {
      label: "Overview",
      name: "tms.jobs.show.overview",
      key: "overview",
    },
    {
      label: "Packages",
      name: "tms.jobs.show.packages",
      key: "packages",
      showCount: true,
    },
    {
      label: "Transport Order",
      name: "tms.jobs.show.transport",
      key: "transport",
    },
    {
      label: "Costs & Charges",
      name: "tms.jobs.show.costs",
      key: "costs",
      showCount: true,
    },
    {
      label: "Customer Invoice",
      name: "tms.jobs.show.customer-invoice",
      key: "customer-invoice",
      showCount: true,
    },
    {
      label: "Supplier Invoices",
      name: "tms.jobs.show.supplier-invoices",
      key: "supplier-invoices",
      showCount: true,
    },
    {
      label: "Load Planner",
      name: "tms.jobs.show.load-planner",
      key: "load-planner",
    },
  ]

  const consolidationTabs: JobDetailsTab[] = [
    {
      label: "Supplier Invoices",
      name: "tms.jobs.show.supplier-invoices",
      key: "supplier-invoices",
      showCount: true,
    },
    {
      label: "Collection Orders",
      name: "tms.jobs.show.collection-orders",
      key: "collection-orders",
      showCount: true,
    },
    {
      label: "Consolidated Invoices",
      name: "tms.jobs.show.consolidated-invoices",
      key: "consolidated-invoices",
      showCount: true,
    },
    {
      label: "Customer Invoice",
      name: "tms.jobs.show.customer-invoice",
      key: "customer-invoice",
      showCount: true,
    },
    {
      label: "Goods In/Out (WMS)",
      name: "tms.jobs.show.wms",
      key: "wms",
      showCount: true,
    },
  ]
  const consolidationTabNames = new Set(consolidationTabs.map(tab => tab.name))
  const normalJobTabNames = new Set(baseTabs.map(tab => tab.name))
  const consolidationOnlyBaseExclusions = new Set([
    "packages",
    "customer-invoice",
    "supplier-invoices",
  ])
  const consolidationBaseTabs = baseTabs.filter(
    tab => !consolidationOnlyBaseExclusions.has(tab.key),
  )

  type CustomerOption = {
    label: string
    value: number
    account_number: string
  }

  const customerOptions = computed<CustomerOption[]>(() => {
    const contactsById = new Map<number, Contact>()

    customerContactsRef.value.forEach(contact => {
      contactsById.set(Number(contact.id), contact)
    })

    if (selectedCustomerRef.value?.id) {
      contactsById.set(Number(selectedCustomerRef.value.id), selectedCustomerRef.value)
    }

    const jobCustomer = (job.value as any)?.customer_contact
    if (jobCustomer?.id) {
      contactsById.set(Number(jobCustomer.id), jobCustomer as Contact)
    }

    return Array.from(contactsById.values()).map((contact: any) => ({
      label: displayContactName(contact),
      value: Number(contact.id),
      account_number: contact.account_number ?? "",
    }))
  })

  const selectedCustomer = computed<Contact | null>(() => {
    if (!form.customer_id) return null

    if (selectedCustomerRef.value?.id === Number(form.customer_id)) {
      return selectedCustomerRef.value
    }

    const jobCustomer = (job.value as any)?.customer_contact ?? null
    if (jobCustomer?.id === Number(form.customer_id)) return jobCustomer as Contact

    return (
      customerContactsRef.value.find(contact => {
        return Number(contact.id) === Number(form.customer_id)
      }) ?? null
    )
  })

  const originAddressOptions = computed<AddressSelectOption[]>(() => {
    return (selectedCustomer.value?.collection_addresses ?? [])
      .filter(address => Boolean(address.is_collection))
      .map(address => addressOption(address))
  })

  const destinationAddressOptions = computed<AddressSelectOption[]>(() => {
    const optionsById = new Map<number, AddressSelectOption>()

    destinationContactsRef.value.forEach(contact => {
      const ownerName = displayContactName(contact)

      ;(contact.collection_addresses ?? []).forEach(address => {
        optionsById.set(Number(address.id), addressOption(address, ownerName))
      })
    })

    const currentAddress = (job.value as any)?.destination_address
    if (currentAddress?.id && !optionsById.has(Number(currentAddress.id))) {
      optionsById.set(Number(currentAddress.id), addressOption(currentAddress))
    }

    return Array.from(optionsById.values())
  })

  const addressContactOptions = computed<CustomerOption[]>(() => {
    const contactsById = new Map<number, Contact>()

    destinationContactsRef.value.forEach(contact => {
      contactsById.set(Number(contact.id), contact)
    })
    ;[selectedCustomerRef.value, addressPickerContactRef.value].forEach(contact => {
      if (contact?.id) contactsById.set(Number(contact.id), contact)
    })

    return Array.from(contactsById.values()).map((contact: any) => ({
      label: displayContactName(contact),
      value: Number(contact.id),
      account_number: contact.account_number ?? "",
    }))
  })

  const addressChoices = computed<AddressChoice[]>(() => {
    const choices: AddressChoice[] = []

    destinationContactsRef.value.forEach(contact => {
      const ownerName = displayContactName(contact)

      ;(contact.collection_addresses ?? []).forEach(address => {
        choices.push(contactAddressChoice(address, ownerName))
      })
      ;(contact.branches ?? []).forEach(branch => {
        choices.push(branchAddressChoice(branch, ownerName))
      })
    })

    const appendLoadedChoice = (rawAddress: any, sourceType: AddressSourceType | null) => {
      if (!rawAddress?.id || !sourceType) return
      const id = Number(rawAddress.id)
      const exists = choices.some(choice => choice.sourceType === sourceType && choice.id === id)

      if (!exists) {
        choices.push({
          id,
          sourceType,
          label: rawAddress.label ?? rawAddress.city ?? "Selected Address",
          ownerName: "",
          address_line_1: rawAddress.address_line_1 ?? null,
          address_line_2: rawAddress.address_line_2 ?? null,
          address_line_3: rawAddress.address_line_3 ?? null,
          city: rawAddress.city ?? null,
          county_state: rawAddress.county_state ?? null,
          postal_code: rawAddress.postal_code ?? null,
          country_id: rawAddress.country_id ?? null,
          country_name: rawAddress.country_name ?? null,
          contact_person: rawAddress.contact_person ?? null,
          phone: rawAddress.phone ?? null,
          email: rawAddress.email ?? null,
          is_collection: Boolean(rawAddress.is_collection ?? true),
          is_delivery: Boolean(rawAddress.is_delivery ?? true),
          special_instructions: rawAddress.special_instructions ?? null,
        })
      }
    }

    appendLoadedChoice(
      (job.value as any)?.destination_address,
      form.destination_address_source_type,
    )

    return choices
  })

  function findAddressChoice(sourceType: AddressSourceType | null, sourceId: number | null) {
    if (!sourceType || !sourceId) return null

    return (
      addressChoices.value.find(choice => {
        return choice.sourceType === sourceType && choice.id === Number(sourceId)
      }) ?? null
    )
  }

  const selectedOriginAddress = computed<ContactCollectionAddress | null>(() => {
    if (!form.origin_contact_collection_address_id) return null

    const addressId = Number(form.origin_contact_collection_address_id)
    const loadedOriginAddress = (job.value as any)?.origin_address

    return (
      selectedCustomer.value?.collection_addresses?.find(
        address => Number(address.id) === addressId,
      ) ??
      (loadedOriginAddress?.id && Number(loadedOriginAddress.id) === addressId
        ? loadedOriginAddress
        : null)
    )
  })

  const selectedDestinationAddress = computed<ContactCollectionAddress | null>(() => {
    return addressChoiceToDisplay(
      findAddressChoice(form.destination_address_source_type, form.destination_address_source_id),
    )
  })

  function referenceOptionsFor(categoryKey: string, fallback: SelectOption[] = []): SelectOption[] {
    const category = referenceDataStore.getByKey(categoryKey)
    const options = (category?.options ?? []).map(optionFromReference)

    return options.length ? options : fallback
  }

  const referenceOptions = {
    serviceTypeOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("service_types")
    }),

    incotermOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("incoterms")
    }),

    currencyOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("currency")
    }),

    commodityTypeOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("commodity_types")
    }),

    insuranceLevelOptions: computed<SelectOption[]>(() => [
      { label: "Standard Conditions", value: "Standard Conditions" },
      { label: "Enhanced Cover", value: "Enhanced Cover" },
      { label: "Full Declared Value", value: "Full Declared Value" },
      { label: "Customer's Own Insurance", value: "Customer's Own Insurance" },
    ]),

    dangerousGoodsOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("dangerous_goods", [
        { label: "Class 1 - Explosives", value: "Class 1 - Explosives" },
        { label: "Class 2 - Gases", value: "Class 2 - Gases" },
        { label: "Class 3 - Flammable liquids", value: "Class 3 - Flammable liquids" },
        { label: "Class 4 - Flammable solids", value: "Class 4 - Flammable solids" },
        { label: "Class 5 - Oxidisers", value: "Class 5 - Oxidisers" },
        { label: "Class 6 - Toxic substances", value: "Class 6 - Toxic substances" },
        { label: "Class 7 - Radioactive", value: "Class 7 - Radioactive" },
        { label: "Class 8 - Corrosives", value: "Class 8 - Corrosives" },
        { label: "Class 9 - Misc dangerous", value: "Class 9 - Misc dangerous" },
      ])
    }),

    roadLocalCollectionTypeOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("road_local_collection_types", [
        { label: "On-Demand", value: "On-Demand" },
        { label: "Scheduled", value: "Scheduled" },
        { label: "Return Collection", value: "Return Collection" },
        { label: "Multi-Stop Local", value: "Multi-Stop Local" },
        { label: "Overnight Parcel", value: "Overnight Parcel" },
      ])
    }),

    roadServiceLevelOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("road_service_levels", [
        { label: "Standard", value: "Standard" },
        { label: "Express (Same-Day)", value: "Express (Same-Day)" },
        { label: "Next-Day AM (Pre-12)", value: "Next-Day AM (Pre-12)" },
        { label: "Next-Day PM", value: "Next-Day PM" },
        { label: "Economy (2-3 Day)", value: "Economy (2-3 Day)" },
        { label: "Time-Critical", value: "Time-Critical" },
      ])
    }),

    roadLoadTypeOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("road_load_types", [
        { label: "FTL - Full Truck Load", value: "FTL - Full Truck Load" },
        { label: "LTL - Part Load", value: "LTL - Part Load" },
        { label: "Groupage / Consolidation", value: "Groupage / Consolidation" },
        { label: "Dedicated Vehicle", value: "Dedicated Vehicle" },
      ])
    }),

    roadServiceTypeOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("road_service_types", [
        { label: "FTL - Full Truck Load", value: "FTL - Full Truck Load" },
        { label: "LTL - Part Load", value: "LTL - Part Load" },
        { label: "Groupage / Consolidation", value: "Groupage / Consolidation" },
        { label: "Dedicated Transport", value: "Dedicated Transport" },
        { label: "Temperature Controlled", value: "Temperature Controlled" },
        { label: "Hazardous Goods (ADR)", value: "Hazardous Goods (ADR)" },
      ])
    }),

    vehicleTypeOptions: computed<SelectOption[]>(() => {
      const customOption = {
        label: "Custom / Specialised Vehicle",
        value: "Custom / Specialised Vehicle",
      }
      const options = referenceOptionsFor("vehicle_types", [
        { label: "Curtainsider / Tautliner", value: "Curtainsider / Tautliner" },
        { label: "Small Van (Transit Connect)", value: "Small Van (Transit Connect)" },
        { label: "SWB Van", value: "SWB Van" },
        { label: "MWB Van", value: "MWB Van" },
        { label: "LWB Van", value: "LWB Van" },
        { label: "Extra LWB Van", value: "Extra LWB Van" },
        { label: "Luton Van", value: "Luton Van" },
        { label: "7.5T Box Truck", value: "7.5T Box Truck" },
        { label: "12T Box Truck", value: "12T Box Truck" },
        { label: "18T Box Truck", value: "18T Box Truck" },
        { label: "Box Trailer", value: "Box Trailer" },
        { label: "Mega Trailer", value: "Mega Trailer" },
        { label: "Double Deck Trailer", value: "Double Deck Trailer" },
        { label: "Reefer Trailer", value: "Reefer Trailer" },
        { label: "Joloda Trailer", value: "Joloda Trailer" },
        { label: "Coil Carrier", value: "Coil Carrier" },
        { label: "Flatbed Trailer (open)", value: "Flatbed Trailer (open)" },
        { label: "Step Frame Trailer (open)", value: "Step Frame Trailer (open)" },
        { label: "Low Loader (open)", value: "Low Loader (open)" },
        { label: "Extendable Trailer (open)", value: "Extendable Trailer (open)" },
        customOption,
      ])

      return options.some(option => option.value === customOption.value)
        ? options
        : [...options, customOption]
    }),

    palletTypeOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("pallet_types", [
        { label: "Euro Pallet (120x80)", value: "Euro Pallet (120x80)" },
        { label: "UK Pallet (120x100)", value: "UK Pallet (120x100)" },
        { label: "Half Pallet", value: "Half Pallet" },
        { label: "Mixed", value: "Mixed" },
        { label: "N/A - Bulk", value: "N/A - Bulk" },
      ])
    }),

    podMethodOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("pod_methods", [
        { label: "Paper POD", value: "Paper POD" },
        { label: "ePOD (App)", value: "ePOD (App)" },
        { label: "Photo Confirmation", value: "Photo Confirmation" },
        { label: "Email Confirmation", value: "Email Confirmation" },
        { label: "None Required", value: "None Required" },
      ])
    }),

    temperatureRequirementOptions: computed<SelectOption[]>(() => {
      return referenceOptionsFor("temperature_requirements", [
        { label: "No", value: "No" },
        { label: "Chilled (2-8 C)", value: "Chilled (2-8 C)" },
        { label: "Frozen (-18 C)", value: "Frozen (-18 C)" },
        { label: "Ambient Controlled", value: "Ambient Controlled" },
      ])
    }),
  }

  const modeOptions = computed<SelectOption[]>(() => {
    return TRANSPORT_MODES.map((mode: TransportMode) => ({
      label: labelFromMode(mode),
      value: mode,
    }))
  })

  const statusOptions = computed<SelectOption[]>(() => {
    const category = referenceDataStore.getByKey("shipment_status")
    const options = (category?.options ?? []).map(optionFromReference)

    return options.length
      ? options
      : [
          { label: "Draft", value: "Draft" },
          { label: "Booked", value: "Booked" },
          { label: "In Transit", value: "In Transit" },
          { label: "Delivered", value: "Delivered" },
          { label: "Cancelled", value: "Cancelled" },
        ]
  })

  const currentRouteName = computed(() => String(route.name ?? ""))
  const isConsolidationJob = computed(() => {
    return form.job_type === "consolidation"
  })

  const tabs = computed<JobDetailsTab[]>(() => {
    return isConsolidationJob.value ? [...consolidationBaseTabs, ...consolidationTabs] : baseTabs
  })

  watch(
    [isConsolidationJob, currentRouteName],
    ([isConsolidation, routeName]) => {
      if (isConsolidation && routeName === "tms.jobs.show.packages") {
        router.replace({
          name: "tms.jobs.show.load-planner",
          params: route.params,
          query: route.query,
        })
        return
      }

      if (
        !isConsolidation &&
        consolidationTabNames.has(routeName) &&
        !normalJobTabNames.has(routeName)
      ) {
        router.replace({
          name: "tms.jobs.show.overview",
          params: route.params,
          query: route.query,
        })
      }
    },
    { immediate: true },
  )

  const title = computed(() => {
    return form.job_number || "Job Details"
  })

  const subtitle = computed(() => {
    const type = form.job_type ? form.job_type.replace("_", " ").toUpperCase() : "NO TYPE"
    const mode = form.mode_of_transport
      ? form.mode_of_transport.replace("_", " ").toUpperCase()
      : "NO MODE"

    return `${type} · ${mode}`
  })

  function isActive(name: string) {
    return currentRouteName.value === name
  }

  function getTabCount(key: string) {
    if (key === "packages") return form.packages.length
    if (key === "costs") return form.buy_costs.length + form.sell_costs.length
    if (key === "supplier-invoices") {
      return isConsolidationJob.value
        ? form.consolidation_details.supplierInvoices.length
        : form.buy_costs.length
    }
    if (key === "collection-orders") return form.consolidation_details.collectionOrders.length
    if (key === "consolidated-invoices") return form.consolidation_details.consolidatedLines.length
    if (key === "customer-invoice") {
      if (!isConsolidationJob.value) return form.sell_costs.length

      return (
        form.consolidation_details.domesticChargeRows.length +
        form.consolidation_details.exportChargeRows.length
      )
    }
    if (key === "wms") return form.consolidation_details.goodsRows.length

    return 0
  }

  function hydrateForm(data: TransportJob) {
    const extra = data as any

    job.value = data

    form.customer_id = data.customer_id ?? extra.customer_contact?.id ?? null
    form.account_number = data.account_number ?? data.customer_account_number ?? ""
    form.quote_ref = data.quote_ref ?? ""
    form.job_number = data.job_number ?? ""
    form.job_date = parseDate(data.job_date)
    form.job_type = data.job_type ?? ""
    form.mode_of_transport = normalizeTransportMode(data.mode_of_transport)
    form.status = extra.status ?? "Draft"
    form.note = data.note ?? ""

    form.order_type = extra.order_type ?? ""
    form.consignment_number = extra.consignment_number ?? ""
    form.service_type = extra.service_type ?? ""
    form.incoterms = extra.incoterms ?? ""
    form.currency = extra.currency ?? ""
    form.declared_value =
      extra.declared_value === null ||
      extra.declared_value === undefined ||
      extra.declared_value === ""
        ? null
        : Number(extra.declared_value)

    form.description_of_goods = extra.description_of_goods ?? ""
    form.commodity_code = extra.commodity_code ?? ""
    form.hs_code = extra.hs_code ?? ""
    form.insurance_level = extra.insurance_level ?? ""
    form.is_hazardous =
      extra.is_hazardous === null || extra.is_hazardous === undefined || extra.is_hazardous === ""
        ? null
        : booleanValue(extra.is_hazardous, false)
    form.hazardous_class = extra.hazardous_class ?? ""
    form.un_number = extra.un_number ?? ""
    form.temperature_requirement = extra.temperature_requirement ?? ""

    form.customer_po_number = extra.customer_po_number ?? ""
    form.customer_booking_ref = extra.customer_booking_ref ?? ""
    form.our_reference = extra.our_reference ?? ""
    form.supplier_ref = extra.supplier_ref ?? ""

    form.consignee_name = extra.consignee_name ?? ""
    form.consignee_contact = extra.consignee_contact ?? ""
    form.consignee_phone = extra.consignee_phone ?? ""
    form.consignee_email = extra.consignee_email ?? ""
    form.origin_contact_collection_address_id =
      extra.origin_contact_collection_address_id === null ||
      extra.origin_contact_collection_address_id === undefined ||
      extra.origin_contact_collection_address_id === ""
        ? null
        : Number(extra.origin_contact_collection_address_id)
    form.destination_contact_collection_address_id =
      extra.destination_contact_collection_address_id === null ||
      extra.destination_contact_collection_address_id === undefined ||
      extra.destination_contact_collection_address_id === ""
        ? null
        : Number(extra.destination_contact_collection_address_id)
    form.destination_address_source_type =
      extra.destination_address_source_type ??
      (form.destination_contact_collection_address_id ? "collection_address" : null)
    form.destination_address_source_id =
      extra.destination_address_source_id === null ||
      extra.destination_address_source_id === undefined ||
      extra.destination_address_source_id === ""
        ? form.destination_contact_collection_address_id
        : Number(extra.destination_address_source_id)
    selectedDestinationContactIdRef.value = extra.destination_address?.contact_id ?? null
    form.collection_date = parseDate(extra.collection_date)
    form.collection_time = extra.collection_time ?? ""
    form.latest_collection_time = extra.latest_collection_time ?? ""
    form.delivery_date = parseDate(extra.delivery_date)
    form.delivery_from_time = extra.delivery_from_time ?? ""
    form.delivery_by_time = extra.delivery_by_time ?? ""
    form.loading_reference = extra.loading_reference ?? ""
    form.delivery_booking_ref = extra.delivery_booking_ref ?? ""
    form.collection_instructions = extra.collection_instructions ?? ""
    form.delivery_instructions = extra.delivery_instructions ?? ""

    if (extra.customer_contact?.id === form.customer_id) {
      selectedCustomerRef.value = extra.customer_contact
    }

    form.files = data.files ?? []

    form.packages = Array.isArray(extra.packages) ? extra.packages.map(normalizePackageRow) : []

    form.charges = Array.isArray(extra.charges) ? extra.charges.map(normalizeChargeRow) : []
    form.buy_costs = form.charges.filter((charge: any) => charge.type === "buy")
    form.sell_costs = form.charges.filter((charge: any) => charge.type === "sell")

    Object.assign(form.road_detail, emptyRoadDetail(), extra.road_detail ?? {})
    if (form.mode_of_transport === "road" && !form.road_detail.cmr_number) {
      form.road_detail.cmr_number = defaultCmrFromJobNumber(form.job_number)
    }
    lastAutoCmrRef.value = defaultCmrFromJobNumber(form.job_number)
    form.order_type =
      form.mode_of_transport === "road"
        ? (form.road_detail.order_type ?? extra.order_type ?? "")
        : ""
    Object.assign(form.sea_detail, emptySeaDetail(), extra.sea_detail ?? {})
    Object.assign(form.air_detail, emptyAirDetail(), extra.air_detail ?? {})
    Object.assign(form.rail_detail, emptyRailDetail(), extra.rail_detail ?? {})
    Object.assign(form.courier_detail, emptyCourierDetail(), extra.courier_detail ?? {})

    form.transport_legs = Array.isArray(extra.transport_legs) ? extra.transport_legs : []
    form.multi_modal_legs = form.transport_legs
    Object.assign(
      form.consolidation_details,
      normalizeConsolidationDetails(extra.consolidation_details),
    )
  }

  async function loadCustomers(query = "") {
    customerOptionsLoadingRef.value = true

    try {
      const res = await contactsService.list({
        page: 1,
        per_page: 100,
        q: query.trim() || undefined,
      })

      customerContactsRef.value = res.data ?? []
    } finally {
      customerOptionsLoadingRef.value = false
    }
  }

  async function loadDestinationContacts() {
    addressContactsLoadingRef.value = true

    try {
      const res = await contactsService.list({
        page: 1,
        per_page: 500,
        include_addresses: true,
      })

      destinationContactsRef.value = res.data ?? []
    } finally {
      addressContactsLoadingRef.value = false
    }
  }

  function onCustomerFilter(event: { value?: string }) {
    if (customerSearchTimer) {
      clearTimeout(customerSearchTimer)
    }

    customerSearchTimer = setTimeout(() => {
      loadCustomers(event.value ?? "")
    }, 250)
  }

  function onAddressContactFilter(event: { value?: string }) {
    if (addressContactSearchTimer) {
      clearTimeout(addressContactSearchTimer)
    }

    addressContactSearchTimer = setTimeout(async () => {
      addressContactsLoadingRef.value = true

      try {
        const res = await contactsService.list({
          page: 1,
          per_page: 500,
          q: event.value?.trim() || undefined,
          include_addresses: true,
        })

        destinationContactsRef.value = res.data ?? []
      } finally {
        addressContactsLoadingRef.value = false
      }
    }, 250)
  }

  async function loadReferenceData() {
    if (!referenceDataStore.categories.length) {
      await referenceDataStore.fetchAll()
    }
  }

  async function load() {
    if (!jobId.value) return

    const data = await transportJobStore.show(jobId.value)
    hydrateForm(data)
    lastSavedPayloadSnapshot.value = currentPayloadSnapshot()
    autosaveWatchSnapshot.value = lastSavedPayloadSnapshot.value
  }

  function buildUpdatePayload(): TransportJobUpdatePayload {
    const existingTransportLegIds = new Set<number>(
      ((job.value as any)?.transport_legs ?? [])
        .map((leg: any) => Number(leg.id))
        .filter((id: number) => Number.isFinite(id) && id > 0),
    )
    const isRoadMode = form.mode_of_transport === "road"

    return {
      customer_id: form.customer_id,
      account_number: form.account_number || null,
      quote_ref: form.quote_ref || null,
      job_number: form.job_number,
      job_date: formatDate(form.job_date),
      job_type: form.job_type || undefined,
      mode_of_transport: form.mode_of_transport,
      status: form.status || null,

      order_type: isRoadMode ? form.order_type || null : undefined,
      consignment_number: form.consignment_number || null,
      service_type: form.service_type || null,
      incoterms: form.incoterms || null,
      currency: form.currency || null,
      declared_value: form.declared_value,
      description_of_goods: form.description_of_goods || null,
      commodity_code: form.commodity_code || null,
      hs_code: isRoadMode ? form.hs_code || null : undefined,
      insurance_level: form.insurance_level || null,
      is_hazardous: form.is_hazardous,
      hazardous_class: form.hazardous_class || null,
      un_number: form.un_number || null,
      temperature_requirement: form.temperature_requirement || null,

      customer_po_number: form.customer_po_number || null,
      customer_booking_ref: form.customer_booking_ref || null,
      our_reference: form.our_reference || null,
      supplier_ref: form.supplier_ref || null,

      consignee_name: form.consignee_name || null,
      consignee_contact: form.consignee_contact || null,
      consignee_phone: form.consignee_phone || null,
      consignee_email: form.consignee_email || null,
      origin_contact_collection_address_id: form.origin_contact_collection_address_id,
      destination_contact_collection_address_id: form.destination_contact_collection_address_id,
      destination_address_source_type: form.destination_address_source_type,
      destination_address_source_id: form.destination_address_source_id,
      collection_date: formatDate(form.collection_date),
      collection_time: form.collection_time || null,
      latest_collection_time: isRoadMode ? form.latest_collection_time || null : undefined,
      delivery_date: isRoadMode ? formatDate(form.delivery_date) : undefined,
      delivery_from_time: isRoadMode ? form.delivery_from_time || null : undefined,
      delivery_by_time: isRoadMode ? form.delivery_by_time || null : undefined,
      loading_reference: isRoadMode ? form.loading_reference || null : undefined,
      delivery_booking_ref: isRoadMode ? form.delivery_booking_ref || null : undefined,
      collection_instructions: isRoadMode ? form.collection_instructions || null : undefined,
      delivery_instructions: isRoadMode ? form.delivery_instructions || null : undefined,

      note: form.note || null,

      ...detailPayloadForMode(form),

      packages: form.packages.map(serializePackageRow),
      charges: [...form.buy_costs, ...form.sell_costs].map(serializeChargeRow),
      transport_legs: serializeTransportLegs(form.multi_modal_legs, existingTransportLegIds),
      consolidation_details: form.consolidation_details,
    }
  }

  function currentPayloadSnapshot(): string {
    return stableStringify(buildUpdatePayload())
  }

  async function save(options: SaveOptions = {}) {
    if (!jobId.value) return

    const payload = buildUpdatePayload()

    saving.value = true

    try {
      const updated = await transportJobStore.update(jobId.value, payload)

      hydrateForm(updated)
      lastSavedPayloadSnapshot.value = currentPayloadSnapshot()
      autosaveWatchSnapshot.value = lastSavedPayloadSnapshot.value

      if (!options.silent) {
        toast.add({
          severity: "success",
          summary: options.successSummary ?? "Updated",
          detail: options.successDetail ?? "Job updated successfully.",
          life: options.successLife ?? 2200,
        })
      }
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Update failed",
        detail: extractErrorMessage(error),
        life: 5500,
      })
      throw error
    } finally {
      saving.value = false
    }
  }

  function isAutosaveTarget(target: EventTarget | null): target is HTMLElement {
    if (!(target instanceof HTMLElement)) return false

    const editable = target.closest("input, textarea, select, [contenteditable='true']")

    if (!(editable instanceof HTMLElement)) return false
    if (editable.closest(".p-hidden-accessible")) return false

    if (
      editable instanceof HTMLInputElement ||
      editable instanceof HTMLTextAreaElement ||
      editable instanceof HTMLSelectElement
    ) {
      if (editable.disabled) return false

      if (
        (editable instanceof HTMLInputElement || editable instanceof HTMLTextAreaElement) &&
        editable.readOnly
      ) {
        return false
      }

      if (
        editable instanceof HTMLInputElement &&
        ["button", "file", "hidden", "reset", "submit"].includes(editable.type)
      ) {
        return false
      }
    }

    return true
  }

  function hasEditableFocus() {
    if (typeof document === "undefined") return false

    return isAutosaveTarget(document.activeElement)
  }

  function clearAutosaveTimers() {
    autosaveTimers.forEach(timer => window.clearTimeout(timer))
    autosaveTimers.clear()

    if (autosaveWatchTimer !== null) {
      window.clearTimeout(autosaveWatchTimer)
      autosaveWatchTimer = null
    }
  }

  async function runAutosave(
    beforeSnapshot: string,
    options: { requireBlurredField?: boolean; silent?: boolean } = {},
  ) {
    await nextTick()

    const afterSnapshot = currentPayloadSnapshot()

    if (!beforeSnapshot || beforeSnapshot === afterSnapshot) return
    if (lastSavedPayloadSnapshot.value === afterSnapshot) return

    if (options.requireBlurredField && hasEditableFocus()) {
      scheduleAutosave(beforeSnapshot, AUTOSAVE_ACTIVE_FIELD_RETRY_MS, options)
      return
    }

    if (saving.value) {
      scheduleAutosave(lastSavedPayloadSnapshot.value, AUTOSAVE_ACTIVE_FIELD_RETRY_MS, options)
      return
    }

    try {
      await save({
        successSummary: "Autosaved",
        successDetail: autosaveSuccessDetail(beforeSnapshot, afterSnapshot),
        successLife: 1900,
        silent: options.silent,
      })
    } catch {
      // save() already surfaces the exact error toast.
    }
  }

  function scheduleAutosave(
    beforeSnapshot: string,
    delay = AUTOSAVE_IDLE_DELAY_MS,
    options: { requireBlurredField?: boolean; silent?: boolean } = {},
  ) {
    const timer = window.setTimeout(() => {
      autosaveTimers.delete(timer)
      runAutosave(beforeSnapshot, options)
    }, delay)

    autosaveTimers.add(timer)
  }

  async function flushAutosave(options: { silent?: boolean } = {}) {
    if (initialLoadingRef.value || saving.value || !jobId.value) return

    const beforeSnapshot = lastSavedPayloadSnapshot.value
    if (!beforeSnapshot) return

    clearAutosaveTimers()
    await runAutosave(beforeSnapshot, { silent: options.silent })
  }

  function scheduleAutosaveFromCurrentState(delay = AUTOSAVE_IDLE_DELAY_MS) {
    if (initialLoadingRef.value || saving.value || !jobId.value) return
    scheduleAutosave(lastSavedPayloadSnapshot.value, delay, { requireBlurredField: true })
  }

  function scheduleAutosaveFromWatcher() {
    if (initialLoadingRef.value || saving.value || !jobId.value) return

    const nextSnapshot = currentPayloadSnapshot()
    if (!autosaveWatchSnapshot.value) {
      autosaveWatchSnapshot.value = nextSnapshot
      return
    }

    if (autosaveWatchSnapshot.value === nextSnapshot) return
    if (lastSavedPayloadSnapshot.value === nextSnapshot) {
      autosaveWatchSnapshot.value = nextSnapshot
      return
    }

    autosaveWatchSnapshot.value = nextSnapshot

    if (autosaveWatchTimer !== null) {
      window.clearTimeout(autosaveWatchTimer)
    }

    autosaveWatchTimer = window.setTimeout(() => {
      autosaveWatchTimer = null
      scheduleAutosave(lastSavedPayloadSnapshot.value, 0, { requireBlurredField: true })
    }, AUTOSAVE_IDLE_DELAY_MS)
  }

  async function loadSelectedCustomer(customerId: number | null) {
    if (!customerId) {
      selectedCustomerRef.value = null
      return null
    }

    const loaded = await (contactStore as any).find(customerId)
    selectedCustomerRef.value = loaded
    form.account_number = loaded?.account_number ?? ""
    customerContactsRef.value = [
      loaded,
      ...customerContactsRef.value.filter(contact => Number(contact.id) !== Number(customerId)),
    ]

    return loaded
  }

  function openAddressModal(target: AddressTarget) {
    addressModalTargetRef.value = target
    addressModalVisibleRef.value = true
  }

  async function selectAddressContact(target: AddressTarget, contactId: number | null) {
    if (target !== "destination") return

    selectedDestinationContactIdRef.value = contactId

    if (!contactId) return

    const loaded = await (contactStore as any).find(Number(contactId))
    addressPickerContactRef.value = loaded
    destinationContactsRef.value = [
      loaded,
      ...destinationContactsRef.value.filter(contact => Number(contact.id) !== Number(contactId)),
    ]
    addressPickerTargetRef.value = target
    addressPickerVisibleRef.value = true
  }

  function chooseAddressSource(choice: AddressChoice) {
    form.destination_address_source_type = choice.sourceType
    form.destination_address_source_id = choice.id
    form.destination_contact_collection_address_id =
      choice.sourceType === "collection_address" ? choice.id : null

    addressPickerVisibleRef.value = false
    scheduleAutosaveFromCurrentState()
  }

  async function createAndSelectAddress(payload: JobTransportAddressPayload) {
    if (!form.customer_id) return

    addressModalSavingRef.value = true

    try {
      const updatedContact = await (contactStore as any).createCollectionAddress(
        Number(form.customer_id),
        payload,
      )
      selectedCustomerRef.value = updatedContact
      destinationContactsRef.value = [
        updatedContact,
        ...destinationContactsRef.value.filter(contact => {
          return Number(contact.id) !== Number(updatedContact.id)
        }),
      ]

      const addresses = updatedContact.collection_addresses ?? []
      const created = addresses[addresses.length - 1]

      if (created?.id) {
        if (addressModalTargetRef.value === "origin") {
          form.origin_contact_collection_address_id = Number(created.id)
        } else {
          form.destination_contact_collection_address_id = Number(created.id)
          form.destination_address_source_type = "collection_address"
          form.destination_address_source_id = Number(created.id)
        }
      }

      addressModalVisibleRef.value = false
      scheduleAutosaveFromCurrentState()
    } finally {
      addressModalSavingRef.value = false
    }
  }

  watch(
    () => form.customer_id,
    async id => {
      const customer = customerOptions.value.find((item: CustomerOption) => {
        return item.value === Number(id)
      })

      form.account_number = customer?.account_number ?? ""

      form.origin_contact_collection_address_id = null

      await loadSelectedCustomer(id ? Number(id) : null)
    },
    { flush: "sync" },
  )

  watch(
    () => form.commodity_code,
    value => {
      form.is_hazardous = isHazardousCommodity(value)
    },
  )

  watch(
    () => [form.mode_of_transport, form.job_number] as const,
    ([mode, jobNumber], [_previousMode, previousJobNumber]) => {
      if (mode !== "road") return

      const nextDefault = defaultCmrFromJobNumber(jobNumber)
      const previousDefault = lastAutoCmrRef.value || defaultCmrFromJobNumber(previousJobNumber)
      const current = String(form.road_detail.cmr_number ?? "").trim()

      if (!current || current === previousDefault) {
        form.road_detail.cmr_number = nextDefault
      }

      lastAutoCmrRef.value = nextDefault
    },
  )

  watch(
    form,
    () => {
      scheduleAutosaveFromWatcher()
    },
    { deep: true, flush: "post" },
  )

  const context: JobDetailsContext = {
    job,
    form,
    loading,
    isConsolidationJob,
    saving,
    save,
    load,
    originAddressOptions,
    destinationAddressOptions,
    addressContactOptions,
    addressContactsLoading: addressContactsLoadingRef,
    addressModalVisible: addressModalVisibleRef,
    addressModalTarget: addressModalTargetRef,
    addressModalSaving: addressModalSavingRef,
    addressPickerVisible: addressPickerVisibleRef,
    addressPickerTarget: addressPickerTargetRef,
    addressPickerContact: addressPickerContactRef,
    selectedDestinationContactId: selectedDestinationContactIdRef,
    selectedOriginAddress,
    selectedDestinationAddress,
    openAddressModal,
    createAndSelectAddress,
    onAddressContactFilter,
    selectAddressContact,
    chooseAddressSource,
    referenceOptions,
  }

  provide("jobDetails", context)

  onBeforeRouteUpdate(async () => {
    await flushAutosave()
  })

  onBeforeRouteLeave(async () => {
    await flushAutosave()
  })

  function flushAutosaveSilently() {
    void flushAutosave({ silent: true })
  }

  function flushAutosaveWhenHidden() {
    if (document.visibilityState === "hidden") {
      flushAutosaveSilently()
    }
  }

  onMounted(async () => {
    document.addEventListener("visibilitychange", flushAutosaveWhenHidden)
    window.addEventListener("pagehide", flushAutosaveSilently)
    window.addEventListener("beforeunload", flushAutosaveSilently)

    initialLoadingRef.value = true

    try {
      await Promise.all([loadCustomers(), loadDestinationContacts(), loadReferenceData()])
      await load()
    } finally {
      initialLoadingRef.value = false
    }
  })

  onUnmounted(() => {
    flushAutosaveSilently()
    document.removeEventListener("visibilitychange", flushAutosaveWhenHidden)
    window.removeEventListener("pagehide", flushAutosaveSilently)
    window.removeEventListener("beforeunload", flushAutosaveSilently)

    if (customerSearchTimer) {
      clearTimeout(customerSearchTimer)
      customerSearchTimer = null
    }

    if (addressContactSearchTimer) {
      clearTimeout(addressContactSearchTimer)
      addressContactSearchTimer = null
    }

    clearAutosaveTimers()
  })

  return {
    tabs,
    isActive,
    getTabCount,

    title,
    subtitle,

    job,
    form,
    customerOptions,
    customerOptionsLoading: customerOptionsLoadingRef,
    originAddressOptions,
    destinationAddressOptions,
    addressContactOptions,
    addressContactsLoading: addressContactsLoadingRef,
    modeOptions,
    statusOptions,
    referenceOptions,
    loading,
    isConsolidationJob,
    initialLoading: initialLoadingRef,
    saving,
    addressModalVisible: addressModalVisibleRef,
    addressModalTarget: addressModalTargetRef,
    addressModalSaving: addressModalSavingRef,
    addressPickerVisible: addressPickerVisibleRef,
    addressPickerTarget: addressPickerTargetRef,
    addressPickerContact: addressPickerContactRef,
    selectedDestinationContactId: selectedDestinationContactIdRef,
    selectedOriginAddress,
    selectedDestinationAddress,

    save,
    load,
    openAddressModal,
    createAndSelectAddress,
    onCustomerFilter,
    onAddressContactFilter,
    selectAddressContact,
    chooseAddressSource,
  }
}
