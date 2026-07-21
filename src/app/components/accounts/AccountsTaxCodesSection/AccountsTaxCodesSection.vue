<script setup lang="ts">
import "./AccountsTaxCodesSection.css"

import { computed, onMounted, reactive, ref } from "vue"
import { useTaxCodeStore } from "@/app/stores/tax-codes"
import type { TaxCode } from "@/app/types/tax-code"

const taxCodeStore = useTaxCodeStore()
const editingId = ref<number | null>(null)
const formVisible = ref(false)
const deleteDialogVisible = ref(false)
const pendingDeleteTaxCode = ref<TaxCode | null>(null)
const filterState = reactive({
  search: "",
  sort: "country",
  direction: "asc" as "asc" | "desc",
  page: 1,
  perPage: 15,
})
const form = reactive({
  country: "United Kingdom",
  code: "GB",
  taxCode: "UK20",
  rate: "20",
  description: "Standard VAT",
  calculationType: "percentage" as "percentage" | "withholding_tax",
  backCalculatedRate: "",
})

const calculationTypeOptions = [
  { label: "Standard percentage", value: "percentage" },
  { label: "Withholding tax / gross-up", value: "withholding_tax" },
]

const countsText = computed(() => {
  const range =
    taxCodeStore.from && taxCodeStore.to ? `${taxCodeStore.from}-${taxCodeStore.to}` : "0"

  return `Showing ${range} of ${taxCodeStore.filtered} tax codes`
})
const firstRow = computed(() => (filterState.page - 1) * filterState.perPage)
const formTitle = computed(() => (editingId.value ? "Edit Tax Code" : "Add Tax Code"))

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    country: "",
    code: "",
    taxCode: "",
    rate: "",
    description: "",
    calculationType: "percentage",
    backCalculatedRate: "",
  })
}

function openCreateModal() {
  resetForm()
  formVisible.value = true
}

function closeForm() {
  formVisible.value = false
  resetForm()
}

function closeDeleteDialog() {
  deleteDialogVisible.value = false
  pendingDeleteTaxCode.value = null
}

function requestParams() {
  return { ...filterState }
}

async function fetchTaxCodes() {
  await taxCodeStore.fetch(requestParams())
}

async function applyFilters() {
  filterState.page = 1
  await fetchTaxCodes()
}

async function saveTaxCode() {
  const payload = {
    country: form.country,
    code: form.code.toUpperCase(),
    taxCode: form.taxCode,
    rate: Number(form.rate || 0),
    description: form.description,
    calculationType: form.calculationType,
    backCalculatedRate: form.backCalculatedRate === "" ? null : Number(form.backCalculatedRate),
  }

  if (editingId.value) await taxCodeStore.update(editingId.value, payload)
  else await taxCodeStore.create(payload)

  closeForm()
  await fetchTaxCodes()
}

function editTaxCode(row: TaxCode) {
  editingId.value = row.id
  Object.assign(form, {
    ...row,
    rate: String(row.rate),
    backCalculatedRate: row.backCalculatedRate === null ? "" : String(row.backCalculatedRate),
  })
  formVisible.value = true
}

function requestDeleteTaxCode(row: TaxCode) {
  pendingDeleteTaxCode.value = row
  deleteDialogVisible.value = true
}

async function confirmDeleteTaxCode() {
  if (!pendingDeleteTaxCode.value) return

  await taxCodeStore.remove(pendingDeleteTaxCode.value.id)
  closeDeleteDialog()
  await fetchTaxCodes()
}

async function resetTaxCodes() {
  if (!window.confirm("Reset tax codes to the imported data?")) return
  await taxCodeStore.reset()
  await fetchTaxCodes()
}

async function onPage(event: { first?: number; rows?: number }) {
  const rows = Number(event.rows ?? filterState.perPage)
  filterState.perPage = rows
  filterState.page = Math.floor(Number(event.first ?? 0) / rows) + 1
  await fetchTaxCodes()
}

function sortBy(key: string) {
  if (filterState.sort === key) {
    filterState.direction = filterState.direction === "asc" ? "desc" : "asc"
  } else {
    filterState.sort = key
    filterState.direction = "asc"
  }
  fetchTaxCodes()
}

function sortMarker(key: string) {
  if (filterState.sort !== key) return ""
  return filterState.direction === "asc" ? "^" : "v"
}

onMounted(fetchTaxCodes)
</script>

