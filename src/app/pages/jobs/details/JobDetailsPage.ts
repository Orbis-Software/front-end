import { computed, reactive, ref } from "vue"

export type JobDetailsTabKey =
  | "overview"
  | "packages"
  | "charges"
  | "tracking"
  | "documents"
  | "reference_data"

export type JobDetailsTabItem = {
  key: JobDetailsTabKey
  label: string
  icon?: string
  badge?: number
}

export type ModeOfTransport = "road" | "air" | "sea" | "rail" | "courier" | "multi_modal"

export type JobDetailsForm = {
  id: number | null
  job_number: string
  status: string
  mode_of_transport: ModeOfTransport
  created_at_label: string

  awb_no: string
  customer_reference: string
  our_reference: string

  service_type: string | null
  vehicle_trailer_type: string | null
  incoterms: string | null
  currency: string | null

  declared_value: number | null
  description_of_goods: string
  commodity_code: string
  hazmat_class: string
  un_number: string
  special_instructions: string

  order_type: "local_collection" | "full_transport_order"

  collection_company_name: string
  collection_address_1: string
  collection_address_2: string
  collection_city: string
  collection_county_state: string
  collection_postcode: string
  collection_country: string | null
  collection_contact_name: string
  collection_phone: string
  collection_email: string
  collection_date: string
  collection_ready_time: string
  latest_collection: string
  loading_ref_bay: string
  collection_instructions: string

  delivery_company_name: string
  delivery_address_1: string
  delivery_address_2: string
  delivery_city: string
  delivery_county_state: string
  delivery_postcode: string
  delivery_country: string | null
  delivery_contact_name: string
  delivery_phone: string
  delivery_email: string
  delivery_date: string
  delivery_from: string
  delivery_by: string
  delivery_booking_ref: string
  delivery_instructions: string
}

export function useJobDetailsPage() {
  const loading = ref(false)
  const saving = ref(false)

  const activeTab = ref<JobDetailsTabKey>("overview")

  const tabs = ref<JobDetailsTabItem[]>([
    { key: "overview", label: "Job Details", icon: "pi pi-folder-open" },
    { key: "packages", label: "Packages", icon: "pi pi-box", badge: 1 },
    { key: "charges", label: "Charges", icon: "pi pi-dollar", badge: 0 },
    { key: "tracking", label: "Tracking", icon: "pi pi-clock" },
    { key: "documents", label: "Documents", icon: "pi pi-file" },
    { key: "reference_data", label: "Reference Data", icon: "pi pi-book" },
  ])

  const form = reactive<JobDetailsForm>({
    id: 421,
    job_number: "JOB-2026-0421",
    status: "Draft",
    mode_of_transport: "road",
    created_at_label: "Created 21 Mar 2026",

    awb_no: "123-45678901",
    customer_reference: "PO / Customer Ref",
    our_reference: "Internal ref",

    service_type: "FTL – Full Truck Load",
    vehicle_trailer_type: "Standard Trailer (13.6m)",
    incoterms: null,
    currency: "GBP – £",

    declared_value: 0,
    description_of_goods: "General cargo / machinery / palletised goods...",
    commodity_code: "e.g. 8471.30",
    hazmat_class: "e.g. Class 3 – Flammable",
    un_number: "UN1234",
    special_instructions:
      "Temperature requirements, handling notes, hazardous material details, access restrictions...",

    order_type: "local_collection",

    collection_company_name: "Company name",
    collection_address_1: "Street address",
    collection_address_2: "Unit / building",
    collection_city: "City",
    collection_county_state: "County",
    collection_postcode: "Postcode",
    collection_country: "United Kingdom",
    collection_contact_name: "Contact name",
    collection_phone: "+44 ...",
    collection_email: "contact@company.com",
    collection_date: "",
    collection_ready_time: "09:00 am",
    latest_collection: "05:00 pm",
    loading_ref_bay: "Dock / bay ref",
    collection_instructions: "Access codes, parking, dock height, forklift availability...",

    delivery_company_name: "Company name",
    delivery_address_1: "Street address",
    delivery_address_2: "Unit / building",
    delivery_city: "City",
    delivery_county_state: "County",
    delivery_postcode: "Postcode",
    delivery_country: "United Kingdom",
    delivery_contact_name: "Contact name",
    delivery_phone: "+44 ...",
    delivery_email: "contact@company.com",
    delivery_date: "",
    delivery_from: "08:00 am",
    delivery_by: "05:00 pm",
    delivery_booking_ref: "Booking / delivery ref",
    delivery_instructions: "Access codes, parking, unloading notes, POD requirements...",
  })

  const headerTitle = computed(() => form.job_number || "Job")
  const headerMeta = computed(
    () => `${formatModeLabel(form.mode_of_transport)} · ${form.created_at_label}`,
  )

  async function onSave() {
    saving.value = true

    try {
      await fakeWait(700)
      console.log("saving job", JSON.parse(JSON.stringify(form)))
    } finally {
      saving.value = false
    }
  }

  async function onPrint() {
    console.log("print job", form.id)
  }

  async function onExportPdf() {
    console.log("export pdf", form.id)
  }

  async function onBookJob() {
    console.log("book job", form.id)
  }

  return {
    loading,
    saving,

    form,
    headerTitle,
    headerMeta,

    tabs,
    activeTab,

    onSave,
    onPrint,
    onExportPdf,
    onBookJob,
  }
}

function formatModeLabel(mode: ModeOfTransport): string {
  switch (mode) {
    case "road":
      return "Road Freight"
    case "air":
      return "Air Freight"
    case "sea":
      return "Sea Freight"
    case "rail":
      return "Rail Freight"
    case "courier":
      return "Courier"
    case "multi_modal":
      return "Multi Modal"
    default:
      return "Job"
  }
}

function fakeWait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
