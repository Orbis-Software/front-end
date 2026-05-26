<script setup lang="ts">
import "./AccountsExchangeRatesSection.css"

import { computed, onMounted, reactive, ref } from "vue"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import InputText from "primevue/inputtext"
import Paginator from "primevue/paginator"

import { downloadCsv, parseCsvFile } from "@/app/composables/useAccountsDemo"
import { useExchangeRateStore } from "@/app/stores/exchange-rates"
import type { ExchangeRate } from "@/app/types/exchange-rate"

const exchangeRateStore = useExchangeRateStore()
const importInput = ref<HTMLInputElement | null>(null)
const editingId = ref<number | null>(null)
const filterState = reactive({
  search: "",
  sort: "effectiveDate",
  direction: "desc" as "asc" | "desc",
  page: 1,
  perPage: 15,
})
const form = reactive({
  base: "GBP",
  quote: "EUR",
  rate: "1.1700",
  effectiveDate: new Date("2026-03-10"),
})

const countsText = computed(() => {
  const range =
    exchangeRateStore.from && exchangeRateStore.to
      ? `${exchangeRateStore.from}-${exchangeRateStore.to}`
      : "0"

  return `Showing ${range} of ${exchangeRateStore.filtered} exchange rates`
})
const firstRow = computed(() => (filterState.page - 1) * filterState.perPage)

function iso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function resetForm() {
  editingId.value = null
  Object.assign(form, { base: "", quote: "", rate: "", effectiveDate: new Date() })
}

function requestParams() {
  return { ...filterState }
}

async function fetchRates() {
  await exchangeRateStore.fetch(requestParams())
}

async function applyFilters() {
  filterState.page = 1
  await fetchRates()
}

async function saveRate() {
  const payload = {
    base: form.base.toUpperCase(),
    quote: form.quote.toUpperCase(),
    rate: Number(form.rate || 0),
    effectiveDate: iso(form.effectiveDate),
  }

  if (editingId.value) await exchangeRateStore.update(editingId.value, payload)
  else await exchangeRateStore.create(payload)

  resetForm()
  await fetchRates()
}

function editRate(row: ExchangeRate) {
  editingId.value = row.id
  Object.assign(form, {
    base: row.base,
    quote: row.quote,
    rate: String(row.rate),
    effectiveDate: new Date(`${row.effectiveDate}T00:00:00`),
  })
}

async function deleteRate(row: ExchangeRate) {
  if (!window.confirm(`Delete ${row.base}/${row.quote}?`)) return
  await exchangeRateStore.remove(row.id)
  await fetchRates()
}

function exportRates() {
  downloadCsv("exchange_rates.csv", [
    ["Base", "Quote", "Rate", "Date"],
    ...exchangeRateStore.exchangeRates.map(row => [
      row.base,
      row.quote,
      row.rate,
      row.effectiveDate,
    ]),
  ])
}

async function importRates(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const [, ...rows] = await parseCsvFile(file)
  for (const row of rows) {
    await exchangeRateStore.create({
      base: (row[0] || "").toUpperCase(),
      quote: (row[1] || "").toUpperCase(),
      rate: Number(row[2] || 0),
      effectiveDate: row[3] || iso(new Date()),
    })
  }
  ;(event.target as HTMLInputElement).value = ""
  await fetchRates()
}

async function resetRates() {
  if (!window.confirm("Reset exchange rates to the imported data?")) return
  await exchangeRateStore.reset()
  await fetchRates()
}

async function onPage(event: { first?: number; rows?: number }) {
  const rows = Number(event.rows ?? filterState.perPage)
  filterState.perPage = rows
  filterState.page = Math.floor(Number(event.first ?? 0) / rows) + 1
  await fetchRates()
}

function sortBy(key: string) {
  if (filterState.sort === key) {
    filterState.direction = filterState.direction === "asc" ? "desc" : "asc"
  } else {
    filterState.sort = key
    filterState.direction = "asc"
  }
  fetchRates()
}

function sortMarker(key: string) {
  if (filterState.sort !== key) return ""
  return filterState.direction === "asc" ? "^" : "v"
}

