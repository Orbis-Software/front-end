<script setup lang="ts">
import "./GlobalReferenceDataPage.css"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import { useGlobalReferenceDataPage } from "./GlobalReferenceDataPage.logic"

const {
  columns,
  modes,
  search,
  selectedCountry,
  selectedModes,
  sortKey,
  sortDirection,
  first,
  perPage,
  loading,
  saving,
  adding,
  error,
  success,
  rows,
  totalRecords,
  unfilteredTotal,
  countriesTotal,
  countryOptions,
  hasChanges,
  paginationStart,
  paginationEnd,
  addDialogVisible,
  newLocation,
  clearFilters,
  sortBy,
  onPageChange,
  editLocation,
  saveChanges,
  openAddDialog,
  onNewLocationCountryChange,
  addLocation,
  isEnabled,
  coordinate,
  timezoneDisplay,
} = useGlobalReferenceDataPage()
</script>

<template>
  <section class="global-reference-page">
    <header class="global-reference-page__summary">
      <article>
        <span>Locations</span>
        <strong>{{ unfilteredTotal.toLocaleString() }}</strong>
      </article>
      <article>
        <span>Countries &amp; territories</span>
        <strong>{{ countriesTotal.toLocaleString() }}</strong>
      </article>
    </header>

    <div class="global-reference-page__controls">
      <div class="global-reference-page__controls-primary">
        <div class="global-reference-page__search">
          <i class="pi pi-search" aria-hidden="true" />
          <input
            v-model="search"
            type="search"
            placeholder="Search city, region, country, or location code..."
            aria-label="Search delivery locations"
          />
        </div>

        <select v-model="selectedCountry" aria-label="Filter by country">
          <option value="">All countries</option>
          <option
            v-for="option in countryOptions"
            :key="`${option.name}-${option.code}`"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </select>

        <div class="global-reference-page__actions">
          <button type="button" class="global-reference-page__btn" @click="clearFilters">
            Clear filters
          </button>

          <button type="button" class="global-reference-page__btn" @click="openAddDialog">
            <i class="pi pi-plus" aria-hidden="true" />
            Add New
          </button>

          <button
            type="button"
            class="global-reference-page__btn global-reference-page__btn--primary"
            :disabled="!hasChanges || saving"
            @click="saveChanges"
          >
            <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'" aria-hidden="true" />
            {{ saving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>

      <div class="global-reference-page__controls-secondary">
        <div class="global-reference-page__island-note">
          <span aria-hidden="true" />
          Red ROAD = island-only access
        </div>

        <div
          class="global-reference-page__mode-filters"
          role="group"
          aria-label="Filter by transport modes"
        >
          <label v-for="mode in modes" :key="mode.value">
            <input v-model="selectedModes" type="checkbox" :value="mode.value" />
            <span>{{ mode.label }}</span>
          </label>
        </div>

        <div class="global-reference-page__count">
          {{ totalRecords.toLocaleString() }} of {{ unfilteredTotal.toLocaleString() }} locations
        </div>
      </div>
    </div>

    <div
      v-if="success"
      class="global-reference-page__message global-reference-page__message--success"
    >
      <i class="pi pi-check-circle" aria-hidden="true" />
      {{ success }}
    </div>

    <div v-if="error" class="global-reference-page__message global-reference-page__message--error">
      <i class="pi pi-exclamation-circle" aria-hidden="true" />
      {{ error }}
    </div>

    <div class="global-reference-page__table-wrap">
      <div v-if="loading" class="global-reference-page__empty">
        <i class="pi pi-spin pi-spinner" aria-hidden="true" />
        <h3>Loading delivery locations</h3>
      </div>

      <table v-else-if="rows.length" class="global-reference-page__table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" scope="col" @click="sortBy(column.key)">
              <span>{{ column.label }}</span>
              <i
                class="pi global-reference-page__sort"
                :class="
                  sortKey === column.key
                    ? sortDirection === 1
                      ? 'pi-sort-up-fill'
                      : 'pi-sort-down-fill'
                    : 'pi-sort-alt'
                "
                aria-hidden="true"
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <strong>{{ row.city || "—" }}</strong>
            </td>
            <td>{{ row.country || "—" }}</td>
            <td>
              <span v-if="row.countryCode" class="global-reference-page__country-code">
                {{ row.countryCode }}
              </span>
              <span v-else>—</span>
            </td>
            <td class="global-reference-page__editable-cell">
              <input
                :value="row.code"
                maxlength="3"
                aria-label="Location code"
                placeholder="—"
                @input="editLocation(row, 'code', ($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="global-reference-page__editable-cell">
              <input
                :value="row.state"
                aria-label="State"
                placeholder="—"
                @input="editLocation(row, 'state', ($event.target as HTMLInputElement).value)"
              />
            </td>
            <td>{{ row.region || "—" }}</td>
            <td>
              <div class="global-reference-page__modes">
                <span
                  v-for="mode in modes.filter(item => isEnabled(row, item.value))"
                  :key="mode.value"
                  class="global-reference-page__mode-pill"
                  :class="[
                    `global-reference-page__mode-pill--${mode.value}`,
                    {
                      'global-reference-page__mode-pill--island':
                        mode.value === 'road' &&
                        (row.islandOnly === 'true' || row.islandOnly === '1'),
                    },
                  ]"
                >
                  {{ mode.label.toUpperCase() }}
                </span>
                <span v-if="!modes.some(item => isEnabled(row, item.value))">—</span>
              </div>
            </td>
            <td class="global-reference-page__coordinate">{{ coordinate(row.latitude) }}</td>
            <td class="global-reference-page__coordinate">{{ coordinate(row.longitude) }}</td>
            <td class="global-reference-page__timezone">{{ timezoneDisplay(row) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="global-reference-page__empty">
        <i class="pi pi-map-marker" aria-hidden="true" />
        <h3>No locations match the selected filters</h3>
        <p>Try changing the search, country, or transport modes.</p>
      </div>
    </div>

    <footer v-if="!loading && totalRecords" class="global-reference-page__pagination">
      <div>
        Showing {{ paginationStart.toLocaleString() }}–{{ paginationEnd.toLocaleString() }} of
        {{ totalRecords.toLocaleString() }}
      </div>
      <Paginator
        v-model:first="first"
        :rows="perPage"
        :total-records="totalRecords"
        :rows-per-page-options="[50, 100, 250, 500]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPageChange"
      />
    </footer>

    <div class="global-reference-page__source-note">
      Delivery locations combine GeoNames city data with UN/LOCODE transport terminals. Location
      Code and State can be corrected directly in the table. A red ROAD badge identifies island-only
      access that requires sea or air transport to reach the island.
    </div>

    <Dialog
      v-model:visible="addDialogVisible"
      modal
      header="Add a location"
      class="global-reference-page__dialog"
      :style="{ width: '640px', maxWidth: 'calc(100vw - 32px)' }"
    >
      <form class="global-reference-page__form" @submit.prevent="addLocation">
        <label class="global-reference-page__form-wide">
          <span>City *</span>
          <input v-model="newLocation.city" required placeholder="e.g. Khazar" />
        </label>

        <label>
          <span>Country *</span>
          <select v-model="newLocation.country" required @change="onNewLocationCountryChange">
            <option value="" disabled>Select country</option>
            <option
              v-for="option in countryOptions"
              :key="`${option.name}-${option.code}`"
              :value="option.name"
            >
              {{ option.name }}
            </option>
          </select>
        </label>

        <label>
          <span>Region</span>
          <input v-model="newLocation.region" placeholder="Auto-filled from country" />
        </label>

        <label>
          <span>Location Code</span>
          <input v-model="newLocation.code" maxlength="3" placeholder="e.g. HAZ" />
        </label>

        <label>
          <span>State / Province</span>
          <input v-model="newLocation.state" placeholder="Optional" />
        </label>

        <label>
          <span>Latitude</span>
          <input
            v-model.number="newLocation.latitude"
            type="number"
            min="-90"
            max="90"
            step="any"
          />
        </label>

        <label>
          <span>Longitude</span>
          <input
            v-model.number="newLocation.longitude"
            type="number"
            min="-180"
            max="180"
            step="any"
          />
        </label>

        <label class="global-reference-page__form-wide">
          <span>Timezone</span>
          <input v-model="newLocation.timezone" placeholder="e.g. Europe/London" />
          <small>Use an IANA timezone name. The GMT offset is calculated automatically.</small>
        </label>

        <fieldset class="global-reference-page__form-wide global-reference-page__form-modes">
          <legend>Transport modes</legend>
          <label v-for="mode in modes" :key="mode.value">
            <input v-model="newLocation[mode.value]" type="checkbox" />
            {{ mode.label }}
          </label>
        </fieldset>
      </form>

      <template #footer>
        <Button label="Cancel" severity="secondary" outlined @click="addDialogVisible = false" />
        <Button
          label="Add Location"
          icon="pi pi-plus"
          :loading="adding"
          :disabled="adding"
          @click="addLocation"
        />
      </template>
    </Dialog>
  </section>
</template>
