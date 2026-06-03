<script setup lang="ts">
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const {
  addCollectionLine,
  addSupplierItem,
  addressOptions,
  adrClassOptions,
  carrierOptions,
  cbm,
  chargeDraft,
  chargeModalTitle,
  chargeOptions,
  collectionChargeTotal,
  collectionDraft,
  collectionDraftTotals,
  collectionFscAmount,
  collectionLineDraft,
  collectionRefOptions,
  confirmCharge,
  confirmCollectionLine,
  confirmConsolidatedItem,
  confirmQuoteLine,
  confirmSupplierCollectionLink,
  confirmSupplierItem,
  consolidatedLineDraft,
  currencyOptions,
  getPackageStackOption,
  haulierQuoteText,
  invoiceCurrencies,
  ldm,
  money,
  nextCollectionRef,
  nextGrnRef,
  packageOptions,
  quoteLineDraft,
  refreshHaulierQuote,
  removeSupplierItem,
  saveCollectionOrder,
  saveSupplierInvoice,
  setPackageStackOption,
  showChargeModal,
  showCollectionLineModal,
  showCollectionOrderModal,
  showConsolidatedItemModal,
  showQuoteLineModal,
  showSupplierCollectionLinkModal,
  showSupplierInvoiceModal,
  showSupplierItemModal,
  supplierCollectionLinkDraft,
  supplierDraft,
  supplierDraftTotals,
  supplierInvoiceLinkOptions,
  supplierItemDraft,
  unitOptions,
  vehicleOptions,
} = context

function isAdrPackage(item: { adr: string }) {
  return item.adr === "Yes"
}

function setAdrPackage(item: { adr: string }, checked: boolean) {
  item.adr = checked ? "Yes" : "No"
}
</script>

