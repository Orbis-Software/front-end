<script setup lang="ts">
import "./JobDetailsPage.css"
import { computed } from "vue"
import { RouterLink, RouterView } from "vue-router"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"

import JobProgressStepper from "@/app/components/jobs/details/JobProgressStepper.vue"
import { useJobDetailsPage } from "./JobDetailsPage.logic"

const {
  tabs,
  isActive,
  getTabCount,
  title,
  subtitle,
  form,
  customerOptions,
  loading,
  saving,
  save,
} = useJobDetailsPage()

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

const modeOptions = [
  { label: "Air Freight", value: "air" },
  { label: "Sea Freight", value: "sea" },
  { label: "Road Freight", value: "road" },
  { label: "Rail Freight", value: "rail" },
  { label: "Courier", value: "courier" },
  { label: "Multi Modal", value: "multi_modal" },
  { label: "Consolidation", value: "consolidation" },
]

const statusOptions = [
  { label: "Draft", value: "Draft" },
  { label: "Booked", value: "Booked" },
  { label: "In Transit", value: "In Transit" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
]

function onPrint() {
  window.print()
}

function onExportPdf() {
  window.print()
}

function onBookJob() {
  save()
}
</script>

<template>
  <section class="job-details-page">
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
            label="Print"
            :disabled="loading"
            @click="onPrint"
          />

          <Button
            class="job-action-btn"
            icon="pi pi-download"
            label="Export"
            :disabled="loading"
            @click="onExportPdf"
          />

          <Button
            class="job-action-btn"
            icon="pi pi-save"
            :label="saving ? 'Saving...' : 'Save'"
            :loading="saving"
            :disabled="loading"
            @click="save"
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
        <div class="job-header-form__grid">
          <label class="job-header-form__field">
            <span>Customer Name <strong>*</strong></span>

            <Dropdown
              v-model="form.customer_id"
              :options="customerOptions"
              option-label="label"
              option-value="value"
              placeholder="— Select Customer —"
              filter
              show-clear
              class="job-header-form__prime"
              :disabled="loading"
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
              show-icon
              class="job-header-form__prime"
              :disabled="loading"
            />
          </label>

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

          <label class="job-header-form__field">
            <span>Status</span>

            <Dropdown
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
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
      <div v-if="loading" class="job-details-page__loading">Loading job details...</div>

      <RouterView v-else />
    </div>
  </section>
</template>
