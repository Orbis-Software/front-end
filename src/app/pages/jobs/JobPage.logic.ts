import { computed, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useToast } from "primevue/usetoast"

import { useContactStore } from "@/app/stores/contact"
import { useTransportJobStore } from "@/app/stores/transport-job"
import { useCompanyStore } from "@/app/stores/company"

import type { Contact } from "@/app/types/contact"
import type {
  JobType,
  TransportMode,
  TransportJob,
  TransportJobCreatePayload,
} from "@/app/types/transport-job"
import type { CompanyReferenceSequence } from "@/app/types/company"

import { buildReferenceNumber } from "@/app/utils/reference-sequence"

export type CardItem<K extends string> = {
  key: K
  title: string
  subtitle: string
}

export const JOB_TYPES: CardItem<JobType>[] = [
  { key: "import", title: "Import", subtitle: "Create an Import job" },
  { key: "export", title: "Export", subtitle: "Create an Export job" },
  { key: "domestic", title: "Domestic", subtitle: "Create a Domestic job" },
  { key: "courier", title: "Courier", subtitle: "Create a Courier job" },
  { key: "multi_modal", title: "Multi Modal", subtitle: "Create a Multi Modal job" },
  { key: "consolidation", title: "Consolidation", subtitle: "Create a Consolidation job" },
]

export const MODES: CardItem<TransportMode>[] = [
  { key: "air", title: "Air", subtitle: "Choose Air" },
  { key: "rail", title: "Rail", subtitle: "Choose Rail" },
  { key: "road", title: "Road", subtitle: "Choose Road" },
  { key: "sea", title: "Sea", subtitle: "Choose Sea" },
]

