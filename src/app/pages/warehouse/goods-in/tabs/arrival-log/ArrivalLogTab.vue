<script setup lang="ts">
import "./ArrivalLogTab.css"
import { useArrivalLogTab } from "./ArrivalLogTab"
import InputText from "primevue/inputtext"
import Dropdown from "primevue/dropdown"
import Button from "primevue/button"

const {
  search,
  selectedCustomer,
  selectedSupplier,
  customerOptions,
  supplierOptions,
  rows,
  filteredRows,
  onSearchInput,
} = useArrivalLogTab()
</script>

<template>
  <section class="arrival-log-tab">
    <div class="arrival-log-tab__toolbar">
      <div class="arrival-log-tab__search">
        <i class="pi pi-search arrival-log-tab__search-icon" />
        <InputText
          :model-value="search"
          @update:model-value="value => onSearchInput(String(value ?? ''))"
          placeholder="Search consignments..."
          class="arrival-log-tab__search-input"
        />
      </div>

      <Dropdown
        v-model="selectedCustomer"
        :options="customerOptions"
        option-label="label"
        option-value="value"
        placeholder="All Customers"
        class="arrival-log-tab__filter"
      />

      <Dropdown
        v-model="selectedSupplier"
        :options="supplierOptions"
        option-label="label"
        option-value="value"
        placeholder="All Suppliers"
        class="arrival-log-tab__filter"
      />
    </div>

    <div class="arrival-log-tab__table-wrap">
      <table class="arrival-log-tab__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Supplier</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Weight</th>
            <th>Location</th>
            <th>Status</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">
            <td class="arrival-log-tab__mono">{{ row.id }}</td>
            <td>{{ row.customer }}</td>
            <td>{{ row.supplier }}</td>
            <td>{{ row.description }}</td>
            <td>{{ row.qty }}</td>
            <td>{{ row.weight }}</td>
            <td>{{ row.location }}</td>
            <td>
              <span class="arrival-log-tab__status arrival-log-tab__status--stored">
                In Storage
              </span>
            </td>
            <td>{{ row.date }}</td>
            <td class="arrival-log-tab__actions">
              <Button label="View" severity="secondary" size="small" outlined />
              <Button label="Receipt" size="small" />
            </td>
          </tr>

          <tr v-if="!filteredRows.length">
            <td colspan="10" class="arrival-log-tab__empty">No consignments found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
