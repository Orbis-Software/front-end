<script setup lang="ts">
import "./JobCostsTab.css"
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import { useJobCostsTab } from "./JobCostsTab.logic"

const {
  buyRows,
  sellRows,
  totals,
  jobCurrency,
  sellCurrency,
  currencyOptions,
  vatRateOptions,
  chargeDescriptionOptions,
  supplierOptions,
  chargeCodesLoading,
  suppliersLoading,
  addChargeCodeDialogVisible,
  addChargeCodeSaving,
  pendingChargeCodeDescription,
  primaryJobChargeClassification,
  deleteDialogVisible,
  printedDeleteDialogVisible,
  pendingDeleteRow,
  addBuyRow,
  addSellRow,
  selectChargeDescription,
  syncChargeDescriptionFilter,
  updateBuyPricing,
  updateBuyCurrency,
  setSellCurrency,
  scheduleMissingChargeDescriptionCheck,
  chargeDescriptionDropdownShown,
  chargeDescriptionDropdownHidden,
  confirmAddChargeCode,
  cancelAddChargeCode,
  requestRemoveRow,
  cancelRemoveRow,
  confirmRemoveRow,
  confirmPrintedRemoveRow,
  toggleBuyRowSellCharge,
  buyRowSellChargeChecked,
  buyRowSellChargeTooltip,
  printedInvoiceNumber,
  lineNet,
  sellVat,
  formatMoney,
  formatRowMoney,
  formatExchangeRate,
  exchangeRateTooltip,
  missingExchangeRate,
  applyVatRate,
  syncLineExchangeRate,
} = useJobCostsTab()
</script>

