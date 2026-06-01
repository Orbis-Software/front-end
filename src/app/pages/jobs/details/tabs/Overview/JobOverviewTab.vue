<script setup lang="ts">
import "./JobOverviewTab.css"
import { computed, inject } from "vue"

import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Textarea from "primevue/textarea"
import Button from "primevue/button"
import Calendar from "primevue/calendar"

import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import JobTransportAddressModal from "@/app/components/jobs/details/JobTransportTab/JobTransportAddressModal.vue"
import type { ContactCollectionAddress } from "@/app/types/contact"

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobOverviewTab must be used inside JobDetailsPage.")
}

const {
  form,
  referenceOptions,
  loading,
  originAddressOptions,
  destinationAddressOptions,
  addressModalVisible,
  addressModalTarget,
  addressModalSaving,
  isConsolidationJob,
  selectedOriginAddress,
  selectedDestinationAddress,
  openAddressModal,
  createAndSelectAddress,
} = context

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

function displayValue(value: string | number | null | undefined): string {
  const text = String(value ?? "").trim()

  return text || "—"
}

function addressLines(address: ContactCollectionAddress | null): string {
  if (!address) return "—"

  return (
    [address.address_line_1, address.address_line_2, address.address_line_3, address.county_state]
      .filter(Boolean)
      .join(", ") || "—"
  )
}

function contactLine(address: ContactCollectionAddress | null): string {
  if (!address) return "—"

  return [address.contact_person, address.phone].filter(Boolean).join(" / ") || "—"
}
const consolidationOverviewRows = computed(() => {
  const overview = form.consolidation_details.overview

  return [
    { label: "Consolidation Mode", value: overview.mode },
    { label: "Invoice Currency", value: overview.invoiceCurrency },
    { label: "Ship Date", value: overview.shipDate },
    { label: "Ship From", value: overview.shipFrom },
    { label: "Exit Incoterm", value: overview.exitIncoterm },
    { label: "Entry Incoterm", value: overview.entryIncoterm },
    { label: "Customer Override", value: overview.customer },
    { label: "Notify Party", value: overview.notifyParty },
    { label: "Shipper", value: overview.shipper },
    { label: "Delivery Address", value: overview.deliveryAddress },
    { label: "Export Customs Ref", value: overview.exportCustomsRef },
    { label: "Import Customs Ref", value: overview.importCustomsRef },
  ]
})

