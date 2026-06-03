<script setup lang="ts">
import Button from "primevue/button"
import Column from "primevue/column"
import DataTable from "primevue/datatable"
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const { collectionOrders, openCollectionOrderModal } = context
</script>

<template>
  <section class="consolidation-section">
    <div class="consolidation-section__head">
      <div>
        <h2>Collection Orders</h2>
        <p>Create collection orders, package details, haulier charges and WMS handoff.</p>
      </div>
      <Button
        label="Add Collection Order"
        icon="pi pi-plus"
        class="btn btn--primary"
        @click="openCollectionOrderModal"
      />
    </div>

    <DataTable
      :value="collectionOrders"
      responsive-layout="scroll"
      class="consolidation-datatable consolidation-datatable--mt"
    >
      <Column field="coRef" header="CO Ref" />
      <Column field="supplier" header="Carrier" />
      <Column field="pickupDate" header="Pickup" />
      <Column field="vehicle" header="Vehicle" />
      <Column field="pcs" header="Pieces" />
      <Column field="weightKg" header="Weight kg" />
      <Column field="status" header="Status" />
      <Column header="WMS">
        <template #body="{ data }">
          <span
            class="consolidation-status"
            :class="{ 'consolidation-status--success': data.wmsRef }"
          >
            {{ data.wmsRef || "Pending" }}
          </span>
        </template>
      </Column>
    </DataTable>
  </section>
</template>
