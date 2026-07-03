<script setup lang="ts">
import "./JobDocumentsTab.css"
import { computed, inject, ref } from "vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import { useToast } from "primevue/usetoast"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { JobPdfDocument } from "@/app/services/transport-jobs/job-pdf"
import type { JobDetailsContext } from "../../JobDetailsPage.logic"

type DocumentRow = {
  id: string
  title: string
  meta: string
  icon: string
  status: "ready" | "pending" | "unavailable"
  url?: string | null
  action?: "invoice" | "job-pdf"
  invoiceId?: number | null
  invoiceNumber?: string | null
  invoiceLabel?: string
  documentType?: JobPdfDocument
  uploadType?: "document" | "pod"
}

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobDocumentsTab must be used inside JobDetailsPage.")
}

const jobContext = context
const toast = useToast()
const transportJobStore = useTransportJobStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const nextUploadType = ref("document")
const uploading = ref(false)
const openingId = ref<string | null>(null)
const podReplaceDialogVisible = ref(false)
const pendingPodReplacementFiles = ref<File[]>([])
const deleteDialogVisible = ref(false)
const deleteBlockedDialogVisible = ref(false)
const deleteConfirmation = ref("")
const deleteInvoiceTarget = ref<DocumentRow | null>(null)
const deletingInvoice = ref(false)

const isRoadMode = computed(() => jobContext.form.mode_of_transport === "road")
const jobId = computed(() => Number(jobContext.job.value?.id ?? 0))
const uploadedFiles = computed(() => jobContext.form.files ?? [])
const pendingUploadCount = computed(() => jobContext.form.upload_files?.length ?? 0)

const documents = computed<DocumentRow[]>(() => {
  const rows: DocumentRow[] = []

  rows.push({
    id: "job-details",
    title: documentTitle("Job Details", jobContext.form.job_number, "pdf"),
    meta: "Generated from the current job details",
    icon: "pi pi-file-pdf",
    status: "ready",
    action: "job-pdf",
    documentType: "job_details",
  })

  if (isRoadMode.value) {
    rows.push({
      id: "transport-order",
      title: documentTitle("Transport Order", jobContext.form.job_number, "pdf"),
      meta: "Generated transport order PDF",
      icon: "pi pi-truck",
      status: "ready",
      action: "job-pdf",
      documentType: "transport_order",
    })
    rows.push({
      id: "collection-order",
      title: documentTitle("Collection Order", jobContext.form.job_number, "pdf"),
      meta: "Generated collection order PDF",
      icon: "pi pi-inbox",
      status: "ready",
      action: "job-pdf",
      documentType: "collection_order",
    })
  }

  ;(jobContext.form.invoices ?? []).forEach((invoice: any) => {
    const pdfReady = Boolean(
      invoice.pdfCacheReady ?? invoice.pdf_cache_ready ?? invoice.pdfUrl ?? invoice.pdf_url,
    )

    rows.push({
      id: `invoice-${invoice.id}`,
      title: documentTitle(
        invoiceLabel(invoice),
        invoice.invoiceNumber ?? invoice.invoice_number,
        "pdf",
      ),
      meta: invoiceMeta(invoice, pdfReady),
      icon: invoiceType(invoice) === "supplier" ? "pi pi-receipt" : "pi pi-file-check",
      status: pdfReady ? "ready" : "unavailable",
      action: "invoice",
      invoiceId: Number(invoice.id),
      invoiceNumber: String(invoice.invoiceNumber ?? invoice.invoice_number ?? ""),
      invoiceLabel: invoiceLabel(invoice),
    })
  })

  uploadedFiles.value.forEach((file: any) => {
    const type = fileType(file)

    rows.push({
      id: `file-${file.id}`,
      title: uploadedDocumentTitle(file),
      meta: uploadedMeta(file),
      icon: fileIcon(file),
      status: file.url ? "ready" : "pending",
      url: file.url,
      uploadType: type === "pod" ? "pod" : "document",
    })
  })

  if (!hasDocumentType("pod")) {
    rows.push({
      id: "pod-pending",
      title: "Proof of Delivery",
      meta: "Pending - not yet uploaded",
      icon: "pi pi-verified",
      status: "pending",
      uploadType: "pod",
    })
  }

  return rows
})

