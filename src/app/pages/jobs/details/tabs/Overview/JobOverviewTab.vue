<script setup lang="ts">
import "./JobOverviewTab.css"
import { inject } from "vue"

import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Textarea from "primevue/textarea"

import type { JobDetailsContext } from "../../JobDetailsPage.logic"

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobOverviewTab must be used inside JobDetailsPage.")
}

const { form, referenceOptions, loading } = context

const {
  serviceTypeOptions,
  incotermOptions,
  currencyOptions,
  commodityTypeOptions,
  insuranceLevelOptions,
} = referenceOptions

const hazardousOptions = [
  { label: "No", value: "No" },
  { label: "Yes – ADR/IMDG", value: "Yes – ADR/IMDG" },
]

const temperatureOptions = [
  { label: "No", value: "No" },
  { label: "Chilled (2–8°C)", value: "Chilled (2–8°C)" },
  { label: "Frozen (-18°C)", value: "Frozen (-18°C)" },
  { label: "Ambient Controlled", value: "Ambient Controlled" },
]
</script>

<template>
  <section class="job-overview-tab">
    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Job Information</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Service Type</span>

          <Dropdown
            v-model="form.service_type"
            :options="serviceTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            show-clear
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Incoterms</span>

          <Dropdown
            v-model="form.incoterms"
            :options="incotermOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            show-clear
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Currency</span>

          <Dropdown
            v-model="form.currency"
            :options="currencyOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            show-clear
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Declared Value</span>

          <InputNumber
            v-model="form.declared_value"
            mode="decimal"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            placeholder="0.00"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field job-overview-tab__field--span-2">
          <span>Description of Goods</span>

          <InputText
            v-model="form.description_of_goods"
            placeholder="General cargo / machinery / palletised goods..."
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Commodity Type</span>

          <Dropdown
            v-model="form.commodity_code"
            :options="commodityTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            show-clear
            filter
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Insurance Level</span>

          <Dropdown
            v-model="form.insurance_level"
            :options="insuranceLevelOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            show-clear
            :disabled="loading"
          />
        </label>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Customer & References</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Customer PO Number</span>

          <InputText
            v-model="form.customer_po_number"
            placeholder="Purchase order ref"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Customer Booking Ref</span>

          <InputText
            v-model="form.customer_booking_ref"
            placeholder="Booking reference"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Our Reference</span>

          <InputText v-model="form.our_reference" placeholder="Internal ref" :disabled="loading" />
        </label>

        <label class="job-overview-tab__field">
          <span>Supplier Ref</span>

          <InputText
            v-model="form.supplier_ref"
            placeholder="Haulier / carrier ref"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Name</span>

          <InputText
            v-model="form.consignee_name"
            placeholder="Recipient company"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Contact</span>

          <InputText
            v-model="form.consignee_contact"
            placeholder="Contact name"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Phone</span>

          <InputText v-model="form.consignee_phone" placeholder="+44 ..." :disabled="loading" />
        </label>

        <label class="job-overview-tab__field">
          <span>Consignee Email</span>

          <InputText
            v-model="form.consignee_email"
            placeholder="email@example.com"
            :disabled="loading"
          />
        </label>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Special Requirements</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Hazardous?</span>

          <Dropdown
            :options="hazardousOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>ADR / Hazmat Class</span>

          <InputText placeholder="e.g. Class 3" :disabled="loading" />
        </label>

        <label class="job-overview-tab__field">
          <span>UN Number</span>

          <InputText placeholder="UN1234" :disabled="loading" />
        </label>

        <label class="job-overview-tab__field">
          <span>Temperature Controlled?</span>

          <Dropdown
            :options="temperatureOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field job-overview-tab__field--span-4">
          <span>Special Instructions / Notes</span>

          <Textarea
            v-model="form.note"
            rows="4"
            placeholder="Temperature requirements, handling notes, access restrictions..."
            :disabled="loading"
          />
        </label>
      </div>
    </div>
  </section>
</template>
