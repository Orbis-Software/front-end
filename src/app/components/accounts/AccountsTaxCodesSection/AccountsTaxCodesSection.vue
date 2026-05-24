<script setup lang="ts">
import "./AccountsTaxCodesSection.css"

import { computed, onMounted, reactive, ref } from "vue"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Paginator from "primevue/paginator"

import { useTaxCodeStore } from "@/app/stores/tax-codes"
import type { TaxCode } from "@/app/types/tax-code"

const taxCodeStore = useTaxCodeStore()
const editingId = ref<number | null>(null)
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
})

const countsText = computed(() => {
  const range =
    taxCodeStore.from && taxCodeStore.to ? `${taxCodeStore.from}-${taxCodeStore.to}` : "0"

  return `Showing ${range} of ${taxCodeStore.filtered} tax codes`
})
const firstRow = computed(() => (filterState.page - 1) * filterState.perPage)

function resetForm() {
  editingId.value = null
  Object.assign(form, { country: "", code: "", taxCode: "", rate: "", description: "" })
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
  }

  if (editingId.value) await taxCodeStore.update(editingId.value, payload)
  else await taxCodeStore.create(payload)

  resetForm()
  await fetchTaxCodes()
}

function editTaxCode(row: TaxCode) {
  editingId.value = row.id
  Object.assign(form, { ...row, rate: String(row.rate) })
}

async function deleteTaxCode(row: TaxCode) {
  if (!window.confirm(`Delete "${row.taxCode}"?`)) return
  await taxCodeStore.remove(row.id)
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

      <div class="accounts-tax-codes__form-grid">
        <div class="accounts-tax-codes__field">
          <label>Country</label>
          <InputText v-model="form.country" />
        </div>
        <div class="accounts-tax-codes__field">
          <label>Country Code</label>
          <InputText v-model="form.code" />
        </div>
        <div class="accounts-tax-codes__field">
          <label>Tax Code</label>
          <InputText v-model="form.taxCode" />
        </div>
        <div class="accounts-tax-codes__field">
          <label>Rate %</label>
          <InputText v-model="form.rate" />
        </div>
        <div class="accounts-tax-codes__field">
          <label>Description</label>
          <InputText v-model="form.description" />
        </div>
      </div>

      <div class="accounts-tax-codes__add-row">
        <Button
          :label="editingId ? 'Save Tax Code' : 'Add Tax Code'"
          class="btn btn--primary"
          :loading="taxCodeStore.saving"
          @click="saveTaxCode"
        />
        <Button v-if="editingId" label="Cancel Edit" class="btn btn--ghost" @click="resetForm" />
      </div>

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
              <th @click="sortBy('description')">
                Description {{ sortMarker("description") }}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="taxCodeStore.loading">
              <td colspan="6">Loading tax codes...</td>
            </tr>
            <tr v-else-if="!taxCodeStore.taxCodes.length">
              <td colspan="6">No tax codes found.</td>
            </tr>
            <tr v-for="row in taxCodeStore.taxCodes" v-else :key="row.id">
              <td>{{ row.country }}</td>
              <td>{{ row.code }}</td>
              <td>{{ row.taxCode }}</td>
              <td>{{ row.rate.toFixed(2) }}</td>
              <td>{{ row.description }}</td>
              <td>
                <div class="accounts-tax-codes__table-actions">
                  <Button label="Edit" class="btn btn--ghost" @click="editTaxCode(row)" />
                  <Button label="Delete" class="btn btn--ghost" @click="deleteTaxCode(row)" />
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
