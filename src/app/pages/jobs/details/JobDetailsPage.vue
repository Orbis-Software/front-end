<script setup lang="ts">
import "./JobDetailsPage.css";
import { useJobDetailsPage } from "./JobDetailsPage";

import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";

import {
  JobDetailsTabs,
  JobOverviewTab,
  JobTransportTab,
  JobPlaceholderTab,
} from "@/app/components/jobs/details";

const {
  job,
  loading,
  saving,

  headerTitle,
  form,
  modeOptions,

  tabs,
  activeTab,

  customerOptions,
  onCustomerFilter,

  onSave,
  onCreateShipment,
  onCreateInvoice,
  onPreAlert,
  onPrint,
  onExportPdf,
} = useJobDetailsPage();
</script>

<template>
  <div class="job-details-page">
    <!-- Header -->
    <div class="job-details-header">
      <div class="job-details-title">{{ headerTitle }}</div>

      <div class="job-details-actions">
        <Button
          class="action-btn"
          icon="pi pi-save"
          label="Save"
          :loading="saving"
          :disabled="loading"
          @click="onSave"
        />
        <Button class="action-btn" icon="pi pi-plus" label="Create Shipment" :disabled="loading" @click="onCreateShipment" />
        <Button class="action-btn" icon="pi pi-file" label="Create Invoice" :disabled="loading" @click="onCreateInvoice" />
        <Button class="action-btn" icon="pi pi-envelope" label="Pre-alert" :disabled="loading" @click="onPreAlert" />
        <Button class="action-btn" icon="pi pi-print" label="Print" :disabled="loading" @click="onPrint" />
        <Button class="action-btn action-btn--export" icon="pi pi-download" label="Export PDF" :disabled="loading" @click="onExportPdf" />
      </div>
    </div>

    <!-- Top Form -->
    <div class="card job-details-top">
      <div class="grid-3">
        <div class="field">
          <label class="label">Customer Name</label>
          <div class="field-control">
            <Dropdown
              v-model="form.customer_id"
              :options="customerOptions"
              optionLabel="label"
              optionValue="value"
              filter
              placeholder="Start typing... (select from CRM)"
              :disabled="loading"
              class="field-fluid"
              @filter="onCustomerFilter"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Customer Quote Ref</label>
          <div class="field-control">
            <InputText
              v-model="form.quote_ref"
              placeholder="Optional"
              :disabled="loading"
              class="field-fluid field-input"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Job Date</label>
          <div class="field-control">
            <Calendar
              v-model="form.job_date"
              dateFormat="dd/mm/yy"
              :disabled="loading"
              class="field-fluid"
              inputClass="field-input"
              :showIcon="false"
            />
          </div>
        </div>
      </div>

      <div class="grid-3">
        <div class="field">
          <label class="label">Account Number</label>
          <div class="field-control">
            <InputText v-model="form.account_number" disabled class="field-fluid field-input" />
          </div>
        </div>

        <div class="field">
          <label class="label">Job Number</label>
          <div class="field-control">
            <InputText v-model="form.job_number" disabled class="field-fluid field-input" />
          </div>
        </div>

        <div class="field">
          <label class="label">Mode of Transport</label>
          <div class="field-control">
            <Dropdown
              v-model="form.mode_of_transport"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select"
              :disabled="loading"
              class="field-fluid"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="card job-details-tabs-card">
      <JobDetailsTabs v-model="activeTab" :tabs="tabs" :disabled="loading" />
    </div>

    <!-- Content -->
    <div class="job-details-content">
      <JobOverviewTab v-if="activeTab === 'overview'" :form="form" :disabled="loading" />
      <JobTransportTab v-else-if="activeTab === 'transport'" :form="form" :disabled="loading" />
      <JobPlaceholderTab v-else :title="tabs.find((t) => t.key === activeTab)?.label || 'Section'" />
    </div>
  </div>
</template>
