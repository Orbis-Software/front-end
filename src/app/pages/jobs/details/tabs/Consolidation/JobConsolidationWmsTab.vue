<script setup lang="ts">
import "./JobConsolidationTabs.css"
import { computed } from "vue"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"

import {
  createGoodsRow,
  makeId,
  nextRef,
  useJobConsolidationContext,
} from "./JobConsolidationTabs.shared"

const context = useJobConsolidationContext()
const details = context.form.consolidation_details

const statusOptions = ["Expected", "Received", "Pending QA", "Released", "Picked", "Dispatched"]
const locationOptions = ["STAGING", "QA", "RACK-A", "RACK-B", "DISPATCH"]

const totals = computed(() => {
  return details.goodsRows.reduce(
    (sum, row) => {
      sum.pcs += Number(row.pcs || 0)
      sum.weight += Number(row.weightKg || 0)
      sum.cbm += Number(row.cbm || 0)
      return sum
    },
    { pcs: 0, weight: 0, cbm: 0 },
  )
})

function addGoodsRow() {
  details.goodsRows.unshift({
    ...createGoodsRow(),
    id: makeId(),
    grn: nextRef("GRN", details.goodsRows.length, 4),
  })
}
</script>

<template>
  <section class="job-consolidation-tab">
      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h2>Goods In/Out (WMS)</h2>
            <p>Warehouse receipt records generated from collections and supplier invoices.</p>
          </div>

          <Button
            label="Add GRN Row"
            icon="pi pi-plus"
            class="job-consolidation-tab__button job-consolidation-tab__button--primary"
            type="button"
            @click="addGoodsRow"
          />
        </header>

        <div class="job-consolidation-tab__summary-row">
          <article>
            <span>Rows</span>
            <strong>{{ details.goodsRows.length }}</strong>
          </article>
          <article>
            <span>Total Pieces</span>
            <strong>{{ totals.pcs }}</strong>
          </article>
          <article>
            <span>Total Weight</span>
            <strong>{{ totals.weight.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Total CBM</span>
            <strong>{{ totals.cbm.toFixed(3) }}</strong>
          </article>
        </div>

        <div
          v-if="!details.goodsRows.length"
          class="job-consolidation-tab__empty"
          style="margin-top: 12px"
        >
          No WMS goods rows yet. Collection orders can create GRN rows automatically.
        </div>

        <div v-else class="job-consolidation-tab__table-wrap">
          <table class="job-consolidation-tab__table job-consolidation-tab__table--wide">
            <thead>
              <tr>
                <th>GRN</th>
                <th>Supplier</th>
                <th>Supplier Invoice</th>
                <th>Supplier PO</th>
                <th>Part No</th>
                <th>Description</th>
                <th>Pieces</th>
                <th>Weight kg</th>
                <th>CBM</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in details.goodsRows" :key="row.id">
                <td><InputText v-model="row.grn" /></td>
                <td><InputText v-model="row.supplier" /></td>
                <td><InputText v-model="row.supplierInvoice" /></td>
                <td><InputText v-model="row.supplierPO" /></td>
                <td><InputText v-model="row.partNo" /></td>
                <td><InputText v-model="row.desc" /></td>
                <td><InputNumber v-model="row.pcs" :min="0" /></td>
                <td><InputNumber v-model="row.weightKg" :min="0" :min-fraction-digits="1" /></td>
                <td><InputNumber v-model="row.cbm" :min="0" :min-fraction-digits="3" /></td>
                <td><Dropdown v-model="row.location" :options="locationOptions" /></td>
                <td><Dropdown v-model="row.status" :options="statusOptions" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h3>Goods Out / Final Delivery</h3>
            <p>Use the single final delivery values from the collection orders tab.</p>
          </div>
        </header>

        <div class="job-consolidation-tab__grid">
          <label class="job-consolidation-tab__field">
            <span>Delivery Ref</span>
            <InputText v-model="details.finalDelivery.deliveryRef" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Planned Date</span>
            <InputText v-model="details.finalDelivery.plannedDate" type="date" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Planned Time</span>
            <InputText v-model="details.finalDelivery.plannedTime" type="time" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Carrier</span>
            <InputText v-model="details.finalDelivery.carrier" />
          </label>
          <label class="job-consolidation-tab__field job-consolidation-tab__field--span-2">
            <span>Delivery Address</span>
            <InputText v-model="details.finalDelivery.address" />
          </label>
          <label class="job-consolidation-tab__field job-consolidation-tab__field--span-2">
            <span>Instructions</span>
            <InputText v-model="details.finalDelivery.instructions" />
          </label>
        </div>
      </div>
  </section>
</template>
