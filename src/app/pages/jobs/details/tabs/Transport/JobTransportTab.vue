<script setup lang="ts">
import "./JobTransportTab.css"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputSwitch from "primevue/inputswitch"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import { useJobTransportTab } from "./JobTransportTab.logic"

const {
  form,
  mode,
  modeLabel,
  multiModalLegs,
  multiDropStops,
  airportOptions,
  seaportOptions,
  railTerminalOptions,
  roadTerminalOptions,
  cityOptions,
  referenceOptions,
  contactOptions,
  contactOptionsLoading,
  getLocationOptions,
  getOriginLabel,
  getDestinationLabel,
  onGlobalReferenceFilter,
  addLeg,
  removeLeg,
  addMultiDropStop,
  removeMultiDropStop,
  setBooleanDetail,
} = useJobTransportTab()

const {
  roadServiceTypeOptions: roadServiceOptions,
  roadLoadTypeOptions: loadTypeOptions,
  vehicleTypeOptions: roadVehicleOptions,
  palletTypeOptions,
  podMethodOptions,
} = referenceOptions

const legModeOptions = [
  { label: "Road", value: "road" },
  { label: "Rail", value: "rail" },
  { label: "Sea", value: "sea" },
  { label: "Air", value: "air" },
  { label: "Courier", value: "courier" },
]

const seaShipmentOptions = [
  "FCL - Full Container",
  "LCL - Less Than Container",
  "Breakbulk",
  "RoRo",
  "Project Cargo",
]

const containerSizeOptions = [
  "20' Standard",
  "40' Standard",
  "40' High Cube",
  "45' High Cube",
  "Reefer 20'",
  "Reefer 40'",
  "Open Top",
  "Flat Rack",
]

const railContainerTypeOptions = [
  "20' Standard",
  "40' Standard",
  "40' High Cube",
  "45' High Cube",
  "Reefer 40'",
  "Swap Body",
]

const blTypeOptions = ["Original BL", "Telex Release", "Sea Waybill", "Express BL"]
const freightTermsOptions = ["Prepaid", "Collect", "Third Party"]

const airShipmentOptions = [
  "General Cargo",
  "Perishable",
  "Dangerous Goods (DGD)",
  "Valuable Cargo (VAL)",
  "Live Animals (AVI)",
  "Oversized",
  "Pharma / GDP",
]

const uldTypeOptions = ["N/A - Loose", "PMC - Pallet", "AKE - LD3 Container", "AMJ - LD7"]

const courierServiceOptions = [
  "Same-Day",
  "Next-Day AM",
  "Next-Day PM",
  "48-Hour Economy",
  "Express International",
  "Timed Delivery",
]

const courierCarrierOptions = [
  "Own Fleet",
  "DPD",
  "DHL Express",
  "FedEx",
  "UPS",
  "TNT",
  "Royal Mail",
  "Evri",
  "Yodel",
  "Other",
]

const courierVehicleOptions = [
  "Motorbike Courier",
  "Car / Estate",
  "Small Van",
  "Transit Van",
  "Luton Box Van",
  "7.5t Rigid",
]

const signatureRequiredOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
]

const yesNoOptions = [
  { label: "No", value: false },
  { label: "Yes", value: true },
]

const multiDropStopTypeOptions = ["Collection", "Delivery", "Customs", "Fuel / Rest", "Other"]

const customsDirectionOptions = [
  { label: "Export", value: "export" },
  { label: "Import", value: "import" },
  { label: "Both", value: "both" },
]

const customsDocumentTypeOptions = [
  "CMR (Road Waybill)",
  "T1 - External Transit",
  "T2 - Internal Transit",
  "EUR.1 Movement Cert.",
  "ATA Carnet",
  "C88 / SAD (Export Entry)",
  "E2 (Import Entry)",
  "Other",
]

const customsStatusOptions = [
  "Pending",
  "Pre-Lodged",
  "Presented at Border",
  "Cleared",
  "Held for Inspection",
  "Released",
]

const portBorderOptions = [
  "Dover / Calais",
  "Folkestone / Coquelles (Eurotunnel)",
  "Holyhead / Dublin",
  "Harwich / Hook of Holland",
  "Hull / Zeebrugge",
  "Newcastle / Amsterdam (DFDS)",
  "Portsmouth / Le Havre",
  "Portsmouth / Caen",
  "Rosslare / Cherbourg",
  "Cairnryan / Larne",
  "Other",
]

const subcontractorCurrencyOptions = ["GBP", "EUR", "USD"]

const subcontractorStatusOptions = [
  "Pending Confirmation",
  "Confirmed",
  "In Transit",
  "Delivered",
  "Invoice Received",
]

const globalReferenceVirtualScrollerOptions = {
  itemSize: 44,
  showLoader: false,
}
</script>

