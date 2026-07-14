<script setup lang="ts">
import "./JobDetailsPage.css"
import { computed, provide, ref, watch } from "vue"
import { RouterLink, RouterView, useRouter } from "vue-router"
import ConfirmDialog from "primevue/confirmdialog"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import Button from "primevue/button"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"
import Textarea from "primevue/textarea"

import JobProgressStepper from "@/app/components/jobs/details/JobProgressStepper.vue"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { JobPdfDocument } from "@/app/types/transport-job-service"
import { useJobDetailsPage } from "./JobDetailsPage.logic"

const {
  tabs,
  subTabs,
  isActive,
  getTabCount,
  title,
  subtitle,
  job,
  form,
  customerOptions,
  customerOptionsLoading,
  modeOptions,
  statusOptions,
  loading,
  initialLoading,
  saving,
  save,
  onCustomerFilter,
} = useJobDetailsPage()

const toast = useToast()
const confirm = useConfirm()
const router = useRouter()
const transportJobStore = useTransportJobStore()
const pdfLoading = ref<JobPdfDocument | null>(null)
const archiveLoading = ref(false)
const statusModalVisible = ref(false)
const selectedStatus = ref(form.status)
const isPdfLoading = computed(() => pdfLoading.value !== null)
const selectedStatusDetails = computed(() => ensureStatusDetails(selectedStatus.value))
const podFiles = computed(() =>
  form.files.filter(file => String(file?.type ?? "").toLowerCase() === "pod"),
)
const pendingPodFileName = computed(() => {
  const pendingIndex = form.upload_file_types.findIndex(
    type => String(type ?? "").toLowerCase() === "pod",
  )

  return pendingIndex >= 0 ? form.upload_files[pendingIndex]?.name || "" : ""
})
const currentStatusIndex = computed(() => {
  const index = statusOptions.value.findIndex(status => status.value === form.status)

  return index >= 0 ? index : 0
})

const progressSteps = computed(() =>
  statusOptions.value.map((status, index) => ({
    key: status.value.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    number: index + 1,
    title: status.label,
    subtitle:
      index < currentStatusIndex.value
        ? "Complete"
        : index === currentStatusIndex.value
          ? "In progress"
          : "Pending",
    done: index < currentStatusIndex.value,
    active: index === currentStatusIndex.value,
  })),
)
const statusValues = computed(() => statusOptions.value.map(status => status.value))

watch(
  () => form.status,
  status => {
    selectedStatus.value = status
  },
)

function openStatusModal() {
  applyStatusDateDefaults()
  selectedStatus.value = form.status
  ensureStatusDetails(selectedStatus.value)
  statusModalVisible.value = true
}

function selectStatus(status: string) {
  const previousStatus = selectedStatus.value
  selectedStatus.value = status
  ensureStatusDetails(status)
  applyStatusTransitionDefaults(previousStatus, status)
  form.status = status
}

async function saveStatusModal() {
  form.status = selectedStatus.value
  await save({
    successSummary: "Status updated",
    successDetail: "Job progress and status notes saved.",
    successLife: 2200,
  })
  statusModalVisible.value = false
}

function ensureStatusDetails(status: string) {
  if (!form.status_notes[status]) {
    form.status_notes[status] = {
      notes: "",
      start_date: null,
      completion_date: null,
      pod_receiver_name: "",
      pod_time: null,
      pod_date: null,
    }
  }

  return form.status_notes[status]
}

function dateOnly(value: unknown): string | null {
  if (!value) return null

  const raw = String(value)
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null

  return formatStatusDate(date)
}

function jobCreatedDate(): string | null {
  return dateOnly(job.value?.created_at) ?? dateOnly(form.job_date)
}

function previousStatusValue(status: string): string | null {
  const index = statusValues.value.indexOf(status)

  return index > 0 ? (statusValues.value[index - 1] ?? null) : null
}

function nextStatusValue(status: string): string | null {
  const index = statusValues.value.indexOf(status)

  return index >= 0 && index < statusValues.value.length - 1
    ? (statusValues.value[index + 1] ?? null)
    : null
}

function defaultStartDateForStatus(status: string): string | null {
  const previous = previousStatusValue(status)

  if (!previous) return jobCreatedDate()

  const previousDetails = ensureStatusDetails(previous)

  return previousDetails.completion_date ?? previousDetails.start_date ?? jobCreatedDate()
}

