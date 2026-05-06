import { computed, onMounted, provide, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { useTransportJobStore } from "@/app/stores/transport-job"
import { useContactStore } from "@/app/stores/contact"
import { useReferenceDataStore } from "@/app/stores/reference-data"

import {
  TRANSPORT_MODES,
  type JobType,
  type TransportJob,
  type TransportJobUpdatePayload,
  type TransportMode,
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

  packages: any[]
  charges: any[]
  buy_costs: any[]
  sell_costs: any[]
  files: any[]

  transport_legs: any[]
  multi_modal_legs: any[]
}

const jobRef = ref<TransportJob | null>(null)
const savingRef = ref(false)

export type JobDetailsContext = {
  job: typeof jobRef
  form: JobDetailsForm
  loading: any
  saving: typeof savingRef
  save: () => Promise<void>
  load: () => Promise<void>
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

export function useJobDetailsPage() {
  const route = useRoute()
  const transportJobStore = useTransportJobStore()
  const contactStore = useContactStore()
  const referenceDataStore = useReferenceDataStore()

  const jobId = computed(() => {
    const raw = route.params.id
    const value = Number(Array.isArray(raw) ? raw[0] : raw)

    return Number.isFinite(value) && value > 0 ? value : null
  })

  const job = jobRef
  const loading = computed(() => transportJobStore.loading || referenceDataStore.loading)
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

    packages: [],
    charges: [],
    buy_costs: [],
    sell_costs: [],
    files: [],

    transport_legs: [],
    multi_modal_legs: [],
  })

  const tabs: JobDetailsTab[] = [
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
  ]

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
    form.mode_of_transport = data.mode_of_transport ?? null
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

    form.files = data.files ?? []

    form.packages = Array.isArray(extra.packages) ? extra.packages.map(normalizePackageRow) : []

    form.charges = Array.isArray(extra.charges) ? extra.charges : []
    form.buy_costs = form.charges.filter((charge: any) => charge.type === "buy")
    form.sell_costs = form.charges.filter((charge: any) => charge.type === "sell")

    form.transport_legs = Array.isArray(extra.transport_legs) ? extra.transport_legs : []
    form.multi_modal_legs = form.transport_legs
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

        note: form.note || null,

        packages: form.packages.map(serializePackageRow),
        charges: [...form.buy_costs, ...form.sell_costs],
        transport_legs: form.multi_modal_legs,
      }

      const updated = await transportJobStore.update(jobId.value, payload)

      hydrateForm(updated)
    } finally {
      saving.value = false
    }
  }

  watch(
    () => form.customer_id,
    id => {
      const customer = customerOptions.value.find((item: CustomerOption) => {
        return item.value === Number(id)
      })

      form.account_number = customer?.account_number ?? ""
    },
  )

  const context: JobDetailsContext = {
    job,
    form,
    loading,
    saving,
    save,
    load,
    referenceOptions,
  }

  provide("jobDetails", context)

  onMounted(async () => {
    await Promise.all([loadCustomers(), loadReferenceData()])
    await load()
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
    modeOptions,
    statusOptions,
    referenceOptions,
    loading,
    saving,

    save,
    load,
  }
}
