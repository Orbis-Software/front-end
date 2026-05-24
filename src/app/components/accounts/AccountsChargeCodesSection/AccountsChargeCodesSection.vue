<script setup lang="ts">
import "./AccountsChargeCodesSection.css"

import Button from "primevue/button"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import InputSwitch from "primevue/inputswitch"
import Paginator from "primevue/paginator"
import { useAccountsChargeCodesSection } from "./AccountsChargeCodesSection"

const {
  chargeCodeStore,
  editingId,
  formVisible,
  filterState,
  form,
  classificationOptions,
  purchaseOptions,
  salesOptions,
  customsOptions,
  countsText,
  firstRow,
  formTitle,
  applyFilters,
  openCreateModal,
  closeForm,
  saveCharge,
  editCharge,
  deleteCharge,
  resetToSeed,
  sortBy,
  onPage,
  sortMarker,
  exportCsv,
  exportExcel,
  printView,
} = useAccountsChargeCodesSection()
</script>

<template>
  <div class="accounts-charge-codes">
    <section class="accounts-charge-codes__panel">
      <div class="accounts-charge-codes__head">
        <div>
          <div class="accounts-charge-codes__eyebrow">CHARGE DESCRIPTIONS &amp; NOMINAL CODES</div>
          <h2 class="accounts-charge-codes__title">
            Freight charge master with nominal, classification, tax and customs mapping
          </h2>
        </div>

        <div class="accounts-charge-codes__actions">
          <Button label="Add Charge" class="btn btn--primary" @click="openCreateModal" />
          <Button label="Export CSV" class="btn btn--ghost" @click="exportCsv" />
          <Button label="Export Excel" class="btn btn--ghost" @click="exportExcel" />
          <Button label="Print" class="btn btn--ghost" @click="printView" />
          <Button label="Reset" class="btn btn--ghost" @click="resetToSeed" />
        </div>
      </div>

      <div class="accounts-charge-codes__filters">
        <div class="accounts-charge-codes__field accounts-charge-codes__field--search">
          <label>Search</label>
          <InputText
            v-model="filterState.search"
            placeholder="Search charge description, nominal, keyword..."
            @input="applyFilters"
          />
        </div>
        <div class="accounts-charge-codes__field">
          <label>Classification</label>
          <Dropdown
            v-model="filterState.classification"
            :options="classificationOptions"
            option-label="label"
            option-value="value"
            class="accounts-charge-codes__control"
            @change="applyFilters"
          />
        </div>
        <div class="accounts-charge-codes__field">
          <label>Purchase Nom.</label>
          <Dropdown
            v-model="filterState.purchaseNominal"
            :options="purchaseOptions"
            option-label="label"
            option-value="value"
            class="accounts-charge-codes__control"
            @change="applyFilters"
          />
        </div>
        <div class="accounts-charge-codes__field">
          <label>Sales Nom.</label>
          <Dropdown
            v-model="filterState.salesNominal"
            :options="salesOptions"
            option-label="label"
            option-value="value"
            class="accounts-charge-codes__control"
            @change="applyFilters"
          />
        </div>
        <div class="accounts-charge-codes__field">
          <label>Customs</label>
          <Dropdown
            v-model="filterState.isCustoms"
            :options="customsOptions"
            option-label="label"
            option-value="value"
            class="accounts-charge-codes__control"
            @change="applyFilters"
          />
        </div>
      </div>

      <div class="accounts-charge-codes__list-tools">
        <div class="accounts-charge-codes__counts">{{ countsText }}</div>
      </div>

      <Dialog
        v-model:visible="formVisible"
        :header="formTitle"
        modal
        class="accounts-charge-codes__dialog"
        :style="{ width: '720px', maxWidth: 'calc(100vw - 32px)' }"
      >
        <div class="accounts-charge-codes__form-grid">
          <div class="accounts-charge-codes__field accounts-charge-codes__field--wide">
            <label>Charge Description</label>
            <InputText v-model="form.description" placeholder="e.g. Air freight" autofocus />
          </div>
          <div class="accounts-charge-codes__field">
            <label>Purchase Nominal</label>
            <InputText v-model="form.purchaseNominal" placeholder="e.g. 325" />
          </div>
          <div class="accounts-charge-codes__field">
            <label>Sales Nominal</label>
            <InputText v-model="form.salesNominal" placeholder="e.g. 200" />
          </div>
          <div class="accounts-charge-codes__field">
            <label>Classification</label>
            <InputText v-model="form.classification" placeholder="e.g. Air, Sea, Road" />
          </div>
          <div class="accounts-charge-codes__field">
            <label>Default Tax Code</label>
            <InputText v-model="form.defaultTaxCode" placeholder="e.g. T1, T0, T9" />
          </div>
          <div class="accounts-charge-codes__field accounts-charge-codes__field--customs">
            <label>Customs Charge</label>
            <div class="accounts-charge-codes__switch-row">
              <InputSwitch v-model="form.isCustoms" />
              <span>{{ form.isCustoms ? "Yes" : "No" }}</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="accounts-charge-codes__dialog-actions">
            <Button label="Cancel" class="btn btn--ghost" @click="closeForm" />
            <Button
              :label="editingId ? 'Save Charge' : 'Add Charge'"
              class="btn btn--primary"
              :loading="chargeCodeStore.saving"
              @click="saveCharge"
            />
          </div>
        </template>
      </Dialog>
      <div v-if="chargeCodeStore.error" class="accounts-charge-codes__error">
        {{ chargeCodeStore.error }}
      </div>

      <div class="accounts-charge-codes__table-wrap">
        <table class="accounts-charge-codes__table">
          <thead>
            <tr>
              <th @click="sortBy('description')">
                Charge Description {{ sortMarker("description") }}
              </th>
              <th @click="sortBy('purchaseNominal')">
                Purchase Nominal {{ sortMarker("purchaseNominal") }}
              </th>
              <th @click="sortBy('salesNominal')">
                Sales Nominal {{ sortMarker("salesNominal") }}
              </th>
              <th @click="sortBy('classification')">
                Classification {{ sortMarker("classification") }}
              </th>
              <th @click="sortBy('defaultTaxCode')">
                Default Tax Code {{ sortMarker("defaultTaxCode") }}
              </th>
              <th @click="sortBy('isCustoms')">Customs {{ sortMarker("isCustoms") }}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="chargeCodeStore.loading">
              <td colspan="7">Loading charge codes...</td>
            </tr>
            <tr v-else-if="!chargeCodeStore.chargeCodes.length">
              <td colspan="7">No charges match the current filters.</td>
            </tr>
            <template v-else>
              <tr v-for="row in chargeCodeStore.chargeCodes" :key="row.id">
                <td>{{ row.description }}</td>
                <td class="accounts-charge-codes__code">{{ row.purchaseNominal || "-" }}</td>
                <td class="accounts-charge-codes__code">{{ row.salesNominal || "-" }}</td>
                <td>
                  <span
                    class="accounts-charge-codes__badge"
                    :class="{ 'accounts-charge-codes__badge--empty': !row.classification }"
                  >
                    {{ row.classification || "-" }}
                  </span>
                </td>
                <td class="accounts-charge-codes__code">{{ row.defaultTaxCode || "-" }}</td>
                <td
                  :class="
                    row.isCustoms ? 'accounts-charge-codes__yes' : 'accounts-charge-codes__no'
                  "
                >
                  {{ row.isCustoms ? "Yes" : "No" }}
                </td>
                <td>
                  <div class="accounts-charge-codes__table-actions">
                    <Button label="Edit" class="btn btn--ghost" @click="editCharge(row)" />
                    <Button label="Delete" class="btn btn--ghost" @click="deleteCharge(row)" />
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <Paginator
        v-if="chargeCodeStore.filtered > 0"
        :rows="filterState.perPage"
        :total-records="chargeCodeStore.filtered"
        :first="firstRow"
        :rows-per-page-options="[15, 25, 50, 100]"
        class="accounts-charge-codes__paginator"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPage"
      />
    </section>
  </div>
</template>