function documentTitle(label: string, ref: unknown, extension: string) {
  const safeRef = String(ref || jobContext.form.job_number || "job").replace(
    /[^A-Za-z0-9_-]+/g,
    "-",
  )

  return `${label} - ${safeRef}.${extension}`
}

function invoiceType(invoice: any) {
  return String(invoice.invoiceType ?? invoice.invoice_type ?? "customer")
}

function invoiceLabel(invoice: any) {
  return invoiceType(invoice) === "supplier" ? "Supplier Invoice" : "Customer Invoice"
}

function invoiceStatus(invoice: any) {
  return String(invoice.status || "printed")
    .replace(/_/g, " ")
    .replace(/^\w/, char => char.toUpperCase())
}

function invoiceMeta(invoice: any, pdfReady: boolean) {
  const date = invoice.invoiceDate ?? invoice.invoice_date
  const base = `${invoiceStatus(invoice)}${date ? ` - ${date}` : ""}`

  return pdfReady ? base : `${base} - PDF not generated yet`
}

function fileName(file: any) {
  return (
    String(file.path || "")
      .split(/[\\/]/)
      .filter(Boolean)
      .pop() || `Document #${file.id}`
  )
}

function fileType(file: any) {
  return String(file.type || "").toLowerCase()
}

function documentTypeLabel(file: any) {
  const type = fileType(file)

  const labels: Record<string, string> = {
    pod: "POD",
    supplier_invoice: "Supplier Invoice",
    customer_invoice: "Customer Invoice",
    invoice: "Invoice",
    transport_order: "Transport Order",
    collection_order: "Collection Order",
    job_details: "Job Details",
    document: "Document",
  }

  if (labels[type]) return labels[type]

  return type ? type.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()) : "Document"
}

function uploadedDocumentTitle(file: any) {
  return `${documentTypeLabel(file)} - ${fileName(file)}`
}

function hasDocumentType(type: string) {
  return uploadedFiles.value.some((file: any) => fileType(file) === type)
}

function uploadedMeta(file: any) {
  const type = documentTypeLabel(file)
  const date = file.created_at ? new Date(file.created_at).toLocaleDateString("en-GB") : null

  return `${type}${date ? ` - Uploaded ${date}` : ""}`
}

function fileIcon(file: any) {
  const name = fileName(file).toLowerCase()
  const type = fileType(file)

  if (type === "pod") return "pi pi-verified"
  if (type === "supplier_invoice") return "pi pi-receipt"
  if (name.endsWith(".pdf")) return "pi pi-file-pdf"
  if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "pi pi-file-excel"
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "pi pi-file-word"
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(name)) return "pi pi-image"

  return "pi pi-file"
}

function openBlob(blob: Blob, filename: string, download = false) {
  const url = URL.createObjectURL(blob)

  if (download) {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
  } else {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

async function openDocument(row: DocumentRow, download = false) {
  if (row.status !== "ready") return

  if (row.url) {
    if (download) {
      const link = document.createElement("a")
      link.href = row.url
      link.download = row.title
      link.target = "_blank"
      link.click()
    } else {
      window.open(row.url, "_blank", "noopener,noreferrer")
    }
    return
  }

  if (!jobId.value) {
    toast.add({
      severity: "warn",
      summary: "Save job first",
      detail: "Save the job before opening generated documents.",
      life: 3000,
    })
    return
  }

  openingId.value = row.id
  try {
    const blob =
      row.action === "invoice" && row.invoiceId
        ? await transportJobStore.downloadInvoicePdf(jobId.value, row.invoiceId)
        : await transportJobStore.jobPdf(jobId.value, row.documentType ?? "job_details")

    openBlob(blob, row.title, download)
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Document unavailable",
      detail: error?.response?.data?.message ?? error?.message ?? "Unable to open this document.",
      life: 4500,
    })
  } finally {
    openingId.value = null
  }
}

