<template>
  <div class="quote-page">
    <div class="quote-top">
      <div class="quote-title">
        <i class="pi pi-file-edit" />
        <span>New Freight Quotation</span>
      </div>

      <div class="quote-actions">
        <span class="status-tag">
          <span class="status-dot" />
          Draft
        </span>

        <Button class="btn orbis-primary" outlined type="button" @click="onBrowseQuotes">
          <i class="pi pi-folder-open" style="margin-right: 8px" />
          Browse Quotes
        </Button>

        <Button class="btn orbis-primary" type="button" @click="onFindQuote">
          <i class="pi pi-search" style="margin-right: 8px" />
          Find Quote
        </Button>
      </div>
    </div>

    <section class="card section">
      <QuoteStepHeader
        title="Quote Type"
        badge="STEP 1"
        subtitle="Choose what you want to create"
      />
      <QuoteTypeSelector :items="QUOTE_TYPES" :selected="quoteType" @select="selectQuoteType" />
    </section>

    <section v-if="quoteType && showModeSelector" class="card section">
      <QuoteStepHeader
        :title="`Mode of Transport for ${quoteTypeLabel}`"
        badge="STEP 2"
        subtitle="Choose the transport mode"
      />
      <ModeSelector :items="availableModes" :selected="mode" @select="selectMode" />
    </section>

    <section v-if="canShowForm" class="card section">
      <div class="meta-title">
        New {{ quoteTypeLabel }} Quote<span v-if="modeLabel"> — {{ modeLabel }}</span>
      </div>

      <QuoteStepHeader
        title="Quote Information"
        badge="STEP 3"
        subtitle="Customer, contact, references, dates, currency, and incoterms"
      />

      <div class="grid-4">
        <div class="field">
          <label class="label">Customer Name *</label>
          <AutoComplete
            v-model="selectedCustomer"
            :suggestions="customerSuggestions"
            :optionLabel="customerOptionLabel"
            placeholder="Start typing... (select from CRM)"
            class="control"
            inputClass="control"
            dropdown
            forceSelection
            :completeOnFocus="true"
            @complete="onCustomerComplete"
            @item-select="onCustomerSelect"
            @clear="onCustomerClear"
          />
        </div>

        <div class="field">
          <label class="label">Account Number</label>
          <InputText :modelValue="accountNumberPreview" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Contact Person *</label>
          <Select
            v-model="selectedContactIndex"
            :options="contactOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select contact"
            :disabled="!selectedCustomer"
          />
        </div>

        <div class="field">
          <label class="label">Customer Ref</label>
          <InputText v-model="form.customer_ref" class="control" placeholder="e.g. PO-2026-001" />
        </div>
      </div>

      <div class="grid-4 mt-12">
        <div class="field">
          <label class="label">Email</label>
          <InputText v-model="form.contact_email" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Phone Number</label>
          <InputText v-model="form.contact_phone" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Quote Ref</label>
          <InputText v-model="form.quote_ref" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Quote Date</label>
          <Calendar
            v-model="form.quote_date"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>
      </div>

      <div class="grid-4 mt-12">
        <div class="field">
          <label class="label">Follow Up Date</label>
          <Calendar
            v-model="form.follow_up_date"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Valid Until</label>
          <Calendar
            v-model="form.valid_until"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Currency</label>
          <Select
            v-model="form.currency"
            :options="currencyOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select currency"
          />
        </div>

        <div class="field">
          <label class="label">Incoterms</label>
          <Select
            v-model="form.incoterm"
            :options="incotermOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select incoterm"
          />
        </div>
      </div>
    </section>

    <section v-if="canShowForm" class="card section">
      <QuoteStepHeader
        title="Shipment Summary"
        badge="STEP 4"
        subtitle="Routing, cargo summary, and package details"
      />

      <div class="grid-4">
        <div class="field">
          <label class="label">Origin Port / Location</label>
          <InputText v-model="form.origin" class="control" placeholder="e.g. London Heathrow" />
        </div>

        <div class="field">
          <label class="label">Destination Port / Location</label>
          <InputText v-model="form.destination" class="control" placeholder="e.g. Dubai DXB" />
        </div>

        <div class="field">
          <label class="label">Estimated Departure</label>
          <Calendar
            v-model="form.etd"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Estimated Arrival</label>
          <Calendar
            v-model="form.eta"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>
      </div>

      <div class="summary-tiles mt-16">
        <div class="summary-tile">
          <span class="tile-label">{{ mode === "road" ? "No. of Pallets" : "No. of Pieces" }}</span>
          <strong>{{ totalPieces }}</strong>
          <small>{{ mode === "road" ? "Plts" : "Pcs" }}</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Actual / Gross Weight</span>
          <strong>{{ totalActualWeight.toFixed(2) }}</strong>
          <small>KG</small>
        </div>

        <div v-if="mode === 'air'" class="summary-tile">
          <span class="tile-label">Volumetric Weight</span>
          <strong>{{ totalVolumetricWeight.toFixed(2) }}</strong>
          <small>KG</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Chargeable Weight</span>
          <strong>{{ chargeableWeight.toFixed(2) }}</strong>
          <small>KG</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Total Cube</span>
          <strong>{{ totalCbm.toFixed(3) }}</strong>
          <small>CBM</small>
        </div>

        <div v-if="mode === 'road'" class="summary-tile">
          <span class="tile-label">Loading Metres</span>
          <strong>{{ totalLdm.toFixed(2) }}</strong>
          <small>LDM</small>
        </div>

        <div v-if="mode === 'sea'" class="summary-tile">
          <span class="tile-label">Revenue Tonne</span>
          <strong>{{ revenueTonne.toFixed(3) }}</strong>
          <small>RT</small>
        </div>

        <div class="summary-tile">
          <span class="tile-label">Commodity</span>
          <strong>{{ form.commodity || "General" }}</strong>
          <small>&nbsp;</small>
        </div>
      </div>

      <div class="grid-4 mt-16">
        <div class="field">
          <label class="label">Commodity</label>
          <InputText v-model="form.commodity" class="control" placeholder="General cargo" />
        </div>

        <div v-if="mode === 'road'" class="field">
          <label class="label">Vehicle Type</label>
          <InputText v-model="form.vehicle_type" class="control" placeholder="FTL / LTL" />
        </div>

        <div v-if="mode === 'rail'" class="field">
          <label class="label">Cargo Class</label>
          <InputText v-model="form.cargo_class" class="control" placeholder="Cargo class" />
        </div>

        <div v-if="mode === 'sea' || mode === 'rail'" class="field">
          <label class="label">Container Type</label>
          <Select
            v-model="form.container_type"
            :options="containerOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select container"
          />
        </div>

        <div v-if="mode === 'sea'" class="field">
          <label class="label">Load Type</label>
          <InputText v-model="form.load_type" class="control" placeholder="FCL / LCL" />
        </div>
      </div>

      <div class="table-head-row">
        <div class="section-subtitle">Package / Piece Details</div>
        <Button class="btn-add" type="button" outlined @click="addDimensionRow">+ Add Row</Button>
      </div>

      <div class="table-wrap">
        <table class="quote-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ mode === "road" ? "Pallets" : mode === "rail" ? "Units" : "Pieces" }}</th>
              <th>L (cm)</th>
              <th>W (cm)</th>
              <th>H (cm)</th>
              <th>Weight (KG)</th>
              <th v-if="mode === 'air'">Vol. Wt (KG)</th>
              <th>CBM</th>
              <th v-if="mode === 'road'">LDM</th>
              <th v-if="mode === 'sea' || mode === 'rail'">Container</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in dimensionRows" :key="row.id">
              <td>{{ index + 1 }}</td>
              <td><InputNumber v-model="row.pieces" inputClass="table-input" :min="1" /></td>
              <td><InputNumber v-model="row.length" inputClass="table-input" :min="0" /></td>
              <td><InputNumber v-model="row.width" inputClass="table-input" :min="0" /></td>
              <td><InputNumber v-model="row.height" inputClass="table-input" :min="0" /></td>
              <td><InputNumber v-model="row.weight" inputClass="table-input" :min="0" /></td>
              <td v-if="mode === 'air'">{{ getRowVolumetricWeight(row).toFixed(2) }}</td>
              <td>{{ getRowCbm(row).toFixed(3) }}</td>
              <td v-if="mode === 'road'">{{ getRowLdm(row).toFixed(2) }}</td>
              <td v-if="mode === 'sea' || mode === 'rail'">
                <Select
                  v-model="row.container_type"
                  :options="containerOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select"
                />
              </td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  type="button"
                  @click="removeDimensionRow(row.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="canShowForm" class="card section">
      <QuoteStepHeader
        title="Goods Details & Charges"
        badge="STEP 5"
        subtitle="Goods description, hazardous details, charge lines, terms, and totals"
      />

      <div class="field">
        <label class="label">Description of Goods</label>
        <InputText
          v-model="form.goods_description"
          class="control"
          placeholder="e.g. General Cargo – Electronic Components"
        />
      </div>

      <div class="haz-row mt-16">
        <label class="toggle-line">
          <InputSwitch v-model="form.is_hazardous" />
          <span>Hazardous Goods</span>
          <strong>{{ form.is_hazardous ? "Yes" : "No" }}</strong>
        </label>
      </div>

      <div v-if="form.is_hazardous" class="haz-box mt-12">
        <div class="haz-badge">Hazardous</div>

        <div class="field">
          <label class="label">Hazardous Class</label>
          <Select
            v-model="form.hazardous_class"
            :options="hazardousClassOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select class"
          />
        </div>

        <div class="field">
          <label class="label">UN Number</label>
          <InputText v-model="form.un_number" class="control" placeholder="e.g. UN1234" />
        </div>

        <div class="field">
          <label class="label">Packing Group</label>
          <Select
            v-model="form.packing_group"
            :options="packingGroupOptions"
            optionLabel="label"
            optionValue="value"
            class="control"
            placeholder="Select PG"
          />
        </div>
      </div>

      <div class="table-head-row">
        <div class="section-subtitle">Charge Lines</div>
        <Button class="btn-add" type="button" outlined @click="addChargeLine()"
          >+ Add Charge</Button
        >
      </div>

      <div class="table-wrap">
        <table class="quote-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>UOM</th>
              <th>Cost</th>
              <th>Markup %</th>
              <th class="text-right">Total (Sell)</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="line in chargeLines" :key="line.id">
              <td>
                <Select
                  v-model="line.description"
                  :options="chargeDescriptionOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select wide"
                />
              </td>
              <td><InputNumber v-model="line.qty" inputClass="table-input" :min="0" /></td>
              <td>
                <Select
                  v-model="line.uom"
                  :options="uomOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="table-select"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.cost"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="0"
                />
              </td>
              <td>
                <InputNumber
                  v-model="line.markup_percent"
                  inputClass="table-input"
                  mode="decimal"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :min="0"
                />
              </td>
              <td class="text-right">{{ getChargeSellTotal(line).toFixed(2) }}</td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  type="button"
                  @click="removeChargeLine(line.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bottom-section">
        <div class="conditions-box">
          <div class="section-subtitle">Terms & Conditions</div>

          <div class="field">
            <label class="label">Preset Conditions</label>
            <Select
              v-model="form.conditions_preset"
              :options="conditionsOptions"
              optionLabel="label"
              optionValue="value"
              class="control"
              placeholder="Select preset"
              @change="onConditionsPresetChange"
            />
          </div>

          <div class="field">
            <label class="label">Conditions</label>
            <Textarea
              v-model="form.terms_conditions"
              class="control textarea"
              placeholder="Conditions of carriage..."
              autoResize
            />
          </div>

          <div class="field">
            <label class="label">Validity Period</label>
            <Select
              v-model="form.validity_period"
              :options="validityOptions"
              optionLabel="label"
              optionValue="value"
              class="control"
            />
          </div>

          <div class="field">
            <label class="label">Internal Notes (not printed)</label>
            <Textarea
              v-model="form.note"
              class="control textarea small-textarea"
              placeholder="Internal notes only..."
              autoResize
            />
          </div>
        </div>

        <div class="totals-card">
          <div class="section-subtitle text-right">Quote Totals</div>

          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal (Sell)</span>
              <strong>{{ subtotalSellDisplay }}</strong>
            </div>

            <div class="totals-row">
              <span>Subtotal (Cost)</span>
              <strong>{{ subtotalCostDisplay }}</strong>
            </div>

            <div class="totals-row">
              <span>Discount</span>
              <InputNumber
                v-model="form.discount"
                inputClass="totals-input"
                mode="decimal"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="0"
              />
            </div>

            <div class="totals-row">
              <span>Tax Rate</span>
              <Select
                v-model="form.tax_rate"
                :options="taxRateOptions"
                optionLabel="label"
                optionValue="value"
                class="totals-select"
              />
            </div>

            <div class="totals-row">
              <span>Tax on Sell</span>
              <strong>{{ taxAmountDisplay }}</strong>
            </div>

            <div class="totals-row">
              <span>Total excl. Tax</span>
              <strong>{{ totalExclTaxDisplay }}</strong>
            </div>

            <div class="totals-row grand">
              <span>Total incl. Tax</span>
              <strong>{{ totalInclTaxDisplay }}</strong>
            </div>

            <div class="totals-row profit">
              <span>Profit Total</span>
              <strong>{{ profitTotalDisplay }}</strong>
            </div>

            <div class="totals-row profit">
              <span>Profit %</span>
              <strong>{{ profitPercentDisplay }}</strong>
            </div>
          </div>

          <div class="final-actions">
            <Button class="btn" outlined type="button" @click="onCancel">Cancel</Button>
            <Button class="btn orbis-primary" type="button" @click="onSave">
              <i class="pi pi-check" style="margin-right: 8px" />
              Submit Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import "./QuoteCreatePage.css"

