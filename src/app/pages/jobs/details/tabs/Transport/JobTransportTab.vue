<script setup lang="ts">
import "./JobTransportTab.css"
import { useJobTransportTab } from "./JobTransportTab.logic"

const { mode, modeLabel, multiModalLegs, addLeg, removeLeg } = useJobTransportTab()
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

        <button class="job-transport-tab__add-leg-btn" @click="addLeg">+ Add Leg</button>
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

            <button @click="removeLeg(leg.id)" class="remove-btn">Remove</button>
          </div>

          <!-- BASE FIELDS -->
          <div class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Leg Mode</span>
              <select v-model="leg.mode">
                <option value="road">Road</option>
                <option value="rail">Rail</option>
                <option value="sea">Sea</option>
                <option value="air">Air</option>
                <option value="courier">Courier</option>
              </select>
            </label>

            <label class="job-transport-tab__field">
              <span>Carrier</span>
              <input v-model="leg.carrier" placeholder="Carrier" />
            </label>

            <label class="job-transport-tab__field">
              <span>Origin</span>
              <input v-model="leg.origin" placeholder="Origin" />
            </label>

            <label class="job-transport-tab__field">
              <span>Destination</span>
              <input v-model="leg.destination" placeholder="Destination" />
            </label>

            <label class="job-transport-tab__field">
              <span>ETD</span>
              <input type="date" v-model="leg.etd" />
            </label>

            <label class="job-transport-tab__field">
              <span>ETA</span>
              <input type="date" v-model="leg.eta" />
            </label>
          </div>

          <!-- =========================
               DYNAMIC PER MODE
          ========================== -->

          <!-- ROAD -->
          <div v-if="leg.mode === 'road'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Vehicle Type</span>
              <select v-model="leg.vehicle_type">
                <option>Trailer</option>
                <option>Van</option>
                <option>Rigid</option>
              </select>
            </label>

            <label class="job-transport-tab__field">
              <span>Driver</span>
              <input v-model="leg.driver_name" />
            </label>

            <label class="job-transport-tab__field">
              <span>Driver Mobile</span>
              <input v-model="leg.driver_mobile" />
            </label>
          </div>

          <!-- SEA -->
          <div v-if="leg.mode === 'sea'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Vessel</span>
              <input v-model="leg.vessel" />
            </label>

            <label class="job-transport-tab__field">
              <span>Voyage</span>
              <input v-model="leg.voyage" />
            </label>

            <label class="job-transport-tab__field">
              <span>Container</span>
              <input v-model="leg.container" />
            </label>
          </div>

          <!-- AIR -->
          <div v-if="leg.mode === 'air'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Airline</span>
              <input v-model="leg.airline" />
            </label>

            <label class="job-transport-tab__field">
              <span>Flight</span>
              <input v-model="leg.flight" />
            </label>

            <label class="job-transport-tab__field">
              <span>AWB</span>
              <input v-model="leg.awb" />
            </label>
          </div>

          <!-- RAIL -->
          <div v-if="leg.mode === 'rail'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Train No</span>
              <input v-model="leg.train" />
            </label>

            <label class="job-transport-tab__field">
              <span>Wagon</span>
              <input v-model="leg.wagon" />
            </label>
          </div>

          <!-- COURIER -->
          <div v-if="leg.mode === 'courier'" class="job-transport-tab__grid">
            <label class="job-transport-tab__field">
              <span>Tracking No</span>
              <input v-model="leg.tracking" />
            </label>

            <label class="job-transport-tab__field">
              <span>Service</span>
              <select v-model="leg.service">
                <option>Next Day</option>
                <option>Same Day</option>
              </select>
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
        <h2>Road Freight Details</h2>
        <span class="job-transport-tab__badge">Road</span>
      </header>

      <div class="job-transport-tab__grid">
        <label class="job-transport-tab__field">
          <span>Service Type</span>
          <select>
            <option>FTL – Full Truck Load</option>
            <option>LTL – Part Load</option>
            <option>Groupage / Consolidation</option>
            <option>Dedicated Transport</option>
            <option>Temperature Controlled</option>
            <option>Hazardous Goods (ADR)</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Vehicle / Trailer Type</span>
          <select>
            <option>Standard Trailer (13.6m)</option>
            <option>Curtainsider</option>
            <option>Flatbed Trailer</option>
            <option>Refrigerated Trailer</option>
            <option>Mega Trailer</option>
            <option>Low Loader</option>
            <option>Rigid Vehicle</option>
            <option>Sprinter Van</option>
            <option>Luton Box Van</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Transit Days</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Distance (km)</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Haulier / Carrier</span>
          <input type="text" placeholder="Carrier name" />
        </label>

        <label class="job-transport-tab__field">
          <span>Trailer Number</span>
          <input type="text" placeholder="AB12 CDE" />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Name</span>
          <input type="text" placeholder="Driver" />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Mobile</span>
          <input type="tel" placeholder="+44 ..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Pallet Spaces</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Pallet Type</span>
          <select>
            <option>Euro Pallet (120x80)</option>
            <option>UK Pallet (120x100)</option>
            <option>Half Pallet</option>
            <option>Mixed</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>CMR Number</span>
          <input type="text" placeholder="CMR ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>POD Method</span>
          <select>
            <option>Paper POD</option>
            <option>ePOD (App)</option>
            <option>Photo Confirmation</option>
            <option>Email Confirmation</option>
          </select>
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Road Transport Notes</span>
          <textarea placeholder="Loading instructions, access codes, special requirements..." />
        </label>
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
          <input type="text" placeholder="DB Cargo / Freightliner..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Train Number</span>
          <input type="text" placeholder="Train service ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Wagon Number</span>
          <input type="text" placeholder="Wagon / flat ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Number</span>
          <input type="text" placeholder="ABCD 1234567" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Type</span>
          <select>
            <option>20' Standard</option>
            <option>40' Standard</option>
            <option>40' High Cube</option>
            <option>45' High Cube</option>
            <option>Reefer 40'</option>
            <option>Swap Body</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Loading Terminal</span>
          <input type="text" placeholder="Origin terminal" />
        </label>

        <label class="job-transport-tab__field">
          <span>Discharge Terminal</span>
          <input type="text" placeholder="Destination terminal" />
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Transit Days</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Departure Date</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Departure Time</span>
          <input type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>Arrival Date</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Arrival Time</span>
          <input type="time" />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Rail Transport Notes</span>
          <textarea
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
          <input type="text" placeholder="Maersk / MSC / CMA CGM..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Vessel Name</span>
          <input type="text" placeholder="MV Vessel Name" />
        </label>

        <label class="job-transport-tab__field">
          <span>Voyage Number</span>
          <input type="text" placeholder="VOY-123" />
        </label>

        <label class="job-transport-tab__field">
          <span>Shipment Type</span>
          <select>
            <option>FCL – Full Container</option>
            <option>LCL – Less Than Container</option>
            <option>Breakbulk</option>
            <option>RoRo</option>
            <option>Project Cargo</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Container Number</span>
          <input type="text" placeholder="ABCD 1234567" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Size</span>
          <select>
            <option>20' Standard</option>
            <option>40' Standard</option>
            <option>40' High Cube</option>
            <option>45' High Cube</option>
            <option>Reefer 20'</option>
            <option>Reefer 40'</option>
            <option>Open Top</option>
            <option>Flat Rack</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Seal Number</span>
          <input type="text" placeholder="Seal #" />
        </label>

        <label class="job-transport-tab__field">
          <span>Container Tare (kg)</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Master BL Number</span>
          <input type="text" placeholder="MBL ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>House BL Number</span>
          <input type="text" placeholder="HBL ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>BL Type</span>
          <select>
            <option>Original BL</option>
            <option>Telex Release</option>
            <option>Sea Waybill</option>
            <option>Express BL</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Freight Terms</span>
          <select>
            <option>Prepaid</option>
            <option>Collect</option>
            <option>Third Party</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Port of Loading</span>
          <input type="text" placeholder="e.g. Felixstowe" />
        </label>

        <label class="job-transport-tab__field">
          <span>Port of Discharge</span>
          <input type="text" placeholder="e.g. Rotterdam" />
        </label>

        <label class="job-transport-tab__field">
          <span>Transhipment Port</span>
          <input type="text" placeholder="Via if any" />
        </label>

        <label class="job-transport-tab__field">
          <span>Final Destination</span>
          <input type="text" placeholder="Inland delivery point" />
        </label>

        <label class="job-transport-tab__field">
          <span>ETD</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>ETA</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Date</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Time</span>
          <input type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>Free Days Demurrage</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Free Days Detention</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Return Depot</span>
          <input type="text" placeholder="Depot name" />
        </label>

        <label class="job-transport-tab__field">
          <span>Return Date</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Sea Freight Notes</span>
          <textarea
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
          <input type="text" placeholder="British Airways / Emirates..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Flight Number</span>
          <input type="text" placeholder="BA 1234" />
        </label>

        <label class="job-transport-tab__field">
          <span>MAWB Number</span>
          <input type="text" placeholder="123-12345678" />
        </label>

        <label class="job-transport-tab__field">
          <span>HAWB Number</span>
          <input type="text" placeholder="HAWB ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Airport of Departure</span>
          <input type="text" placeholder="e.g. LHR – Heathrow" />
        </label>

        <label class="job-transport-tab__field">
          <span>Airport of Arrival</span>
          <input type="text" placeholder="e.g. JFK – New York" />
        </label>

        <label class="job-transport-tab__field">
          <span>Via / Transhipment</span>
          <input type="text" placeholder="Transit airport" />
        </label>

        <label class="job-transport-tab__field">
          <span>Shipment Type</span>
          <select>
            <option>General Cargo</option>
            <option>Perishable</option>
            <option>Dangerous Goods (DGD)</option>
            <option>Valuable Cargo (VAL)</option>
            <option>Live Animals (AVI)</option>
            <option>Oversized</option>
            <option>Pharma / GDP</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>ETD</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>ETA</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Date</span>
          <input type="date" />
        </label>

        <label class="job-transport-tab__field">
          <span>Cut-Off Time</span>
          <input type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>ULD Type</span>
          <select>
            <option value="">N/A – Loose</option>
            <option>PMC – Pallet</option>
            <option>AKE – LD3 Container</option>
            <option>AMJ – LD7</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>ULD Number</span>
          <input type="text" placeholder="ULD ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Chargeable Weight</span>
          <input type="number" placeholder="0.00" />
        </label>

        <label class="job-transport-tab__field">
          <span>Rate per kg</span>
          <input type="number" placeholder="0.00" />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Air Freight Notes</span>
          <textarea placeholder="Screening requirements, lithium battery declaration..." />
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
          <select>
            <option>Same-Day</option>
            <option>Next-Day AM</option>
            <option>Next-Day PM</option>
            <option>48-Hour Economy</option>
            <option>Express International</option>
            <option>Timed Delivery</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Carrier</span>
          <select>
            <option>Own Fleet</option>
            <option>DPD</option>
            <option>DHL Express</option>
            <option>FedEx</option>
            <option>UPS</option>
            <option>TNT</option>
            <option>Royal Mail</option>
            <option>Evri</option>
            <option>Yodel</option>
            <option>Other</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Tracking Number</span>
          <input type="text" placeholder="Tracking ref" />
        </label>

        <label class="job-transport-tab__field">
          <span>Vehicle Type</span>
          <select>
            <option>Motorbike Courier</option>
            <option>Car / Estate</option>
            <option>Small Van</option>
            <option>Transit Van</option>
            <option>Luton Box Van</option>
            <option>7.5t Rigid</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Name</span>
          <input type="text" placeholder="Driver" />
        </label>

        <label class="job-transport-tab__field">
          <span>Driver Mobile</span>
          <input type="tel" placeholder="+44 ..." />
        </label>

        <label class="job-transport-tab__field">
          <span>Est. Distance Miles</span>
          <input type="number" placeholder="0" />
        </label>

        <label class="job-transport-tab__field">
          <span>Rate per Mile</span>
          <input type="number" placeholder="0.00" />
        </label>

        <label class="job-transport-tab__field">
          <span>Signature Required?</span>
          <select>
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>POD Method</span>
          <select>
            <option>Paper POD</option>
            <option>ePOD (App)</option>
            <option>Photo Confirmation</option>
            <option>Email Confirmation</option>
          </select>
        </label>

        <label class="job-transport-tab__field">
          <span>Exact Delivery Time</span>
          <input type="time" />
        </label>

        <label class="job-transport-tab__field">
          <span>Parking / Access Code</span>
          <input type="text" placeholder="Barrier code, bay number..." />
        </label>

        <label class="job-transport-tab__field job-transport-tab__field--span-4">
          <span>Courier Notes</span>
          <textarea placeholder="Safe-place instructions, access codes, return address..." />
        </label>
      </div>
    </div>
  </section>
</template>
