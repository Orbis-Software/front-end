<template>
  <div class="quotes-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quotations</h1>
        <p class="page-subtitle">Manage all quotations</p>
      </div>

      <div class="page-actions">
        <div class="search-group">
          <div class="search-wrap">
            <i class="pi pi-search search-icon" />
            <InputText
              v-model="searchText"
              class="search-input"
              placeholder="     Search quotation number, customer..."
            />
          </div>
        </div>

        <Button
          class="btn-primary new-btn"
          icon="pi pi-plus"
          label="New Quotation"
          @click="onNewQuotation"
        />
      </div>
    </div>

    <div class="filters-wrap">
      <div class="filters-row">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          class="filter-pill"
          :class="{ active: statusFilter === option.value }"
          type="button"
          @click="statusFilter = option.value"
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
        :value="paginatedItems"
        dataKey="id"
        responsiveLayout="scroll"
        class="quotes-table"
        paginator
        :rows="rows"
        :totalRecords="filteredItems.length"
        :first="firstRow"
        :rowsPerPageOptions="[10, 15, 25, 50]"
        @page="onPage"
      >
        <template #empty>
          <div class="empty-state">
            <div class="empty-title">No quotations found</div>
            <div class="empty-subtitle">Try changing filters or search terms.</div>
          </div>
        </template>

        <Column header="Quotation" style="width: 240px">
          <template #body="{ data }">
            <div class="quote-cell">
              <button class="cell-link" type="button" @click="onEdit(data.id)">
                {{ data.quote_number }}
              </button>
              <div class="cell-subtext">#{{ data.id }}</div>
            </div>
          </template>
        </Column>

        <Column header="Customer" style="width: 260px">
          <template #body="{ data }">
            <div class="customer-cell">
              <div class="customer-name">{{ data.customer_name }}</div>
              <div class="cell-subtext">{{ data.account_number }}</div>
            </div>
          </template>
        </Column>

        <Column header="Type" style="width: 160px">
          <template #body="{ data }">
            <span class="info-chip">{{ prettify(data.quote_type) }}</span>
          </template>
        </Column>

        <Column header="Mode" style="width: 160px">
          <template #body="{ data }">
            <span class="info-chip">{{ prettify(data.mode_of_transport) }}</span>
          </template>
        </Column>

        <Column header="Status" style="width: 160px">
          <template #body="{ data }">
            <span class="info-chip" :class="statusClass(data.status)">
              {{ prettify(data.status) }}
            </span>
          </template>
        </Column>

        <Column header="Valid Until" style="width: 160px">
          <template #body="{ data }">
            <span class="plain-value">{{ data.valid_until }}</span>
          </template>
        </Column>

        <Column header="Amount" style="width: 160px">
          <template #body="{ data }">
            <span class="plain-value">{{ data.currency }} {{ formatAmount(data.amount) }}</span>
          </template>
        </Column>

        <Column header="" style="width: 180px">
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
                @click="onDelete(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./QuoteListPage.css"

import InputText from "primevue/inputtext"
import Button from "primevue/button"
import DataTable from "primevue/datatable"
import Column from "primevue/column"

import { useQuoteListPage } from "./QuoteListPage"

const {
  searchText,
  statusFilter,
  modeFilter,
  statusOptions,
  modeOptions,
  filteredItems,
  paginatedItems,
  rows,
  firstRow,
  onPage,
  onNewQuotation,
  onEdit,
  onDelete,
  prettify,
  formatAmount,
  statusClass,
} = useQuoteListPage()
</script>