<template>
  <div class="accounts-tax-codes">
    <section class="accounts-tax-codes__panel">
      <div class="accounts-tax-codes__head">
        <div>
          <div class="accounts-tax-codes__eyebrow">TAX CODES</div>
          <h2 class="accounts-tax-codes__title">Country tax matrix for customer invoicing</h2>
        </div>
        <div class="accounts-tax-codes__actions">
          <Button label="Add Tax Code" class="btn btn--primary" @click="openCreateModal" />
          <Button label="Reset" class="btn btn--ghost" @click="resetTaxCodes" />
        </div>
      </div>

      <div class="accounts-tax-codes__filters">
        <div class="accounts-tax-codes__field">
          <label>Search</label>
          <InputText
            v-model="filterState.search"
            placeholder="Search country, code or description..."
            @input="applyFilters"
          />
        </div>
      </div>

      <Dialog
        v-model:visible="formVisible"
        :header="formTitle"
        modal
        class="accounts-tax-codes__dialog"
        :style="{ width: '640px', maxWidth: 'calc(100vw - 32px)' }"
        @hide="resetForm"
      >
        <div class="accounts-tax-codes__form-grid">
          <div class="accounts-tax-codes__field accounts-tax-codes__field--wide">
            <label>Country</label>
            <InputText v-model="form.country" placeholder="e.g. United Kingdom" autofocus />
          </div>
          <div class="accounts-tax-codes__field">
            <label>Country Code</label>
            <InputText v-model="form.code" placeholder="e.g. GB" />
          </div>
          <div class="accounts-tax-codes__field">
            <label>Tax Code</label>
            <InputText v-model="form.taxCode" placeholder="e.g. UK20" />
          </div>
          <div class="accounts-tax-codes__field">
            <label>Rate %</label>
            <InputText v-model="form.rate" placeholder="e.g. 17.6470588" />
          </div>
          <div class="accounts-tax-codes__field">
            <label>Description</label>
            <InputText v-model="form.description" placeholder="e.g. Standard VAT" />
          </div>
          <div class="accounts-tax-codes__field">
            <label>Calculation</label>
            <Dropdown
              v-model="form.calculationType"
              :options="calculationTypeOptions"
              option-label="label"
              option-value="value"
            />
          </div>
          <div class="accounts-tax-codes__field">
            <label>Back Calculated %</label>
            <InputText
              v-model="form.backCalculatedRate"
              placeholder="e.g. 15 for TM WHT"
              :disabled="form.calculationType !== 'withholding_tax'"
            />
          </div>
        </div>

        <template #footer>
          <div class="accounts-tax-codes__dialog-actions">
            <Button label="Cancel" class="btn btn--ghost" @click="closeForm" />
            <Button
              :label="editingId ? 'Save Tax Code' : 'Add Tax Code'"
              class="btn btn--primary"
              :loading="taxCodeStore.saving"
              @click="saveTaxCode"
            />
          </div>
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteDialogVisible"
        header="Delete Tax Code"
        modal
        class="accounts-tax-codes__dialog"
        :style="{ width: '460px', maxWidth: 'calc(100vw - 32px)' }"
        @hide="closeDeleteDialog"
      >
        <p class="accounts-tax-codes__confirm-message">
          Delete "{{ pendingDeleteTaxCode?.taxCode }}"? This cannot be undone.
        </p>

        <template #footer>
          <div class="accounts-tax-codes__dialog-actions">
            <Button label="Cancel" class="btn btn--ghost" @click="closeDeleteDialog" />
            <Button
              label="Delete"
              class="btn btn--primary"
              :loading="taxCodeStore.saving"
              @click="confirmDeleteTaxCode"
            />
          </div>
        </template>
      </Dialog>

      <div class="accounts-tax-codes__counts">{{ countsText }}</div>
      <div v-if="taxCodeStore.error" class="accounts-tax-codes__error">
        {{ taxCodeStore.error }}
      </div>

      <div class="accounts-tax-codes__table-wrap">
        <table class="accounts-tax-codes__table">
          <thead>
            <tr>
              <th @click="sortBy('country')">Country {{ sortMarker("country") }}</th>
              <th @click="sortBy('code')">Code {{ sortMarker("code") }}</th>
              <th @click="sortBy('taxCode')">Tax Code {{ sortMarker("taxCode") }}</th>
              <th @click="sortBy('rate')">Rate % {{ sortMarker("rate") }}</th>
              <th>Calculation</th>
              <th @click="sortBy('description')">Description {{ sortMarker("description") }}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="taxCodeStore.loading">
              <td colspan="7">Loading tax codes...</td>
            </tr>
            <tr v-else-if="!taxCodeStore.taxCodes.length">
              <td colspan="7">No tax codes found.</td>
            </tr>
            <tr v-for="row in taxCodeStore.taxCodes" v-else :key="row.id">
              <td>{{ row.country }}</td>
              <td>{{ row.code }}</td>
              <td>{{ row.taxCode }}</td>
              <td>{{ row.rate.toFixed(7).replace(/\.?0+$/, "") }}</td>
              <td>
                {{
                  row.calculationType === "withholding_tax"
                    ? `WHT${row.backCalculatedRate ? ` (${row.backCalculatedRate}%)` : ""}`
                    : "Standard"
                }}
              </td>
              <td>{{ row.description }}</td>
              <td>
                <div class="accounts-tax-codes__table-actions">
                  <Button label="Edit" class="btn btn--ghost" @click="editTaxCode(row)" />
                  <Button
                    label="Delete"
                    class="btn btn--ghost"
                    @click="requestDeleteTaxCode(row)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Paginator
        v-if="taxCodeStore.filtered > 0"
        :rows="filterState.perPage"
        :total-records="taxCodeStore.filtered"
        :first="firstRow"
        :rows-per-page-options="[15, 25, 50, 100]"
        class="accounts-tax-codes__paginator"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPage"
      />
    </section>
  </div>
</template>
