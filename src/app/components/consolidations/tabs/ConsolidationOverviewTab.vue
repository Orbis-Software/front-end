<script setup lang="ts">
import Calendar from "primevue/calendar"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import type { ConsolidationPageContext } from "@/app/components/consolidations/ConsolidationPageContext"

const { context } = defineProps<{ context: ConsolidationPageContext }>()

const {
  calendarDate,
  consolidatedTotalsMap,
  currencyOptions,
  customerInvoiceTotal,
  deliveryAddressOptions,
  domesticTotal,
  exportTotal,
  formatCurrencyTotals,
  hasAdr,
  incotermOptions,
  jobNumberAuto,
  jobNumberPlaceholder,
  jobNumberUsesSystem,
  modeOptions,
  money,
  overview,
  packageBreakdown,
  setOverviewDate,
  setTransportDate,
  shipFromOptions,
  supplierTotalsMap,
  transport,
  transportFieldInputType,
  transportFieldOptions,
  transportFieldPlaceholder,
  transportFields,
} = context
</script>

<template>
  <section class="consolidation-section">
    <div class="consolidation-section__head">
      <div>
        <h2>Overview</h2>
        <p>Job header, shipment terms, parties, customs and transport details.</p>
      </div>
    </div>

    <div class="consolidation-form-grid consolidation-form-grid--three">
      <label class="consolidation-field">
        <span>Job Number</span>
        <InputText
          v-model="overview.jobNo"
          :readonly="jobNumberUsesSystem"
          :placeholder="jobNumberPlaceholder"
          @input="jobNumberAuto = false"
        />
      </label>
      <label class="consolidation-field">
        <span>Job Date</span>
        <Calendar
          :model-value="calendarDate(overview.jobDate)"
          date-format="dd/mm/yy"
          placeholder="dd/mm/yyyy"
          show-icon
          show-button-bar
          :manual-input="false"
          @update:model-value="setOverviewDate('jobDate', $event)"
        />
      </label>
      <label class="consolidation-field">
        <span>Mode of Transport</span>
        <Dropdown
          v-model="overview.mode"
          :options="modeOptions"
          option-label="label"
          option-value="value"
        />
      </label>
      <label class="consolidation-field">
        <span>Invoice Currency</span>
        <Dropdown
          v-model="overview.invoiceCurrency"
          :options="currencyOptions"
          option-label="label"
          option-value="value"
        />
      </label>
      <label class="consolidation-field">
        <span>Ship Date</span>
        <Calendar
          :model-value="calendarDate(overview.shipDate)"
          date-format="dd/mm/yy"
          placeholder="dd/mm/yyyy"
          show-icon
          show-button-bar
          :manual-input="false"
          @update:model-value="setOverviewDate('shipDate', $event)"
        />
      </label>
      <label class="consolidation-field">
        <span>Ship From</span>
        <Dropdown
          v-model="overview.shipFrom"
          :options="shipFromOptions"
          option-label="label"
          option-value="value"
          placeholder="Select city"
          filter
          filter-by="label,value,subLabel,searchText"
        >
          <template #option="{ option }">
            <div class="consolidation-reference-option">
              <strong>{{ option.label }}</strong>
              <small v-if="option.subLabel">{{ option.subLabel }}</small>
            </div>
          </template>
        </Dropdown>
      </label>
      <label class="consolidation-field">
        <span>Exit Incoterm</span>
        <Dropdown
          v-model="overview.exitIncoterm"
          :options="incotermOptions"
          option-label="label"
          option-value="value"
          placeholder="Select incoterm"
          show-clear
        />
      </label>
      <label class="consolidation-field">
        <span>Entry Incoterm</span>
        <Dropdown
          v-model="overview.entryIncoterm"
          :options="incotermOptions"
          option-label="label"
          option-value="value"
          placeholder="Select incoterm"
          show-clear
        />
      </label>
      <label class="consolidation-field">
        <span>ADR</span>
        <InputText :model-value="hasAdr ? 'Yes' : 'No'" readonly :class="{ 'adr-yes': hasAdr }" />
      </label>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Parties and Delivery</div>
      <div class="consolidation-form-grid consolidation-form-grid--two">
        <label class="consolidation-field">
          <span>Customer if different from Job Customer</span>
          <InputText v-model="overview.customer" placeholder="Optional customer override" />
        </label>
        <label class="consolidation-field">
          <span>Notify Party</span>
          <InputText v-model="overview.notifyParty" />
        </label>
        <label class="consolidation-field">
          <span>Shipper</span>
          <InputText v-model="overview.shipper" />
        </label>
        <label class="consolidation-field">
          <span>Delivery Address</span>
          <Dropdown
            v-model="overview.deliveryAddress"
            :options="deliveryAddressOptions"
            option-label="label"
            option-value="value"
            placeholder="Select delivery address"
            editable
            filter
            show-clear
            filter-by="label,value,subLabel,searchText"
          >
            <template #option="{ option }">
              <div class="consolidation-reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>
      </div>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Customs and Goods</div>
      <div class="consolidation-form-grid consolidation-form-grid--two">
        <label class="consolidation-field">
          <span>Goods Description</span>
          <Textarea v-model="overview.goodsDescription" rows="3" />
        </label>
        <label class="consolidation-field">
          <span>Special Instructions</span>
          <Textarea v-model="overview.instructions" rows="3" />
        </label>
        <label class="consolidation-field">
          <span>Export Customs Ref</span>
          <InputText v-model="overview.exportCustomsRef" />
        </label>
        <label class="consolidation-field">
          <span>Import Customs Ref</span>
          <InputText v-model="overview.importCustomsRef" />
        </label>
      </div>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">{{ overview.mode }} Transport Details</div>
      <div class="consolidation-form-grid consolidation-form-grid--three">
        <label v-for="field in transportFields" :key="field.key" class="consolidation-field">
          <span>{{ field.label }}</span>
          <Calendar
            v-if="transportFieldInputType(field.key) === 'calendar'"
            :model-value="calendarDate(transport[field.key])"
            date-format="dd/mm/yy"
            placeholder="dd/mm/yyyy"
            show-icon
            show-button-bar
            :manual-input="false"
            @update:model-value="setTransportDate(field.key, $event)"
          />
          <Dropdown
            v-else-if="
              transportFieldInputType(field.key) === 'location' ||
              transportFieldInputType(field.key) === 'dropdown'
            "
            v-model="transport[field.key]"
            :options="transportFieldOptions(field.key)"
            option-label="label"
            option-value="value"
            :placeholder="transportFieldPlaceholder(field.key)"
            filter
            show-clear
            filter-by="label,value,subLabel,searchText"
          >
            <template #option="{ option }">
              <div class="consolidation-reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
          <InputText v-else v-model="transport[field.key]" />
        </label>
      </div>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Consolidation Summary</div>
      <div class="consolidation-page__summary-row consolidation-page__summary-row--five">
        <article>
          <span>Supplier Cost</span><strong>{{ formatCurrencyTotals(supplierTotalsMap) }}</strong>
        </article>
        <article>
          <span>Commercial Invoice</span
          ><strong>{{ formatCurrencyTotals(consolidatedTotalsMap) }}</strong>
        </article>
        <article>
          <span>Customer Invoice</span><strong>{{ money("GBP", customerInvoiceTotal) }}</strong>
        </article>
        <article>
          <span>Margin</span
          ><strong>{{ money("GBP", customerInvoiceTotal - domesticTotal - exportTotal) }}</strong>
        </article>
        <article><span>Status</span><strong>Draft</strong></article>
      </div>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Total Number of Packages</div>
      <div class="consolidation-page__summary-row">
        <article>
          <span>Crates</span><strong>{{ packageBreakdown.crates }}</strong>
        </article>
        <article>
          <span>Pallets</span><strong>{{ packageBreakdown.pallets }}</strong>
        </article>
        <article>
          <span>Cartons / Boxes</span><strong>{{ packageBreakdown.cartons }}</strong>
        </article>
        <article>
          <span>Jiffy Bags</span><strong>{{ packageBreakdown.jiffies }}</strong>
        </article>
      </div>
    </div>

    <div class="consolidation-subsection">
      <div class="consolidation-subsection__title">Total Weight and Loading Meters</div>
      <div class="consolidation-page__summary-row">
        <article>
          <span>Total Net Weight</span><strong>{{ packageBreakdown.net.toFixed(1) }} kg</strong>
        </article>
        <article>
          <span>Total Gross Weight</span><strong>{{ packageBreakdown.gross.toFixed(1) }} kg</strong>
        </article>
        <article>
          <span>Total CBM</span><strong>{{ packageBreakdown.cbm.toFixed(3) }}</strong>
        </article>
        <article>
          <span>Total LDM</span><strong>{{ packageBreakdown.ldm.toFixed(3) }}</strong>
        </article>
      </div>
    </div>
  </section>
</template>
