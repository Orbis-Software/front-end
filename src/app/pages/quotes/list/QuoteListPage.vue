<template>
  <section class="quotes-list-page">
    <Toast />

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
            :loading="loading"
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
                    @click="onView(data.id)"
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
                <span class="quotes-list-page__plain-value">
                  {{ data.valid_until || "—" }}
                </span>
              </template>
            </Column>

            <Column header="Amount" style="width: 160px">
              <template #body="{ data }">
                <span class="quotes-list-page__plain-value">
                  {{ data.currency }} {{ formatAmount(data.amount) }}
                </span>
              </template>
            </Column>

            <Column header="Actions" style="width: 280px">
              <template #body="{ data }">
                <div class="quotes-list-page__row-actions">
                  <template v-if="data.status === 'draft'">
                    <Button
                      text
                      class="quotes-list-page__edit-btn"
                      icon="pi pi-pencil"
                      label="Edit"
                      @click="onEdit(data.id)"
                    />

                    <Button
                      text
                      class="quotes-list-page__sent-btn"
                      icon="pi pi-send"
                      label="Sent"
                      @click="openSentModal(data)"
                    />
                  </template>

                  <template v-else-if="data.status === 'sent'">
                    <Button
                      text
                      class="quotes-list-page__approve-btn"
                      icon="pi pi-check"
                      label="Accept"
                      @click="openApprovalModal(data)"
                    />

                    <Button
                      text
                      class="quotes-list-page__decline-btn"
                      icon="pi pi-times"
                      label="Reject"
                      @click="openDeclineModal(data)"
                    />
                  </template>

                  <template v-else-if="data.status === 'accepted'">
                    <Button
                      text
                      class="quotes-list-page__convert-btn"
                      icon="pi pi-briefcase"
                      label="Convert to Job"
                      @click="openConvertModal(data)"
                    />
                  </template>

                  <template v-else-if="data.status === 'rejected'">
                    <Button
                      text
                      class="quotes-list-page__delete-btn"
                      icon="pi pi-trash"
                      label="Delete"
                      @click="openDeleteModal(data)"
                    />
                  </template>

                  <template v-else>
                    <Button text icon="pi pi-eye" label="View" @click="onView(data.id)" />
                  </template>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="actionDialogVisible"
      modal
      class="quotes-list-page__action-dialog"
      :header="actionDialogTitle"
      :style="{ width: '440px' }"
    >
      <div class="quotes-list-page__dialog-body">
        <p class="quotes-list-page__dialog-message">
          {{ actionDialogMessage }}
        </p>

        <div v-if="selectedQuote" class="quotes-list-page__dialog-summary">
          <div>
            <span>Quotation</span>
            <strong>{{ selectedQuote.quote_number }}</strong>
          </div>

          <div>
            <span>Customer</span>
            <strong>{{ selectedQuote.customer_name }}</strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>{{ selectedQuote.currency }} {{ formatAmount(selectedQuote.amount) }}</strong>
          </div>
        </div>

        <div
          v-if="selectedAction === 'approve' || selectedAction === 'decline'"
          class="quotes-list-page__dialog-field"
        >
          <label>Notes</label>
          <Textarea v-model="actionNotes" rows="4" autoResize placeholder="Add optional notes..." />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="actionProcessing"
          @click="closeActionDialog"
        />

        <Button
          :label="actionConfirmLabel"
          :icon="actionConfirmIcon"
          :class="actionConfirmClass"
          :loading="actionProcessing"
          :disabled="actionProcessing"
          @click="confirmQuoteAction"
        />
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import "./QuoteListPage.css"

import InputText from "primevue/inputtext"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Dialog from "primevue/dialog"
import Toast from "primevue/toast"
import Textarea from "primevue/textarea"

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
  loading,
  actionProcessing,
  actionDialogVisible,
  selectedQuote,
  selectedAction,
  actionNotes,
  actionDialogTitle,
  actionDialogMessage,
  actionConfirmLabel,
  actionConfirmIcon,
  actionConfirmClass,
  onPage,
  onNewQuotation,
  onView,
  onEdit,
  openSentModal,
  openApprovalModal,
  openDeclineModal,
  openConvertModal,
  openDeleteModal,
  closeActionDialog,
  confirmQuoteAction,
  prettify,
  formatAmount,
  statusClass,
} = useQuoteListPage()
</script>
