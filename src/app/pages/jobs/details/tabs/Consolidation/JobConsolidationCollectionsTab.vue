<script setup lang="ts">
import "./JobConsolidationTabs.css"
import { computed, reactive } from "vue"

import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"

import { getPackageStackOption, setPackageStackOption } from "@/app/utils/packageStacking"
import type { JobConsolidationCollectionOrder } from "@/app/types/transport-job"
import {
  adrClassOptions,
  carrierOptions,
  collectionTotals,
  createCollectionOrder,
  createPackageLine,
  makeId,
  money,
  nextRef,
  packageCbm,
  packageLdm,
  packageOptions,
  useJobConsolidationContext,
  vehicleOptions,
} from "./JobConsolidationTabs.shared"

const context = useJobConsolidationContext()
const details = context.form.consolidation_details
const draft = reactive<JobConsolidationCollectionOrder>(createCollectionOrder())

const totals = computed(() => collectionTotals(draft.lines))
const fscAmount = computed(() => Number(draft.freight || 0) * (Number(draft.fscPct || 0) / 100))
const haulierTotal = computed(
  () => Number(draft.freight || 0) + fscAmount.value + Number(draft.additional || 0),
)

const haulierQuoteText = computed(() => {
  return [
    `Subject: Collection / Transport Quote Request - ${draft.coRef || "New Collection"}`,
    "",
    "Please quote for the following collection and transport service.",
    `Collection From: ${draft.collectionAddress || "-"}`,
    `Delivery To: ${draft.deliveryAddress || "-"}`,
    `Pickup: ${draft.pickupDate || "-"} ${draft.pickupTime || ""}`.trim(),
    `Required Delivery: ${draft.deliveryDate || "-"}`,
    `Mode: ${draft.vehicle}`,
    `Cargo: ${draft.goodsDescription || "-"}`,
    `Pieces: ${totals.value.pieces}`,
    `Gross Weight: ${totals.value.weight.toFixed(1)} kg`,
    `Volume: ${totals.value.volume.toFixed(3)} cbm`,
    `ADR: ${draft.lines.some(line => line.adr) || draft.hazardous ? "Yes" : "No"}`,
    `Budget / Target Rate: ${money("GBP", draft.freight)}`,
  ].join("\n")
})

function addCollectionLine() {
  draft.lines.push(createPackageLine())
}

function removeCollectionLine(id: number) {
  if (draft.lines.length === 1) return
  draft.lines = draft.lines.filter(line => line.id !== id)
}

function resetDraft() {
  Object.assign(draft, createCollectionOrder(), {
    coRef: nextRef("CO", details.collectionOrders.length),
  })
}

function saveCollectionOrder() {
  const calculated = totals.value
  const coRef = draft.coRef.trim() || nextRef("CO", details.collectionOrders.length)
  const grn = nextRef("GRN", details.goodsRows.length, 4)

  details.collectionOrders.unshift({
    ...draft,
    id: makeId(),
    coRef,
    pcs: calculated.pieces,
    weightKg: Number(calculated.weight.toFixed(1)),
    volumeCbm: Number(calculated.volume.toFixed(3)),
    ldm: Number(calculated.ldm.toFixed(3)),
    hazardous: draft.hazardous || draft.lines.some(line => line.adr),
    lines: draft.lines.map(line => ({ ...line, id: makeId() })),
  })

  details.goodsRows.unshift({
    id: makeId(),
    grn,
    supplier: draft.supplier,
    supplierInvoice: "-",
    supplierPO: coRef,
    partNo: "-",
    desc: draft.goodsDescription || "Collection goods",
    pcs: calculated.pieces,
    weightKg: Number(calculated.weight.toFixed(1)),
    cbm: Number(calculated.volume.toFixed(3)),
    location: "STAGING",
    status: "Received",
  })

  if (!details.finalDelivery.address) {
    details.finalDelivery.address = draft.deliveryAddress
  }

  resetDraft()
}

resetDraft()
</script>