onMounted(fetchRates)
</script>

<template>
  <div class="accounts-exchange-rates">
    <input
      ref="importInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="importRates"
    />

    <section class="accounts-exchange-rates__panel">
      <div class="accounts-exchange-rates__head">
        <div>
          <div class="accounts-exchange-rates__eyebrow">EXCHANGE RATES</div>
          <h2 class="accounts-exchange-rates__title">Manual entry and CSV upload</h2>
        </div>

        <div class="accounts-exchange-rates__actions">
          <Button label="Import CSV" class="btn btn--ghost" @click="importInput?.click()" />
          <Button label="Export CSV" class="btn btn--ghost" @click="exportRates" />
          <Button label="Reset" class="btn btn--ghost" @click="resetRates" />
        </div>
      </div>

      <div class="accounts-exchange-rates__filters">
        <div class="accounts-exchange-rates__field">
          <label>Search</label>
          <InputText
            v-model="filterState.search"
            placeholder="Search currency, rate or date..."
            @input="applyFilters"
          />
        </div>
      </div>

      <div class="accounts-exchange-rates__form-grid">
        <div class="accounts-exchange-rates__field">
          <label>Base Currency</label>
          <InputText v-model="form.base" />
        </div>
        <div class="accounts-exchange-rates__field">
          <label>Quote Currency</label>
          <InputText v-model="form.quote" />
        </div>
        <div class="accounts-exchange-rates__field">
          <label>Rate</label>
          <InputText v-model="form.rate" />
        </div>
        <div class="accounts-exchange-rates__field">
          <label>Effective Date</label>
          <Calendar
            v-model="form.effectiveDate"
            date-format="dd/mm/yy"
            show-icon
            class="accounts-exchange-rates__calendar"
          />
        </div>
      </div>

      <div class="accounts-exchange-rates__add-row">
        <Button
          :label="editingId ? 'Save Exchange Rate' : 'Add Exchange Rate'"
          class="btn btn--primary"
          :loading="exchangeRateStore.saving"
          @click="saveRate"
        />
        <Button v-if="editingId" label="Cancel Edit" class="btn btn--ghost" @click="resetForm" />
      </div>

      <div class="accounts-exchange-rates__counts">{{ countsText }}</div>
      <div v-if="exchangeRateStore.error" class="accounts-exchange-rates__error">
        {{ exchangeRateStore.error }}
      </div>

      <div class="accounts-exchange-rates__table-wrap">
        <table class="accounts-exchange-rates__table">
          <thead>
            <tr>
              <th @click="sortBy('base')">Base {{ sortMarker("base") }}</th>
              <th @click="sortBy('quote')">Quote {{ sortMarker("quote") }}</th>
              <th @click="sortBy('rate')">Rate {{ sortMarker("rate") }}</th>
              <th @click="sortBy('effectiveDate')">
                Effective Date {{ sortMarker("effectiveDate") }}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="exchangeRateStore.loading">
              <td colspan="5">Loading exchange rates...</td>
            </tr>
            <tr v-else-if="!exchangeRateStore.exchangeRates.length">
              <td colspan="5">No exchange rates found.</td>
            </tr>
            <tr v-for="row in exchangeRateStore.exchangeRates" v-else :key="row.id">
              <td>{{ row.base }}</td>
              <td>{{ row.quote }}</td>
              <td>{{ row.rate.toFixed(4) }}</td>
              <td>{{ row.effectiveDate }}</td>
              <td>
                <div class="accounts-exchange-rates__table-actions">
                  <Button label="Edit" class="btn btn--ghost" @click="editRate(row)" />
                  <Button label="Delete" class="btn btn--ghost" @click="deleteRate(row)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Paginator
        v-if="exchangeRateStore.filtered > 0"
        :rows="filterState.perPage"
        :total-records="exchangeRateStore.filtered"
        :first="firstRow"
        :rows-per-page-options="[15, 25, 50, 100]"
        class="accounts-exchange-rates__paginator"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPage"
      />
    </section>
  </div>
</template>
