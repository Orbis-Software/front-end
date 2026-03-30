<script setup lang="ts">
import "./JobDetailsPage.css"
import { useJobDetailsPage } from "./JobDetailsPage"

import Button from "primevue/button"

import {
  JobDetailsTabs,
  RoadJobDetails,
  AirJobDetails,
  SeaJobDetails,
} from "@/app/components/jobs/details"

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

      <JobDetailsTabs v-model="activeTab" :tabs="tabs" :disabled="loading" />
    </div>

    <div class="job-content-shell">
      <!-- ROAD -->
      <RoadJobDetails
        v-if="form.mode_of_transport === 'road' && activeTab === 'overview'"
        :form="form"
        :disabled="loading"
      />

      <!-- AIR -->
      <AirJobDetails
        v-else-if="form.mode_of_transport === 'air' && activeTab === 'overview'"
        :form="form"
        :disabled="loading"
      />

      <!-- SEA -->
      <SeaJobDetails
        v-else-if="form.mode_of_transport === 'sea' && activeTab === 'overview'"
        :form="form"
        :disabled="loading"
      />

      <!-- generic placeholders -->
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
