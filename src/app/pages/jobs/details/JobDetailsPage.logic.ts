import { computed, onMounted, provide, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { useTransportJobStore } from "@/app/stores/transport-job"
import { useContactStore } from "@/app/stores/contact"
import type {
  JobType,
  TransportJob,
  TransportJobUpdatePayload,
  TransportMode,
} from "@/app/types/transport-job"

export type JobDetailsTab = {
  label: string
  name: string
  key: string
  showCount?: boolean
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

  description_of_goods: string
  customer_reference: string
  service_type: string

  packages: any[]
  buy_costs: any[]
  sell_costs: any[]
  files: any[]

  multi_modal_legs: any[]
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

export function useJobDetailsPage() {
  const route = useRoute()
  const transportJobStore = useTransportJobStore()
  const contactStore = useContactStore()

  const jobId = computed(() => {
    const raw = route.params.id
    const value = Number(Array.isArray(raw) ? raw[0] : raw)

    return Number.isFinite(value) && value > 0 ? value : null
  })

  const job = ref<TransportJob | null>(null)
  const loading = computed(() => transportJobStore.loading)
  const saving = ref(false)

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

    description_of_goods: "",
    customer_reference: "",
    service_type: "",

    packages: [],
    buy_costs: [],
    sell_costs: [],
    files: [],

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

    form.files = data.files ?? []

    form.description_of_goods = extra.description_of_goods ?? ""
    form.customer_reference = extra.customer_reference ?? ""
    form.service_type = extra.service_type ?? ""

    form.packages = Array.isArray(extra.packages) ? extra.packages : []
    form.buy_costs = Array.isArray(extra.buy_costs) ? extra.buy_costs : []
    form.sell_costs = Array.isArray(extra.sell_costs) ? extra.sell_costs : []
    form.multi_modal_legs = Array.isArray(extra.multi_modal_legs) ? extra.multi_modal_legs : []
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
        quote_ref: form.quote_ref || null,
        job_number: form.job_number,
        job_date: formatDate(form.job_date),
        job_type: form.job_type || undefined,
        mode_of_transport: form.mode_of_transport,
        note: form.note || null,

        ...({
          status: form.status,
          description_of_goods: form.description_of_goods,
          customer_reference: form.customer_reference,
          service_type: form.service_type,
          packages: form.packages,
          buy_costs: form.buy_costs,
          sell_costs: form.sell_costs,
          multi_modal_legs: form.multi_modal_legs,
        } as any),
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

  const context = {
    job,
    form,
    loading,
    saving,
    save,
    load,
  }

  provide("jobDetails", context)

  onMounted(async () => {
    await loadCustomers()
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
    loading,
    saving,

    save,
    load,
  }
}
