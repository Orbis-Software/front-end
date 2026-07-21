<script setup lang="ts">
import "./ExpectedArrivalsTab.css"
import AddExpectedArrivalModal from "@/app/components/warehouse/goods-in/AddExpectedArrivalModal.vue"
import ReceiveConsignmentModal from "@/app/components/warehouse/goods-in/ReceiveConsignmentModal.vue"

import { useExpectedArrivalsTab } from "./ExpectedArrivalsTab"

const {
  rows,
  loading,
  saving,
  error,
  expectedArrivalOpen,
  receiveConsignmentOpen,
  selectedArrival,
  onAddExpectedArrival,
  onCloseExpectedArrival,
  onSavedExpectedArrival,
  removeRow,
  onReceive,
  onCloseReceive,
  onSavedReceive,
  formatDate,
  statusLabel,
  sourceLabel,
} = useExpectedArrivalsTab()
</script>

<template>
  <section class="expected-arrivals-tab">
    <div class="expected-arrivals-tab__toolbar">
      <div class="expected-arrivals-tab__spacer" />

      <Button label="+ Add Expected Arrival" @click="onAddExpectedArrival" />
    </div>

    <p v-if="error" class="expected-arrivals-tab__message expected-arrivals-tab__message--error">
      {{ error }}
    </p>

    <p v-if="loading" class="expected-arrivals-tab__message">Loading expected arrivals…</p>

    <div v-else class="expected-arrivals-tab__table-wrap">
      <table class="expected-arrivals-tab__table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Supplier</th>
            <th>Description</th>
            <th>Est. Date</th>
            <th>Qty</th>
            <th>WMS Ref</th>
            <th>Source</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.customer_name }}</td>
            <td>{{ row.supplier_name || "-" }}</td>
            <td>{{ row.description }}</td>
            <td>{{ formatDate(row.expected_date) }}</td>
            <td>{{ row.estimated_quantity }}</td>
            <td>{{ row.wms_reference }}</td>
            <td>{{ sourceLabel(row) }}</td>

            <td>
              <span class="expected-arrivals-tab__status">
                {{ statusLabel(row.status) }}
              </span>
            </td>

            <td class="expected-arrivals-tab__actions">
              <Button label="Receive" size="small" @click="onReceive(row)" />
              <Button
                v-if="!row.is_source_locked"
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                title="Remove manual expected arrival"
                @click="removeRow(row)"
              />
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="9" class="expected-arrivals-tab__empty">
              No expected arrivals yet. Raising a Collection Order will add its goods here
              automatically.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <AddExpectedArrivalModal
      :visible="expectedArrivalOpen"
      :saving="saving"
      @close="onCloseExpectedArrival"
      @saved="onSavedExpectedArrival"
    />

    <ReceiveConsignmentModal
      :visible="receiveConsignmentOpen"
      :arrival="selectedArrival"
      :saving="saving"
      @close="onCloseReceive"
      @saved="onSavedReceive"
    />
  </section>
</template>