function applyStatusDateDefaults() {
  statusValues.value.forEach(status => {
    const details = ensureStatusDetails(status)

    if (!details.start_date) {
      details.start_date = defaultStartDateForStatus(status)
    }
  })
}

function applyStatusTransitionDefaults(previousStatus: string, nextStatus: string) {
  const previousIndex = statusValues.value.indexOf(previousStatus)
  const nextIndex = statusValues.value.indexOf(nextStatus)
  const nextDetails = ensureStatusDetails(nextStatus)

  if (!nextDetails.start_date) {
    nextDetails.start_date = defaultStartDateForStatus(nextStatus)
  }

  if (previousIndex >= 0 && nextIndex > previousIndex) {
    const previousDetails = ensureStatusDetails(previousStatus)

    if (!previousDetails.completion_date && nextDetails.start_date) {
      previousDetails.completion_date = nextDetails.start_date
    }
  }
}

function updateStatusCompletionDate(status: string, value: Date | Date[] | null | undefined) {
  const completionDate = formatStatusDate(value)
  const details = ensureStatusDetails(status)
  details.completion_date = completionDate

  const next = nextStatusValue(status)
  if (!next || !completionDate) return

  const nextDetails = ensureStatusDetails(next)
  if (!nextDetails.start_date) {
    nextDetails.start_date = completionDate
  }
}

function onPodUploadChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const existingPendingPodIndex = form.upload_file_types.findIndex(
    type => String(type ?? "").toLowerCase() === "pod",
  )

  if (existingPendingPodIndex >= 0) {
    form.upload_files.splice(existingPendingPodIndex, 1, file)
    form.upload_file_types.splice(existingPendingPodIndex, 1, "POD")
  } else {
    form.upload_files.push(file)
    form.upload_file_types.push("POD")
  }
}

function statusDateValue(value: string | null | undefined): Date | null {
  if (!value) return null

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function formatStatusDate(value: Date | Date[] | null | undefined): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)

  window.open(url, "_blank", "noopener,noreferrer")
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

async function extractPdfError(error: any) {
  const data = error?.response?.data

  if (data instanceof Blob) {
    const text = await data.text()

    try {
      const parsed = JSON.parse(text)
      return parsed?.message ?? text
    } catch {
      return text || "Unable to generate the job PDF."
    }
  }

  return error?.response?.data?.message ?? error?.message ?? "Unable to generate the job PDF."
}

async function loadPdf(document: JobPdfDocument = "job_details") {
  const id = Number(job.value?.id)

  if (!Number.isFinite(id) || id <= 0) return

  pdfLoading.value = document

  try {
    const blob = await transportJobStore.jobPdf(id, document)

    if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
      const text = blob instanceof Blob ? await blob.text() : ""
      throw new Error(text || "The server did not return a PDF.")
    }

    openBlob(blob)
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "PDF failed",
      detail: await extractPdfError(error),
      life: 4500,
    })
  } finally {
    pdfLoading.value = null
  }
}

provide("jobPdfActions", {
  pdfLoading,
  isPdfLoading,
  loadPdf,
})

function archiveErrorMessage(error: any) {
  return error?.response?.data?.message ?? error?.message ?? "Unable to archive job."
}

function onArchive() {
  const id = Number(job.value?.id)

  if (!Number.isFinite(id) || id <= 0) return

  const label = form.job_number || job.value?.job_number || "this job"

  confirm.require({
    group: "archive-job",
    message: `Archive ${label}? It will be removed from active jobs and no longer treated as a live operational file. Job details, costs, documents and generated PDFs will stay saved. Use this only when the job is complete, cancelled or no longer active.`,
    header: "Archive Job",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Archive",
    rejectLabel: "Cancel",
    acceptClass: "p-button-danger",
    accept: async () => {
      archiveLoading.value = true

      try {
        await transportJobStore.remove(id)
        toast.add({
          severity: "success",
          summary: "Archived",
          detail: "Job archived successfully.",
          life: 2500,
        })
        await router.push({ name: "tms.jobs.index" })
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Archive failed",
          detail: archiveErrorMessage(error),
          life: 4000,
        })
      } finally {
        archiveLoading.value = false
      }
    },
  })
}
</script>

