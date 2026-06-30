import { defineStore } from "pinia"
import { ref } from "vue"

import transportJobs from "@/app/services/transport-jobs"
import type { CollectionNotePreviewPayload } from "@/app/services/transport-jobs/collection-note-preview"
import type { EmailJobInvoicePayload } from "@/app/services/transport-jobs/email-invoice"
import jobPdfService from "@/app/services/transport-jobs/job-pdf"
import type { PassSupplierInvoicePayload } from "@/app/services/transport-jobs/pass-supplier-invoice"
import type { JobPdfDocument, JobPdfOptions } from "@/app/services/transport-jobs/job-pdf"
import type {
  InvoiceGenerationResponse,
  InvoiceGenerationStatusResponse,
} from "@/app/services/transport-jobs/invoice-generation"
import type {
  TransportJob,
  PaginatedResponse,
  TransportJobCreatePayload,
  TransportJobUpdatePayload,
  TransportMode,
  JobType,
} from "@/app/types/transport-job"

export type TransportJobFetchParams = {
  page?: number
  per_page?: number
  q?: string
  job_type?: JobType
  mode_of_transport?: TransportMode
  created_by?: number
  customer_id?: number
  status?: string
}

export const useTransportJobStore = defineStore("transportJob", () => {
  const items = ref<TransportJob[]>([])
  const loading = ref(false)

  const page = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)

  const activeMode = ref<TransportMode | null>(null)
  const activeJobType = ref<JobType | null>(null)
  const activeCustomerId = ref<number | null>(null)
  const status = ref<string | null>(null)
  const q = ref<string>("")
  const createdBy = ref<number | null>(null)

  function buildParams(overrides: TransportJobFetchParams = {}): TransportJobFetchParams {
    return {
      page: overrides.page ?? page.value,
      per_page: overrides.per_page ?? perPage.value,
      customer_id: overrides.customer_id ?? activeCustomerId.value ?? undefined,
      mode_of_transport: overrides.mode_of_transport ?? activeMode.value ?? undefined,
      job_type: overrides.job_type ?? activeJobType.value ?? undefined,
      status: overrides.status ?? status.value ?? undefined,
      q: overrides.q ?? (q.value || undefined),
      created_by: overrides.created_by ?? createdBy.value ?? undefined,
    }
  }

  async function fetch(overrides: TransportJobFetchParams = {}) {
    loading.value = true

    try {
      const params = buildParams(overrides)
      const res: PaginatedResponse<TransportJob> = await transportJobs.list(params)

      items.value = res.data

      if (res.meta) {
        page.value = res.meta.current_page
        perPage.value = res.meta.per_page
        total.value = res.meta.total
        lastPage.value = res.meta.last_page
      }

      return res
    } finally {
      loading.value = false
    }
  }

  async function show(id: number) {
    loading.value = true

    try {
      const job = await transportJobs.show(id)

      const idx = items.value.findIndex(x => x.id === job.id)

      if (idx >= 0) {
        items.value[idx] = job
      } else {
        items.value.unshift(job)
      }

      return job
    } finally {
      loading.value = false
    }
  }

  async function create(payload: TransportJobCreatePayload) {
    loading.value = true

    try {
      const job = await transportJobs.create(payload)

      items.value.unshift(job)
      total.value += 1

      return job
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, payload: TransportJobUpdatePayload) {
    loading.value = true

    try {
      const job = await transportJobs.update(id, payload)

      const idx = items.value.findIndex(x => x.id === job.id)

      if (idx >= 0) {
        items.value[idx] = job
      }

      return job
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    loading.value = true

    try {
      await transportJobs.remove(id)

      items.value = items.value.filter(x => x.id !== id)
      total.value = Math.max(0, total.value - 1)

      return true
    } finally {
      loading.value = false
    }
  }

  async function collectionNotePreview(payload: CollectionNotePreviewPayload) {
    loading.value = true

    try {
      return await transportJobs.collectionNotePreview(payload)
    } finally {
      loading.value = false
    }
  }

  async function jobPdf(id: number, document?: JobPdfDocument, options?: JobPdfOptions) {
    loading.value = true

    try {
      return await jobPdfService(id, document, options)
    } finally {
      loading.value = false
    }
  }

  async function emailInvoice(id: number, payload: EmailJobInvoicePayload) {
    loading.value = true

    try {
      return await transportJobs.emailInvoice(id, payload)
    } finally {
      loading.value = false
    }
  }

  async function passSupplierInvoice(id: number, payload: PassSupplierInvoicePayload) {
    loading.value = true

    try {
      return await transportJobs.passSupplierInvoice(id, payload)
    } finally {
      loading.value = false
    }
  }

  async function generateCustomerInvoice(id: number): Promise<InvoiceGenerationResponse> {
    return await transportJobs.generateCustomerInvoice(id)
  }

  async function generateSupplierInvoice(
    id: number,
    supplierId: number,
  ): Promise<InvoiceGenerationResponse> {
    return await transportJobs.generateSupplierInvoice(id, supplierId)
  }

  async function invoiceGenerationStatus(
    id: number,
    invoiceId: number,
  ): Promise<InvoiceGenerationStatusResponse> {
    return await transportJobs.invoiceGenerationStatus(id, invoiceId)
  }

  async function downloadInvoicePdf(id: number, invoiceId: number): Promise<Blob> {
    return await transportJobs.downloadInvoicePdf(id, invoiceId)
  }

  function setCreatedBy(value: number | null) {
    createdBy.value = value
  }

  function resetFilters() {
    activeMode.value = null
    activeJobType.value = null
    activeCustomerId.value = null
    status.value = null
    q.value = ""
    createdBy.value = null
    page.value = 1
  }

  return {
    items,
    loading,

    activeMode,
    activeJobType,
    activeCustomerId,
    status,
    q,
    createdBy,

    page,
    perPage,
    total,
    lastPage,

    fetch,
    show,
    create,
    update,
    remove,
    collectionNotePreview,
    jobPdf,
    emailInvoice,
    passSupplierInvoice,
    generateCustomerInvoice,
    generateSupplierInvoice,
    invoiceGenerationStatus,
    downloadInvoicePdf,

    setCreatedBy,
    resetFilters,
  }
})
