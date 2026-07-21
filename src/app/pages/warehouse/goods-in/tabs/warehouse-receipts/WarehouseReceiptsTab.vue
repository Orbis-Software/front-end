<script setup lang="ts">
import "./WarehouseReceiptsTab.css"
import { useWarehouseReceiptsTab } from "./WarehouseReceiptsTab"

const { rows, loading, error, receivedDate } = useWarehouseReceiptsTab()
</script>

<template>
  <section class="warehouse-receipts-tab">
    <p v-if="error" class="warehouse-receipts-tab__empty">{{ error }}</p>
    <p v-if="loading" class="warehouse-receipts-tab__empty">Loading warehouse receipts…</p>

    <div v-else-if="!rows.length" class="warehouse-receipts-tab__empty">
      No warehouse receipts yet. Receive a Collection Order from Expected Arrivals to create one.
    </div>

    <div v-else class="warehouse-receipts-tab__table-wrap">
      <table class="warehouse-receipts-tab__table">
        <thead>
          <tr>
            <th>WR Number</th>
            <th>Job Ref</th>
            <th>Customer</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Pieces</th>
            <th>Gross kg</th>
            <th>Attachments</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td class="warehouse-receipts-tab__mono warehouse-receipts-tab__strong">
              {{ row.receipt_reference }}
            </td>
            <td class="warehouse-receipts-tab__mono">
              {{ row.job_number || row.external_reference || "-" }}
            </td>
            <td>{{ row.customer_name }}</td>
            <td>{{ row.supplier_name || "-" }}</td>
            <td>{{ receivedDate(row) }}</td>
            <td>{{ row.received_quantity }}</td>
            <td>
              {{ row.received_weight_kg ? Number(row.received_weight_kg).toLocaleString() : "-" }}
            </td>
            <td><span class="warehouse-receipts-tab__muted">None</span></td>
            <td class="warehouse-receipts-tab__actions">
              <Button label="Print" size="small" outlined disabled />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
