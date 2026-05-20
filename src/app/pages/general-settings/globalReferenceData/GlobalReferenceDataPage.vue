<script setup lang="ts">
import "./GlobalReferenceDataPage.css"
import Paginator from "primevue/paginator"
import { useGlobalReferenceDataPage } from "./GlobalReferenceDataPage.logic"

const {
  tabs,
  activeTab,
  search,
  selectedType,
  selectedRegion,
  selectedStatus,
  selectedCountry,
  typeOptions,
  regionOptions,
  statusOptions,
  countryOptions,
  loading,
  error,
  rows,
  columns,
  first,
  perPage,
  totalRecords,
  paginationStart,
  paginationEnd,
  setTab,
  clearFilters,
  exportCsv,
  sortBy,
  onPageChange,
  getTypeClass,
  getStatusClass,
} = useGlobalReferenceDataPage()
</script>

<template>
  <section class="global-reference-page">
    <nav class="global-reference-page__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="global-reference-page__tab"
        :class="{ 'global-reference-page__tab--active': activeTab === tab.value }"
        @click="setTab(tab.value)"
      >
        <span>{{ tab.icon }} {{ tab.label }}</span>

        <span class="global-reference-page__tab-count">
          {{ tab.count }}
        </span>
      </button>
    </nav>

    <div class="global-reference-page__controls">
      <div class="global-reference-page__search">
        <i class="pi pi-search global-reference-page__search-icon" />
        <input v-model="search" type="text" placeholder="Search reference data..." />
      </div>

      <select v-if="activeTab === 'terminals'" v-model="selectedType">
        <option value="">All Types</option>
        <option v-for="option in typeOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <select v-if="activeTab === 'cities'" v-model="selectedCountry">
        <option value="">All Countries</option>
        <option v-for="option in countryOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <select v-model="selectedRegion">
        <option value="">All Regions</option>
        <option v-for="option in regionOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <select v-if="activeTab !== 'cities'" v-model="selectedStatus">
        <option value="">All Statuses</option>
        <option v-for="option in statusOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <button type="button" class="global-reference-page__btn" @click="clearFilters">
        ✕ Clear
      </button>

      <button
        type="button"
        class="global-reference-page__btn global-reference-page__btn--primary"
        @click="exportCsv"
      >
        ⬇ Export CSV
      </button>

      <div class="global-reference-page__count">
        Showing
        <strong>{{ paginationStart }}-{{ paginationEnd }}</strong>
        of
        <strong>{{ totalRecords }}</strong>
        records
      </div>
    </div>

    <div class="global-reference-page__table-wrap">
      <div v-if="loading" class="global-reference-page__empty">
        <div>...</div>
        <h3>Loading reference data</h3>
      </div>

      <div v-else-if="error" class="global-reference-page__empty">
        <div>!</div>
        <h3>{{ error }}</h3>
        <p>Please refresh the page or try again later.</p>
      </div>

      <table v-else-if="rows.length" class="global-reference-page__table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" @click="sortBy(column.key)">
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in rows" :key="`${first}-${index}`">
            <td v-for="column in columns" :key="column.key">
              <span
                v-if="column.key === 'type'"
                class="global-reference-page__badge"
                :class="getTypeClass(String(row[column.key]))"
              >
                {{ row[column.key] }}
              </span>

              <span
                v-else-if="column.key === 'status'"
                class="global-reference-page__status"
                :class="getStatusClass(String(row[column.key]))"
              >
                {{ row[column.key] }}
              </span>

              <span
                v-else-if="['iata', 'icao', 'awb', 'code'].includes(column.key)"
                class="global-reference-page__code"
              >
                {{ row[column.key] }}
              </span>

              <span v-else-if="column.key === 'coordinates'" class="global-reference-page__coords">
                {{ row[column.key] }}
              </span>

              <strong v-else-if="['name', 'terminalName', 'fullName'].includes(column.key)">
                {{ row[column.key] }}
              </strong>

              <span v-else>
                {{ row[column.key] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="global-reference-page__empty">
        <div>🔍</div>
        <h3>No records match your filters</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    </div>

    <div v-if="!loading && !error && totalRecords > 0" class="global-reference-page__pagination">
      <Paginator
        v-model:first="first"
        :rows="perPage"
        :total-records="totalRecords"
        :rows-per-page-options="[10, 25, 50, 100]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPageChange"
      />
    </div>
  </section>
</template>
