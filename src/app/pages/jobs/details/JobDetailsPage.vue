<script setup lang="ts">
import "./JobDetailsPage.css"
import { computed, ref } from "vue"
import { RouterLink, RouterView, useRouter } from "vue-router"
import ConfirmDialog from "primevue/confirmdialog"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"

import JobProgressStepper from "@/app/components/jobs/details/JobProgressStepper.vue"
import { useTransportJobStore } from "@/app/stores/transport-job"
import type { JobPdfDocument } from "@/app/services/transport-jobs/job-pdf"
import { useJobDetailsPage } from "./JobDetailsPage.logic"

const {
  tabs,
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
  onAutosaveFocusIn,
  onAutosaveFocusOut,
  onAutosaveChange,
  onCustomerFilter,
} = useJobDetailsPage()

const toast = useToast()
const confirm = useConfirm()
const router = useRouter()
const transportJobStore = useTransportJobStore()
const pdfLoading = ref<JobPdfDocument | null>(null)
const archiveLoading = ref(false)
const isPdfLoading = computed(() => pdfLoading.value !== null)
const isRoadMode = computed(() => form.mode_of_transport === "road")

const progressSteps = computed(() => [
  {
    key: "job_created",
    number: 1,
    title: "Job Created",
    subtitle: "Complete",
    done: true,
    active: false,
  },
  {
    key: "data_entry",
    number: 2,
    title: "Data Entry",
    subtitle: "In progress",
    done: false,
    active: true,
  },
  {
    key: "booked",
    number: 3,
    title: "Booked",
    subtitle: "Pending",
    done: false,
    active: false,
  },
  {
    key: "departed",
    number: 4,
    title: "Departed",
    subtitle: "Pending",
    done: false,
    active: false,
  },
  {
    key: "in_transit",
    number: 5,
    title: "In Transit",
    subtitle: "Pending",
    done: false,
    active: false,
  },
  {
    key: "arrived",
    number: 6,
    title: "Arrived",
    subtitle: "Pending",
    done: false,
    active: false,
  },
  {
    key: "pod_closed",
    number: 7,
    title: "POD / Closed",
    subtitle: "Pending",
    done: false,
    active: false,
  },
])

function pdfFileName() {
  const number = form.job_number || job.value?.job_number || `job-${job.value?.id ?? "details"}`
  return `${number}`.replace(/[^A-Za-z0-9_-]+/g, "-") + ".pdf"
}

function openBlob(blob: Blob, download = false) {
  const url = URL.createObjectURL(blob)

  if (download) {
    const link = document.createElement("a")
    link.href = url
    link.download = pdfFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    return
  }

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

async function loadPdf(download = false, document: JobPdfDocument = "job_details") {
  const id = Number(job.value?.id)

  if (!Number.isFinite(id) || id <= 0) return

  pdfLoading.value = document

  try {
    const blob = await transportJobStore.jobPdf(id, document)

    if (!(blob instanceof Blob) || blob.type !== "application/pdf") {
      const text = blob instanceof Blob ? await blob.text() : ""
      throw new Error(text || "The server did not return a PDF.")
    }

    openBlob(blob, download)
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

function onPrint() {
  loadPdf(false, "job_details")
}

function onExportPdf() {
  loadPdf(true, "job_details")
}

function onCollectionOrder() {
  if (!isRoadMode.value) return

  loadPdf(false, "collection_order")
}

function onTransportOrder() {
  if (!isRoadMode.value) return

  loadPdf(false, "transport_order")
}

function archiveErrorMessage(error: any) {
  return error?.response?.data?.message ?? error?.message ?? "Unable to archive job."
}

function onArchive() {
  const id = Number(job.value?.id)

  if (!Number.isFinite(id) || id <= 0) return

  const label = form.job_number || job.value?.job_number || "this job"

  confirm.require({
    message: `Archive ${label}?`,
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

function onBookJob() {
  form.status = "Booked"
  save()
}
</script>

<template>
  <section
    class="job-details-page"
    @focusin.capture="onAutosaveFocusIn"
    @focusout.capture="onAutosaveFocusOut"
    @change.capture="onAutosaveChange"
  >
    <ConfirmDialog />

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
            class="job-action-btn"
            icon="pi pi-print"
            :label="pdfLoading === 'job_details' ? 'Opening...' : 'Print'"
            :loading="pdfLoading === 'job_details'"
            :disabled="loading || isPdfLoading"
            @click="onPrint"
          />

          <Button
            class="job-action-btn"
            icon="pi pi-download"
            label="Export"
            :disabled="loading || isPdfLoading"
            @click="onExportPdf"
          />

          <Button
            v-if="isRoadMode"
            class="job-action-btn"
            icon="pi pi-file"
            :label="pdfLoading === 'collection_order' ? 'Opening...' : 'Collection Order'"
            :loading="pdfLoading === 'collection_order'"
            :disabled="loading || isPdfLoading"
            @click="onCollectionOrder"
          />

          <Button
            v-if="isRoadMode"
            class="job-action-btn"
            icon="pi pi-truck"
            :label="pdfLoading === 'transport_order' ? 'Opening...' : 'Transport Order'"
            :loading="pdfLoading === 'transport_order'"
            :disabled="loading || isPdfLoading"
            @click="onTransportOrder"
          />

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

          <Button
            class="job-action-btn job-action-btn--primary"
            icon="pi pi-check"
            label="Book Job"
            :disabled="loading || saving"
            @click="onBookJob"
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

            <Dropdown
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="— Select Status —"
              class="job-header-form__prime"
              :disabled="loading"
            />
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
    </div>

    <div class="job-content-shell">
      <div v-if="initialLoading" class="job-details-page__loading">Loading job details...</div>

      <RouterView v-else v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>
  </section>
</template>