function openFilePicker(type = "document") {
  nextUploadType.value = type
  fileInputRef.value?.click()
}

async function onFilesPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])

  if (!files.length) return

  const fileType = nextUploadType.value || "document"

  if (fileType === "pod" && hasDocumentType("pod")) {
    pendingPodReplacementFiles.value = files
    podReplaceDialogVisible.value = true
    input.value = ""
    return
  }

  jobContext.form.upload_files.push(...files)
  jobContext.form.upload_file_types.push(...files.map(() => fileType))
  uploading.value = true

  try {
    await jobContext.save({
      successSummary: fileType === "pod" ? "POD uploaded" : "Documents uploaded",
      successDetail:
        fileType === "pod"
          ? "Proof of delivery was saved to the job."
          : "Attached documents were saved to the job.",
      successLife: 2200,
    })
    input.value = ""
  } finally {
    nextUploadType.value = "document"
    uploading.value = false
  }
}

async function confirmPodReplacement() {
  if (!pendingPodReplacementFiles.value.length) {
    podReplaceDialogVisible.value = false
    return
  }

  jobContext.form.replace_file_types = [
    ...new Set([...(jobContext.form.replace_file_types ?? []), "pod"]),
  ]
  jobContext.form.upload_files.push(...pendingPodReplacementFiles.value)
  jobContext.form.upload_file_types.push(...pendingPodReplacementFiles.value.map(() => "pod"))
  uploading.value = true

  try {
    await jobContext.save({
      successSummary: "POD replaced",
      successDetail: "The existing Proof of Delivery was replaced with the new file.",
      successLife: 2400,
    })
    podReplaceDialogVisible.value = false
    pendingPodReplacementFiles.value = []
  } finally {
    nextUploadType.value = "document"
    uploading.value = false
  }
}

function cancelPodReplacement() {
  podReplaceDialogVisible.value = false
  pendingPodReplacementFiles.value = []
  nextUploadType.value = "document"
}

function openDeleteInvoice(row: DocumentRow) {
  if (row.action !== "invoice" || !row.invoiceId) return

  deleteInvoiceTarget.value = row
  deleteConfirmation.value = ""
  deleteDialogVisible.value = true
}

async function confirmDeleteInvoice() {
  const target = deleteInvoiceTarget.value
  const invoiceId = Number(target?.invoiceId ?? 0)
  const invoiceNumber = String(target?.invoiceNumber ?? "")

  if (!jobId.value || !invoiceId) return

  if (deleteConfirmation.value.trim() !== invoiceNumber) {
    toast.add({
      severity: "warn",
      summary: "Confirmation required",
      detail: "Type the invoice number exactly before deleting.",
      life: 3000,
    })
    return
  }

  deletingInvoice.value = true

  try {
    await transportJobStore.deleteInvoice(jobId.value, invoiceId, deleteConfirmation.value.trim())
    await jobContext.load()
    deleteDialogVisible.value = false
    deleteInvoiceTarget.value = null
    deleteConfirmation.value = ""
    toast.add({
      severity: "success",
      summary: "Invoice deleted",
      detail: "The latest invoice was deleted and the job was refreshed.",
      life: 3000,
    })
  } catch (error: any) {
    if (error?.response?.status === 409) {
      deleteDialogVisible.value = false
      deleteBlockedDialogVisible.value = true
      return
    }

    toast.add({
      severity: "error",
      summary: "Delete failed",
      detail: error?.response?.data?.message ?? error?.message ?? "Unable to delete this invoice.",
      life: 4500,
    })
  } finally {
    deletingInvoice.value = false
  }
}
</script>