<template>
  <Dialog
    v-model:visible="showSupplierInvoiceModal"
    header="Add Supplier Invoice"
    class="consolidation-supplier-invoice-dialog"
    modal
    :style="{ width: '1180px', maxWidth: '96vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--four">
      <label class="consolidation-field">
        <span>Supplier Name</span>
        <InputText v-model="supplierDraft.supplierName" />
      </label>
      <label class="consolidation-field">
        <span>Customer PO Ref</span>
        <InputText v-model="supplierDraft.customerPoRef" />
      </label>
      <label class="consolidation-field">
        <span>Supplier Invoice Number</span>
        <InputText v-model="supplierDraft.supplierInvoiceNumber" />
      </label>
      <label class="consolidation-field">
        <span>Invoice Date</span>
        <InputText v-model="supplierDraft.invoiceDate" type="date" />
      </label>
      <label class="consolidation-field">
        <span>Currency</span>
        <Dropdown
          v-model="supplierDraft.currency"
          :options="currencyOptions"
          option-label="label"
          option-value="value"
        />
      </label>
      <label class="consolidation-field">
        <span>Invoice Value</span>
        <InputNumber
          v-model="supplierDraft.invoiceValue"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
        />
      </label>
      <label class="consolidation-field">
        <span>Collection Ref</span>
        <Dropdown v-model="supplierDraft.collectionRef" :options="collectionRefOptions" />
      </label>
      <label class="consolidation-field">
        <span>Shipping Label No</span>
        <InputText v-model="supplierDraft.label" />
      </label>
    </div>

    <div class="consolidation-modal-toolbar consolidation-modal-toolbar--packages">
      <Button label="Add Item" icon="pi pi-plus" class="btn btn--ghost" @click="addSupplierItem" />
    </div>

    <div
      class="consolidation-table-wrap consolidation-table-wrap--mt consolidation-supplier-package-wrap"
    >
      <table
        class="consolidation-table consolidation-table--inputs consolidation-supplier-package-table"
      >
        <colgroup>
          <col class="consolidation-package-col--index" />
          <col class="consolidation-package-col--package" />
          <col class="consolidation-package-col--qty" />
          <col class="consolidation-package-col--measure" />
          <col class="consolidation-package-col--measure" />
          <col class="consolidation-package-col--measure" />
          <col class="consolidation-package-col--kg" />
          <col class="consolidation-package-col--kg" />
          <col class="consolidation-package-col--check" />
          <col class="consolidation-package-col--check-wide" />
          <col class="consolidation-package-col--check-wide" />
          <col class="consolidation-package-col--check-wide" />
          <col class="consolidation-package-col--action" />
        </colgroup>
        <thead>
          <tr>
            <th class="consolidation-table__item-heading">#</th>
            <th class="consolidation-table__package-heading">Package</th>
            <th class="consolidation-table__compact-heading">Qty</th>
            <th class="consolidation-table__compact-heading">Length</th>
            <th class="consolidation-table__compact-heading">Width</th>
            <th class="consolidation-table__compact-heading">Height</th>
            <th class="consolidation-table__kg-heading">Net kg</th>
            <th class="consolidation-table__kg-heading">Gross kg</th>
            <th class="consolidation-table__check-heading">ADR</th>
            <th class="consolidation-table__check-heading">Stackable</th>
            <th class="consolidation-table__check-heading">Non-Stack</th>
            <th class="consolidation-table__check-heading">Top-Loadable</th>
            <th class="consolidation-table__action-heading">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in supplierDraft.items" :key="item.id">
            <td class="consolidation-table__item-number" data-label="#">{{ index + 1 }}</td>
            <td class="consolidation-table__package-cell" data-label="Package">
              <Dropdown v-model="item.packageType" :options="packageOptions" />
            </td>
            <td class="consolidation-table__compact-cell" data-label="Qty">
              <InputNumber
                v-model="item.collie"
                class="consolidation-number--compact"
                :min="1"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__compact-cell" data-label="Length">
              <InputNumber
                v-model="item.length"
                class="consolidation-number--compact"
                :min="0"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__compact-cell" data-label="Width">
              <InputNumber
                v-model="item.width"
                class="consolidation-number--compact"
                :min="0"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__compact-cell" data-label="Height">
              <InputNumber
                v-model="item.height"
                class="consolidation-number--compact"
                :min="0"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__kg-cell" data-label="Net kg">
              <InputNumber
                v-model="item.net"
                class="consolidation-number--kg"
                :min="0"
                :min-fraction-digits="1"
              />
            </td>
            <td class="consolidation-table__kg-cell" data-label="Gross kg">
              <InputNumber
                v-model="item.gross"
                class="consolidation-number--kg"
                :min="0"
                :min-fraction-digits="1"
              />
            </td>
            <td class="consolidation-table__check-cell" data-label="ADR">
              <Checkbox
                :model-value="isAdrPackage(item)"
                binary
                @update:model-value="setAdrPackage(item, $event)"
              />
            </td>
            <td class="consolidation-table__check-cell" data-label="Stackable">
              <Checkbox
                :model-value="getPackageStackOption(item) === 'stackable'"
                binary
                @update:model-value="setPackageStackOption(item, 'stackable')"
              />
            </td>
            <td class="consolidation-table__check-cell" data-label="Non-Stack">
              <Checkbox
                :model-value="getPackageStackOption(item) === 'non_stack'"
                binary
                @update:model-value="setPackageStackOption(item, 'non_stack')"
              />
            </td>
            <td class="consolidation-table__check-cell" data-label="Top-Loadable">
              <Checkbox
                :model-value="getPackageStackOption(item) === 'top_loadable'"
                binary
                @update:model-value="setPackageStackOption(item, 'top_loadable')"
              />
            </td>
            <td class="consolidation-table__action-cell" data-label="Action">
              <Button
                label="Delete"
                class="btn btn--ghost btn--small"
                :disabled="supplierDraft.items.length === 1"
                @click="removeSupplierItem(index)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="consolidation-page__summary-row">
      <article>
        <span>Draft pieces</span><strong>{{ supplierDraftTotals.pieces }}</strong>
      </article>
      <article>
        <span>Draft gross</span><strong>{{ supplierDraftTotals.weight.toFixed(1) }} kg</strong>
      </article>
      <article>
        <span>Draft volume</span><strong>{{ supplierDraftTotals.volume.toFixed(3) }} cbm</strong>
      </article>
      <article>
        <span>Draft value</span>
        <strong>{{ money(supplierDraft.currency, supplierDraft.invoiceValue) }}</strong>
      </article>
    </div>

    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showSupplierInvoiceModal = false" />
        <Button
          label="Save Supplier Invoice"
          icon="pi pi-save"
          class="btn btn--primary"
          @click="saveSupplierInvoice"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showCollectionOrderModal"
    header="Add Collection Order"
    modal
    :style="{ width: '1180px', maxWidth: '96vw' }"
  >
    <div class="consolidation-modal-toolbar">
      <Button
        label="Add Package"
        icon="pi pi-plus"
        class="btn btn--ghost"
        @click="addCollectionLine"
      />
    </div>

    <div class="consolidation-form-grid consolidation-form-grid--three">
      <label class="consolidation-field">
        <span>Collection Order Ref</span>
        <InputText v-model="collectionDraft.coRef" />
      </label>
      <label class="consolidation-field">
        <span>Customer Ref</span>
        <InputText v-model="collectionDraft.customerRef" placeholder="Enter customer reference" />
      </label>
      <label class="consolidation-field">
        <span>Collection Ref</span>
        <InputText
          v-model="collectionDraft.collectionRef"
          placeholder="Enter collection reference"
        />
      </label>
      <label class="consolidation-field">
        <span>Pickup Date</span>
        <InputText v-model="collectionDraft.pickupDate" type="date" />
      </label>
      <label class="consolidation-field">
        <span>Pickup Time</span>
        <InputText v-model="collectionDraft.pickupTime" type="time" />
      </label>
      <label class="consolidation-field">
        <span>Mode Type</span>
        <Dropdown v-model="collectionDraft.vehicle" :options="vehicleOptions" />
      </label>
      <label class="consolidation-field">
        <span>Collection Address</span>
        <Dropdown v-model="collectionDraft.collectionAddress" :options="addressOptions" />
      </label>
      <label class="consolidation-field">
        <span>Delivery Address</span>
        <Dropdown v-model="collectionDraft.deliveryAddress" :options="addressOptions" />
      </label>
      <label class="consolidation-field">
        <span>Required Delivery Date</span>
        <InputText v-model="collectionDraft.deliveryDate" type="date" />
      </label>
      <label class="consolidation-field">
        <span>Delivery Time</span>
        <InputText v-model="collectionDraft.deliveryTime" type="time" />
      </label>
      <label class="consolidation-field">
        <span>Carrier</span>
        <Dropdown v-model="collectionDraft.supplier" :options="carrierOptions" />
      </label>
      <label class="consolidation-field">
        <span>Goods Description</span>
        <InputText v-model="collectionDraft.goodsDescription" />
      </label>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Hazardous</div>
      <div class="consolidation-hazard-row">
        <label class="consolidation-check-row">
          <Checkbox v-model="collectionDraft.hazardous" binary />
          <span>ADR / Hazardous goods</span>
        </label>
        <label
          v-if="collectionDraft.hazardous"
          class="consolidation-field consolidation-field--adr"
        >
          <span>ADR Class</span>
          <Dropdown
            v-model="collectionDraft.adrClass"
            :options="adrClassOptions"
            option-label="label"
            option-value="value"
          />
        </label>
      </div>
    </div>

    <div class="consolidation-table-wrap consolidation-table-wrap--mt">
      <table class="consolidation-table consolidation-table--inputs consolidation-table--wide">
        <thead>
          <tr>
            <th class="consolidation-table__item-heading">#</th>
            <th>Packaging</th>
            <th class="consolidation-table__compact-heading">Qty</th>
            <th class="consolidation-table__compact-heading">Length</th>
            <th class="consolidation-table__compact-heading">Width</th>
            <th class="consolidation-table__compact-heading">Height</th>
            <th>Net kg</th>
            <th>Gross kg</th>
            <th>CBM</th>
            <th>LDM</th>
            <th>ADR</th>
            <th class="consolidation-table__check-heading">Stackable</th>
            <th class="consolidation-table__check-heading">Non-Stack</th>
            <th class="consolidation-table__check-heading">Top-Loadable</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, index) in collectionDraft.lines" :key="line.id">
            <td class="consolidation-table__item-number">{{ index + 1 }}</td>
            <td><Dropdown v-model="line.packageType" :options="packageOptions" /></td>
            <td class="consolidation-table__compact-cell">
              <InputNumber
                v-model="line.qty"
                class="consolidation-number--compact"
                :min="1"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__compact-cell">
              <InputNumber
                v-model="line.length"
                class="consolidation-number--compact"
                :min="0"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__compact-cell">
              <InputNumber
                v-model="line.width"
                class="consolidation-number--compact"
                :min="0"
                :max="9999"
              />
            </td>
            <td class="consolidation-table__compact-cell">
              <InputNumber
                v-model="line.height"
                class="consolidation-number--compact"
                :min="0"
                :max="9999"
              />
            </td>
            <td><InputNumber v-model="line.netWeight" :min="0" :min-fraction-digits="1" /></td>
            <td>
              <InputNumber v-model="line.grossWeight" :min="0" :min-fraction-digits="1" />
            </td>
            <td>{{ cbm(line).toFixed(3) }}</td>
            <td>{{ ldm(line).toFixed(3) }}</td>
            <td><Checkbox v-model="line.adr" binary /></td>
            <td class="consolidation-table__check-cell">
              <Checkbox
                :model-value="getPackageStackOption(line) === 'stackable'"
                binary
                @update:model-value="setPackageStackOption(line, 'stackable')"
              />
            </td>
            <td class="consolidation-table__check-cell">
              <Checkbox
                :model-value="getPackageStackOption(line) === 'non_stack'"
                binary
                @update:model-value="setPackageStackOption(line, 'non_stack')"
              />
            </td>
            <td class="consolidation-table__check-cell">
              <Checkbox
                :model-value="getPackageStackOption(line) === 'top_loadable'"
                binary
                @update:model-value="setPackageStackOption(line, 'top_loadable')"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="consolidation-page__summary-row">
      <article>
        <span>Total pieces</span><strong>{{ collectionDraftTotals.pieces }}</strong>
      </article>
      <article>
        <span>Gross weight</span><strong>{{ collectionDraftTotals.weight.toFixed(1) }} kg</strong>
      </article>
      <article>
        <span>Volume</span><strong>{{ collectionDraftTotals.volume.toFixed(3) }} cbm</strong>
      </article>
      <article>
        <span>LDM</span><strong>{{ collectionDraftTotals.ldm.toFixed(3) }}</strong>
      </article>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Haulier Charges</div>
      <div class="consolidation-form-grid consolidation-form-grid--four">
        <label class="consolidation-field">
          <span>Freight</span>
          <InputNumber v-model="collectionDraft.freight" :min-fraction-digits="2" />
        </label>
        <label class="consolidation-field">
          <span>FSC %</span>
          <InputNumber v-model="collectionDraft.fscPct" :min-fraction-digits="1" suffix="%" />
        </label>
        <label class="consolidation-field">
          <span>FSC Amount</span>
          <InputText :model-value="money('GBP', collectionFscAmount)" readonly />
        </label>
        <label class="consolidation-field">
          <span>Additional</span>
          <InputNumber v-model="collectionDraft.additional" :min-fraction-digits="2" />
        </label>
      </div>
      <div class="consolidation-page__summary-row consolidation-page__summary-row--compact">
        <article>
          <span>Total haulier charge</span>
          <strong>{{ money("GBP", collectionChargeTotal) }}</strong>
        </article>
        <article>
          <span>Generated preview</span><strong>{{ nextCollectionRef }} / {{ nextGrnRef }}</strong>
        </article>
      </div>
      <Textarea v-model="haulierQuoteText" rows="6" class="consolidation-quote-text" />
    </div>

    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showCollectionOrderModal = false" />
        <Button
          label="Refresh Quote Request"
          icon="pi pi-refresh"
          class="btn btn--ghost"
          @click="refreshHaulierQuote"
        />
        <Button
          label="Save Collection Order"
          icon="pi pi-save"
          class="btn btn--primary"
          @click="saveCollectionOrder"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showSupplierItemModal"
    header="Add Supplier Package Item"
    modal
    :style="{ width: '720px', maxWidth: '94vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--three">
      <label class="consolidation-field">
        <span>Package</span>
        <Dropdown v-model="supplierItemDraft.packageType" :options="packageOptions" />
      </label>
      <label class="consolidation-field">
        <span>Qty</span>
        <InputNumber v-model="supplierItemDraft.collie" :min="1" />
      </label>
      <label class="consolidation-field">
        <span>ADR</span>
        <label class="consolidation-check-row consolidation-check-row--field">
          <Checkbox
            :model-value="isAdrPackage(supplierItemDraft)"
            binary
            @update:model-value="setAdrPackage(supplierItemDraft, $event)"
          />
          <span>{{ supplierItemDraft.adr }}</span>
        </label>
      </label>
      <label class="consolidation-field">
        <span>Length</span>
        <InputNumber v-model="supplierItemDraft.length" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Width</span>
        <InputNumber v-model="supplierItemDraft.width" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Height</span>
        <InputNumber v-model="supplierItemDraft.height" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Net kg</span>
        <InputNumber v-model="supplierItemDraft.net" :min="0" :min-fraction-digits="1" />
      </label>
      <label class="consolidation-field">
        <span>Gross kg</span>
        <InputNumber v-model="supplierItemDraft.gross" :min="0" :min-fraction-digits="1" />
      </label>
    </div>
    <div class="consolidation-modal-checks">
      <label class="consolidation-check-row">
        <Checkbox
          :model-value="getPackageStackOption(supplierItemDraft) === 'stackable'"
          binary
          @update:model-value="setPackageStackOption(supplierItemDraft, 'stackable')"
        />
        <span>Stackable</span>
      </label>
      <label class="consolidation-check-row">
        <Checkbox
          :model-value="getPackageStackOption(supplierItemDraft) === 'non_stack'"
          binary
          @update:model-value="setPackageStackOption(supplierItemDraft, 'non_stack')"
        />
        <span>Non-Stack</span>
      </label>
      <label class="consolidation-check-row">
        <Checkbox
          :model-value="getPackageStackOption(supplierItemDraft) === 'top_loadable'"
          binary
          @update:model-value="setPackageStackOption(supplierItemDraft, 'top_loadable')"
        />
        <span>Top-Loadable</span>
      </label>
    </div>
    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showSupplierItemModal = false" />
        <Button
          label="Add Item"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="confirmSupplierItem"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showSupplierCollectionLinkModal"
    header="Add Supplier Invoice to Collection"
    modal
    :style="{ width: '560px', maxWidth: '94vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--two">
      <label class="consolidation-field consolidation-field--wide">
        <span>Supplier Invoice</span>
        <Dropdown
          v-model="supplierCollectionLinkDraft.supplierInvoiceId"
          :options="supplierInvoiceLinkOptions"
          option-label="label"
          option-value="value"
          placeholder="Select supplier invoice"
        />
      </label>
      <label class="consolidation-field consolidation-field--wide">
        <span>Collection Ref</span>
        <Dropdown
          v-if="collectionRefOptions.length"
          v-model="supplierCollectionLinkDraft.collectionRef"
          :options="collectionRefOptions"
          placeholder="Select collection"
        />
        <InputText
          v-else
          v-model="supplierCollectionLinkDraft.collectionRef"
          placeholder="Enter collection ref"
        />
      </label>
    </div>
    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button
          label="Cancel"
          class="btn btn--ghost"
          @click="showSupplierCollectionLinkModal = false"
        />
        <Button
          label="Add Link"
          icon="pi pi-link"
          class="btn btn--primary"
          :disabled="!supplierCollectionLinkDraft.supplierInvoiceId"
          @click="confirmSupplierCollectionLink"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showCollectionLineModal"
    header="Add Collection Package"
    modal
    :style="{ width: '760px', maxWidth: '94vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--three">
      <label class="consolidation-field">
        <span>Packaging</span>
        <Dropdown v-model="collectionLineDraft.packageType" :options="packageOptions" />
      </label>
      <label class="consolidation-field">
        <span>Qty</span>
        <InputNumber v-model="collectionLineDraft.qty" :min="1" />
      </label>
      <label class="consolidation-check-row">
        <Checkbox v-model="collectionLineDraft.adr" binary />
        <span>ADR</span>
      </label>
      <label class="consolidation-field">
        <span>Length</span>
        <InputNumber v-model="collectionLineDraft.length" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Width</span>
        <InputNumber v-model="collectionLineDraft.width" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Height</span>
        <InputNumber v-model="collectionLineDraft.height" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Net kg</span>
        <InputNumber v-model="collectionLineDraft.netWeight" :min="0" :min-fraction-digits="1" />
      </label>
      <label class="consolidation-field">
        <span>Gross kg</span>
        <InputNumber v-model="collectionLineDraft.grossWeight" :min="0" :min-fraction-digits="1" />
      </label>
    </div>
    <div class="consolidation-modal-checks">
      <label class="consolidation-check-row">
        <Checkbox
          :model-value="getPackageStackOption(collectionLineDraft) === 'stackable'"
          binary
          @update:model-value="setPackageStackOption(collectionLineDraft, 'stackable')"
        />
        <span>Stackable</span>
      </label>
      <label class="consolidation-check-row">
        <Checkbox
          :model-value="getPackageStackOption(collectionLineDraft) === 'non_stack'"
          binary
          @update:model-value="setPackageStackOption(collectionLineDraft, 'non_stack')"
        />
        <span>Non-Stack</span>
      </label>
      <label class="consolidation-check-row">
        <Checkbox
          :model-value="getPackageStackOption(collectionLineDraft) === 'top_loadable'"
          binary
          @update:model-value="setPackageStackOption(collectionLineDraft, 'top_loadable')"
        />
        <span>Top-Loadable</span>
      </label>
    </div>
    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showCollectionLineModal = false" />
        <Button
          label="Add Package"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="confirmCollectionLine"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showConsolidatedItemModal"
    header="Add Consolidated Invoice Item"
    modal
    :style="{ width: '820px', maxWidth: '94vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--three">
      <label class="consolidation-field">
        <span>Currency</span>
        <Dropdown v-model="consolidatedLineDraft.invoiceCurrency" :options="invoiceCurrencies" />
      </label>
      <label class="consolidation-field">
        <span>PO Ref</span>
        <InputText v-model="consolidatedLineDraft.poRef" />
      </label>
      <label class="consolidation-field">
        <span>Shipping Label No</span>
        <InputText v-model="consolidatedLineDraft.shippingLabelNo" />
      </label>
      <label class="consolidation-field consolidation-field--wide">
        <span>Description</span>
        <InputText v-model="consolidatedLineDraft.description" />
      </label>
      <label class="consolidation-field">
        <span>Qty</span>
        <InputNumber v-model="consolidatedLineDraft.qty" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>UOM</span>
        <Dropdown v-model="consolidatedLineDraft.uom" :options="unitOptions" />
      </label>
      <label class="consolidation-field">
        <span>Origin</span>
        <InputText v-model="consolidatedLineDraft.countryOfOrigin" />
      </label>
      <label class="consolidation-field">
        <span>HS Code</span>
        <InputText v-model="consolidatedLineDraft.hsCode" />
      </label>
      <label class="consolidation-field">
        <span>Unit Price</span>
        <InputNumber v-model="consolidatedLineDraft.unitPrice" :min-fraction-digits="2" />
      </label>
      <label class="consolidation-field">
        <span>Supplier</span>
        <InputText v-model="consolidatedLineDraft.supplier" />
      </label>
      <label class="consolidation-field">
        <span>GRN</span>
        <InputText v-model="consolidatedLineDraft.grn" />
      </label>
    </div>
    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showConsolidatedItemModal = false" />
        <Button
          label="Add Item"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="confirmConsolidatedItem"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showChargeModal"
    :header="chargeModalTitle"
    modal
    :style="{ width: '560px', maxWidth: '94vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--two">
      <label class="consolidation-field consolidation-field--wide">
        <span>Description</span>
        <Dropdown v-model="chargeDraft.description" :options="chargeOptions" />
      </label>
      <label class="consolidation-field">
        <span>Qty</span>
        <InputNumber v-model="chargeDraft.qty" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Unit</span>
        <Dropdown v-model="chargeDraft.unit" :options="unitOptions" />
      </label>
      <label class="consolidation-field">
        <span>Rate</span>
        <InputNumber v-model="chargeDraft.rate" :min-fraction-digits="2" />
      </label>
    </div>
    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showChargeModal = false" />
        <Button
          label="Add Charge"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="confirmCharge"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showQuoteLineModal"
    header="Add Quote Line"
    modal
    :style="{ width: '560px', maxWidth: '94vw' }"
  >
    <div class="consolidation-form-grid consolidation-form-grid--two">
      <label class="consolidation-field consolidation-field--wide">
        <span>Description</span>
        <Dropdown v-model="quoteLineDraft.description" :options="chargeOptions" />
      </label>
      <label class="consolidation-field">
        <span>Qty</span>
        <InputNumber v-model="quoteLineDraft.qty" :min="0" />
      </label>
      <label class="consolidation-field">
        <span>Unit</span>
        <Dropdown v-model="quoteLineDraft.unit" :options="unitOptions" />
      </label>
      <label class="consolidation-field">
        <span>Rate</span>
        <InputNumber v-model="quoteLineDraft.rate" :min-fraction-digits="2" />
      </label>
    </div>
    <template #footer>
      <div class="consolidation-dialog-footer">
        <Button label="Cancel" class="btn btn--ghost" @click="showQuoteLineModal = false" />
        <Button
          label="Add Line"
          icon="pi pi-plus"
          class="btn btn--primary"
          @click="confirmQuoteLine"
        />
      </div>
    </template>
  </Dialog>
</template>
