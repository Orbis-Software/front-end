<template>
  <div class="quote-page">
    <div class="quote-top">
      <div class="quote-title">
        <i class="pi pi-file-edit" />
        <span>Quotation Page</span>
      </div>

      <div class="quote-actions">
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
        title="Select a Quote Type"
        badge="NEW QUOTES"
        subtitle="Choose what you want to create"
      />
      <QuoteTypeSelector :items="QUOTE_TYPES" :selected="quoteType" @select="selectQuoteType" />
    </section>

    <section v-if="quoteType && showModeSelector" class="card section">
      <QuoteStepHeader
        :title="`Mode of Transport for ${quoteTypeLabel}`"
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
        subtitle="Customer, reference, dates, and quotation details"
      />

      <div class="grid-3">
        <div class="field">
          <label class="label">Customer Name</label>
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
          <label class="label">Contact Person</label>
          <InputText v-model="form.contact_person" class="control" placeholder="Contact person" />
        </div>
      </div>

      <div class="grid-3" style="margin-top: 12px">
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
      </div>

      <div class="grid-3" style="margin-top: 12px">
        <div class="field">
          <label class="label">Quote Type</label>
          <InputText :modelValue="quoteTypeLabel" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">
            {{ showModeSelector ? "Mode of Transport" : "Mode / Type" }}
          </label>
          <InputText :modelValue="modeLabel || quoteTypeLabel" class="control" readonly />
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
      </div>
    </section>

    <section v-if="canShowForm" class="card section">
      <QuoteStepHeader title="Shipment Summary" subtitle="Main routing and shipment details" />

      <div class="grid-3">
        <div class="field">
          <label class="label">Origin</label>
          <InputText v-model="form.origin" class="control" placeholder="Origin" />
        </div>

        <div class="field">
          <label class="label">Destination</label>
          <InputText v-model="form.destination" class="control" placeholder="Destination" />
        </div>

        <div class="field">
          <label class="label">Incoterm</label>
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

      <div class="grid-3" style="margin-top: 12px">
        <div class="field">
          <label class="label">No. of Pieces</label>
          <InputNumber v-model="form.pieces" class="control" inputClass="control" />
        </div>

        <div class="field">
          <label class="label">Weight</label>
          <InputNumber v-model="form.weight" class="control" inputClass="control" />
        </div>

        <div class="field">
          <label class="label">Volume</label>
          <InputNumber v-model="form.volume" class="control" inputClass="control" />
        </div>
      </div>

      <div class="grid-3" style="margin-top: 12px">
        <div class="field">
          <label class="label">Commodity</label>
          <InputText v-model="form.commodity" class="control" placeholder="Commodity" />
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
    </section>

    <div v-if="canShowForm" class="two-col">
      <section class="card section">
        <QuoteStepHeader
          title="Goods Details & Charges"
          subtitle="Description, notes, and quotation values"
        />

        <div class="grid-3">
          <div class="field" style="grid-column: 1 / -1">
            <label class="label">Description of Goods</label>
            <Textarea
              v-model="form.goods_description"
              class="control textarea"
              placeholder="Describe the goods..."
              autoResize
            />
          </div>
        </div>

        <div class="grid-3" style="margin-top: 12px">
          <div class="field">
            <label class="label">Sell Rate</label>
            <InputNumber
              v-model="form.sell_rate"
              class="control"
              inputClass="control"
              mode="decimal"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>

          <div class="field">
            <label class="label">Cost Rate</label>
            <InputNumber
              v-model="form.cost_rate"
              class="control"
              inputClass="control"
              mode="decimal"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>

          <div class="field">
            <label class="label">Markup %</label>
            <InputNumber
              v-model="form.markup_percent"
              class="control"
              inputClass="control"
              mode="decimal"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>
        </div>

        <div class="grid-3" style="margin-top: 12px">
          <div class="field">
            <label class="label">Subtotal</label>
            <InputText :modelValue="subtotalDisplay" class="control" readonly />
          </div>

          <div class="field">
            <label class="label">Profit</label>
            <InputText :modelValue="profitDisplay" class="control" readonly />
          </div>

          <div class="field">
            <label class="label">Total</label>
            <InputText :modelValue="totalDisplay" class="control" readonly />
          </div>
        </div>

        <div class="grid-3" style="margin-top: 12px">
          <div class="field" style="grid-column: 1 / -1">
            <label class="label">Internal Notes</label>
            <Textarea
              v-model="form.note"
              class="control textarea"
              placeholder="Internal notes, pricing notes, follow-up notes..."
              autoResize
            />
          </div>
        </div>
      </section>

      <section class="card section actions">
        <Button class="create-btn orbis-primary" type="button" @click="onSave">
          <i class="pi pi-file" style="margin-right: 8px" />
          Create Quote
        </Button>

        <button class="cancel-link" type="button" @click="onCancel">
          <i class="pi pi-times" style="margin-right: 6px" />
          Cancel
        </button>
      </section>
    </div>
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
  selectQuoteType,
  selectMode,

  form,
  selectedCustomer,
  customerSuggestions,
  customerOptionLabel,
  accountNumberPreview,

  currencyOptions,
  incotermOptions,

  subtotalDisplay,
  profitDisplay,
  totalDisplay,

  onCustomerComplete,
  onCustomerSelect,
  onCustomerClear,
  onBrowseQuotes,
  onFindQuote,
  onSave,
  onCancel,
} = useQuoteCreatePage()
</script>
