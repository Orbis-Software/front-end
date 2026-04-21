<script setup lang="ts">
import "./ExpectedArrivalsTab.css"
import Button from "primevue/button"
import AddExpectedArrivalModal from "@/app/components/warehouse/goods-in/AddExpectedArrivalModal.vue"

import { useExpectedArrivalsTab } from "./ExpectedArrivalsTab"

const {
  rows,
  expectedArrivalOpen,
  onAddExpectedArrival,
  onCloseExpectedArrival,
  onSavedExpectedArrival,
} = useExpectedArrivalsTab()
</script>

<template>
  <section class="expected-arrivals-tab">
    <div class="expected-arrivals-tab__toolbar">
      <div class="expected-arrivals-tab__spacer" />

      <Button label="+ Add Expected Arrival" @click="onAddExpectedArrival" />
    </div>

    <div class="expected-arrivals-tab__table-wrap">
      <table class="expected-arrivals-tab__table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Supplier</th>
            <th>Description</th>
            <th>Est. Date</th>
            <th>Qty</th>
            <th>Ref</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.customer }}</td>
            <td>{{ row.supplier }}</td>
            <td>{{ row.description }}</td>
            <td>{{ row.date }}</td>
            <td>{{ row.qty }}</td>
            <td>{{ row.ref }}</td>

            <td>
              <span class="expected-arrivals-tab__status">
                {{ row.status }}
              </span>
            </td>

            <td class="expected-arrivals-tab__actions">
              <Button label="Receive" size="small" />
              <Button icon="pi pi-times" size="small" severity="danger" text />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <AddExpectedArrivalModal
      :visible="expectedArrivalOpen"
      @close="onCloseExpectedArrival"
      @saved="onSavedExpectedArrival"
    />
  </section>
</template>
