<script setup lang="ts">
import "./JobOverviewTab.css"
import { computed, inject, ref } from "vue"

import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Textarea from "primevue/textarea"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import InputSwitch from "primevue/inputswitch"

import type { JobDetailsContext } from "../../JobDetailsPage.logic"
import JobTransportAddressModal from "@/app/components/jobs/details/JobTransportTab/JobTransportAddressModal.vue"
import DestinationAddressPickerModal from "@/app/components/jobs/details/DestinationAddressPickerModal.vue"
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
  addressContactOptions,
  originAddressSelection,
  destinationAddressSelection,
  addressModalVisible,
  addressModalTarget,
  addressModalSaving,
  addressModalCustomerId,
  addressModalCustomerName,
  isConsolidationJob,
  selectedOriginAddress,
  selectedDestinationAddress,
  selectedDestinationContactId,
  destinationAddressOwner,
  destinationCustomerOptions,
  selectedCustomerName,
  addressContactsLoading,
  openAddressModal,
  createAndSelectAddress,
  selectAddressSource,
  onAddressContactFilter,
  selectDestinationCustomer,
  setDestinationAddressOwner,
  setAddressModalCustomer,
} = context

const destinationAddressModalVisible = ref(false)
const destinationAddressSelectionLabel = computed(() => {
  return (
    destinationAddressOptions.value.find(
      (option: { value: string; label: string }) =>
        option.value === destinationAddressSelection.value,
    )?.label ?? "No destination address selected"
  )
})

function openDestinationAddressModal() {
  destinationAddressModalVisible.value = true

  if (
    destinationAddressOwner.value === "selected_customer" &&
    !selectedDestinationContactId.value &&
    form.customer_id
  ) {
    void selectDestinationCustomer(Number(form.customer_id))
  } else if (
    destinationAddressOwner.value === "other_customer" &&
    selectedDestinationContactId.value
  ) {
    void selectDestinationCustomer(Number(selectedDestinationContactId.value))
  }
}

const {
  serviceTypeOptions,
  incotermOptions,
  currencyOptions,
  commodityTypeOptions,
  insuranceLevelOptions,
  dangerousGoodsOptions,
  roadLocalCollectionTypeOptions: localCollectionTypeOptions,
  roadServiceLevelOptions: localServiceLevelOptions,
  roadLoadTypeOptions: loadTypeOptions,
  vehicleTypeOptions: localVehicleOptions,
  palletTypeOptions,
  podMethodOptions,
  temperatureRequirementOptions: temperatureOptions,
} = referenceOptions

const isRoadMode = computed(() => form.mode_of_transport === "road")
const roadOrderTypes = [
  {
    label: "Local Collection",
    value: "Local Collection",
    icon: "pi pi-clock",
    description: "Short-distance collection and delivery. Usually same-day or next-day.",
  },
  {
    label: "Full Transport Order",
    value: "Full Transport Order",
    icon: "pi pi-truck",
    description: "Longer road freight with carrier, load, delivery and optional customs detail.",
  },
]
const shipmentReferenceLabel = computed(() => {
  if (form.mode_of_transport === "road") return "CMR Ref:"
  if (form.mode_of_transport === "air") return "AWB Ref:"
  if (form.mode_of_transport === "sea") return "BL Ref:"
  if (form.mode_of_transport === "rail") return "SMGS Ref:"

  return "Shipment Ref:"
})
const showShipmentReference = computed(() => {
  return ["road", "air", "sea", "rail"].includes(String(form.mode_of_transport ?? ""))
})
const defaultCmrNumber = computed(() => {
  const digits = String(form.job_number ?? "").replace(/\D+/g, "")

  return digits ? digits.slice(-4).padStart(4, "0") : ""
})
const shipmentReferenceValue = computed({
  get: () =>
    isRoadMode.value ? (form.road_detail.cmr_number ?? "") : (form.consignment_number ?? ""),
  set: value => {
    if (isRoadMode.value) {
      form.road_detail.cmr_number = value
      return
    }

    form.consignment_number = value
  },
})
const cmrPlaceholder = computed(() =>
  defaultCmrNumber.value
    ? `Auto ${defaultCmrNumber.value}, or enter seller/haulier CMR`
    : "Enter seller/haulier CMR",
)
const shipmentReferencePlaceholder = computed(() =>
  isRoadMode.value ? cmrPlaceholder.value : "Shipment reference",
)
const declaredValueMode = computed(() => (form.currency ? "currency" : "decimal"))
const declaredValueCurrency = computed(() => form.currency || "GBP")
const hazardousEnabled = computed({
  get: () => Boolean(form.is_hazardous),
  set: value => {
    form.is_hazardous = value

    if (!value) {
      form.hazardous_class = ""
      form.un_number = ""
    }
  },
})
const commodityTypeText = computed(() => String(form.commodity_code ?? "").toLowerCase())
const fragileCommodity = computed(() => commodityTypeText.value.includes("fragile"))
const temperatureControlledCommodity = computed(() =>
  commodityTypeText.value.includes("temperature"),
)
const perishableCommodity = computed(() => commodityTypeText.value.includes("perishable"))
const specialRequirementsVisible = computed(
  () =>
    hazardousEnabled.value ||
    fragileCommodity.value ||
    temperatureControlledCommodity.value ||
    perishableCommodity.value,
)