import AutoComplete from "primevue/autocomplete"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"
import Textarea from "primevue/textarea"
import Button from "primevue/button"
import Select from "primevue/select"
import InputNumber from "primevue/inputnumber"
import InputSwitch from "primevue/inputswitch"

import ModeSelector from "@/app/components/jobs/ModeSelector.vue"
import QuoteStepHeader from "./QuoteStepHeader.vue"
import QuoteTypeSelector from "./QuoteTypeSelector.vue"
import { useQuoteCreatePage } from "./QuoteCreatePage"

const {
  QUOTE_TYPES,
  availableModes,
  quoteType,
  mode,
  quoteTypeLabel,
  modeLabel,
  showModeSelector,
  canShowForm,

  form,
  selectedCustomer,
  selectedContactIndex,
  customerSuggestions,
  contactOptions,
  accountNumberPreview,

  currencyOptions,
  incotermOptions,
  containerOptions,
  uomOptions,
  chargeDescriptionOptions,
  hazardousClassOptions,
  packingGroupOptions,
  conditionsOptions,
  validityOptions,
  taxRateOptions,

  dimensionRows,
  chargeLines,

  totalPieces,
  totalActualWeight,
  totalVolumetricWeight,
  chargeableWeight,
  totalCbm,
  totalLdm,
  revenueTonne,

  subtotalSellDisplay,
  subtotalCostDisplay,
  totalExclTaxDisplay,
  taxAmountDisplay,
  totalInclTaxDisplay,
  profitTotalDisplay,
  profitPercentDisplay,

  selectQuoteType,
  selectMode,
  customerOptionLabel,
  onCustomerComplete,
  onCustomerSelect,
  onCustomerClear,
  addDimensionRow,
  removeDimensionRow,
  addChargeLine,
  removeChargeLine,
  getRowCbm,
  getRowVolumetricWeight,
  getRowLdm,
  getChargeSellTotal,
  onConditionsPresetChange,
  onBrowseQuotes,
  onFindQuote,
  onSave,
  onCancel,
} = useQuoteCreatePage()
</script>
