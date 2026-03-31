<template>
  <div class="jobs-list-page">
    <ConfirmDialog />

    <div class="page-header">
      <div>
        <h1 class="page-title">Jobs</h1>
        <p class="page-subtitle">Manage all transport jobs</p>
      </div>

      <div class="page-actions">
        <div class="search-group">
          <div class="search-wrap">
            <i class="pi pi-search search-icon" />
            <InputText
              v-model="searchText"
              class="search-input"
              placeholder="     Search job number, customer..."
            />
          </div>

          <div class="toggle-under-search">
            <span class="toggle-label">Show All Jobs</span>
            <ToggleSwitch v-model="showAllJobs" class="jobs-switch" />
          </div>
        </div>

        <Button class="btn-primary new-btn" icon="pi pi-plus" label="New Job" @click="onNewJob" />
      </div>
    </div>

    <div class="filters-wrap">
      <div class="filters-row">
        <button
          v-for="option in jobTypeOptions"
          :key="option.value"
          class="filter-pill"
          :class="{ active: jobTypeFilter === option.value }"
          type="button"
          @click="jobTypeFilter = option.value"
        >
          {{ option.label.toUpperCase() }}
        </button>
      </div>

      <div class="filters-row secondary">
        <button
          v-for="option in modeOptions"
          :key="option.value"
          class="filter-pill"
          :class="{ active: modeFilter === option.value }"
          type="button"
          @click="modeFilter = option.value"
        >
          {{ option.label.toUpperCase() }}
        </button>
      </div>
    </div>

    <div class="table-card">
      <DataTable
        :value="items"
        :loading="loading"
        dataKey="id"
        responsiveLayout="scroll"
        class="jobs-table"
        paginator
        lazy
        :rows="perPage"
        :totalRecords="total"
        :first="firstRow"
        :rowsPerPageOptions="[15, 25, 50, 100]"
        @page="onPage"
      >
        <template #empty>
          <div class="empty-state">
            <div class="empty-title">No jobs found</div>
            <div class="empty-subtitle">Try changing filters or search terms.</div>
          </div>
        </template>

        <Column header="Job" style="width: 280px">
          <template #body="{ data }">
            <div class="job-cell">
              <button class="cell-link" type="button" @click="onEdit(data.id)">
                {{ data.job_number || "—" }}
              </button>
              <div class="cell-subtext">#{{ data.id }}</div>
            </div>
          </template>
        </Column>

        <Column header="Type" style="width: 180px">
          <template #body="{ data }">
            <span class="info-chip">
              {{ prettify(data.job_type) || "—" }}
            </span>
          </template>
        </Column>

        <Column header="Mode" style="width: 180px">
          <template #body="{ data }">
            <span class="info-chip">
              {{ prettify(data.mode_of_transport) || "—" }}
            </span>
          </template>
        </Column>

        <Column header="Customer" style="width: 280px">
          <template #body="{ data }">
            <div class="customer-cell">
              <div class="customer-name">
                {{ data.customer_contact?.company_name ?? "—" }}
              </div>
              <div class="cell-subtext">
                {{ data.customer_contact?.account_number ?? "" }}
              </div>
            </div>
          </template>
        </Column>

        <Column header="Created by" style="width: 280px">
          <template #body="{ data }">
            <div class="customer-cell">
              <div class="customer-name">
                {{ data.creator?.name ?? "—" }}
              </div>
              <div class="cell-subtext">
                {{ data.customer_contact?.email ?? "" }}
              </div>
            </div>
          </template>
        </Column>

        <Column header="Quote Ref" style="width: 180px">
          <template #body="{ data }">
            <span class="plain-value">{{ data.quote_ref || "—" }}</span>
          </template>
        </Column>

        <Column header="Date" style="width: 160px">
          <template #body="{ data }">
            <span class="plain-value">{{ data.job_date || "—" }}</span>
          </template>
        </Column>

        <Column header="" style="width: 190px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button
                text
                class="edit-btn"
                icon="pi pi-pencil"
                label="Edit"
                @click="onEdit(data.id)"
              />
              <Button
                text
                class="delete-btn"
                icon="pi pi-trash"
                label="Delete"
                @click="confirmDelete(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./JobsListPage.css"

import InputText from "primevue/inputtext"
import Button from "primevue/button"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import ConfirmDialog from "primevue/confirmdialog"
import ToggleSwitch from "primevue/toggleswitch"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import { useJobsListPage } from "./JobsListPage"

const confirm = useConfirm()
const toast = useToast()

const {
  items,
  loading,
  total,
  perPage,
  firstRow,
  searchText,
  jobTypeFilter,
  modeFilter,
  jobTypeOptions,
  modeOptions,
  showAllJobs,
  onPage,
  onNewJob,
  onEdit,
  onDelete,
  prettify,
} = useJobsListPage()

function confirmDelete(id: number) {
  confirm.require({
    message: "Delete this job?",
    header: "Confirm",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await onDelete(id)
        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: "Job deleted",
          life: 2500,
        })
      } catch (e: any) {
        toast.add({
          severity: "error",
          summary: "Failed",
          detail: String(e?.response?.data?.message ?? e?.message ?? "Unable to delete job"),
          life: 4000,
        })
      }
    },
  })
}
</script>