<template>
  <section class="job-documents-page">
    <header class="job-documents-page__header">
      <div>
        <h2>Attached Documents</h2>
        <p>Printed and uploaded job documents are stored here for quick access.</p>
      </div>

      <Button
        label="Upload Document"
        icon="pi pi-upload"
        class="btn btn--primary"
        :loading="uploading"
        :disabled="jobContext.saving.value || uploading"
        @click="openFilePicker()"
      />
      <input
        ref="fileInputRef"
        type="file"
        multiple
        class="job-documents-page__file-input"
        @change="onFilesPicked"
      />
    </header>

    <div v-if="pendingUploadCount" class="job-documents-page__pending">
      {{ pendingUploadCount }} document{{ pendingUploadCount === 1 ? "" : "s" }} waiting to save.
    </div>

    <div class="job-documents-page__list">
      <article v-for="row in documents" :key="row.id" class="job-documents-page__row">
        <div class="job-documents-page__icon">
          <i :class="row.icon" />
        </div>

        <div class="job-documents-page__info">
          <strong>{{ row.title }}</strong>
          <span>{{ row.meta }}</span>
        </div>

        <div class="job-documents-page__actions">
          <template v-if="row.status === 'ready'">
            <Button
              label="View"
              icon="pi pi-eye"
              class="btn btn--ghost btn--small"
              size="small"
              outlined
              :loading="openingId === row.id"
              @click="openDocument(row)"
            />
            <Button
              label="Download"
              icon="pi pi-download"
              class="btn btn--ghost btn--small"
              size="small"
              outlined
              :disabled="openingId === row.id"
              @click="openDocument(row, true)"
            />
            <Button
              v-if="row.uploadType === 'pod'"
              label="Change"
              icon="pi pi-refresh"
              class="btn btn--ghost btn--small"
              size="small"
              outlined
              :disabled="jobContext.saving.value || uploading"
              @click="openFilePicker('pod')"
            />
            <Button
              v-if="row.action === 'invoice'"
              label="Delete"
              icon="pi pi-trash"
              class="btn btn--ghost btn--small"
              severity="danger"
              size="small"
              outlined
              :disabled="openingId === row.id || deletingInvoice"
              @click="openDeleteInvoice(row)"
            />
          </template>
          <span v-else-if="row.status === 'unavailable'" class="job-documents-page__status">
            Not ready
          </span>
          <Button
            v-else
            label="Upload"
            icon="pi pi-upload"
            class="btn btn--ghost btn--small"
            size="small"
            outlined
            @click="openFilePicker(row.uploadType ?? 'document')"
          />
        </div>
      </article>
    </div>

    <Dialog
      v-model:visible="podReplaceDialogVisible"
      modal
      header="Replace POD"
      class="job-documents-page__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-documents-page__dialog-body">
        <p>
          A POD is already saved on this job. Replacing it will remove the current POD document and
          save the newly selected file.
        </p>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="uploading" @click="cancelPodReplacement" />
        <Button
          label="Replace POD"
          icon="pi pi-refresh"
          :loading="uploading"
          @click="confirmPodReplacement"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      :header="`Delete ${deleteInvoiceTarget?.invoiceLabel ?? 'Invoice'}`"
      class="job-documents-page__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-documents-page__dialog-body">
        <p>
          This will delete the latest invoice only. To confirm, type the invoice number exactly:
          <strong>{{ deleteInvoiceTarget?.invoiceNumber }}</strong>
        </p>
        <label class="job-documents-page__field">
          <span>Invoice Number</span>
          <InputText v-model="deleteConfirmation" autocomplete="off" />
        </label>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          text
          :disabled="deletingInvoice"
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Delete Invoice"
          icon="pi pi-trash"
          severity="danger"
          :loading="deletingInvoice"
          :disabled="deleteConfirmation.trim() !== String(deleteInvoiceTarget?.invoiceNumber ?? '')"
          @click="confirmDeleteInvoice"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteBlockedDialogVisible"
      modal
      header="Invoice Cannot Be Deleted"
      class="job-documents-page__dialog"
      :style="{ width: 'min(520px, 94vw)' }"
    >
      <div class="job-documents-page__dialog-body">
        <p>
          This invoice cannot be deleted because it is not the latest invoice. This keeps the
          invoice audit trail and numbering sequence intact.
        </p>
      </div>

      <template #footer>
        <Button label="OK" @click="deleteBlockedDialogVisible = false" />
      </template>
    </Dialog>
  </section>
</template>