<template>
  <section class="job-transport-tab">
    <div class="job-transport-tab__mode-card">
      <div class="job-transport-tab__mode-summary">
        <span>Mode of Transport</span>
        <strong>{{ modeLabel }}</strong>
      </div>
    </div>

    <div v-if="!mode" class="job-transport-tab__empty">
      Select a mode of transport from the job header to load the transport inputs.
    </div>

    <!-- =========================
         MULTI MODAL
    ========================== -->
    <div v-if="mode === 'multi_modal'" class="job-transport-tab__section">
      <header class="job-transport-tab__section-header">
        <div>
          <h2>Multi Modal Legs</h2>
          <p>Add each transport leg separately.</p>
        </div>

        <Button
          class="job-transport-tab__add-leg-btn"
          icon="pi pi-plus"
          label="Add Leg"
          type="button"
          @click="addLeg"
        />
      </header>

      <div class="job-transport-tab__legs">
        <div
          v-for="(leg, index) in multiModalLegs"
          :key="leg.id"
          class="job-transport-tab__leg-card"
        >
          <!-- HEADER -->
          <div class="job-transport-tab__leg-header">
            <strong>Leg {{ index + 1 }}</strong>

            <Button
              class="remove-btn"
              label="Remove"
              type="button"
              text
              @click="removeLeg(leg.id)"
            />
          </div>

          <!-- BASE FIELDS -->
          <div class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Leg Mode</span>
              <Dropdown
                v-model="leg.mode"
                :options="legModeOptions"
                option-label="label"
                option-value="value"
                class="job-transport-tab__prime-select"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>{{ leg.mode === "road" ? "Haulier / Carrier" : "Carrier" }}</span>
              <InputText v-model="leg.carrier" placeholder="Carrier" />
            </label>

            <label class="job-transport-tab__field">
              <span>{{ getOriginLabel(leg.mode) }}</span>
              <Dropdown
                v-model="leg.origin"
                :options="getLocationOptions(leg.mode)"
                option-label="label"
                option-value="value"
                placeholder="Select origin"
                filter
                @filter="onGlobalReferenceFilter"
                filter-by="label,value,subLabel,searchText"
                :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
                class="job-transport-tab__prime-select"
              >
                <template #option="{ option }">
                  <div class="job-transport-tab__reference-option">
                    <strong>{{ option.label }}</strong>
                    <small v-if="option.subLabel">{{ option.subLabel }}</small>
                  </div>
                </template>
              </Dropdown>
            </label>

            <label class="job-transport-tab__field">
              <span>{{ getDestinationLabel(leg.mode) }}</span>
              <Dropdown
                v-model="leg.destination"
                :options="getLocationOptions(leg.mode)"
                option-label="label"
                option-value="value"
                placeholder="Select destination"
                filter
                @filter="onGlobalReferenceFilter"
                filter-by="label,value,subLabel,searchText"
                :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
                class="job-transport-tab__prime-select"
              >
                <template #option="{ option }">
                  <div class="job-transport-tab__reference-option">
                    <strong>{{ option.label }}</strong>
                    <small v-if="option.subLabel">{{ option.subLabel }}</small>
                  </div>
                </template>
              </Dropdown>
            </label>

            <label class="job-transport-tab__field">
              <span>Final Destination</span>
              <Dropdown
                v-model="leg.extra_data.final_destination"
                :options="cityOptions"
                option-label="label"
                option-value="value"
                placeholder="Select final destination"
                filter
                @filter="onGlobalReferenceFilter"
                filter-by="label,value,subLabel,searchText"
                :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
                class="job-transport-tab__prime-select"
              >
                <template #option="{ option }">
                  <div class="job-transport-tab__reference-option">
                    <strong>{{ option.label }}</strong>
                    <small v-if="option.subLabel">{{ option.subLabel }}</small>
                  </div>
                </template>
              </Dropdown>
            </label>

            <label class="job-transport-tab__field">
              <span>ETD</span>
              <InputText type="date" v-model="leg.etd" />
            </label>

            <label class="job-transport-tab__field">
              <span>ETA</span>
              <InputText type="date" v-model="leg.eta" />
            </label>
          </div>

          <!-- =========================
               DYNAMIC PER MODE
          ========================== -->

          <!-- ROAD -->
          <div v-if="leg.mode === 'road'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Service Type</span>
              <Dropdown
                v-model="leg.extra_data.service_type"
                :options="roadServiceOptions"
                option-label="label"
                option-value="value"
                placeholder="Select service"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Vehicle Type</span>
              <Dropdown
                v-model="leg.extra_data.vehicle_type"
                :options="roadVehicleOptions"
                option-label="label"
                option-value="value"
                placeholder="Select vehicle"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Trailer Number</span>
              <InputText v-model="leg.extra_data.trailer_number" placeholder="AB12 CDE" />
            </label>

            <label class="job-transport-tab__field">
              <span>Driver Name</span>
              <InputText v-model="leg.extra_data.driver_name" placeholder="Driver" />
            </label>

            <label class="job-transport-tab__field">
              <span>Driver Mobile</span>
              <InputText v-model="leg.extra_data.driver_mobile" placeholder="+44 ..." />
            </label>

            <label class="job-transport-tab__field">
              <span>Est. Distance (km)</span>
              <InputText
                v-model="leg.extra_data.estimated_distance_km"
                type="number"
                placeholder="0"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Est. Transit Days</span>
              <InputText
                v-model="leg.extra_data.estimated_transit_days"
                type="number"
                placeholder="0"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Pallet Spaces</span>
              <InputText v-model="leg.extra_data.pallet_spaces" type="number" placeholder="0" />
            </label>

            <label class="job-transport-tab__field">
              <span>Pallet Type</span>
              <Dropdown
                v-model="leg.extra_data.pallet_type"
                :options="palletTypeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select pallet type"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>CMR Number</span>
              <InputText v-model="leg.extra_data.cmr_number" placeholder="CMR ref" />
            </label>

            <label class="job-transport-tab__field">
              <span>POD Method</span>
              <Dropdown
                v-model="leg.extra_data.pod_method"
                :options="podMethodOptions"
                option-label="label"
                option-value="value"
                placeholder="Select POD method"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field job-transport-tab__field--span-4">
              <span>Road Transport Notes</span>
              <Textarea
                v-model="leg.extra_data.notes"
                placeholder="Loading instructions, access codes, special requirements..."
              />
            </label>
          </div>

          <!-- SEA -->
          <div v-if="leg.mode === 'sea'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Shipping Line</span>
              <InputText
                v-model="leg.extra_data.shipping_line"
                placeholder="Maersk / MSC / CMA CGM..."
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Vessel Name</span>
              <InputText v-model="leg.extra_data.vessel_name" placeholder="MV Vessel Name" />
            </label>

            <label class="job-transport-tab__field">
              <span>Voyage Number</span>
              <InputText v-model="leg.extra_data.voyage_number" placeholder="VOY-123" />
            </label>

            <label class="job-transport-tab__field">
              <span>Shipment Type</span>
              <Dropdown
                v-model="leg.extra_data.shipment_type"
                :options="seaShipmentOptions"
                placeholder="Select shipment"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Container Number</span>
              <InputText v-model="leg.extra_data.container_number" />
            </label>

            <label class="job-transport-tab__field">
              <span>Container Size</span>
              <Dropdown
                v-model="leg.extra_data.container_size"
                :options="containerSizeOptions"
                placeholder="Select size"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Seal Number</span>
              <InputText v-model="leg.extra_data.seal_number" placeholder="Seal #" />
            </label>

            <label class="job-transport-tab__field">
              <span>Container Tare (kg)</span>
              <InputText v-model="leg.extra_data.container_tare_kg" type="number" placeholder="0" />
            </label>

            <label class="job-transport-tab__field">
              <span>Master BL Number</span>
              <InputText v-model="leg.extra_data.master_bl_number" placeholder="MBL ref" />
            </label>

            <label class="job-transport-tab__field">
              <span>House BL Number</span>
              <InputText v-model="leg.extra_data.house_bl_number" placeholder="HBL ref" />
            </label>

            <label class="job-transport-tab__field">
              <span>BL Type</span>
              <Dropdown
                v-model="leg.extra_data.bl_type"
                :options="blTypeOptions"
                placeholder="Select BL type"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Freight Terms</span>
              <Dropdown
                v-model="leg.extra_data.freight_terms"
                :options="freightTermsOptions"
                placeholder="Select freight terms"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Transhipment Port</span>
              <Dropdown
                v-model="leg.extra_data.transhipment_port"
                :options="seaportOptions"
                option-label="label"
                option-value="value"
                placeholder="Select transhipment port"
                filter
                @filter="onGlobalReferenceFilter"
                filter-by="label,value,subLabel,searchText"
                :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
                class="job-transport-tab__prime-select"
              >
                <template #option="{ option }">
                  <div class="job-transport-tab__reference-option">
                    <strong>{{ option.label }}</strong>
                    <small v-if="option.subLabel">{{ option.subLabel }}</small>
                  </div>
                </template>
              </Dropdown>
            </label>

            <label class="job-transport-tab__field">
              <span>Cut-Off Date</span>
              <InputText v-model="leg.extra_data.cut_off_date" type="date" />
            </label>

            <label class="job-transport-tab__field">
              <span>Cut-Off Time</span>
              <InputText v-model="leg.extra_data.cut_off_time" type="time" />
            </label>

            <label class="job-transport-tab__field">
              <span>Free Days Demurrage</span>
              <InputText
                v-model="leg.extra_data.free_days_demurrage"
                type="number"
                placeholder="0"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Free Days Detention</span>
              <InputText
                v-model="leg.extra_data.free_days_detention"
                type="number"
                placeholder="0"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Return Depot</span>
              <InputText v-model="leg.extra_data.return_depot" placeholder="Depot name" />
            </label>

            <label class="job-transport-tab__field">
              <span>Return Date</span>
              <InputText v-model="leg.extra_data.return_date" type="date" />
            </label>

            <label class="job-transport-tab__field job-transport-tab__field--span-4">
              <span>Sea Freight Notes</span>
              <Textarea
                v-model="leg.extra_data.notes"
                placeholder="VGM details, fumigation requirements, special stowage instructions..."
              />
            </label>
          </div>

          <!-- AIR -->
          <div v-if="leg.mode === 'air'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Airline</span>
              <InputText v-model="leg.extra_data.airline" />
            </label>

            <label class="job-transport-tab__field">
              <span>Flight Number</span>
              <InputText v-model="leg.extra_data.flight_number" />
            </label>

            <label class="job-transport-tab__field">
              <span>MAWB Number</span>
              <InputText v-model="leg.extra_data.mawb_number" placeholder="123-12345678" />
            </label>

            <label class="job-transport-tab__field">
              <span>HAWB Number</span>
              <InputText v-model="leg.extra_data.hawb_number" placeholder="HAWB ref" />
            </label>

            <label class="job-transport-tab__field">
              <span>Shipment Type</span>
              <Dropdown
                v-model="leg.extra_data.shipment_type"
                :options="airShipmentOptions"
                placeholder="Select cargo"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Via / Transhipment</span>
              <Dropdown
                v-model="leg.extra_data.via_transhipment"
                :options="airportOptions"
                option-label="label"
                option-value="value"
                placeholder="Select transit airport"
                filter
                @filter="onGlobalReferenceFilter"
                filter-by="label,value,subLabel,searchText"
                :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
                class="job-transport-tab__prime-select"
              >
                <template #option="{ option }">
                  <div class="job-transport-tab__reference-option">
                    <strong>{{ option.label }}</strong>
                    <small v-if="option.subLabel">{{ option.subLabel }}</small>
                  </div>
                </template>
              </Dropdown>
            </label>

            <label class="job-transport-tab__field">
              <span>Cut-Off Date</span>
              <InputText v-model="leg.extra_data.cut_off_date" type="date" />
            </label>

            <label class="job-transport-tab__field">
              <span>Cut-Off Time</span>
              <InputText v-model="leg.extra_data.cut_off_time" type="time" />
            </label>

            <label class="job-transport-tab__field">
              <span>ULD Type</span>
              <Dropdown
                v-model="leg.extra_data.uld_type"
                :options="uldTypeOptions"
                placeholder="Select ULD type"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>ULD Number</span>
              <InputText v-model="leg.extra_data.uld_number" placeholder="ULD ref" />
            </label>

            <label class="job-transport-tab__field">
              <span>Chargeable Weight</span>
              <InputText
                v-model="leg.extra_data.chargeable_weight"
                type="number"
                placeholder="0.00"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Rate per kg</span>
              <InputText v-model="leg.extra_data.rate_per_kg" type="number" placeholder="0.00" />
            </label>

            <label class="job-transport-tab__field job-transport-tab__field--span-4">
              <span>Air Freight Notes</span>
              <Textarea
                v-model="leg.extra_data.notes"
                placeholder="Screening requirements, lithium battery declaration..."
              />
            </label>
          </div>

          <!-- RAIL -->
          <div v-if="leg.mode === 'rail'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Train No</span>
              <InputText v-model="leg.extra_data.train_number" />
            </label>

            <label class="job-transport-tab__field">
              <span>Wagon Number</span>
              <InputText v-model="leg.extra_data.wagon_number" />
            </label>

            <label class="job-transport-tab__field">
              <span>Container Number</span>
              <InputText v-model="leg.extra_data.container_number" />
            </label>

            <label class="job-transport-tab__field">
              <span>Container Type</span>
              <Dropdown
                v-model="leg.extra_data.container_type"
                :options="railContainerTypeOptions"
                placeholder="Select type"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Rail Operator</span>
              <InputText
                v-model="leg.extra_data.rail_operator"
                placeholder="DB Cargo / Freightliner"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Est. Transit Days</span>
              <InputText
                v-model="leg.extra_data.estimated_transit_days"
                type="number"
                placeholder="0"
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Departure Date</span>
              <InputText v-model="leg.extra_data.departure_date" type="date" />
            </label>

            <label class="job-transport-tab__field">
              <span>Departure Time</span>
              <InputText v-model="leg.extra_data.departure_time" type="time" />
            </label>

            <label class="job-transport-tab__field">
              <span>Arrival Date</span>
              <InputText v-model="leg.extra_data.arrival_date" type="date" />
            </label>

            <label class="job-transport-tab__field">
              <span>Arrival Time</span>
              <InputText v-model="leg.extra_data.arrival_time" type="time" />
            </label>

            <label class="job-transport-tab__field job-transport-tab__field--span-4">
              <span>Rail Transport Notes</span>
              <Textarea
                v-model="leg.extra_data.notes"
                placeholder="Terminal requirements, gauge restrictions, intermodal connections..."
              />
            </label>
          </div>

          <!-- COURIER -->
          <div v-if="leg.mode === 'courier'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Courier Service</span>
              <Dropdown
                v-model="leg.extra_data.courier_service"
                :options="courierServiceOptions"
                placeholder="Select service"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Tracking Number</span>
              <InputText v-model="leg.extra_data.tracking_number" />
            </label>

            <label class="job-transport-tab__field">
              <span>Vehicle Type</span>
              <Dropdown
                v-model="leg.extra_data.vehicle_type"
                :options="courierVehicleOptions"
                placeholder="Select vehicle"
                class="job-transport-tab__prime-select"
                show-clear
              />
            </label>

            <label class="job-transport-tab__field">
              <span>Driver Name</span>
              <InputText v-model="leg.extra_data.driver_name" />
            </label>

            <label class="job-transport-tab__field">
              <span>Driver Mobile</span>
              <InputText v-model="leg.extra_data.driver_mobile" />
            </label>

            <label class="job-transport-tab__field">
              <span>Exact Delivery Time</span>
              <InputText v-model="leg.extra_data.exact_delivery_time" type="time" />
            </label>
          </div>
        </div>

        <!-- EMPTY -->
        <div v-if="!multiModalLegs.length" class="job-transport-tab__empty">
          No legs yet. Click Add Leg.
        </div>
      </div>
    </div>

    <div v-if="mode === 'road'" class="job-transport-tab__section">
      <header class="job-transport-tab__section-header">
        <h2>Full Transport Order</h2>
        <span class="job-transport-tab__badge">Road</span>
      </header>

      <div class="job-transport-tab__grid">
        <label class="job-transport-tab__field">
          <span>Service Type</span>
          <Dropdown
            v-model="form.road_detail.service_type"
            :options="roadServiceOptions"
            option-label="label"
            option-value="value"
            placeholder="Select service"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Load Type</span>
          <Dropdown
            v-model="form.road_detail.full_load_type"
            :options="loadTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select load type"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Vehicle / Trailer Type</span>
          <Dropdown
            v-model="form.road_detail.vehicle_type"
            :options="roadVehicleOptions"
            option-label="label"
            option-value="value"
            placeholder="Select vehicle"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Origin Road Terminal</span>
          <Dropdown
            v-model="form.road_detail.origin_city"
            :options="roadTerminalOptions"
            option-label="label"
            option-value="value"
            placeholder="Select origin road terminal"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Destination Road Terminal</span>
          <Dropdown
            v-model="form.road_detail.destination_city"
            :options="roadTerminalOptions"
            option-label="label"
            option-value="value"
            placeholder="Select destination road terminal"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Final Destination</span>
          <Dropdown
            v-model="form.road_detail.final_destination"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            placeholder="Select final destination"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Transit Days</span>
          <InputNumber v-model="form.road_detail.estimated_transit_days" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Distance (km)</span>
          <InputNumber v-model="form.road_detail.estimated_distance_km" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Load Plan Ref</span>
          <InputText
            v-model="form.road_detail.full_load_plan_ref"
            placeholder="Load plan / manifest ref"
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Haulier / Carrier</span>
          <InputText v-model="form.road_detail.carrier" placeholder="Carrier name" />
        </label>

        <label class="job-transport-tab__field">
          <span>Vehicle Registration</span>
          <InputText v-model="form.road_detail.full_vehicle_registration" placeholder="AB12 CDE" />
        </label>

        <label class="job-transport-tab__field">
          <span>Trailer Number</span>
          <InputText v-model="form.road_detail.trailer_number" placeholder="AB12 CDE" />
        </label>

        <label class="job-transport-tab__field">
          <span>Seal Number</span>
          <InputText v-model="form.road_detail.full_seal_number" placeholder="Seal no." />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Name</span>
          <InputText v-model="form.road_detail.driver_name" placeholder="Driver" />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Mobile</span>
          <InputText v-model="form.road_detail.driver_mobile" type="tel" placeholder="+44 ..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Pallet Spaces</span>
          <InputNumber v-model="form.road_detail.pallet_spaces" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Pallet Type</span>
          <Dropdown
            v-model="form.road_detail.pallet_type"
            :options="palletTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select pallet type"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Max Stack Height (cm)</span>
          <InputNumber
            v-model="form.road_detail.full_max_stack_height_cm"
            :min="0"
            placeholder="220"
          />
        </label>

        <label class="job-transport-tab__field">
          <span>CMR Number</span>
          <InputText v-model="form.road_detail.cmr_number" placeholder="CMR ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Route / Via</span>
          <InputText v-model="form.road_detail.full_route_via" placeholder="e.g. UK > BE > DE" />
        </label>

        <label class="job-transport-tab__field">
          <span>POD Method</span>
          <Dropdown
            v-model="form.road_detail.pod_method"
            :options="podMethodOptions"
            option-label="label"
            option-value="value"
            placeholder="Select POD method"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Road Transport Notes</span>
          <Textarea
            v-model="form.road_detail.notes"
            placeholder="Loading instructions, access codes, special requirements..."
          />
        </label>

        <div class="job-transport-tab__switch-group">
          <label class="job-transport-tab__field job-transport-tab__switch-field">
            <span>Multi-Drop?</span>
            <div class="job-transport-tab__switch-row">
              <strong>{{ form.road_detail.full_multi_drop ? "Yes" : "No" }}</strong>
              <InputSwitch
                :model-value="Boolean(form.road_detail.full_multi_drop)"
                @update:model-value="(value: boolean) => setBooleanDetail('full_multi_drop', value)"
              />
            </div>
          </label>

          <label class="job-transport-tab__field job-transport-tab__switch-field">
            <span>Customs Required?</span>
            <div class="job-transport-tab__switch-row">
              <strong>{{ form.road_detail.full_customs_required ? "Yes" : "No" }}</strong>
              <InputSwitch
                :model-value="Boolean(form.road_detail.full_customs_required)"
                @update:model-value="
                  (value: boolean) => setBooleanDetail('full_customs_required', value)
                "
              />
            </div>
          </label>

          <label class="job-transport-tab__field job-transport-tab__switch-field">
            <span>Subcontractor Used?</span>
            <div class="job-transport-tab__switch-row">
              <strong>{{ form.road_detail.full_subcontractor_used ? "Yes" : "No" }}</strong>
              <InputSwitch
                :model-value="Boolean(form.road_detail.full_subcontractor_used)"
                @update:model-value="
                  (value: boolean) => setBooleanDetail('full_subcontractor_used', value)
                "
              />
            </div>
          </label>
        </div>
      </div>

      <div v-if="form.road_detail.full_multi_drop" class="job-transport-tab__conditional-card">
        <header class="job-transport-tab__conditional-header">
          <div>
            <h3>Intermediate Stops / Multi-Drop</h3>
            <p>Add every collection, delivery, or customs stop between origin and destination.</p>
          </div>

          <Button
            class="job-transport-tab__add-leg-btn"
            icon="pi pi-plus"
            label="Add Stop"
            type="button"
            @click="addMultiDropStop"
          />
        </header>

        <div v-if="!multiDropStops.length" class="job-transport-tab__conditional-empty">
          No intermediate stops added yet.
        </div>

        <div v-else class="job-transport-tab__stop-list">
          <div
            v-for="(stop, index) in multiDropStops"
            :key="stop.id"
            class="job-transport-tab__stop-row"
          >
            <div class="job-transport-tab__stop-title">
              <strong>Stop {{ index + 1 }}</strong>
              <Button
                class="remove-btn"
                label="Remove"
                type="button"
                text
                @click="removeMultiDropStop(stop.id)"
              />
            </div>

            <div class="job-transport-tab__grid job-transport-tab__grid--nested">
              <label class="job-transport-tab__field">
                <span>Company / Location</span>
                <InputText v-model="stop.company_location" placeholder="Company or site" />
              </label>

              <label class="job-transport-tab__field">
                <span>City & Postcode</span>
                <Dropdown
                  v-model="stop.city_postcode"
                  :options="cityOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Search city, terminal, airport"
                  filter
                  @filter="onGlobalReferenceFilter"
                  filter-by="label,value,subLabel,searchText"
                  :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
                  class="job-transport-tab__prime-select"
                  show-clear
                >
                  <template #option="{ option }">
                    <div class="job-transport-tab__reference-option">
                      <strong>{{ option.label }}</strong>
                      <small v-if="option.subLabel">{{ option.subLabel }}</small>
                    </div>
                  </template>
                </Dropdown>
              </label>

              <label class="job-transport-tab__field">
                <span>Date</span>
                <InputText v-model="stop.date" type="date" />
              </label>

              <label class="job-transport-tab__field">
                <span>Stop Type</span>
                <Dropdown
                  v-model="stop.stop_type"
                  :options="multiDropStopTypeOptions"
                  placeholder="Select stop type"
                  class="job-transport-tab__prime-select"
                  show-clear
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="form.road_detail.full_customs_required"
        class="job-transport-tab__conditional-card"
      >
        <header class="job-transport-tab__conditional-header">
          <div>
            <h3>Customs & Border Details</h3>
            <p>Core customs references and border instructions for the road movement.</p>
          </div>
        </header>

        <div class="job-transport-tab__grid">
          <label class="job-transport-tab__field">
            <span>Direction</span>
            <Dropdown
              v-model="form.road_detail.customs_direction"
              :options="customsDirectionOptions"
              option-label="label"
              option-value="value"
              placeholder="Select direction"
              class="job-transport-tab__prime-select"
              show-clear
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Customs Document Type</span>
            <Dropdown
              v-model="form.road_detail.customs_document_type"
              :options="customsDocumentTypeOptions"
              placeholder="Select document"
              class="job-transport-tab__prime-select"
              show-clear
            />
          </label>

          <label class="job-transport-tab__field">
            <span>MRN / Declaration Ref</span>
            <InputText v-model="form.road_detail.customs_mrn_declaration_ref" placeholder="MRN" />
          </label>

          <label class="job-transport-tab__field">
            <span>Export Entry Ref (C88)</span>
            <InputText v-model="form.road_detail.customs_export_entry_ref" placeholder="C88 ref" />
          </label>

          <label class="job-transport-tab__field">
            <span>Customs Status</span>
            <Dropdown
              v-model="form.road_detail.customs_status"
              :options="customsStatusOptions"
              placeholder="Select status"
              class="job-transport-tab__prime-select"
              show-clear
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Port / Border Crossing</span>
            <Dropdown
              v-model="form.road_detail.customs_port_border"
              :options="portBorderOptions"
              placeholder="Select border"
              class="job-transport-tab__prime-select"
              show-clear
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Ferry / Tunnel Booking Ref</span>
            <InputText
              v-model="form.road_detail.customs_ferry_booking_ref"
              placeholder="Booking ref"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Broker Reference</span>
            <InputText
              v-model="form.road_detail.customs_broker_reference"
              placeholder="Broker ref"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Exporter EORI</span>
            <InputText v-model="form.road_detail.customs_exporter_eori" placeholder="GB..." />
          </label>

          <label class="job-transport-tab__field">
            <span>Importer EORI</span>
            <InputText v-model="form.road_detail.customs_importer_eori" placeholder="GB..." />
          </label>

          <label class="job-transport-tab__field job-transport-tab__field--span-2">
            <span>Customs Broker / Agent</span>
            <InputText v-model="form.road_detail.customs_broker_agent" placeholder="Agent name" />
          </label>

          <label class="job-transport-tab__field">
            <span>Deferment Account No.</span>
            <InputText
              v-model="form.road_detail.customs_deferment_account"
              placeholder="Account no."
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Duty Rate (%)</span>
            <InputNumber
              v-model="form.road_detail.customs_duty_rate_percent"
              :min="0"
              :max-fraction-digits="2"
              placeholder="0.00"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Country of Origin</span>
            <InputText v-model="form.road_detail.customs_country_of_origin" placeholder="Country" />
          </label>

          <label class="job-transport-tab__field">
            <span>Country of Destination</span>
            <InputText
              v-model="form.road_detail.customs_country_of_destination"
              placeholder="Country"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Goods Procedure Code</span>
            <InputText
              v-model="form.road_detail.customs_goods_procedure_code"
              placeholder="Procedure code"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Export Licence No.</span>
            <InputText
              v-model="form.road_detail.customs_export_licence_no"
              placeholder="Licence no."
            />
          </label>

          <label class="job-transport-tab__field job-transport-tab__field--span-4">
            <span>General Customs Notes</span>
            <Textarea
              v-model="form.road_detail.customs_notes"
              placeholder="Customs instructions, clearance timing, documents required..."
            />
          </label>
        </div>
      </div>

      <div
        v-if="form.road_detail.full_subcontractor_used"
        class="job-transport-tab__conditional-card"
      >
        <header class="job-transport-tab__conditional-header">
          <div>
            <h3>Subcontractor Details</h3>
            <p>Carrier instructions, buy rate, and confirmation status.</p>
          </div>
        </header>

        <div class="job-transport-tab__grid">
          <label class="job-transport-tab__field job-transport-tab__field--span-2">
            <span>Subcontractor Name</span>
            <Dropdown
              v-model="form.road_detail.subcontractor_contact_id"
              :options="contactOptions"
              option-label="label"
              option-value="value"
              placeholder="Search contacts"
              filter
              filter-by="label,subLabel"
              :loading="contactOptionsLoading"
              class="job-transport-tab__prime-select"
              show-clear
            >
              <template #option="{ option }">
                <div class="job-transport-tab__reference-option">
                  <strong>{{ option.label }}</strong>
                  <small v-if="option.subLabel">{{ option.subLabel }}</small>
                </div>
              </template>
            </Dropdown>
          </label>

          <label class="job-transport-tab__field">
            <span>Subcontractor Ref</span>
            <InputText v-model="form.road_detail.subcontractor_ref" placeholder="Reference" />
          </label>

          <label class="job-transport-tab__field">
            <span>Contact Name</span>
            <InputText v-model="form.road_detail.subcontractor_contact_name" placeholder="Name" />
          </label>

          <label class="job-transport-tab__field">
            <span>Contact Phone</span>
            <InputText
              v-model="form.road_detail.subcontractor_contact_phone"
              type="tel"
              placeholder="+44 ..."
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Buy Rate</span>
            <InputNumber
              v-model="form.road_detail.subcontractor_buy_rate"
              :min="0"
              :max-fraction-digits="2"
              placeholder="0.00"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Buy Currency</span>
            <Dropdown
              v-model="form.road_detail.subcontractor_buy_currency"
              :options="subcontractorCurrencyOptions"
              placeholder="Currency"
              class="job-transport-tab__prime-select"
              show-clear
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Subcon PO / Instruction Ref</span>
            <InputText
              v-model="form.road_detail.subcontractor_po_instruction_ref"
              placeholder="PO / instruction ref"
            />
          </label>

          <label class="job-transport-tab__field">
            <span>Subcon Status</span>
            <Dropdown
              v-model="form.road_detail.subcontractor_status"
              :options="subcontractorStatusOptions"
              placeholder="Select status"
              class="job-transport-tab__prime-select"
              show-clear
            />
          </label>

          <label class="job-transport-tab__field job-transport-tab__field--span-4">
            <span>Subcontractor Notes</span>
            <Textarea
              v-model="form.road_detail.subcontractor_notes"
              placeholder="Special instructions, agreed terms, invoice notes..."
            />
          </label>
        </div>
      </div>
    </div>

    <div v-if="mode === 'rail'" class="job-transport-tab__section">
      <header class="job-transport-tab__section-header">
        <h2>Rail Freight Details</h2>
        <span class="job-transport-tab__badge">Rail</span>
      </header>

      <div class="job-transport-tab__grid">
        <label class="job-transport-tab__field">
          <span>Rail Operator</span>
          <InputText
            v-model="form.rail_detail.rail_operator"
            placeholder="DB Cargo / Freightliner..."
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Train Number</span>
          <InputText v-model="form.rail_detail.train_number" placeholder="Train service ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Wagon Number</span>
          <InputText v-model="form.rail_detail.wagon_number" placeholder="Wagon / flat ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Number</span>
          <InputText v-model="form.rail_detail.container_number" placeholder="ABCD 1234567" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Type</span>
          <Dropdown
            v-model="form.rail_detail.container_type"
            :options="railContainerTypeOptions"
            placeholder="Select container type"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Loading Terminal</span>
          <Dropdown
            v-model="form.rail_detail.loading_terminal"
            :options="railTerminalOptions"
            option-label="label"
            option-value="value"
            placeholder="Select loading terminal"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Discharge Terminal</span>
          <Dropdown
            v-model="form.rail_detail.discharge_terminal"
            :options="railTerminalOptions"
            option-label="label"
            option-value="value"
            placeholder="Select discharge terminal"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Final Destination</span>
          <Dropdown
            v-model="form.rail_detail.final_destination"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            placeholder="Select final destination"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Transit Days</span>
          <InputNumber v-model="form.rail_detail.estimated_transit_days" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Departure Date</span>
          <InputText v-model="form.rail_detail.departure_date" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Departure Time</span>
          <InputText v-model="form.rail_detail.departure_time" type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>Arrival Date</span>
          <InputText v-model="form.rail_detail.arrival_date" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Arrival Time</span>
          <InputText v-model="form.rail_detail.arrival_time" type="time" />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Rail Transport Notes</span>
          <Textarea
            v-model="form.rail_detail.notes"
            placeholder="Terminal requirements, gauge restrictions, intermodal connections..."
          />
        </label>
      </div>
    </div>

    <div v-if="mode === 'sea'" class="job-transport-tab__section">
      <header class="job-transport-tab__section-header">
        <h2>Sea Freight Details</h2>
        <span class="job-transport-tab__badge">Sea</span>
      </header>

      <div class="job-transport-tab__grid">
        <label class="job-transport-tab__field">
          <span>Shipping Line</span>
          <InputText
            v-model="form.sea_detail.shipping_line"
            placeholder="Maersk / MSC / CMA CGM..."
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Vessel Name</span>
          <InputText v-model="form.sea_detail.vessel_name" placeholder="MV Vessel Name" />
        </label>

        <label class="job-transport-tab__field">
          <span>Voyage Number</span>
          <InputText v-model="form.sea_detail.voyage_number" placeholder="VOY-123" />
        </label>

        <label class="job-transport-tab__field">
          <span>Shipment Type</span>
          <Dropdown
            v-model="form.sea_detail.shipment_type"
            :options="seaShipmentOptions"
            placeholder="Select shipment"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Number</span>
          <InputText v-model="form.sea_detail.container_number" placeholder="ABCD 1234567" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Size</span>
          <Dropdown
            v-model="form.sea_detail.container_size"
            :options="containerSizeOptions"
            placeholder="Select size"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Seal Number</span>
          <InputText v-model="form.sea_detail.seal_number" placeholder="Seal #" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Tare (kg)</span>
          <InputNumber v-model="form.sea_detail.container_tare_kg" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Master BL Number</span>
          <InputText v-model="form.sea_detail.master_bl_number" placeholder="MBL ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>House BL Number</span>
          <InputText v-model="form.sea_detail.house_bl_number" placeholder="HBL ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>BL Type</span>
          <Dropdown
            v-model="form.sea_detail.bl_type"
            :options="blTypeOptions"
            placeholder="Select BL type"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Freight Terms</span>
          <Dropdown
            v-model="form.sea_detail.freight_terms"
            :options="freightTermsOptions"
            placeholder="Select freight terms"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Port of Loading</span>
          <Dropdown
            v-model="form.sea_detail.port_of_loading"
            :options="seaportOptions"
            option-label="label"
            option-value="value"
            placeholder="Select port of loading"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Port of Discharge</span>
          <Dropdown
            v-model="form.sea_detail.port_of_discharge"
            :options="seaportOptions"
            option-label="label"
            option-value="value"
            placeholder="Select port of discharge"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Transhipment Port</span>
          <Dropdown
            v-model="form.sea_detail.transhipment_port"
            :options="seaportOptions"
            option-label="label"
            option-value="value"
            placeholder="Select transhipment port"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Final Destination</span>
          <Dropdown
            v-model="form.sea_detail.final_destination"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            placeholder="Select final destination"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>ETD</span>
          <InputText v-model="form.sea_detail.etd" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>ETA</span>
          <InputText v-model="form.sea_detail.eta" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Date</span>
          <InputText v-model="form.sea_detail.cut_off_date" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Time</span>
          <InputText v-model="form.sea_detail.cut_off_time" type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>Free Days Demurrage</span>
          <InputNumber v-model="form.sea_detail.free_days_demurrage" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Free Days Detention</span>
          <InputNumber v-model="form.sea_detail.free_days_detention" :min="0" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Return Depot</span>
          <InputText v-model="form.sea_detail.return_depot" placeholder="Depot name" />
        </label>

        <label class="job-transport-tab__field">
          <span>Return Date</span>
          <InputText v-model="form.sea_detail.return_date" type="date" />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Sea Freight Notes</span>
          <Textarea
            v-model="form.sea_detail.notes"
            placeholder="VGM details, fumigation requirements, special stowage instructions..."
          />
        </label>
      </div>
    </div>

    <div v-if="mode === 'air'" class="job-transport-tab__section">
      <header class="job-transport-tab__section-header">
        <h2>Air Freight Details</h2>
        <span class="job-transport-tab__badge">Air</span>
      </header>

      <div class="job-transport-tab__grid">
        <label class="job-transport-tab__field">
          <span>Airline</span>
          <InputText
            v-model="form.air_detail.airline"
            placeholder="British Airways / Emirates..."
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Flight Number</span>
          <InputText v-model="form.air_detail.flight_number" placeholder="BA 1234" />
        </label>

        <label class="job-transport-tab__field">
          <span>MAWB Number</span>
          <InputText v-model="form.air_detail.mawb_number" placeholder="123-12345678" />
        </label>

        <label class="job-transport-tab__field">
          <span>HAWB Number</span>
          <InputText v-model="form.air_detail.hawb_number" placeholder="HAWB ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Airport of Departure</span>
          <Dropdown
            v-model="form.air_detail.airport_of_departure"
            :options="airportOptions"
            option-label="label"
            option-value="value"
            placeholder="Select departure airport"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Airport of Arrival</span>
          <Dropdown
            v-model="form.air_detail.airport_of_arrival"
            :options="airportOptions"
            option-label="label"
            option-value="value"
            placeholder="Select arrival airport"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Via / Transhipment</span>
          <Dropdown
            v-model="form.air_detail.via_transhipment"
            :options="airportOptions"
            option-label="label"
            option-value="value"
            placeholder="Select transit airport"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Final Destination</span>
          <Dropdown
            v-model="form.air_detail.final_destination"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            placeholder="Select final destination"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Shipment Type</span>
          <Dropdown
            v-model="form.air_detail.shipment_type"
            :options="airShipmentOptions"
            placeholder="Select shipment type"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>ETD</span>
          <InputText v-model="form.air_detail.etd" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>ETA</span>
          <InputText v-model="form.air_detail.eta" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Date</span>
          <InputText v-model="form.air_detail.cut_off_date" type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Time</span>
          <InputText v-model="form.air_detail.cut_off_time" type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>ULD Type</span>
          <Dropdown
            v-model="form.air_detail.uld_type"
            :options="uldTypeOptions"
            placeholder="Select ULD type"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>ULD Number</span>
          <InputText v-model="form.air_detail.uld_number" placeholder="ULD ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Chargeable Weight</span>
          <InputNumber
            v-model="form.air_detail.chargeable_weight"
            :min="0"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            placeholder="0.00"
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Rate per kg</span>
          <InputNumber
            v-model="form.air_detail.rate_per_kg"
            :min="0"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            placeholder="0.00"
          />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Air Freight Notes</span>
          <Textarea
            v-model="form.air_detail.notes"
            placeholder="Screening requirements, lithium battery declaration..."
          />
        </label>
      </div>
    </div>

    <div v-if="mode === 'courier'" class="job-transport-tab__section">
      <header class="job-transport-tab__section-header">
        <h2>Courier Details</h2>
        <span class="job-transport-tab__badge">Courier</span>
      </header>

      <div class="job-transport-tab__grid">
        <label class="job-transport-tab__field">
          <span>Courier Service</span>
          <Dropdown
            v-model="form.courier_detail.courier_service"
            :options="courierServiceOptions"
            placeholder="Select service"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Carrier</span>
          <Dropdown
            v-model="form.courier_detail.carrier"
            :options="courierCarrierOptions"
            placeholder="Select carrier"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Tracking Number</span>
          <InputText v-model="form.courier_detail.tracking_number" placeholder="Tracking ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Final Destination</span>
          <Dropdown
            v-model="form.courier_detail.final_destination"
            :options="cityOptions"
            option-label="label"
            option-value="value"
            placeholder="Select final destination"
            filter
            @filter="onGlobalReferenceFilter"
            filter-by="label,value,subLabel,searchText"
            :virtual-scroller-options="globalReferenceVirtualScrollerOptions"
            class="job-transport-tab__prime-select"
          >
            <template #option="{ option }">
              <div class="job-transport-tab__reference-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </label>

        <label class="job-transport-tab__field">
          <span>Vehicle Type</span>
          <Dropdown
            v-model="form.courier_detail.vehicle_type"
            :options="courierVehicleOptions"
            placeholder="Select vehicle"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Name</span>
          <InputText v-model="form.courier_detail.driver_name" placeholder="Driver" />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Mobile</span>
          <InputText v-model="form.courier_detail.driver_mobile" type="tel" placeholder="+44 ..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Distance Miles</span>
          <InputNumber
            v-model="form.courier_detail.estimated_distance_miles"
            :min="0"
            placeholder="0"
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Rate per Mile</span>
          <InputNumber
            v-model="form.courier_detail.rate_per_mile"
            :min="0"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            placeholder="0.00"
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Signature Required?</span>
          <Dropdown
            v-model="form.courier_detail.signature_required"
            :options="signatureRequiredOptions"
            option-label="label"
            option-value="value"
            placeholder="Select option"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>POD Method</span>
          <Dropdown
            v-model="form.courier_detail.pod_method"
            :options="podMethodOptions"
            option-label="label"
            option-value="value"
            placeholder="Select POD method"
            class="job-transport-tab__prime-select"
            show-clear
          />
        </label>

        <label class="job-transport-tab__field">
          <span>Exact Delivery Time</span>
          <InputText v-model="form.courier_detail.exact_delivery_time" type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>Parking / Access Code</span>
          <InputText
            v-model="form.courier_detail.parking_access_code"
            placeholder="Barrier code, bay number..."
          />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Courier Notes</span>
          <Textarea
            v-model="form.courier_detail.notes"
            placeholder="Safe-place instructions, access codes, return address..."
          />
        </label>
      </div>
    </div>
  </section>
</template>
