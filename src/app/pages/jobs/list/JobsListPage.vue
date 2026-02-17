<template>
  <div class="jobs-list-page">
    <div class="page-header">
      <div class="left">
        <div class="page-title">Jobs</div>
        <div class="page-subtitle">Manage all transport jobs</div>
      </div>

    <div class="page-actions">
        <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search" />
            <InputText
            v-model="searchText"
            class="search-input"
            placeholder="Search job number, customer, quote ref..."
            />
        </span>

        <Button class="orbis-primary" icon="pi pi-plus" label="New Job" @click="onNewJob" />
    </div>

    </div>

    <section class="filters-card">
      <div class="filter-row">
        <div class="filter-label">Job Type</div>
        <SelectButton
          v-model="jobTypeFilter"
          :options="jobTypeOptions"
          optionLabel="label"
          optionValue="value"
          :allowEmpty="false"
          class="orbis-selectbutton"
        />
      </div>

      <div class="filter-row">
        <div class="filter-label">Mode</div>
        <SelectButton
          v-model="modeFilter"
          :options="modeOptions"
          optionLabel="label"
          optionValue="value"
          :allowEmpty="false"
          class="orbis-selectbutton"
        />
      </div>
    </section>

    <section class="card">
      <DataTable
        :value="items"
        dataKey="id"
        :loading="loading"
        stripedRows
        responsiveLayout="scroll"
        class="jobs-table"
      >
        <template #empty>
          <div class="empty">
            <div class="empty-title">No jobs found</div>
            <div class="empty-sub">Try changing filters or search terms.</div>
          </div>
        </template>

        <Column header="Job" style="width: 260px">
          <template #body="{ data }">
            <div class="job-cell">
              <div class="job-number">{{ data.job_number }}</div>
              <div class="muted">#{{ data.id }}</div>
            </div>
          </template>
        </Column>

        <Column header="Type" style="width: 170px">
          <template #body="{ data }">
            <Tag :value="prettify(data.job_type)" class="tag-soft" />
          </template>
        </Column>

        <Column header="Mode" style="width: 150px">
          <template #body="{ data }">
            <Tag :value="prettify(data.mode_of_transport)" class="tag-soft" />
          </template>
        </Column>

        <Column header="Customer">
          <template #body="{ data }">
            <div class="customer-cell">
              <div class="customer-name">
                {{ data.customer_contact?.name ?? "—" }}
              </div>
              <div class="muted">
                {{ data.customer_contact?.account_number ?? "" }}
              </div>
            </div>
          </template>
        </Column>

        <Column header="Quote Ref" style="width: 180px">
          <template #body="{ data }">
            {{ data.quote_ref ?? "—" }}
          </template>
        </Column>

        <Column header="Date" style="width: 150px">
          <template #body="{ data }">
            {{ data.job_date ?? "—" }}
          </template>
        </Column>

        <Column header="" style="width: 190px" bodyClass="actions-col">
          <template #body="{ data }">
            <Button text size="small" icon="pi pi-pencil" label="Edit" class="action-btn" @click="onEdit(data.id)" />
            <Button
              text
              size="small"
              icon="pi pi-trash"
              label="Delete"
              severity="danger"
              class="action-btn danger"
              @click="confirmDelete(data.id)"
            />
          </template>
        </Column>
      </DataTable>

      <div class="table-footer">
        <div class="muted">
          Page {{ page }} of {{ lastPage }} • {{ total }} total
        </div>

        <Paginator
          :rows="perPage"
          :totalRecords="total"
          :first="(page - 1) * perPage"
          :rowsPerPageOptions="[10, 15, 25, 50]"
          @page="onPage"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import "./JobsListPage.css"

import InputText from "primevue/inputtext"
import Button from "primevue/button"
import SelectButton from "primevue/selectbutton"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Tag from "primevue/tag"
import Paginator from "primevue/paginator"

import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import { useJobsListPage } from "./JobsListPage"

const confirm = useConfirm()
const toast = useToast()

const {
  items,
  loading,

  page,
  perPage,
  lastPage,
  total,

  jobTypeFilter,
  modeFilter,
  searchText,

  jobTypeOptions,
  modeOptions,

  onNewJob,
  onEdit,
  onDelete,
  onPage,

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
        toast.add({ severity: "success", summary: "Deleted", detail: "Job deleted", life: 2500 })
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