<template>
  <section class="job-consolidation-tab">
    <div v-if="!context.isConsolidationJob.value" class="job-consolidation-tab__empty">
      This tab is only available for consolidation jobs.
    </div>

    <template v-else>
      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h2>Collection Orders</h2>
            <p>Multiple collections feed one final delivery for this consolidation job.</p>
          </div>
          <Button
            label="Add Package"
            icon="pi pi-plus"
            class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
            type="button"
            @click="addCollectionLine"
          />
        </header>

        <div class="job-consolidation-tab__grid">
          <label class="job-consolidation-tab__field">
            <span>Collection Order Ref</span>
            <InputText v-model="draft.coRef" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Customer Ref</span>
            <InputText v-model="draft.customerRef" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Collection Ref</span>
            <InputText v-model="draft.collectionRef" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Carrier</span>
            <Dropdown v-model="draft.supplier" :options="carrierOptions" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Pickup Date</span>
            <InputText v-model="draft.pickupDate" type="date" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Pickup Time</span>
            <InputText v-model="draft.pickupTime" type="time" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Mode Type</span>
            <Dropdown v-model="draft.vehicle" :options="vehicleOptions" />
          </label>
          <label class="job-consolidation-tab__field">
            <span>Required Delivery Date</span>
            <InputText v-model="draft.deliveryDate" type="date" />
          </label>
          <label class="job-consolidation-tab__field job-consolidation-tab__field--span-2">
            <span>Collection Address</span>
            <InputText v-model="draft.collectionAddress" />
          </label>
          <label class="job-consolidation-tab__field job-consolidation-tab__field--span-2">
            <span>Delivery Address</span>
            <InputText v-model="draft.deliveryAddress" />
          </label>
          <label class="job-consolidation-tab__field job-consolidation-tab__field--span-4">
            <span>Goods Description</span>
            <InputText v-model="draft.goodsDescription" />
          </label>
        </div>

        <div
          class="job-consolidation-tab__grid job-consolidation-tab__grid--three"
          style="margin-top: 10px"
        >
          <label class="job-consolidation-tab__field">
            <span>Hazardous</span>
            <span>
              <Checkbox v-model="draft.hazardous" binary />
              ADR / Hazardous goods
            </span>
          </label>
          <label v-if="draft.hazardous" class="job-consolidation-tab__field">
            <span>ADR Class</span>
            <Dropdown
              v-model="draft.adrClass"
              :options="adrClassOptions"
              option-label="label"
              option-value="value"
            />
          </label>
        </div>

        <div class="job-consolidation-tab__table-wrap">
          <table class="job-consolidation-tab__table job-consolidation-tab__table--wide">
            <thead>
              <tr>
                <th>#</th>
                <th>Packaging</th>
                <th>Qty</th>
                <th>Length</th>
                <th>Width</th>
                <th>Height</th>
                <th>Net kg</th>
                <th>Gross kg</th>
                <th>CBM</th>
                <th>LDM</th>
                <th>ADR</th>
                <th class="job-consolidation-tab__check">Stackable</th>
                <th class="job-consolidation-tab__check">Non-Stack</th>
                <th class="job-consolidation-tab__check">Top-Loadable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(line, index) in draft.lines" :key="line.id">
                <td>{{ index + 1 }}</td>
                <td><Dropdown v-model="line.packageType" :options="packageOptions" /></td>
                <td><InputNumber v-model="line.qty" :min="1" /></td>
                <td><InputNumber v-model="line.length" :min="0" /></td>
                <td><InputNumber v-model="line.width" :min="0" /></td>
                <td><InputNumber v-model="line.height" :min="0" /></td>
                <td><InputNumber v-model="line.netWeight" :min="0" :min-fraction-digits="1" /></td>
                <td>
                  <InputNumber v-model="line.grossWeight" :min="0" :min-fraction-digits="1" />
                </td>
                <td>{{ packageCbm(line).toFixed(3) }}</td>
                <td>{{ packageLdm(line).toFixed(3) }}</td>
                <td><Checkbox v-model="line.adr" binary /></td>
                <td class="job-consolidation-tab__check">
                  <Checkbox
                    :model-value="getPackageStackOption(line) === 'stackable'"
                    binary
                    @update:model-value="setPackageStackOption(line, 'stackable')"
                  />
                </td>
                <td class="job-consolidation-tab__check">
                  <Checkbox
                    :model-value="getPackageStackOption(line) === 'non_stack'"
                    binary
                    @update:model-value="setPackageStackOption(line, 'non_stack')"
                  />
                </td>
                <td class="job-consolidation-tab__check">
                  <Checkbox
                    :model-value="getPackageStackOption(line) === 'top_loadable'"
                    binary
                    @update:model-value="setPackageStackOption(line, 'top_loadable')"
                  />
                </td>
                <td>
                  <Button
                    icon="pi pi-trash"
                    class="job-consolidation-tab__button job-consolidation-tab__button--ghost"
                    type="button"
                    :disabled="draft.lines.length === 1"
                    @click="removeCollectionLine(line.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="job-consolidation-tab__summary-row">
          <article>
            <span>Total pieces</span>
            <strong>{{ totals.pieces }}</strong>
          </article>
          <article>
            <span>Gross weight</span>
            <strong>{{ totals.weight.toFixed(1) }} kg</strong>
          </article>
          <article>
            <span>Volume</span>
            <strong>{{ totals.volume.toFixed(3) }} cbm</strong>
          </article>
          <article>
            <span>LDM</span>
            <strong>{{ totals.ldm.toFixed(3) }}</strong>
          </article>
        </div>

        <div class="job-consolidation-tab__subsection">
          <header class="job-consolidation-tab__section-header">
            <div>
              <h3>Haulier Charges</h3>
              <p>These charges can feed the customer invoice tab.</p>
            </div>
          </header>

          <div class="job-consolidation-tab__grid job-consolidation-tab__grid--three">
            <label class="job-consolidation-tab__field">
              <span>Freight</span>
              <InputNumber v-model="draft.freight" :min-fraction-digits="2" />
            </label>
            <label class="job-consolidation-tab__field">
              <span>FSC %</span>
              <InputNumber v-model="draft.fscPct" :min-fraction-digits="1" suffix="%" />
            </label>
            <label class="job-consolidation-tab__field">
              <span>Additional</span>
              <InputNumber v-model="draft.additional" :min-fraction-digits="2" />
            </label>
            <label class="job-consolidation-tab__field">
              <span>FSC Amount</span>
              <InputText :model-value="money('GBP', fscAmount)" readonly />
            </label>
            <label class="job-consolidation-tab__field">
              <span>Total Haulier Charge</span>
              <InputText :model-value="money('GBP', haulierTotal)" readonly />
            </label>
            <label class="job-consolidation-tab__field job-consolidation-tab__field--span-4">
              <span>Quote Request Preview</span>
              <Textarea :model-value="haulierQuoteText" rows="6" readonly />
            </label>
          </div>
        </div>

        <div class="job-consolidation-tab__actions" style="margin-top: 12px">
          <Button
            label="Add Collection Order"
            icon="pi pi-save"
            class="job-consolidation-tab__button job-consolidation-tab__button--primary"
            type="button"
            @click="saveCollectionOrder"
          />
        </div>
      </div>

      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h3>Final Delivery</h3>
            <p>One final delivery for all collected goods.</p>
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
            <span>Final Carrier</span>
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

      <div class="job-consolidation-tab__section">
        <header class="job-consolidation-tab__section-header">
          <div>
            <h3>Saved Collection Orders</h3>
          </div>
        </header>

        <div v-if="!details.collectionOrders.length" class="job-consolidation-tab__empty">
          No collection orders added yet.
        </div>

        <div v-else class="job-consolidation-tab__table-wrap">
          <table class="job-consolidation-tab__table">
            <thead>
              <tr>
                <th>CO Ref</th>
                <th>Carrier</th>
                <th>Pickup</th>
                <th>Vehicle</th>
                <th>Pieces</th>
                <th>Weight kg</th>
                <th>Status</th>
                <th>WMS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in details.collectionOrders" :key="order.id">
                <td>{{ order.coRef }}</td>
                <td>{{ order.supplier }}</td>
                <td>{{ order.pickupDate }}</td>
                <td>{{ order.vehicle }}</td>
                <td>{{ order.pcs }}</td>
                <td>{{ order.weightKg }}</td>
                <td>{{ order.status }}</td>
                <td>
                  <span
                    class="job-consolidation-tab__status"
                    :class="{ 'job-consolidation-tab__status--success': order.wmsRef }"
                  >
                    {{ order.wmsRef || "Pending" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>
