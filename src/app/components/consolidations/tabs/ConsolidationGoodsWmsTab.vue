<script setup lang="ts">
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const { goodsInRows } = context
</script>

<template>
  <section class="consolidation-section">
    <div class="consolidation-section__head">
      <div>
        <h2>Goods In/Out (WMS)</h2>
        <p>Warehouse receipt records generated from collections and supplier invoices.</p>
      </div>
      <Button label="Link GRN" icon="pi pi-link" class="btn btn--ghost" />
    </div>

    <DataTable :value="goodsInRows" responsive-layout="scroll" class="consolidation-datatable">
      <Column field="grn" header="GRN" />
      <Column field="supplier" header="Supplier" />
      <Column field="supplierInvoice" header="Supplier Invoice" />
      <Column field="supplierPO" header="Supplier PO" />
      <Column field="partNo" header="Part No" />
      <Column field="desc" header="Description" />
      <Column field="pcs" header="Pieces" />
      <Column field="weightKg" header="Weight kg" />
      <Column field="cbm" header="CBM" />
      <Column field="location" header="Location" />
      <Column field="status" header="Status" />
    </DataTable>
  </section>
</template>
