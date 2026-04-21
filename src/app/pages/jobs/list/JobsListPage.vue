<template>
  <section class="jobs-list-page">
    <ConfirmDialog />

    <header class="jobs-list-page__header">
      <div class="jobs-list-page__title-wrap">
        <h1 class="jobs-list-page__title">Jobs</h1>
      </div>

      <div class="jobs-list-page__header-actions">
        <div class="jobs-list-page__search-wrap">
          <i class="pi pi-search jobs-list-page__search-icon" />
          <InputText
            v-model="searchText"
            class="jobs-list-page__search-input"
            placeholder="     Search job number, customer..."
          />
        </div>

        <div class="jobs-list-page__toggle-inline">
          <span class="jobs-list-page__toggle-label">Show All Jobs</span>
          <ToggleSwitch v-model="showAllJobs" class="jobs-list-page__switch" />
        </div>

        <Button
          class="jobs-list-page__new-btn"
          icon="pi pi-plus"
          label="New Job"
          @click="onNewJob"
        />
      </div>
    </header>

    <div class="jobs-list-page__card">
      <div class="jobs-list-page__tabs-bar">
        <nav class="jobs-list-page__tabs">
          <button
            v-for="option in jobTypeOptions"
            :key="option.value"
            class="jobs-list-page__tab"
            :class="{ 'jobs-list-page__tab--active': jobTypeFilter === option.value }"
            type="button"
            @click="jobTypeFilter = option.value"
          >
            {{ option.label }}
          </button>
        </nav>

        <div class="jobs-list-page__tabs-tools">
          <div class="jobs-list-page__mode-filter">
            <span class="jobs-list-page__mode-filter-label">Mode of Transport</span>

            <Dropdown
              v-model="modeFilter"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select mode"
              class="jobs-list-page__mode-dropdown"
            />
          </div>
        </div>
      </div>

      <div class="jobs-list-page__content">
        <div class="jobs-list-page__table-card">
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
              <div class="jobs-list-page__empty-state">
                <div class="jobs-list-page__empty-title">No jobs found</div>
                <div class="jobs-list-page__empty-subtitle">
                  Try changing filters or search terms.
                </div>
              </div>
            </template>

            <Column header="Job" style="width: 280px">
              <template #body="{ data }">
                <div class="jobs-list-page__job-cell">
                  <button class="jobs-list-page__cell-link" type="button" @click="onEdit(data.id)">
                    {{ data.job_number || "—" }}
                  </button>
                  <div class="jobs-list-page__cell-subtext">#{{ data.id }}</div>
                </div>
              </template>
            </Column>

            <Column header="Type" style="width: 180px">
              <template #body="{ data }">
                <span class="jobs-list-page__info-chip">
                  {{ prettify(data.job_type) || "—" }}
                </span>
              </template>
            </Column>

            <Column header="Mode" style="width: 180px">
              <template #body="{ data }">
                <span class="jobs-list-page__info-chip">
                  {{ prettify(data.mode_of_transport) || "—" }}
                </span>
              </template>
            </Column>

            <Column header="Customer" style="width: 280px">
              <template #body="{ data }">
                <div class="jobs-list-page__customer-cell">
                  <div class="jobs-list-page__customer-name">
                    {{ data.customer_contact?.company_name ?? "—" }}
                  </div>
                  <div class="jobs-list-page__cell-subtext">
                    {{ data.customer_contact?.account_number ?? "" }}
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Created by" style="width: 280px">
              <template #body="{ data }">
                <div class="jobs-list-page__creator-cell">
                  <div class="jobs-list-page__creator-name">
                    {{ data.creator?.name ?? "—" }}
                  </div>
                  <div class="jobs-list-page__cell-subtext">
                    {{ data.customer_contact?.email ?? "" }}
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Quote Ref" style="width: 180px">
              <template #body="{ data }">
                <span class="jobs-list-page__plain-value">{{ data.quote_ref || "—" }}</span>
              </template>
            </Column>

            <Column header="Date" style="width: 160px">
              <template #body="{ data }">
                <span class="jobs-list-page__plain-value">{{ data.job_date || "—" }}</span>
              </template>
            </Column>

            <Column header="" style="width: 190px">
              <template #body="{ data }">
                <div class="jobs-list-page__row-actions">
                  <Button
                    text
                    class="jobs-list-page__edit-btn"
                    icon="pi pi-pencil"
                    label="Edit"
                    @click="onEdit(data.id)"
                  />
                  <Button
                    text
                    class="jobs-list-page__delete-btn"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import "./JobsListPage.css"

import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
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
