<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useInvoiceGenerationStore } from "@/app/stores/invoice-generation"
import { useAuthStore } from "@/app/stores/auth"
import transportJobs from "@/app/services/transport-jobs"
import InvoiceEmailDialog from "@/app/pages/jobs/details/tabs/Invoices/InvoiceEmailDialog/InvoiceEmailDialog.vue"
import type { InvoiceGenerationTask } from "@/app/types/invoice-generation"
import type { InvoiceEmailRecipientOption } from "@/app/types/invoice-email"

const store = useInvoiceGenerationStore()
const auth = useAuthStore()
const openedEmailTaskIds = new Set<string>()
const emailDialogVisible = ref(false)
const emailJob = ref<any | null>(null)
const emailInvoice = ref<any | null>(null)
const emailTask = ref<InvoiceGenerationTask | null>(null)

function title(task: any) {
  if (task.status === "completed") return "Invoice Ready"
  if (task.status === "failed" || task.timeout) return "Invoice Generation Failed"

  return `Generating ${task.invoice_type === "supplier" ? "Supplier" : "Customer"} Invoice`
}

onMounted(() => {
  store.hydrate()
})

function normalizeEmail(email: unknown): string {
  return String(email || "").trim()
}

function addRecipient(
  recipients: InvoiceEmailRecipientOption[],
  seen: Set<string>,
  group: string,
  label: string,
  email: unknown,
) {
  const value = normalizeEmail(email)

  if (!value || seen.has(value.toLowerCase())) return

  seen.add(value.toLowerCase())
  recipients.push({
    group,
    label: `${label} <${value}>`,
    value,
  })
}

const invoiceLabel = computed(() =>
  emailTask.value?.invoice_type === "supplier" ? "Supplier Invoice" : "Customer Invoice",
)

const emailRecipientOptions = computed<InvoiceEmailRecipientOption[]>(() => {
  const recipients: InvoiceEmailRecipientOption[] = []
  const seen = new Set<string>()
  const customer = emailJob.value?.customer_contact

  addRecipient(recipients, seen, "Customer", customer?.company_name || "Customer", customer?.email)
  addRecipient(recipients, seen, "Customer", "Consignee", emailJob.value?.consignee_email)
  addRecipient(recipients, seen, "Employee", auth.user?.name || "Current user", auth.user?.email)

  return recipients
})

const emailJobSummary = computed(() => ({
  "Job Number": emailJob.value?.job_number || emailTask.value?.job_number,
  Customer: emailJob.value?.customer_contact?.company_name,
  Consignee: emailJob.value?.consignee_name,
  "Collection Date": emailJob.value?.collection_date,
  "Delivery Date": emailJob.value?.delivery_date,
  "Customer Ref": emailJob.value?.customer_po_number || emailJob.value?.customer_booking_ref,
  "Invoice Total": emailInvoice.value?.total,
}))

async function openEmailDialog(task: InvoiceGenerationTask) {
  if (task.invoice_type === "supplier") return
  if (!task.transport_job_id || !task.invoice_id || openedEmailTaskIds.has(task.id)) return

  openedEmailTaskIds.add(task.id)
  try {
    const job = await transportJobs.show(task.transport_job_id)
    const invoice =
      (job as any).invoices?.find((row: any) => Number(row.id) === Number(task.invoice_id)) ?? null

    if (!invoice) {
      openedEmailTaskIds.delete(task.id)
      return
    }

    emailTask.value = task
    emailJob.value = job
    emailInvoice.value = invoice
    emailDialogVisible.value = true
  } catch {
    openedEmailTaskIds.delete(task.id)
  }
}

