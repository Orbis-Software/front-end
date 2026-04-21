<template>
  <section class="quotes-list-page">
    <header class="quotes-list-page__header">
      <div class="quotes-list-page__title-wrap">
        <h1 class="quotes-list-page__title">Quotations</h1>
      </div>

      <div class="quotes-list-page__header-actions">
        <div class="quotes-list-page__search-wrap">
          <i class="pi pi-search quotes-list-page__search-icon" />
          <InputText
            v-model="searchText"
            class="quotes-list-page__search-input"
            placeholder="     Search quotation number, customer..."
          />
        </div>

        <Button
          class="quotes-list-page__new-btn"
          icon="pi pi-plus"
          label="New Quotation"
          @click="onNewQuotation"
        />
      </div>
    </header>

    <div class="quotes-list-page__card">
      <div class="quotes-list-page__tabs-bar">
        <nav class="quotes-list-page__tabs">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="quotes-list-page__tab"
            :class="{ 'quotes-list-page__tab--active': statusFilter === option.value }"
            type="button"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </nav>

        <div class="quotes-list-page__tabs-tools">
          <div class="quotes-list-page__mode-filter">
            <span class="quotes-list-page__mode-filter-label">Mode of Transport</span>

            <Dropdown
              v-model="modeFilter"
              :options="modeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select mode"
              class="quotes-list-page__mode-dropdown"
            />
          </div>
        </div>
      </div>

      <div class="quotes-list-page__content">
        <div class="quotes-list-page__table-card">
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
              <div class="quotes-list-page__empty-state">
                <div class="quotes-list-page__empty-title">No quotations found</div>
                <div class="quotes-list-page__empty-subtitle">
                  Try changing filters or search terms.
                </div>
              </div>
            </template>

            <Column header="Quotation" style="width: 240px">
              <template #body="{ data }">
                <div class="quotes-list-page__quote-cell">
                  <button
                    class="quotes-list-page__cell-link"
                    type="button"
                    @click="onEdit(data.id)"
                  >
                    {{ data.quote_number }}
                  </button>
                  <div class="quotes-list-page__cell-subtext">#{{ data.id }}</div>
                </div>
              </template>
            </Column>

            <Column header="Customer" style="width: 260px">
              <template #body="{ data }">
                <div class="quotes-list-page__customer-cell">
                  <div class="quotes-list-page__customer-name">{{ data.customer_name }}</div>
                  <div class="quotes-list-page__cell-subtext">{{ data.account_number }}</div>
                </div>
              </template>
            </Column>

            <Column header="Type" style="width: 160px">
              <template #body="{ data }">
                <span class="quotes-list-page__info-chip">
                  {{ prettify(data.quote_type) }}
                </span>
              </template>
            </Column>

            <Column header="Mode" style="width: 160px">
              <template #body="{ data }">
                <span class="quotes-list-page__info-chip">
                  {{ prettify(data.mode_of_transport) }}
                </span>
              </template>
            </Column>

            <Column header="Status" style="width: 160px">
              <template #body="{ data }">
                <span class="quotes-list-page__info-chip" :class="statusClass(data.status)">
                  {{ prettify(data.status) }}
                </span>
              </template>
            </Column>

            <Column header="Valid Until" style="width: 160px">
              <template #body="{ data }">
                <span class="quotes-list-page__plain-value">{{ data.valid_until }}</span>
              </template>
            </Column>

            <Column header="Amount" style="width: 160px">
              <template #body="{ data }">
                <span class="quotes-list-page__plain-value">
                  {{ data.currency }} {{ formatAmount(data.amount) }}
                </span>
              </template>
            </Column>

            <Column header="" style="width: 180px">
              <template #body="{ data }">
                <div class="quotes-list-page__row-actions">
                  <Button
                    text
                    class="quotes-list-page__edit-btn"
                    icon="pi pi-pencil"
                    label="Edit"
                    @click="onEdit(data.id)"
                  />
                  <Button
                    text
                    class="quotes-list-page__delete-btn"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import "./QuoteListPage.css"

import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
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
