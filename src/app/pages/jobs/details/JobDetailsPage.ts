import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { useToast } from "primevue/usetoast"

import { useTransportJobStore } from "@/app/stores/transport-job"
import { useContactStore } from "@/app/stores/contact"

import type {
  TransportJob,
  TransportJobUpdatePayload,
  TransportMode,
} from "@/app/types/transport-job"
import type { Contact } from "@/app/types/contact"

export type JobDetailsTabKey =
  | "overview"
  | "job_details"
  | "packages"
  | "charges"
  | "tracking"
  | "documents"
  | "reference_data"
  | "milestones"
  | "customs"
  | "container"
  | "awb"
  | "routing"
  | "notes"
  | "collection"
  | "delivery"
  | "history"
  | "rail_details"
  | "parties"
  | "activity"
  | "core_details"
  | "carrier_vessel"
  | "routing_dates"
  | "cargo_customs"
  | "supplier_invoices"
  | "collection_orders"
  | "consolidated_invoice"
  | "customer_invoice"
  | "goods_in_out_wms"

export type JobDetailsTabItem = {
  key: JobDetailsTabKey
  label: string
  icon?: string
  badge?: number
}

function toDateOrNull(v: any): Date | null {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

function toIsoDate(v: Date | null): string | null {
  if (!v) return null
  return v.toISOString().slice(0, 10)
}

function formatCreatedDate(v: any): string {
  if (!v) return ""
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function contactDisplayName(c: any) {
  return c?.company_name ?? c?.name ?? [c?.first_name, c?.last_name].filter(Boolean).join(" ") ?? ""
}

function toTitleCaseMode(mode: TransportMode | null): string {
  switch (mode) {
    case "road":
      return "Road"
    case "sea":
      return "Sea"
    case "air":
      return "Air"
    case "rail":
      return "Rail"
    case "courier":
      return "Courier"
    case "multi_modal":
      return "Multi Modal"
    default:
      return "Job"
  }
}

export function useJobDetailsPage() {
  const route = useRoute()
  const toast = useToast()

  const transportJobsStore = useTransportJobStore()
  const contactStore = useContactStore()

  const jobId = computed<number | null>(() => {
    const raw = route.params.id
    const n = Number(Array.isArray(raw) ? raw[0] : raw)
    return Number.isFinite(n) && n > 0 ? n : null
  })

  const job = ref<TransportJob | null>(null)
  const loading = computed(() => transportJobsStore.loading)
  const saving = ref(false)

  const prevTypeId = ref<number | null>(null)
  const prevSearch = ref("")

  const form = reactive({
    customer_id: null as number | null,
    quote_ref: "" as string,
    job_date: null as Date | null,

    account_number: "" as string,
    customer_name: "" as string,
    job_number: "" as string,
    mode_of_transport: null as TransportMode | null,

    status: "Draft" as string,
    created_label: "" as string,

    awb_no: "" as string,
    customer_reference: "" as string,
    our_reference: "" as string,

    service_type: "" as string,
    vehicle_trailer_type: "" as string,
    incoterms: "" as string,
    currency: "" as string,
    declared_value: "" as string,
    description_of_goods: "" as string,
    commodity_code: "" as string,
    hazmat_class: "" as string,
    un_number: "" as string,
    special_instructions: "" as string,

    order_type: "local_collection" as "local_collection" | "full_transport_order",

    collection_type: "On-Demand" as string,
    priority_service_level: "Standard" as string,
    vehicle_required: "Motorbike Courier" as string,
    zone_area: "" as string,
    est_distance_miles: "0" as string,
    est_duration_hours: "0.0" as string,
    rate_per_mile: "0.00" as string,
    estimated_mileage_cost: "" as string,
    round_trip: "no" as "yes" | "no",
    signature_required: "yes" as "yes" | "no",
    pod_method: "Paper POD" as string,
    parking_access_code: "" as string,
    time_critical: "no" as "yes" | "no",
    exact_delivery_time: "" as string,
    driver_assigned: "" as string,
    driver_mobile: "" as string,
    local_collection_notes: "" as string,

    collection_company_name: "" as string,
    collection_address_1: "" as string,
    collection_address_2: "" as string,
    collection_city: "" as string,
    collection_county_state: "" as string,
    collection_postcode: "" as string,
    collection_country: "United Kingdom" as string,
    collection_contact_name: "" as string,
    collection_phone: "" as string,
    collection_email: "" as string,
    collection_date_ui: null as Date | null,
    collection_ready_time: "" as string,
    latest_collection: "" as string,
    loading_ref_bay: "" as string,
    collection_instructions: "" as string,

    delivery_company_name: "" as string,
    delivery_address_1: "" as string,
    delivery_address_2: "" as string,
    delivery_city: "" as string,
    delivery_county_state: "" as string,
    delivery_postcode: "" as string,
    delivery_country: "United Kingdom" as string,
    delivery_contact_name: "" as string,
    delivery_phone: "" as string,
    delivery_email: "" as string,
    delivery_date_ui: null as Date | null,
    delivery_from: "" as string,
    delivery_by: "" as string,
    delivery_booking_ref: "" as string,
    delivery_instructions: "" as string,

    carrier_name: "" as string,
    carrier_driver_name: "" as string,
    carrier_driver_mobile: "" as string,
    vehicle_registration: "" as string,
    trailer_container_no: "" as string,
    seal_number: "" as string,
    cmr_waybill_no: "" as string,
    route_via: "" as string,

    flight_no: "" as string,
    origin_airport: "" as string,
    destination_airport: "" as string,
    airline: "" as string,
    vessel_name: "" as string,
    voyage_no: "" as string,
    port_of_loading: "" as string,
    port_of_discharge: "" as string,
  })

  const customerTypeId = computed<number | null>(() => {
    const t = (contactStore.types ?? []).find((x: any) => {
      const name = String(x?.name ?? "").toLowerCase()
      return name === "customer"
    })
    return t?.id ?? null
  })

  const customerOptions = computed(() => {
    const items: Contact[] = (contactStore.items ?? []) as any
    return items.map((c: any) => ({
      label: contactDisplayName(c),
      value: Number(c.id),
    }))
  })

  const tabs = computed<JobDetailsTabItem[]>(() => {
    switch (form.mode_of_transport) {
      case "road":
        return [
          { key: "job_details", label: "Job Details", icon: "pi pi-folder-open" },
          { key: "packages", label: "Packages", icon: "pi pi-box" },
          { key: "charges", label: "Charges", icon: "pi pi-dollar" },
          { key: "documents", label: "Documents", icon: "pi pi-file" },
        ]

      case "air":
        return [
          { key: "job_details", label: "Job Details", icon: "pi pi-folder-open" },
          { key: "packages", label: "Packages", icon: "pi pi-box" },
          { key: "charges", label: "Charges", icon: "pi pi-dollar" },
          { key: "documents", label: "Documents", icon: "pi pi-file" },
          { key: "notes", label: "Notes", icon: "pi pi-pencil" },
        ]

      case "courier":
        return [
          { key: "overview", label: "Overview", icon: "pi pi-home" },
          { key: "collection", label: "Collection", icon: "pi pi-arrow-down-left" },
          { key: "delivery", label: "Delivery", icon: "pi pi-arrow-up-right" },
          { key: "packages", label: "Packages", icon: "pi pi-box" },
          { key: "charges", label: "Charges", icon: "pi pi-dollar" },
          { key: "documents", label: "Documents", icon: "pi pi-file" },
        ]

      case "rail":
        return [
          { key: "rail_details", label: "Rail Details", icon: "pi pi-folder-open" },
          { key: "parties", label: "Parties", icon: "pi pi-users" },
          { key: "packages", label: "Packages", icon: "pi pi-box" },
          { key: "charges", label: "Charges", icon: "pi pi-dollar" },
          { key: "documents", label: "Documents", icon: "pi pi-file" },
          { key: "reference_data", label: "Reference Data", icon: "pi pi-book" },
        ]

      case "sea":
        return [
          { key: "core_details", label: "Core Details", icon: "pi pi-folder-open" },
          { key: "carrier_vessel", label: "Carrier and Vessel", icon: "pi pi-send" },
          { key: "routing_dates", label: "Routing and Dates", icon: "pi pi-map" },
          { key: "cargo_customs", label: "Cargo and Customs", icon: "pi pi-briefcase" },
        ]

      case "multi_modal":
        return [
          { key: "job_details", label: "Job Details", icon: "pi pi-folder-open" },
          { key: "routing", label: "Routing", icon: "pi pi-map" },
          { key: "packages", label: "Packages", icon: "pi pi-box" },
          { key: "charges", label: "Charges", icon: "pi pi-dollar" },
          { key: "documents", label: "Documents", icon: "pi pi-file" },
        ]

      case "consolidation":
        return [
          { key: "overview", label: "Overview", icon: "pi pi-home" },
          { key: "supplier_invoices", label: "Supplier Invoices", icon: "pi pi-receipt" },
          { key: "collection_orders", label: "Collection Orders", icon: "pi pi-truck" },
          { key: "consolidated_invoice", label: "Consolidated Invoice", icon: "pi pi-file" },
          { key: "customer_invoice", label: "Customer Invoice", icon: "pi pi-wallet" },
          { key: "goods_in_out_wms", label: "Goods In/Out WMS", icon: "pi pi-box" },
        ]

      default:
        return [
          { key: "overview", label: "Overview", icon: "pi pi-folder-open" },
          { key: "documents", label: "Documents", icon: "pi pi-file" },
        ]
    }
  })

  const activeTab = ref<JobDetailsTabKey>("overview")

  const validTabKeys = computed(() => tabs.value.map(tab => tab.key))

  watch(
    validTabKeys,
    keys => {
      if (!keys.includes(activeTab.value)) {
        activeTab.value = (keys[0] as JobDetailsTabKey) ?? "overview"
      }
    },
    { immediate: true },
  )

  const headerTitle = computed(() => form.job_number || "Job")

  const headerMeta = computed(() => {
    const mode = toTitleCaseMode(form.mode_of_transport)
    const status = form.status || "Draft"
    return `${mode.toUpperCase()} · ${status}`
  })

  async function initCustomerFilter() {
    prevTypeId.value = (contactStore as any).activeTypeId ?? null
    prevSearch.value = (contactStore as any).search ?? ""

    await contactStore.fetchTypes()

    if (typeof (contactStore as any).setTypeId === "function") {
      await (contactStore as any).setTypeId(customerTypeId.value ?? null)
    } else {
      ;(contactStore as any).activeTypeId = customerTypeId.value ?? null
    }

    if (typeof (contactStore as any).setSearch === "function") {
      await (contactStore as any).setSearch("")
    } else {
      ;(contactStore as any).search = ""
    }

    if (typeof (contactStore as any).fetch === "function") {
      await (contactStore as any).fetch()
    }
  }

  function cleanupCustomerFilter() {
    ;(contactStore as any).activeTypeId = prevTypeId.value
    ;(contactStore as any).search = prevSearch.value
  }

  async function onCustomerFilter(e: any) {
    const q = String(e?.value ?? e?.query ?? "").trim()

    if (typeof (contactStore as any).setSearch === "function") {
      await (contactStore as any).setSearch(q)
    } else {
      ;(contactStore as any).search = q
    }

    if (typeof (contactStore as any).fetch === "function") {
      await (contactStore as any).fetch()
    }
  }

  function hydrateFromJob(j: TransportJob) {
    form.customer_id = j.customer_id ?? null
    form.quote_ref = (j as any).quote_ref ?? ""
    form.job_date = toDateOrNull(j.job_date)

    form.job_number = j.job_number ?? ""
    form.mode_of_transport = (j.mode_of_transport ?? null) as any

    form.customer_name = contactDisplayName((j as any).customer_contact)
    form.account_number =
      (j as any).account_number ?? (j as any).customer_contact?.account_number ?? ""

    form.status = String((j as any).status ?? "Draft")
    form.created_label = formatCreatedDate((j as any).created_at)

    form.awb_no = (j as any).awb_no ?? (j as any).consignment_no ?? ""
    form.customer_reference = (j as any).customer_reference ?? (j as any).quote_ref ?? ""
    form.our_reference = (j as any).our_reference ?? ""
    form.service_type = (j as any).service_type ?? ""
    form.vehicle_trailer_type = (j as any).vehicle_trailer_type ?? ""
    form.incoterms = (j as any).incoterms ?? ""
    form.currency = (j as any).currency ?? ""
    form.declared_value = String((j as any).declared_value ?? "")
    form.description_of_goods = (j as any).description_of_goods ?? ""
    form.commodity_code = (j as any).commodity_code ?? ""
    form.hazmat_class = (j as any).hazmat_class ?? ""
    form.un_number = (j as any).un_number ?? ""
    form.special_instructions = (j as any).special_instructions ?? ""

    form.order_type =
      (j as any).order_type === "full_transport_order" ? "full_transport_order" : "local_collection"

    form.collection_type = (j as any).collection_type ?? "On-Demand"
    form.priority_service_level = (j as any).priority_service_level ?? "Standard"
    form.vehicle_required = (j as any).vehicle_required ?? "Motorbike Courier"
    form.zone_area = (j as any).zone_area ?? ""
    form.est_distance_miles = String((j as any).est_distance_miles ?? "0")
    form.est_duration_hours = String((j as any).est_duration_hours ?? "0.0")
    form.rate_per_mile = String((j as any).rate_per_mile ?? "0.00")
    form.estimated_mileage_cost = String((j as any).estimated_mileage_cost ?? "")
    form.round_trip = (j as any).round_trip === "yes" ? "yes" : "no"
    form.signature_required = (j as any).signature_required === "no" ? "no" : "yes"
    form.pod_method = (j as any).pod_method ?? "Paper POD"
    form.parking_access_code = (j as any).parking_access_code ?? ""
    form.time_critical = (j as any).time_critical === "yes" ? "yes" : "no"
    form.exact_delivery_time = (j as any).exact_delivery_time ?? ""
    form.driver_assigned = (j as any).driver_assigned ?? ""
    form.driver_mobile = (j as any).driver_mobile ?? ""
    form.local_collection_notes = (j as any).local_collection_notes ?? ""

    form.collection_company_name = (j as any).collection_company_name ?? ""
    form.collection_address_1 = (j as any).collection_address_1 ?? ""
    form.collection_address_2 = (j as any).collection_address_2 ?? ""
    form.collection_city = (j as any).collection_city ?? ""
    form.collection_county_state = (j as any).collection_county_state ?? ""
    form.collection_postcode = (j as any).collection_postcode ?? ""
    form.collection_country = (j as any).collection_country ?? "United Kingdom"
    form.collection_contact_name = (j as any).collection_contact_name ?? ""
    form.collection_phone = (j as any).collection_phone ?? ""
    form.collection_email = (j as any).collection_email ?? ""
    form.collection_date_ui = toDateOrNull((j as any).collection_date)
    form.collection_ready_time = (j as any).collection_ready_time ?? ""
    form.latest_collection = (j as any).latest_collection ?? ""
    form.loading_ref_bay = (j as any).loading_ref_bay ?? ""
    form.collection_instructions = (j as any).collection_instructions ?? ""

    form.delivery_company_name = (j as any).delivery_company_name ?? ""
    form.delivery_address_1 = (j as any).delivery_address_1 ?? ""
    form.delivery_address_2 = (j as any).delivery_address_2 ?? ""
    form.delivery_city = (j as any).delivery_city ?? ""
    form.delivery_county_state = (j as any).delivery_county_state ?? ""
    form.delivery_postcode = (j as any).delivery_postcode ?? ""
    form.delivery_country = (j as any).delivery_country ?? "United Kingdom"
    form.delivery_contact_name = (j as any).delivery_contact_name ?? ""
    form.delivery_phone = (j as any).delivery_phone ?? ""
    form.delivery_email = (j as any).delivery_email ?? ""
    form.delivery_date_ui = toDateOrNull((j as any).delivery_date)
    form.delivery_from = (j as any).delivery_from ?? ""
    form.delivery_by = (j as any).delivery_by ?? ""
    form.delivery_booking_ref = (j as any).delivery_booking_ref ?? ""
    form.delivery_instructions = (j as any).delivery_instructions ?? ""

    form.carrier_name = (j as any).carrier_name ?? ""
    form.carrier_driver_name = (j as any).carrier_driver_name ?? ""
    form.carrier_driver_mobile = (j as any).carrier_driver_mobile ?? ""
    form.vehicle_registration = (j as any).vehicle_registration ?? ""
    form.trailer_container_no = (j as any).trailer_container_no ?? ""
    form.seal_number = (j as any).seal_number ?? ""
    form.cmr_waybill_no = (j as any).cmr_waybill_no ?? ""
    form.route_via = (j as any).route_via ?? ""

    form.flight_no = (j as any).flight_no ?? ""
    form.origin_airport = (j as any).origin_airport ?? ""
    form.destination_airport = (j as any).destination_airport ?? ""
    form.airline = (j as any).airline ?? ""
    form.vessel_name = (j as any).vessel_name ?? ""
    form.voyage_no = (j as any).voyage_no ?? ""
    form.port_of_loading = (j as any).port_of_loading ?? ""
    form.port_of_discharge = (j as any).port_of_discharge ?? ""
  }

  async function load() {
    if (!jobId.value) return
    const j = await transportJobsStore.show(jobId.value)
    job.value = j
    hydrateFromJob(j)
  }

  watch(
    () => form.customer_id,
    id => {
      if (!id) {
        form.account_number = ""
        form.customer_name = ""
        return
      }

      const c = (contactStore.items ?? []).find((x: any) => Number(x.id) === Number(id)) as any

      if (c) {
        form.account_number = c.account_number ?? ""
        form.customer_name = contactDisplayName(c)
      }
    },
  )

  async function onSave() {
    if (!jobId.value) return

    saving.value = true

    try {
      const payload: TransportJobUpdatePayload = {
        customer_id: form.customer_id ?? null,
        quote_ref: form.quote_ref || null,
        job_date: toIsoDate(form.job_date),
        mode_of_transport: (form.mode_of_transport ?? "road") as any,
      }

      const updated = await transportJobsStore.update(jobId.value, payload)
      job.value = updated
      hydrateFromJob(updated)

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Job updated",
        life: 2200,
      })

      await load()
    } catch (e: any) {
      const msg = String(e?.response?.data?.message ?? e?.message ?? "Unable to save job")

      toast.add({
        severity: "error",
        summary: "Failed",
        detail: msg,
        life: 4000,
      })

      throw e
    } finally {
      saving.value = false
    }
  }

  function onPrint() {}
  function onExportPdf() {}
  function onBookJob() {}

  onMounted(async () => {
    await initCustomerFilter()
    await load()
  })

  onUnmounted(() => {
    cleanupCustomerFilter()
  })

  watch(jobId, async () => {
    await initCustomerFilter()
    await load()
  })

  return {
    job,
    jobId,

    loading,
    saving,

    headerTitle,
    headerMeta,
    form,

    tabs,
    activeTab,

    customerOptions,
    onCustomerFilter,

    onSave,
    onPrint,
    onExportPdf,
    onBookJob,
  }
}
