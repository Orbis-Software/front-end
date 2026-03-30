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
  tabs,
  activeTab,

  onSave,
  onPrint,
  onExportPdf,
} = useJobDetailsPage()
</script>

<template>
  <div class="job-details-page">
    <!-- HEADER -->
    <div class="job-header">
      <div class="job-header-left">
        <div class="job-title">{{ headerTitle }}</div>
        <div class="job-meta">{{ form.mode_of_transport?.toUpperCase() }} · Draft</div>
      </div>

      <div class="job-actions">
        <Button label="Print" icon="pi pi-print" @click="onPrint" />
        <Button label="Export" icon="pi pi-download" @click="onExportPdf" />
        <Button label="Save" icon="pi pi-save" :loading="saving" @click="onSave" />
        <Button label="Book Job" class="primary" />
      </div>
    </div>

    <!-- TABS -->
    <JobDetailsTabs v-model="activeTab" :tabs="tabs" />

    <!-- CONNECTED CONTENT -->
    <div class="job-content">
      <!-- ROAD -->
      <RoadJobDetails
        v-if="form.mode_of_transport === 'road' && activeTab === 'overview'"
        :form="form"
      />

      <!-- AIR -->
      <AirJobDetails
        v-else-if="form.mode_of_transport === 'air' && activeTab === 'overview'"
        :form="form"
      />

      <!-- SEA -->
      <SeaJobDetails
        v-else-if="form.mode_of_transport === 'sea' && activeTab === 'overview'"
        :form="form"
      />

      <!-- fallback -->
      <div v-else class="placeholder">
        {{ activeTab }}
      </div>
    </div>
  </div>
</template>
