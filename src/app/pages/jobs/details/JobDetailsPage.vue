<script setup lang="ts">
import "./JobDetailsPage.css"
import { computed } from "vue"
import { useJobDetailsPage } from "./JobDetailsPage"

import Button from "primevue/button"

import {
  JobDetailsTabs,
  RoadJobDetails,
  AirJobDetails,
  SeaJobDetails,
} from "@/app/components/jobs/details"

import JobProgressStepper from "@/app/components/jobs/details/JobProgressStepper.vue"

const {
  loading,
  saving,

  form,
  headerTitle,
  headerMeta,

  tabs,
  activeTab,

  onSave,
  onPrint,
  onExportPdf,
  onBookJob,
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
</script>

<template>
  <div class="job-details-page">
    <div class="job-header-card">
      <div class="job-header-main">
        <div class="job-header-left">
          <div class="job-title">{{ headerTitle }}</div>
          <div class="job-meta">{{ headerMeta }}</div>
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
            label="Save"
            :loading="saving"
            :disabled="loading"
            @click="onSave"
          />
          <Button
            class="job-action-btn job-action-btn--primary"
            icon="pi pi-check"
            label="Book Job"
            :disabled="loading"
            @click="onBookJob"
          />
        </div>
      </div>

      <JobProgressStepper :steps="progressSteps" />

      <JobDetailsTabs v-model="activeTab" :tabs="tabs" :disabled="loading" />
    </div>

    <div class="job-content-shell">
      <RoadJobDetails
        v-if="form.mode_of_transport === 'road'"
        :form="form"
        :active-tab="activeTab"
        :disabled="loading"
      />

      <AirJobDetails
        v-else-if="form.mode_of_transport === 'air'"
        :form="form"
        :active-tab="activeTab"
        :disabled="loading"
      />

      <SeaJobDetails
        v-else-if="form.mode_of_transport === 'sea'"
        :form="form"
        :active-tab="activeTab"
        :disabled="loading"
      />

      <div v-else class="job-placeholder-card">
        <div class="job-placeholder-title">
          {{ tabs.find(tab => tab.key === activeTab)?.label || "Section" }}
        </div>
        <div class="job-placeholder-text">
          This section will be built specifically for
          <strong>{{ form.mode_of_transport || "this mode" }}</strong
          >.
        </div>
      </div>
    </div>
  </div>
</template>