async function openEmailPdf() {
  const jobId = Number(emailTask.value?.transport_job_id)
  const invoiceId = Number(emailTask.value?.invoice_id)

  if (!Number.isFinite(jobId) || !Number.isFinite(invoiceId)) return

  const blob = await transportJobs.downloadInvoicePdf(jobId, invoiceId)
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank", "noopener,noreferrer")
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

watch(
  () =>
    store.activeTasks.map(task => `${task.id}:${task.status}:${task.download_available}`).join("|"),
  () => {
    const readyTask = store.activeTasks.find(task => {
      return (
        task.invoice_type !== "supplier" &&
        task.status === "completed" &&
        task.download_available &&
        !openedEmailTaskIds.has(task.id)
      )
    })

    if (readyTask) {
      void openEmailDialog(readyTask)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="store.activeTasks.length" class="invoice-generation-stack" aria-live="polite">
    <article
      v-for="task in store.activeTasks"
      :key="task.id"
      class="invoice-generation-toast"
      :class="`invoice-generation-toast--${task.timeout ? 'timeout' : task.status}`"
    >
      <button class="invoice-generation-toast__close" type="button" @click="store.remove(task.id)">
        <span aria-hidden="true">×</span>
        <span class="sr-only">Close</span>
      </button>

      <div class="invoice-generation-toast__title">{{ title(task) }}</div>
      <div class="invoice-generation-toast__meta">
        Job {{ task.job_number || task.transport_job_id || "" }}
        <span v-if="task.invoice_number"> · {{ task.invoice_number }}</span>
      </div>

      <div class="invoice-generation-toast__message">
        {{
          task.timeout
            ? "Still processing. You can refresh this status from the job later."
            : task.stage_message
        }}
      </div>

      <div
        class="invoice-generation-toast__progress"
        role="progressbar"
        :aria-valuenow="task.timeout ? task.progress : task.progress"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="task.stage_message"
      >
        <span :style="{ width: `${task.progress}%` }" />
      </div>

      <div class="invoice-generation-toast__footer">
        <strong>{{ task.progress }}%</strong>
        <div class="invoice-generation-toast__actions">
          <button
            v-if="task.status === 'completed' && task.download_available"
            type="button"
            @click="store.view(task)"
          >
            View Invoice
          </button>
          <button
            v-if="task.status === 'failed' || task.timeout"
            type="button"
            @click="store.openJob(task)"
          >
            Open Job
          </button>
        </div>
      </div>
    </article>
  </div>

  <InvoiceEmailDialog
    v-model:visible="emailDialogVisible"
    :title="`Send ${invoiceLabel}`"
    :job-id="emailTask?.transport_job_id || null"
    :invoice-id="emailTask?.invoice_id || null"
    :invoice-label="invoiceLabel"
    :invoice-number="emailInvoice?.invoiceNumber || emailTask?.invoice_number || 'Invoice'"
    :pdf-url="emailInvoice?.pdfUrl || null"
    :recipient-options="emailRecipientOptions"
    :job-summary="emailJobSummary"
    @open-pdf="openEmailPdf"
  />
</template>

<style scoped>
.invoice-generation-stack {
  position: fixed;
  z-index: 1200;
  top: 92px;
  right: 22px;
  width: min(380px, calc(100vw - 32px));
  display: grid;
  gap: 12px;
}

.invoice-generation-toast {
  position: relative;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
  color: #1f2937;
}

.invoice-generation-toast--failed,
.invoice-generation-toast--timeout {
  border-color: #fecaca;
}

.invoice-generation-toast--completed {
  border-color: #bbf7d0;
}

.invoice-generation-toast__close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  font-size: 1.1rem;
}

.invoice-generation-toast__title {
  padding-right: 24px;
  font-weight: 800;
  font-size: 0.98rem;
}

.invoice-generation-toast__meta {
  margin-top: 3px;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 700;
}

.invoice-generation-toast__message {
  margin-top: 12px;
  color: #374151;
  font-size: 0.9rem;
}

.invoice-generation-toast__progress {
  height: 8px;
  margin-top: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
}

.invoice-generation-toast__progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ec691a;
  transition: width 0.25s ease;
}

.invoice-generation-toast__footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.invoice-generation-toast__actions {
  display: flex;
  gap: 8px;
}

.invoice-generation-toast__actions button {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  padding: 6px 10px;
  font-weight: 800;
  cursor: pointer;
}

.invoice-generation-toast__actions button:hover {
  border-color: #ec691a;
  color: #ec691a;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