export function useJobCreatePage() {
  const router = useRouter()
  const toast = useToast()

  const contactStore = useContactStore()
  const store = useTransportJobStore()
  const companyStore = useCompanyStore()

  const jobType = ref<JobType | null>(null)
  const mode = ref<TransportMode | null>(null)

  const jobTypeLabel = computed(() => JOB_TYPES.find(x => x.key === jobType.value)?.title ?? "")
  const modeLabel = computed(() => MODES.find(x => x.key === mode.value)?.title ?? "")

  const isNoModeJobType = computed(() => {
    return jobType.value === "multi_modal" || jobType.value === "consolidation"
  })

  const availableModes = computed<CardItem<TransportMode>[]>(() => {
    if (isNoModeJobType.value) return []
    return MODES
  })

  const form = reactive<{
    customer_id: number | null
    customer_quote_ref: string
    job_number: string
    job_date: Date | null
    note: string
  }>({
    customer_id: null,
    customer_quote_ref: "",
    job_number: "",
    job_date: null,
    note: "",
  })

  const creating = ref(false)
  const createError = ref("")
  const jobNumberAuto = ref(true)

  const canCreate = computed(() => {
    const hasMode = isNoModeJobType.value ? true : !!mode.value
    return !!jobType.value && hasMode && !!form.job_number && !creating.value
  })

  const selectedCustomer = ref<Contact | null>(null)
  const customerSuggestions = computed<Contact[]>(() => contactStore.items)

  const prevTypeId = ref<number | null>(null)
  const prevSearch = ref("")

  const customerTypeId = computed<number | null>(() => {
    const t = (contactStore.types ?? []).find((x: any) => {
      const name = String(x?.name ?? "").toLowerCase()
      return name === "customer"
    })
    return t?.id ?? null
  })

  function contactDisplayName(c: any) {
    return c.company_name ?? c.name ?? [c.first_name, c.last_name].filter(Boolean).join(" ") ?? ""
  }

  const customerOptionLabel = (c: any) => contactDisplayName(c)

  const accountNumberPreview = computed(() => {
    return (selectedCustomer.value as any)?.account_number ?? ""
  })

  function isJobType(value: string): value is JobType {
    return JOB_TYPES.some(item => item.key === value)
  }

  function isTransportMode(value: string): value is TransportMode {
    return MODES.some(item => item.key === value)
  }

  function selectJobType(next: string) {
    if (!isJobType(next)) return

    jobType.value = next
    mode.value = null
    form.job_number = ""
    jobNumberAuto.value = true
  }

  function selectMode(next: string) {
    if (!isTransportMode(next)) return

    mode.value = next
    form.job_number = ""
    jobNumberAuto.value = true
  }

  function resetAll() {
    jobType.value = null
    mode.value = null
    form.job_number = ""
    form.job_date = null
    jobNumberAuto.value = true
  }

  function formatDateYYYYMMDD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`
  }

  const jobSequence = computed<CompanyReferenceSequence | null>(() => {
    const seqs = companyStore.item?.reference_sequences ?? []
    if (!Array.isArray(seqs) || seqs.length === 0) return null

    const seq = seqs.find(x => x.type === "job")
    return seq ?? null
  })

  function refreshJobNumberPreview(force = false) {
    if (!jobType.value) return
    if (!isNoModeJobType.value && !mode.value) return

    const seq = jobSequence.value
    if (!seq || !seq.use_system) return

    if (!force && form.job_number && !jobNumberAuto.value) return

    const date = form.job_date ?? new Date()
    const preview = buildReferenceNumber(seq, date, { separator: "-" })

    if (preview) {
      form.job_number = preview
      jobNumberAuto.value = true
    }
  }

  async function initJobPage() {
    prevTypeId.value = contactStore.activeTypeId
    prevSearch.value = contactStore.search ?? ""

    companyStore.hydrateFromAuth()

    const hasSeq =
      Array.isArray(companyStore.item?.reference_sequences) &&
      companyStore.item!.reference_sequences.length > 0

    if (!hasSeq) {
      try {
        await companyStore.fetch()
      } catch {
        // allow page to load even if company fetch fails
      }
    }

    await contactStore.fetchTypes()
    await contactStore.setTypeId(customerTypeId.value ?? null)
    await contactStore.setSearch("")

    refreshJobNumberPreview(true)
  }

  function cleanupJobPage() {
    contactStore.activeTypeId = prevTypeId.value
    contactStore.search = prevSearch.value
  }

  async function onCustomerComplete(e: any) {
    const q = String(e?.query ?? "").trim()
    await contactStore.setSearch(q)
  }

  function onCustomerSelect(e: any) {
    const c: Contact | null = e?.value ?? null
    if (!c) return

    selectedCustomer.value = c
    form.customer_id = c.id
  }

  function onCustomerClear() {
    selectedCustomer.value = null
    form.customer_id = null
  }

  watch(
    () => [jobType.value, mode.value],
    () => {
      if (!jobType.value) return
      if (isNoModeJobType.value || mode.value) {
        refreshJobNumberPreview(true)
      }
    },
  )

  watch(
    () => form.job_date,
    () => {
      if (!jobType.value) return
      if (isNoModeJobType.value || mode.value) {
        refreshJobNumberPreview(true)
      }
    },
  )

  watch(
    () => jobSequence.value?.next_number,
    () => {
      if (!jobType.value) return
      if (isNoModeJobType.value || mode.value) {
        refreshJobNumberPreview(true)
      }
    },
  )

  function buildCreateJobPayload(): TransportJobCreatePayload {
    const base = {
      customer_id: form.customer_id,
      quote_ref: form.customer_quote_ref,
      job_number: form.job_number,
      job_date: form.job_date ? formatDateYYYYMMDD(form.job_date) : null,
      note: form.note,
    }

    if (jobType.value === "multi_modal") {
      return {
        ...base,
        job_type: "multi_modal",
        mode_of_transport: null,
      }
    }

    if (jobType.value === "consolidation") {
      return {
        ...base,
        job_type: "consolidation",
        mode_of_transport: null,
      }
    }

    if (!jobType.value || !mode.value) {
      throw new Error("Job type and mode are required.")
    }

    return {
      ...base,
      job_type: jobType.value,
      mode_of_transport: mode.value,
    }
  }

  function extractErrorMessage(err: any): string {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create job."
    return String(msg)
  }

  async function onSave() {
    if (!canCreate.value) return

    creating.value = true
    createError.value = ""

    try {
      const payload = buildCreateJobPayload()
      const job: TransportJob = await store.create(payload)

      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Job created",
        life: 2500,
      })

      try {
        await companyStore.fetch()
      } catch {
        // ignore
      }

      await router.push({
        name: "tms.jobs.show",
        params: { id: job.id },
      })

      return job
    } catch (e: any) {
      createError.value = extractErrorMessage(e)

      toast.add({
        severity: "error",
        summary: "Failed",
        detail: createError.value || "Unable to create job",
        life: 4000,
      })

      throw e
    } finally {
      creating.value = false
    }
  }

  function onCancel() {
    form.note = ""
    form.customer_id = null
    form.customer_quote_ref = ""
    form.job_number = ""
    form.job_date = null

    selectedCustomer.value = null
    createError.value = ""

    resetAll()
  }

  return {
    store,

    JOB_TYPES,
    MODES,
    availableModes,
    isNoModeJobType,

    jobType,
    mode,
    jobTypeLabel,
    modeLabel,
    selectJobType,
    selectMode,

    form,
    selectedCustomer,
    customerSuggestions,
    customerOptionLabel,
    accountNumberPreview,

    creating,
    canCreate,
    createError,

    initJobPage,
    cleanupJobPage,
    onCustomerComplete,
    onCustomerSelect,
    onCustomerClear,

    onSave,
    onCancel,
  }
}