<template>
  <section class="job-costs-tab">
    <div class="job-costs-tab__section">
      <header class="job-costs-tab__section-header">
        <div>
          <h2>Buy Costs</h2>
          <p>Supplier costs for the job.</p>
        </div>

        <Button
          type="button"
          class="job-costs-tab__add-btn"
          label="Add Cost Line"
          icon="pi pi-plus"
          @click="addBuyRow"
        />
      </header>

      <div class="job-costs-tab__table-wrap">
        <table class="job-costs-tab__table job-costs-tab__table--buy">
          <thead>
            <tr>
              <th>#</th>
              <th>Charge Description</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Unit Cost</th>
              <th>Markup</th>
              <th>Currency</th>
              <th>Ex. Rate</th>
              <th>Net</th>
              <th>Add to Sell</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in buyRows" :key="row.id">
              <td class="job-costs-tab__number">{{ index + 1 }}</td>
              <td>
                <Dropdown
                  v-model="row.description"
                  class="job-costs-tab__charge-description"
                  :options="chargeDescriptionOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select charge description"
                  filter
                  auto-filter-focus
                  editable
                  show-clear
                  :loading="chargeCodesLoading"
                  @change="selectChargeDescription(row, row.description)"
                  @show="chargeDescriptionDropdownShown"
                  @hide="chargeDescriptionDropdownHidden"
                  @blur="scheduleMissingChargeDescriptionCheck"
                />
              </td>
              <td>
                <Dropdown
                  v-model="row.supplier_id"
                  :options="supplierOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select supplier"
                  filter
                  auto-filter-focus
                  show-clear
                  :loading="suppliersLoading"
                />
              </td>
              <td>
                <InputNumber v-model="row.quantity" :min="0" />
              </td>
              <td>
                <InputNumber
                  v-model="row.unitCost"
                  :min="0"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  @update:model-value="updateBuyPricing(row)"
                />
              </td>
              <td>
                <InputNumber
                  v-model="row.markupPercentage"
                  suffix="%"
                  :min="0"
                  :min-fraction-digits="0"
                  :max-fraction-digits="2"
                  @update:model-value="updateBuyPricing(row)"
                />
              </td>
              <td>
                <Dropdown
                  v-model="row.currency"
                  :options="currencyOptions"
                  option-label="label"
                  option-value="value"
                  filter
                  auto-filter-focus
                  @change="updateBuyCurrency(row)"
                />
              </td>
              <td>
                <div
                  class="job-costs-tab__exchange-rate"
                  :class="{ 'job-costs-tab__exchange-rate--missing': missingExchangeRate(row) }"
                  :title="exchangeRateTooltip(row)"
                  tabindex="0"
                >
                  <span>{{ formatExchangeRate(row) }}</span>
                  <i v-if="missingExchangeRate(row)" class="pi pi-exclamation-triangle" />
                </div>
              </td>
              <td class="job-costs-tab__computed">{{ formatRowMoney(row, lineNet(row)) }}</td>
              <td>
                <div class="job-costs-tab__sell-link" :title="buyRowSellChargeTooltip(row)">
                  <Checkbox
                    :model-value="buyRowSellChargeChecked(row)"
                    binary
                    :input-id="`add-buy-${row.id}-to-sell`"
                    @update:model-value="toggleBuyRowSellCharge(row, $event)"
                  />
                </div>
              </td>
              <td>
                <Button
                  type="button"
                  class="job-costs-tab__remove-btn"
                  icon="pi pi-trash"
                  text
                  rounded
                  aria-label="Remove cost line"
                  @click="requestRemoveRow(row)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="job-costs-tab__section">
      <header class="job-costs-tab__section-header">
        <div>
          <h2>Sell Charges</h2>
          <p>Customer charges and revenue lines.</p>
        </div>

        <div class="job-costs-tab__section-actions">
          <label class="job-costs-tab__sell-currency">
            <span>Sell Currency</span>
            <Dropdown
              :model-value="sellCurrency"
              :options="currencyOptions"
              option-label="label"
              option-value="value"
              filter
              auto-filter-focus
              @update:model-value="setSellCurrency"
            />
          </label>
          <Button
            type="button"
            class="job-costs-tab__add-btn"
            label="Add Charge Line"
            icon="pi pi-plus"
            @click="addSellRow"
          />
        </div>
      </header>

      <div class="job-costs-tab__table-wrap">
        <table class="job-costs-tab__table job-costs-tab__table--sell">
          <thead>
            <tr>
              <th>#</th>
              <th>Charge Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Currency</th>
              <th>Ex. Rate</th>
              <th>VAT %</th>
              <th>Net</th>
              <th v-if="totals.hasVat">VAT</th>
              <th v-if="totals.hasVat">Gross</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in sellRows" :key="row.id">
              <td class="job-costs-tab__number">{{ index + 1 }}</td>
              <td>
                <Dropdown
                  v-model="row.description"
                  class="job-costs-tab__charge-description"
                  :options="chargeDescriptionOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select charge description"
                  filter
                  auto-filter-focus
                  editable
                  show-clear
                  :loading="chargeCodesLoading"
                  @change="selectChargeDescription(row, row.description)"
                  @show="chargeDescriptionDropdownShown"
                  @hide="chargeDescriptionDropdownHidden"
                  @blur="scheduleMissingChargeDescriptionCheck"
                />
              </td>
              <td>
                <InputNumber v-model="row.quantity" :min="0" />
              </td>
              <td>
                <InputNumber
                  v-model="row.unitPrice"
                  :min="0"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                />
              </td>
              <td>
                <span class="job-costs-tab__currency-lock" title="Controlled by Sell Currency">
                  <i class="pi pi-lock" />
                  {{ row.currency }}
                </span>
              </td>
              <td>
                <div
                  class="job-costs-tab__exchange-rate"
                  :class="{ 'job-costs-tab__exchange-rate--missing': missingExchangeRate(row) }"
                  :title="exchangeRateTooltip(row)"
                  tabindex="0"
                >
                  <span>{{ formatExchangeRate(row) }}</span>
                  <i v-if="missingExchangeRate(row)" class="pi pi-exclamation-triangle" />
                </div>
              </td>
              <td>
                <Dropdown
                  v-model="row.vatRate"
                  :options="vatRateOptions"
                  option-label="label"
                  option-value="value"
                  filter
                  auto-filter-focus
                  @change="applyVatRate(row, row.vatRate)"
                />
              </td>
              <td class="job-costs-tab__computed">{{ formatRowMoney(row, lineNet(row)) }}</td>
              <td v-if="totals.hasVat" class="job-costs-tab__computed">
                {{ formatRowMoney(row, sellVat(row)) }}
              </td>
              <td v-if="totals.hasVat" class="job-costs-tab__computed">
                {{ formatRowMoney(row, lineNet(row) + sellVat(row)) }}
              </td>
              <td>
                <Button
                  type="button"
                  class="job-costs-tab__remove-btn"
                  icon="pi pi-trash"
                  text
                  rounded
                  aria-label="Remove charge line"
                  @click="requestRemoveRow(row)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="totals.missingExchangeRates" class="job-costs-tab__exchange-warning">
      <i class="pi pi-exclamation-triangle" />
      <span>
        {{ totals.missingExchangeRates }} cost line{{
          totals.missingExchangeRates === 1 ? "" : "s"
        }}
        missing exchange rates to {{ jobCurrency }}. Add them in Accounts &gt; Exchange Rates before
        relying on converted totals.
      </span>
    </div>

    <div class="job-costs-tab__summary">
      <div class="job-costs-tab__summary-row">
        <span>Total Revenue (Net {{ jobCurrency }})</span>
        <strong>{{ formatMoney(totals.totalSell, jobCurrency) }}</strong>
      </div>

      <div class="job-costs-tab__summary-row">
        <span>Total Cost (Net {{ jobCurrency }})</span>
        <strong>{{ formatMoney(totals.totalBuy, jobCurrency) }}</strong>
      </div>

      <div class="job-costs-tab__summary-row">
        <span>Gross Margin ({{ jobCurrency }})</span>
        <strong>{{ formatMoney(totals.margin, jobCurrency) }}</strong>
      </div>

      <div class="job-costs-tab__summary-row">
        <span>Margin %</span>
        <strong>{{ totals.marginPercent.toFixed(1) }}%</strong>
      </div>

      <div v-if="totals.hasVat" class="job-costs-tab__summary-row">
        <span>Total VAT ({{ jobCurrency }})</span>
        <strong>{{ formatMoney(totals.totalVat, jobCurrency) }}</strong>
      </div>

      <div
        v-if="totals.hasVat"
        class="job-costs-tab__summary-row job-costs-tab__summary-row--total"
      >
        <span>Grand Total (inc. VAT {{ jobCurrency }})</span>
        <strong>{{ formatMoney(totals.grandTotal, jobCurrency) }}</strong>
      </div>
    </div>

    <Dialog
      v-model:visible="addChargeCodeDialogVisible"
      modal
      header="Add Charge Code?"
      :style="{ width: '420px' }"
    >
      <div class="job-costs-tab__dialog">
        <p>
          <strong>{{ pendingChargeCodeDescription }}</strong> is not in Charge Codes. Add it now and
          use it for this line?
        </p>
        <p class="job-costs-tab__dialog-muted">
          Classification:
          <strong>{{ primaryJobChargeClassification || "Unclassified" }}</strong>
        </p>
      </div>

      <template #footer>
        <Button
          type="button"
          label="No"
          class="job-costs-tab__dialog-secondary"
          text
          :disabled="addChargeCodeSaving"
          @click="cancelAddChargeCode"
        />
        <Button
          type="button"
          label="Yes, Add"
          class="job-costs-tab__dialog-primary"
          :loading="addChargeCodeSaving"
          @click="confirmAddChargeCode"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Delete Line?"
      :style="{ width: '380px' }"
    >
      <div class="job-costs-tab__dialog">
        <p>
          Delete
          <strong>{{ pendingDeleteRow?.description || "this line" }}</strong>
          from {{ pendingDeleteRow?.type === "buy" ? "Buy Costs" : "Sell Charges" }}?
        </p>
        <p class="job-costs-tab__dialog-muted">This only removes the line from this job.</p>
      </div>

      <template #footer>
        <Button
          type="button"
          label="Cancel"
          class="job-costs-tab__dialog-secondary"
          text
          @click="cancelRemoveRow"
        />
        <Button
          type="button"
          label="Delete"
          severity="danger"
          class="job-costs-tab__dialog-danger"
          @click="confirmRemoveRow"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="printedDeleteDialogVisible"
      modal
      header="Printed Invoice Warning"
      :style="{ width: '430px' }"
    >
      <div class="job-costs-tab__dialog">
        <p>
          This line is already printed on invoice
          <strong>{{ printedInvoiceNumber(pendingDeleteRow) }}</strong
          >.
        </p>
        <p>
          Deleting it will remove the cost line from the job, but the printed invoice record/PDF may
          still show the original charge.
        </p>
        <p class="job-costs-tab__dialog-muted">
          Confirm again only if you are sure this printed charge should be removed.
        </p>
      </div>

      <template #footer>
        <Button
          type="button"
          label="Cancel"
          class="job-costs-tab__dialog-secondary"
          text
          @click="cancelRemoveRow"
        />
        <Button
          type="button"
          label="Delete Printed Line"
          severity="danger"
          class="job-costs-tab__dialog-danger"
          @click="confirmPrintedRemoveRow"
        />
      </template>
    </Dialog>
  </section>
</template>
