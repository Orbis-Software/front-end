import { computed, onMounted, provide, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"

import { useTransportJobStore } from "@/app/stores/transport-job"
import { useContactStore } from "@/app/stores/contact"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type { Contact, ContactCollectionAddress } from "@/app/types/contact"

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
  type JobCourierDetail,
  type JobRailDetail,
  type JobRoadDetail,
  type JobSeaDetail,
  type JobType,
  type TransportJob,
  type TransportJobUpdatePayload,
  type TransportMode,
} from "@/app/types/transport-job"
import type { JobTransportAddressPayload } from "@/app/components/jobs/details/JobTransportTab/JobTransportAddressModal.vue"

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

  service_type: string
  incoterms: string
  currency: string
  declared_value: number | null
  description_of_goods: string
  commodity_code: string
  insurance_level: string

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
  collection_date: Date | null
  collection_time: string

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

const jobRef = ref<TransportJob | null>(null)
const savingRef = ref(false)
const selectedCustomerRef = ref<Contact | null>(null)
const addressModalVisibleRef = ref(false)
const addressModalTargetRef = ref<AddressTarget>("origin")
const addressModalSavingRef = ref(false)
const initialLoadingRef = ref(false)

export type JobDetailsContext = {
  job: typeof jobRef
  form: JobDetailsForm
  loading: any
  isConsolidationJob: any
  saving: typeof savingRef
  save: () => Promise<void>
  load: () => Promise<void>
  originAddressOptions: any
  destinationAddressOptions: any
  addressModalVisible: any
  addressModalTarget: any
  addressModalSaving: any
  selectedOriginAddress: any
  selectedDestinationAddress: any
  openAddressModal: (target: AddressTarget) => void
  createAndSelectAddress: (payload: JobTransportAddressPayload) => Promise<void>
  referenceOptions: {
    serviceTypeOptions: any
    incotermOptions: any
    currencyOptions: any
    commodityTypeOptions: any
    insuranceLevelOptions: any
  }
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

function addressOption(address: ContactCollectionAddress): AddressSelectOption {
  const reference = address.reference_code ? `${address.reference_code} - ` : ""
  const label = address.label || address.city || addressSummary(address) || "Unnamed Address"

  return {
    label: `${reference}${label}`,
    value: Number(address.id),
    address,
  }
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
    service_type: null,
    vehicle_type: null,
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
    vehicle: stringValue(row?.vehicle, "7.5t"),
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
  if (form.mode_of_transport === "road") return { road_detail: form.road_detail }
  if (form.mode_of_transport === "sea") return { sea_detail: form.sea_detail }
  if (form.mode_of_transport === "air") return { air_detail: form.air_detail }
  if (form.mode_of_transport === "rail") return { rail_detail: form.rail_detail }
  if (form.mode_of_transport === "courier") return { courier_detail: form.courier_detail }

  return {}
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

    service_type: "",
    incoterms: "",
    currency: "",
    declared_value: null,
    description_of_goods: "",
    commodity_code: "",
    insurance_level: "",

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
    collection_date: null,
    collection_time: "",

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
      label: "Transport",
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
  const consolidationBaseTabs = baseTabs.filter(tab => tab.key !== "packages")

  type CustomerOption = {
    label: string
    value: number
    account_number: string
  }

  const customerOptions = computed<CustomerOption[]>(() => {
    return ((contactStore as any).items ?? []).map((contact: any) => ({
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
      (((contactStore as any).items ?? []) as Contact[]).find(contact => {
        return Number(contact.id) === Number(form.customer_id)
      }) ?? null
    )
  })

  const originAddressOptions = computed<AddressSelectOption[]>(() => {
    return (selectedCustomer.value?.collection_addresses ?? [])
      .filter(address => Boolean(address.is_collection))
      .map(addressOption)
  })

  const destinationAddressOptions = computed<AddressSelectOption[]>(() => {
    return (selectedCustomer.value?.collection_addresses ?? [])
      .filter(address => Boolean(address.is_delivery))
      .map(addressOption)
  })

  const selectedOriginAddress = computed<ContactCollectionAddress | null>(() => {
    return (
      originAddressOptions.value.find(option => {
        return option.value === Number(form.origin_contact_collection_address_id)
      })?.address ?? null
    )
  })

  const selectedDestinationAddress = computed<ContactCollectionAddress | null>(() => {
    return (
      destinationAddressOptions.value.find(option => {
        return option.value === Number(form.destination_contact_collection_address_id)
      })?.address ?? null
    )
  })

  const referenceOptions = {
    serviceTypeOptions: computed<SelectOption[]>(() => {
      const category = referenceDataStore.getByKey("service_types")
      return (category?.options ?? []).map(optionFromReference)
    }),

    incotermOptions: computed<SelectOption[]>(() => {
      const category = referenceDataStore.getByKey("incoterms")
      return (category?.options ?? []).map(optionFromReference)
    }),

    currencyOptions: computed<SelectOption[]>(() => {
      const category = referenceDataStore.getByKey("currency")
      return (category?.options ?? []).map(optionFromReference)
    }),

    commodityTypeOptions: computed<SelectOption[]>(() => {
      const category = referenceDataStore.getByKey("commodity_types")
      return (category?.options ?? []).map(optionFromReference)
    }),

    insuranceLevelOptions: computed<SelectOption[]>(() => [
      { label: "Standard Conditions", value: "Standard Conditions" },
      { label: "Enhanced Cover", value: "Enhanced Cover" },
      { label: "Full Declared Value", value: "Full Declared Value" },
      { label: "Customer's Own Insurance", value: "Customer's Own Insurance" },
    ]),
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

      if (!isConsolidation && consolidationTabNames.has(routeName)) {
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
    if (key === "supplier-invoices") return form.consolidation_details.supplierInvoices.length
    if (key === "collection-orders") return form.consolidation_details.collectionOrders.length
    if (key === "consolidated-invoices") return form.consolidation_details.consolidatedLines.length
    if (key === "customer-invoice") {
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

    form.customer_id = data.customer_id ?? null
    form.account_number = data.account_number ?? ""
    form.quote_ref = data.quote_ref ?? ""
    form.job_number = data.job_number ?? ""
    form.job_date = parseDate(data.job_date)
    form.job_type = data.job_type ?? ""
    form.mode_of_transport = normalizeTransportMode(data.mode_of_transport)
    form.status = extra.status ?? "Draft"
    form.note = data.note ?? ""

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
    form.insurance_level = extra.insurance_level ?? ""

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
    form.collection_date = parseDate(extra.collection_date)
    form.collection_time = extra.collection_time ?? ""

    if (extra.customer_contact?.id === data.customer_id) {
      selectedCustomerRef.value = extra.customer_contact
    }

    form.files = data.files ?? []

    form.packages = Array.isArray(extra.packages) ? extra.packages.map(normalizePackageRow) : []

    form.charges = Array.isArray(extra.charges) ? extra.charges : []
    form.buy_costs = form.charges.filter((charge: any) => charge.type === "buy")
    form.sell_costs = form.charges.filter((charge: any) => charge.type === "sell")

    Object.assign(form.road_detail, emptyRoadDetail(), extra.road_detail ?? {})
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

  async function loadCustomers() {
    if (typeof (contactStore as any).fetch === "function") {
      await (contactStore as any).fetch()
      return
    }

    if (typeof (contactStore as any).fetchAll === "function") {
      await (contactStore as any).fetchAll()
    }
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
  }

  async function save() {
    if (!jobId.value) return

    saving.value = true

    try {
      const existingTransportLegIds = new Set<number>(
        ((job.value as any)?.transport_legs ?? [])
          .map((leg: any) => Number(leg.id))
          .filter((id: number) => Number.isFinite(id) && id > 0),
      )

      const payload: TransportJobUpdatePayload = {
        customer_id: form.customer_id,
        account_number: form.account_number || null,
        quote_ref: form.quote_ref || null,
        job_number: form.job_number,
        job_date: formatDate(form.job_date),
        job_type: form.job_type || undefined,
        mode_of_transport: form.mode_of_transport,
        status: form.status || null,

        service_type: form.service_type || null,
        incoterms: form.incoterms || null,
        currency: form.currency || null,
        declared_value: form.declared_value,
        description_of_goods: form.description_of_goods || null,
        commodity_code: form.commodity_code || null,
        insurance_level: form.insurance_level || null,

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
        collection_date: formatDate(form.collection_date),
        collection_time: form.collection_time || null,

        note: form.note || null,

        ...detailPayloadForMode(form),

        packages: form.packages.map(serializePackageRow),
        charges: [...form.buy_costs, ...form.sell_costs],
        transport_legs: serializeTransportLegs(form.multi_modal_legs, existingTransportLegIds),
        consolidation_details: form.consolidation_details,
      }

      const updated = await transportJobStore.update(jobId.value, payload)

      hydrateForm(updated)
      toast.add({
        severity: "success",
        summary: "Updated",
        detail: "Job updated successfully.",
        life: 2200,
      })
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

  async function loadSelectedCustomer(customerId: number | null) {
    if (!customerId) {
      selectedCustomerRef.value = null
      return null
    }

    const loaded = await (contactStore as any).find(customerId)
    selectedCustomerRef.value = loaded

    return loaded
  }

  function openAddressModal(target: AddressTarget) {
    addressModalTargetRef.value = target
    addressModalVisibleRef.value = true
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

      const addresses = updatedContact.collection_addresses ?? []
      const created = addresses[addresses.length - 1]

      if (created?.id) {
        if (addressModalTargetRef.value === "origin") {
          form.origin_contact_collection_address_id = Number(created.id)
        } else {
          form.destination_contact_collection_address_id = Number(created.id)
        }
      }

      addressModalVisibleRef.value = false
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
      form.destination_contact_collection_address_id = null

      await loadSelectedCustomer(id ? Number(id) : null)
    },
    { flush: "sync" },
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
    addressModalVisible: addressModalVisibleRef,
    addressModalTarget: addressModalTargetRef,
    addressModalSaving: addressModalSavingRef,
    selectedOriginAddress,
    selectedDestinationAddress,
    openAddressModal,
    createAndSelectAddress,
    referenceOptions,
  }

  provide("jobDetails", context)

  onMounted(async () => {
    initialLoadingRef.value = true

    try {
      await Promise.all([loadCustomers(), loadReferenceData()])
      await load()
    } finally {
      initialLoadingRef.value = false
    }
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
    originAddressOptions,
    destinationAddressOptions,
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
    selectedOriginAddress,
    selectedDestinationAddress,

    save,
    load,
    openAddressModal,
    createAndSelectAddress,
  }
}
