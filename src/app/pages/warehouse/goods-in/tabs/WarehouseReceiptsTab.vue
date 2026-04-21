<script setup lang="ts">
import "./WarehouseReceiptsTab.css"
import Button from "primevue/button"
import { useWarehouseReceiptsTab } from "./WarehouseReceiptsTab"

const { rows } = useWarehouseReceiptsTab()
</script>

<template>
  <section class="warehouse-receipts-tab">
    <div v-if="!rows.length" class="warehouse-receipts-tab__empty">
      No warehouse receipts yet. Open a consignment in the Arrival Log and click
      <strong>Receipt</strong> to create one.
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
              {{ row.wrNumber }}
            </td>
            <td class="warehouse-receipts-tab__mono">{{ row.jobRef }}</td>
            <td>{{ row.customer }}</td>
            <td>{{ row.supplier }}</td>
            <td>{{ row.date }}</td>
            <td>{{ row.pieces }}</td>
            <td>{{ row.grossWeight }}</td>
            <td>
              <span v-if="row.attachments > 0" class="warehouse-receipts-tab__attachments">
                📎 {{ row.attachments }} file<span v-if="row.attachments !== 1">s</span>
              </span>
              <span v-else class="warehouse-receipts-tab__muted">None</span>
            </td>
            <td class="warehouse-receipts-tab__actions">
              <Button icon="pi pi-pencil" size="small" text />
              <Button label="Print" size="small" outlined />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