const hazardousOptions = [
  { label: "No", value: false },
  { label: "Yes - ADR/IMDG", value: true },
]

const yesNoOptions = [
  { label: "No", value: false },
  { label: "Yes", value: true },
]

const localMileageCost = computed(() => {
  const distance = Number(form.road_detail.local_estimated_distance_miles ?? 0)
  const rate = Number(form.road_detail.local_rate_per_mile ?? 0)
  const cost = distance * rate

  return cost > 0 ? Number(cost.toFixed(2)) : null
})

function setOrderType(value: string): void {
  form.order_type = value
  form.road_detail.order_type = value
}

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
        <label v-if="showShipmentReference" class="job-overview-tab__field">
          <span>{{ shipmentReferenceLabel }}</span>

          <InputText
            v-model="shipmentReferenceValue"
            :placeholder="shipmentReferencePlaceholder"
            :disabled="loading"
          />
        </label>

        <label v-if="false" class="job-overview-tab__field">
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
          <span>Shipment Currency</span>

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
            :mode="declaredValueMode"
            :currency="declaredValueCurrency"
            locale="en-GB"
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

        <label v-if="isRoadMode" class="job-overview-tab__field">
          <span>Commodity Code (HS)</span>

          <InputText v-model="form.hs_code" placeholder="e.g. 8471.30" :disabled="loading" />
        </label>
      </div>
    </div>

    <div class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Customer & References</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Customer Ref</span>

          <InputText
            v-model="form.customer_po_number"
            placeholder="Customer reference / PO"
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
      <header
        class="job-overview-tab__section-header job-overview-tab__section-header--with-control"
      >
        <h2>Special Requirements</h2>

        <label class="job-overview-tab__header-switch">
          <span>Hazardous</span>
          <InputSwitch v-model="hazardousEnabled" :disabled="loading" />
        </label>
      </header>

      <div
        v-if="specialRequirementsVisible"
        class="job-overview-tab__grid job-overview-tab__grid--4"
      >
        <label v-if="hazardousEnabled" class="job-overview-tab__field">
          <span>ADR / Hazmat Class</span>

          <Dropdown
            v-model="form.hazardous_class"
            :options="dangerousGoodsOptions"
            option-label="label"
            option-value="value"
            placeholder="Select dangerous goods class"
            show-clear
            filter
            :disabled="loading"
          />
        </label>

        <label v-if="hazardousEnabled" class="job-overview-tab__field">
          <span>UN Number</span>

          <InputText v-model="form.un_number" placeholder="UN1234" :disabled="loading" />
        </label>

        <label
          v-if="hazardousEnabled || temperatureControlledCommodity"
          class="job-overview-tab__field"
        >
          <span>Temperature Controlled?</span>

          <Dropdown
            v-model="form.temperature_requirement"
            :options="temperatureOptions"
            option-label="label"
            option-value="value"
            placeholder="Select"
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

    <div v-if="false" class="job-overview-tab__section">
      <header class="job-overview-tab__section-header job-overview-tab__section-header--with-note">
        <div>
          <h2>Order Type</h2>
          <p>Select the type of order to reveal the relevant fields below</p>
        </div>
      </header>

      <div class="job-overview-tab__order-type">
        <button
          v-for="option in roadOrderTypes"
          :key="option.value"
          type="button"
          class="job-overview-tab__order-button"
          :class="{ 'job-overview-tab__order-button--active': form.order_type === option.value }"
          :disabled="loading"
          @click="setOrderType(option.value)"
        >
          <i :class="option.icon" />
          <span>{{ option.label }}</span>
          <small>{{ option.description }}</small>
        </button>
      </div>

      <div v-if="form.order_type === 'Local Collection'" class="job-overview-tab__order-panel">
        <div class="job-overview-tab__order-banner job-overview-tab__order-banner--local">
          <i class="pi pi-clock" />
          <span>
            <strong>Local Collection</strong>
            Short-distance, same-area collection and delivery. Typically same-day or next-day.
          </span>
        </div>

        <div class="job-overview-tab__grid job-overview-tab__grid--4">
          <label class="job-overview-tab__field">
            <span>Collection Type</span>
            <Dropdown
              v-model="form.road_detail.local_collection_type"
              :options="localCollectionTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select collection type"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Priority / Service Level</span>
            <Dropdown
              v-model="form.road_detail.local_service_level"
              :options="localServiceLevelOptions"
              option-label="label"
              option-value="value"
              placeholder="Select service level"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Vehicle Required</span>
            <Dropdown
              v-model="form.road_detail.local_vehicle_required"
              :options="localVehicleOptions"
              option-label="label"
              option-value="value"
              placeholder="Select vehicle"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Zone / Area</span>
            <InputText
              v-model="form.road_detail.local_zone_area"
              placeholder="e.g. London Zone 1, M60 Corridor"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Est. Distance (miles)</span>
            <InputNumber
              v-model="form.road_detail.local_estimated_distance_miles"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="1"
              placeholder="0"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Est. Duration (hrs)</span>
            <InputNumber
              v-model="form.road_detail.local_estimated_duration_hours"
              :min="0"
              :step="0.25"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              placeholder="0.0"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Rate per Mile (GBP)</span>
            <InputNumber
              v-model="form.road_detail.local_rate_per_mile"
              mode="currency"
              currency="GBP"
              locale="en-GB"
              :min="0"
              placeholder="0.00"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Estimated Mileage Cost</span>
            <InputNumber
              :model-value="localMileageCost"
              mode="currency"
              currency="GBP"
              locale="en-GB"
              placeholder="Auto-calculated"
              disabled
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Round Trip?</span>
            <Dropdown
              v-model="form.road_detail.local_round_trip"
              :options="yesNoOptions"
              option-label="label"
              option-value="value"
              placeholder="Select"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Signature Required?</span>
            <Dropdown
              v-model="form.road_detail.local_signature_required"
              :options="yesNoOptions"
              option-label="label"
              option-value="value"
              placeholder="Select"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>POD Method</span>
            <Dropdown
              v-model="form.road_detail.local_pod_method"
              :options="podMethodOptions"
              option-label="label"
              option-value="value"
              placeholder="Select POD method"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Parking / Access Code</span>
            <InputText
              v-model="form.road_detail.local_parking_access_code"
              placeholder="e.g. barrier code, bay number"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Time Critical?</span>
            <Dropdown
              v-model="form.road_detail.local_time_critical"
              :options="yesNoOptions"
              option-label="label"
              option-value="value"
              placeholder="Select"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Exact Delivery Time</span>
            <InputText
              v-model="form.road_detail.local_exact_delivery_time"
              type="time"
              placeholder="hh:mm"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Driver Assigned</span>
            <InputText
              v-model="form.road_detail.local_driver_assigned"
              placeholder="Driver name / ID"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Driver Mobile</span>
            <InputText
              v-model="form.road_detail.local_driver_mobile"
              type="tel"
              placeholder="+44 ..."
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field job-overview-tab__field--span-4">
            <span>Local Collection Notes</span>
            <Textarea
              v-model="form.road_detail.local_collection_notes"
              rows="3"
              placeholder="Safe place instructions, access codes, return address if undelivered..."
              :disabled="loading"
            />
          </label>
        </div>
      </div>

      <div
        v-else-if="form.order_type === 'Full Transport Order'"
        class="job-overview-tab__order-panel"
      >
        <div class="job-overview-tab__order-banner job-overview-tab__order-banner--transport">
          <i class="pi pi-truck" />
          <span>
            <strong>Full Transport Order</strong>
            Long-distance road freight with carrier, load, delivery and optional customs detail.
          </span>
        </div>

        <div class="job-overview-tab__grid job-overview-tab__grid--4">
          <label class="job-overview-tab__field">
            <span>Load Type</span>
            <Dropdown
              v-model="form.road_detail.full_load_type"
              :options="loadTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select load type"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Est. Transit Days</span>
            <InputNumber
              v-model="form.road_detail.estimated_transit_days"
              :min="0"
              placeholder="0"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Est. Distance (km)</span>
            <InputNumber
              v-model="form.road_detail.estimated_distance_km"
              :min="0"
              placeholder="0"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Load Plan Ref</span>
            <InputText
              v-model="form.road_detail.full_load_plan_ref"
              placeholder="Load plan / manifest ref"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Pallet Spaces Required</span>
            <InputNumber
              v-model="form.road_detail.pallet_spaces"
              :min="0"
              placeholder="0"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Pallet Type</span>
            <Dropdown
              v-model="form.road_detail.pallet_type"
              :options="palletTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select pallet type"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Max Stack Height (cm)</span>
            <InputNumber
              v-model="form.road_detail.full_max_stack_height_cm"
              :min="0"
              placeholder="220"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Multi-Drop?</span>
            <Dropdown
              v-model="form.road_detail.full_multi_drop"
              :options="yesNoOptions"
              option-label="label"
              option-value="value"
              placeholder="Select"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Customs Required?</span>
            <Dropdown
              v-model="form.road_detail.full_customs_required"
              :options="yesNoOptions"
              option-label="label"
              option-value="value"
              placeholder="Select"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Haulier Used?</span>
            <Dropdown
              v-model="form.road_detail.full_subcontractor_used"
              :options="yesNoOptions"
              option-label="label"
              option-value="value"
              placeholder="Select"
              show-clear
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Carrier / Haulier</span>
            <InputText
              v-model="form.road_detail.carrier"
              placeholder="Carrier name"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Driver Name</span>
            <InputText
              v-model="form.road_detail.driver_name"
              placeholder="Driver full name"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Driver Mobile</span>
            <InputText
              v-model="form.road_detail.driver_mobile"
              type="tel"
              placeholder="+44 ..."
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Vehicle Registration</span>
            <InputText
              v-model="form.road_detail.full_vehicle_registration"
              placeholder="AB12 CDE"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Trailer / Container No.</span>
            <InputText
              v-model="form.road_detail.trailer_number"
              placeholder="Trailer number"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Seal Number</span>
            <InputText
              v-model="form.road_detail.full_seal_number"
              placeholder="Seal no."
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>CMR / Waybill No.</span>
            <InputText
              v-model="form.road_detail.cmr_number"
              :placeholder="cmrPlaceholder"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>Route / Via</span>
            <InputText
              v-model="form.road_detail.full_route_via"
              placeholder="e.g. UK > BE > DE"
              :disabled="loading"
            />
          </label>

          <label class="job-overview-tab__field">
            <span>POD Method</span>
            <Dropdown
              v-model="form.road_detail.pod_method"
              :options="podMethodOptions"
              option-label="label"
              option-value="value"
              placeholder="Select POD method"
              show-clear
              :disabled="loading"
            />
          </label>
        </div>
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
              :model-value="originAddressSelection"
              :options="originAddressOptions"
              option-label="label"
              option-value="value"
              placeholder="Select origin"
              show-clear
              append-to="body"
              :disabled="loading"
              @update:model-value="(value: string | null) => selectAddressSource('origin', value)"
            />

            <Button
              icon="pi pi-plus"
              label="NEW"
              :disabled="
                loading ||
                !form.customer_id ||
                (destinationAddressOwner === 'other_customer' && !selectedDestinationContactId)
              "
              type="button"
              @click="openAddressModal('origin')"
            />
          </div>
        </div>

        <div class="job-overview-tab__field">
          <span>Destination Address</span>

          <div
            class="job-overview-tab__address-select job-overview-tab__address-select--destination"
          >
            <InputText :model-value="destinationAddressSelectionLabel" readonly />

            <Button
              icon="pi pi-map-marker"
              label="CHOOSE"
              :disabled="loading || !form.customer_id"
              type="button"
              @click="openDestinationAddressModal"
            />

            <Button
              icon="pi pi-plus"
              label="NEW"
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
              <span>Ready Time</span>

              <InputText
                v-model="form.collection_time"
                type="time"
                placeholder="hh:mm"
                :disabled="loading"
              />
            </label>

            <label v-if="isRoadMode" class="job-overview-tab__field">
              <span>Latest Collection</span>

              <InputText
                v-model="form.latest_collection_time"
                type="time"
                placeholder="hh:mm"
                :disabled="loading"
              />
            </label>

            <label v-if="isRoadMode" class="job-overview-tab__field">
              <span>Loading Ref / Bay</span>

              <InputText
                v-model="form.loading_reference"
                placeholder="Dock / bay ref"
                :disabled="loading"
              />
            </label>

            <label
              v-if="isRoadMode"
              class="job-overview-tab__field job-overview-tab__field--span-2"
            >
              <span>Collection Instructions</span>

              <Textarea
                v-model="form.collection_instructions"
                rows="3"
                placeholder="Access codes, parking, dock height, forklift availability..."
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

          <div class="job-overview-tab__schedule-grid">
            <label v-if="isRoadMode" class="job-overview-tab__field">
              <span>Delivery Date</span>

              <Calendar
                v-model="form.delivery_date"
                date-format="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                showIcon
                :disabled="loading"
              />
            </label>

            <label v-if="isRoadMode" class="job-overview-tab__field">
              <span>Delivery From</span>

              <InputText
                v-model="form.delivery_from_time"
                type="time"
                placeholder="hh:mm"
                :disabled="loading"
              />
            </label>

            <label v-if="isRoadMode" class="job-overview-tab__field">
              <span>Delivery By</span>

              <InputText
                v-model="form.delivery_by_time"
                type="time"
                placeholder="hh:mm"
                :disabled="loading"
              />
            </label>

            <label v-if="isRoadMode" class="job-overview-tab__field">
              <span>Delivery Booking Ref</span>

              <InputText
                v-model="form.delivery_booking_ref"
                placeholder="Booking / delivery ref"
                :disabled="loading"
              />
            </label>

            <label
              v-if="isRoadMode"
              class="job-overview-tab__field job-overview-tab__field--span-2"
            >
              <span>Delivery Instructions</span>

              <Textarea
                v-model="form.delivery_instructions"
                rows="3"
                placeholder="Access codes, parking, unloading notes, POD requirements..."
                :disabled="loading"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="false" class="job-overview-tab__section">
      <header class="job-overview-tab__section-header">
        <h2>Special Requirements</h2>
      </header>

      <div class="job-overview-tab__grid job-overview-tab__grid--4">
        <label class="job-overview-tab__field">
          <span>Hazardous?</span>

          <Dropdown
            v-model="form.is_hazardous"
            :options="hazardousOptions"
            option-label="label"
            option-value="value"
            placeholder="— Select —"
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>ADR / Hazmat Class</span>

          <Dropdown
            v-model="form.hazardous_class"
            :options="dangerousGoodsOptions"
            option-label="label"
            option-value="value"
            placeholder="Select dangerous goods class"
            show-clear
            filter
            :disabled="loading"
          />
        </label>

        <label class="job-overview-tab__field">
          <span>UN Number</span>

          <InputText v-model="form.un_number" placeholder="UN1234" :disabled="loading" />
        </label>

        <label class="job-overview-tab__field">
          <span>Temperature Controlled?</span>

          <Dropdown
            v-model="form.temperature_requirement"
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

    <DestinationAddressPickerModal
      v-model:visible="destinationAddressModalVisible"
      :owner="destinationAddressOwner"
      :selected-customer-name="selectedCustomerName"
      :other-customer-id="
        destinationAddressOwner === 'other_customer' ? selectedDestinationContactId : null
      "
      :customer-options="destinationCustomerOptions"
      :address-options="destinationAddressOptions"
      :address-value="destinationAddressSelection"
      :loading-customers="addressContactsLoading"
      :disabled="loading || !form.customer_id"
      @update:owner="setDestinationAddressOwner"
      @search-customers="query => onAddressContactFilter({ value: query })"
      @select-customer="selectDestinationCustomer"
      @select-address="value => selectAddressSource('destination', value)"
    />

    <JobTransportAddressModal
      v-model:visible="addressModalVisible"
      :target="addressModalTarget === 'origin' ? 'collection' : 'delivery'"
      :saving="addressModalSaving"
      :customer-id="addressModalCustomerId"
      :customer-name="addressModalCustomerName"
      :customer-options="addressContactOptions"
      :customer-loading="addressContactsLoading"
      @search-customers="query => onAddressContactFilter({ value: query })"
      @select-customer="setAddressModalCustomer"
      @save="createAndSelectAddress"
    />
  </section>
</template>