<template>
  <section class="job-details-page">
    <ConfirmDialog group="archive-job" class="job-details-page__archive-dialog" />

    <div class="job-header-card">
      <div class="job-header-main">
        <div class="job-header-left">
          <div class="job-title">
            {{ title }}
          </div>

          <div class="job-meta">
            {{ subtitle }}
          </div>
        </div>

        <div class="job-actions">
          <Button
            class="job-action-btn job-action-btn--danger"
            icon="pi pi-folder"
            :label="archiveLoading ? 'Archiving...' : 'Archive'"
            :loading="archiveLoading"
            :disabled="loading || saving || archiveLoading || !job?.id"
            @click="onArchive"
          />

          <Button
            class="job-action-btn"
            icon="pi pi-save"
            :label="saving ? 'Saving...' : 'Save'"
            :loading="saving"
            :disabled="loading"
            @click="() => save()"
          />
        </div>
      </div>

      <div class="job-header-form">
        <div class="job-header-form__grid job-header-form__grid--top">
          <label class="job-header-form__field">
            <span>Customer Name <strong>*</strong></span>

            <Dropdown
              v-model="form.customer_id"
              :options="customerOptions"
              option-label="label"
              option-value="value"
              placeholder="— Select Customer —"
              filter
              filter-placeholder="Search customers..."
              show-clear
              class="job-header-form__prime"
              :loading="customerOptionsLoading"
              :disabled="loading"
              @filter="onCustomerFilter"
            />
          </label>

          <label class="job-header-form__field">
            <span>Customer Quote Ref</span>

            <InputText
              v-model="form.quote_ref"
              placeholder="Optional"
              class="job-header-form__prime"
              :disabled="loading"
            />
          </label>

          <label class="job-header-form__field">
            <span>Job Date <strong>*</strong></span>

            <Calendar
              v-model="form.job_date"
              date-format="dd/mm/yy"
              placeholder="Select date..."
              showIcon
              class="job-header-form__prime"
              :disabled="loading"
            />
          </label>

          <label class="job-header-form__field">
            <span>Mode of Transport <strong>*</strong></span>

            <Dropdown
              v-model="form.mode_of_transport"
              :options="modeOptions"
              option-label="label"
              option-value="value"
              placeholder="— Select MOT —"
              class="job-header-form__prime"
              :disabled="loading"
            />
          </label>
        </div>

        <div class="job-header-form__grid job-header-form__grid--bottom">
          <label class="job-header-form__field">
            <span>Account No.</span>

            <InputText
              v-model="form.account_number"
              placeholder="Auto"
              readonly
              class="job-header-form__prime"
            />
          </label>

          <label class="job-header-form__field">
            <span>Job Number</span>

            <InputText v-model="form.job_number" readonly class="job-header-form__prime" />
          </label>

          <label class="job-header-form__field">
            <span>Status</span>

            <button
              type="button"
              class="job-status-trigger"
              :disabled="loading"
              @click="openStatusModal"
            >
              <span>{{ form.status }}</span>
              <i class="pi pi-pencil"></i>
            </button>
          </label>
        </div>
      </div>

      <JobProgressStepper :steps="progressSteps" />

      <nav class="job-details-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name, params: $route.params }"
          class="job-details-page__tab"
          :class="{ 'job-details-page__tab--active': isActive(tab.name) }"
        >
          <span>{{ tab.label }}</span>

          <span v-if="tab.showCount" class="job-details-page__tab-count">
            {{ getTabCount(tab.key) }}
          </span>
        </RouterLink>
      </nav>

      <nav v-if="subTabs.length" class="job-details-page__subtabs">
        <RouterLink
          v-for="tab in subTabs"
          :key="tab.name"
          :to="{ name: tab.name, params: $route.params }"
          class="job-details-page__subtab"
          :class="{ 'job-details-page__subtab--active': isActive(tab.name, true) }"
        >
          <span>{{ tab.label }}</span>

          <span v-if="tab.showCount" class="job-details-page__subtab-count">
            {{ getTabCount(tab.key) }}
          </span>
        </RouterLink>
      </nav>
    </div>

    <div class="job-content-shell">
      <div v-if="initialLoading" class="job-details-page__loading">Loading job details...</div>

      <RouterView v-else v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>

    <Dialog
      v-model:visible="statusModalVisible"
      modal
      header="Job Status"
      class="job-status-modal"
      :style="{ width: 'min(920px, calc(100vw - 32px))' }"
    >
      <div class="job-status-modal__body">
        <div class="job-status-modal__progress">
          <button
            v-for="(status, index) in statusOptions"
            :key="status.value"
            type="button"
            class="job-status-modal__stage"
            :class="{
              'job-status-modal__stage--done': index < currentStatusIndex,
              'job-status-modal__stage--active': selectedStatus === status.value,
            }"
            @click="selectStatus(status.value)"
          >
            <span class="job-status-modal__stage-dot">
              <i v-if="index < currentStatusIndex" class="pi pi-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </span>

            <span class="job-status-modal__stage-copy">
              <strong>{{ status.label }}</strong>
              <small>
                {{
                  index < currentStatusIndex
                    ? "Complete"
                    : status.value === form.status
                      ? "Current status"
                      : "Pending"
                }}
              </small>
            </span>
          </button>
        </div>

        <div class="job-status-modal__details">
          <div class="job-status-modal__details-head">
            <span>Stage Notes</span>
            <strong>{{ selectedStatus }}</strong>
          </div>

          <div class="job-status-modal__date-grid">
            <label class="job-status-modal__field">
              <span>Start Date</span>
              <Calendar
                :model-value="statusDateValue(selectedStatusDetails.start_date)"
                date-format="dd/mm/yy"
                showIcon
                class="job-status-modal__input"
                @update:model-value="selectedStatusDetails.start_date = formatStatusDate($event)"
              />
            </label>

            <label class="job-status-modal__field">
              <span>Completion Date</span>
              <Calendar
                :model-value="statusDateValue(selectedStatusDetails.completion_date)"
                date-format="dd/mm/yy"
                showIcon
                class="job-status-modal__input"
                @update:model-value="updateStatusCompletionDate(selectedStatus, $event)"
              />
            </label>
          </div>

          <Textarea
            v-model="selectedStatusDetails.notes"
            rows="8"
            auto-resize
            class="job-status-modal__notes"
            placeholder="Add updates, blockers, references, or handover notes for this stage..."
          />

          <div v-if="selectedStatus === 'POD / Closed'" class="job-status-modal__pod">
            <div class="job-status-modal__details-head">
              <span>Proof of Delivery</span>
            </div>

            <div class="job-status-modal__date-grid">
              <label class="job-status-modal__field">
                <span>Receiver Name</span>
                <InputText
                  v-model="selectedStatusDetails.pod_receiver_name"
                  class="job-status-modal__input"
                  placeholder="Name signed on POD"
                />
              </label>

              <label class="job-status-modal__field">
                <span>Time</span>
                <InputText
                  v-model="selectedStatusDetails.pod_time"
                  type="time"
                  class="job-status-modal__input"
                />
              </label>

              <label class="job-status-modal__field">
                <span>Date</span>
                <Calendar
                  :model-value="statusDateValue(selectedStatusDetails.pod_date)"
                  date-format="dd/mm/yy"
                  showIcon
                  class="job-status-modal__input"
                  @update:model-value="selectedStatusDetails.pod_date = formatStatusDate($event)"
                />
              </label>
            </div>

            <label class="job-status-modal__upload">
              <span>Upload POD</span>
              <input type="file" accept=".pdf,image/*" @change="onPodUploadChange" />
            </label>

            <div v-if="pendingPodFileName || podFiles.length" class="job-status-modal__pod-files">
              <div v-if="pendingPodFileName" class="job-status-modal__pod-file">
                Pending upload: {{ pendingPodFileName }}
              </div>

              <a
                v-for="file in podFiles"
                :key="file.id"
                class="job-status-modal__pod-file"
                :href="file.url || undefined"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ file.path?.split("/").pop() || `POD file #${file.id}` }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="saving"
          @click="statusModalVisible = false"
        />
        <Button
          icon="pi pi-save"
          :label="saving ? 'Saving...' : 'Save Status'"
          :loading="saving"
          @click="saveStatusModal"
        />
      </template>
    </Dialog>
  </section>
</template>