const consolidationTransportRows = computed(() => {
  const transport = form.consolidation_details.transport

  return [
    { label: "Transport Ref", value: transport.bookingRef },
    { label: "Carrier", value: transport.carrier },
    { label: "Origin", value: transport.originPort },
    { label: "Destination", value: transport.destinationPort },
    { label: "Final Destination", value: transport.finalDestination },
    { label: "ETD", value: transport.etd },
    { label: "ETA", value: transport.eta },
  ]
})
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

    <div v-if="isConsolidationJob" class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Consolidation Snapshot</h2>
      </header>

      <div class="job-overview-tab__route-details job-overview-tab__route-details--top">
        <div class="job-overview-tab__address-card">
          <h3>Shipment Details</h3>

          <dl>
            <div v-for="row in consolidationOverviewRows" :key="row.label">
              <dt>{{ row.label }}</dt>
              <dd>{{ displayValue(row.value) }}</dd>
            </div>
          </dl>
        </div>

        <div class="job-overview-tab__address-card">
          <h3>Transport Details</h3>

          <dl>
            <div v-for="row in consolidationTransportRows" :key="row.label">
              <dt>{{ row.label }}</dt>
              <dd>{{ displayValue(row.value) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="job-overview-tab__grid job-overview-tab__grid--2">
        <label class="job-overview-tab__field">
          <span>Goods Description</span>
          <Textarea
            :model-value="form.consolidation_details.overview.goodsDescription"
            rows="3"
            readonly
          />
        </label>

        <label class="job-overview-tab__field">
          <span>Special Instructions</span>
          <Textarea
            :model-value="form.consolidation_details.overview.instructions"
            rows="3"
            readonly
          />
        </label>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Origin & Destination</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--2">
        <div class="job-overview-tab__field">
          <span>Origin Address</span>

          <div class="job-overview-tab__address-select">
            <Dropdown
              v-model="form.origin_contact_collection_address_id"
              :options="originAddressOptions"
              option-label="label"
              option-value="value"
              placeholder="Select collection address"
              show-clear
              filter
              :disabled="loading || !form.customer_id"
            />

            <Button
              icon="pi pi-plus"
              label="New"
              :disabled="loading || !form.customer_id"
              type="button"
              @click="openAddressModal('origin')"
            />
          </div>
        </div>

        <div class="job-overview-tab__field">
          <span>Destination Address</span>

          <div class="job-overview-tab__address-select">
            <Dropdown
              v-model="form.destination_contact_collection_address_id"
              :options="destinationAddressOptions"
              option-label="label"
              option-value="value"
              placeholder="Select delivery address"
              show-clear
              filter
              :disabled="loading || !form.customer_id"
            />

            <Button
              icon="pi pi-plus"
              label="New"
              :disabled="loading || !form.customer_id"
              type="button"
              @click="openAddressModal('destination')"
            />
          </div>
        </div>
      </div>

      <div class="job-overview-tab__route-details">
        <div class="job-overview-tab__address-card">
          <h3>Origin Details</h3>

          <dl>
            <div>
              <dt>Company / Site</dt>
              <dd>{{ displayValue(selectedOriginAddress?.label) }}</dd>
            </div>

            <div>
              <dt>Warehouse / Depot Name</dt>
              <dd>{{ displayValue(selectedOriginAddress?.reference_code) }}</dd>
            </div>

            <div>
              <dt>Address</dt>
              <dd>{{ addressLines(selectedOriginAddress) }}</dd>
            </div>

            <div>
              <dt>City</dt>
              <dd>{{ displayValue(selectedOriginAddress?.city) }}</dd>
            </div>

            <div>
              <dt>Postcode</dt>
              <dd>{{ displayValue(selectedOriginAddress?.postal_code) }}</dd>
            </div>

            <div>
              <dt>Country</dt>
              <dd>{{ displayValue(selectedOriginAddress?.country_name) }}</dd>
            </div>

            <div>
              <dt>Contact</dt>
              <dd>{{ contactLine(selectedOriginAddress) }}</dd>
            </div>
          </dl>

          <div class="job-overview-tab__schedule-grid">
            <label class="job-overview-tab__field">
              <span>Collection Date</span>

              <Calendar
                v-model="form.collection_date"
                date-format="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                showIcon
                :disabled="loading"
              />
            </label>

            <label class="job-overview-tab__field">
              <span>Collection Time</span>

              <InputText
                v-model="form.collection_time"
                type="time"
                placeholder="hh:mm"
                :disabled="loading"
              />
            </label>
          </div>
        </div>

        <div class="job-overview-tab__address-card">
          <h3>Destination Details</h3>

          <dl>
            <div>
              <dt>Company / Site</dt>
              <dd>{{ displayValue(selectedDestinationAddress?.label) }}</dd>
            </div>

            <div>
              <dt>Warehouse / Depot Name</dt>
              <dd>{{ displayValue(selectedDestinationAddress?.reference_code) }}</dd>
            </div>

            <div>
              <dt>Address</dt>
              <dd>{{ addressLines(selectedDestinationAddress) }}</dd>
            </div>

            <div>
              <dt>City</dt>
              <dd>{{ displayValue(selectedDestinationAddress?.city) }}</dd>
            </div>

            <div>
              <dt>Postcode</dt>
              <dd>{{ displayValue(selectedDestinationAddress?.postal_code) }}</dd>
            </div>

            <div>
              <dt>Country</dt>
              <dd>{{ displayValue(selectedDestinationAddress?.country_name) }}</dd>
            </div>

            <div>
              <dt>Contact</dt>
              <dd>{{ contactLine(selectedDestinationAddress) }}</dd>
            </div>
          </dl>
        </div>
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

    <JobTransportAddressModal
      v-model:visible="addressModalVisible"
      :target="addressModalTarget === 'origin' ? 'collection' : 'delivery'"
      :saving="addressModalSaving"
      @save="createAndSelectAddress"
    />
  </section>
</template>
