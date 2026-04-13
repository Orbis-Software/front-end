<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title">Job Information</div>
    </div>

    <div class="road-card__body">
      <div class="road-grid road-grid--5">
        <div class="road-field">
          <label class="road-label">Job Number</label>
          <input v-model="form.job_number" class="road-input" disabled />
        </div>

        <div class="road-field">
          <label class="road-label">AWB / Consignment No.</label>
          <input
            v-model="form.awb_no"
            class="road-input"
            :disabled="disabled"
            placeholder="123-45678901"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Customer Reference</label>
          <input
            v-model="form.customer_reference"
            class="road-input"
            :disabled="disabled"
            placeholder="PO / Customer Ref"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Our Reference</label>
          <input
            v-model="form.our_reference"
            class="road-input"
            :disabled="disabled"
            placeholder="Internal ref"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Status</label>
          <select v-model="form.status" class="road-select" :disabled="disabled">
            <option>Draft</option>
            <option>Booked</option>
            <option>Collected</option>
            <option>In Transit</option>
            <option>Delivered</option>
            <option>Invoiced</option>
            <option>Closed</option>
          </select>
        </div>

        <div class="road-field">
          <label class="road-label">Service Type</label>
          <select v-model="form.service_type" class="road-select" :disabled="disabled">
            <option value="">— Select —</option>
            <option>FTL – Full Truck Load</option>
            <option>LTL – Part Load</option>
            <option>Groupage / Consolidation</option>
            <option>Dedicated Transport</option>
            <option>Temperature Controlled</option>
            <option>Hazardous Goods (ADR)</option>
            <option>Flatbed / Step Frame</option>
            <option>Curtainsider</option>
            <option>Mega Trailer</option>
            <option>Low Loader</option>
          </select>
        </div>

        <div class="road-field">
          <label class="road-label">Vehicle / Trailer Type</label>
          <select v-model="form.vehicle_trailer_type" class="road-select" :disabled="disabled">
            <option value="">— Select —</option>
            <option>Standard Trailer (13.6m)</option>
            <option>Rigid Vehicle</option>
            <option>Sprinter Van</option>
            <option>Luton Box Van</option>
            <option>7.5t Curtainsider</option>
            <option>18t Rigid</option>
            <option>Flatbed Trailer</option>
            <option>Refrigerated Trailer</option>
            <option>Low Loader</option>
            <option>Mega Trailer</option>
          </select>
        </div>

        <div class="road-field">
          <label class="road-label">Incoterms</label>
          <select v-model="form.incoterms" class="road-select" :disabled="disabled">
            <option value="">— Select —</option>
            <option>EXW – Ex Works</option>
            <option>FCA – Free Carrier</option>
            <option>CPT – Carriage Paid To</option>
            <option>CIP – Carriage &amp; Insurance Paid</option>
            <option>DAP – Delivered At Place</option>
            <option>DPU – Delivered At Place Unloaded</option>
            <option>DDP – Delivered Duty Paid</option>
            <option>FAS – Free Alongside Ship</option>
            <option>FOB – Free On Board</option>
            <option>CFR – Cost and Freight</option>
            <option>CIF – Cost, Insurance &amp; Freight</option>
          </select>
        </div>

        <div class="road-field">
          <label class="road-label">Currency</label>
          <select v-model="form.currency" class="road-select" :disabled="disabled">
            <option value="">— Select —</option>
            <option>GBP – £</option>
            <option>EUR – €</option>
            <option>USD – $</option>
            <option>PLN – zł</option>
            <option>CHF – Fr</option>
          </select>
        </div>

        <div class="road-field">
          <label class="road-label">Declared Value</label>
          <input
            v-model="form.declared_value"
            class="road-input"
            :disabled="disabled"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />
        </div>

        <div class="road-field road-span-2">
          <label class="road-label">Description of Goods</label>
          <input
            v-model="form.description_of_goods"
            class="road-input"
            :disabled="disabled"
            placeholder="General cargo / machinery / palletised goods…"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Commodity Code (HS)</label>
          <input
            v-model="form.commodity_code"
            class="road-input"
            :disabled="disabled"
            placeholder="e.g. 8471.30"
          />
        </div>

        <div class="road-field">
          <label class="road-label">ADR / Hazmat Class</label>
          <input
            v-model="form.hazmat_class"
            class="road-input"
            :disabled="disabled"
            placeholder="e.g. Class 3 – Flammable"
          />
        </div>

        <div class="road-field">
          <label class="road-label">UN Number</label>
          <input
            v-model="form.un_number"
            class="road-input"
            :disabled="disabled"
            placeholder="UN1234"
          />
        </div>

        <div class="road-field road-span-5">
          <label class="road-label">Special Instructions / Notes</label>
          <textarea
            v-model="form.special_instructions"
            class="road-textarea"
            :disabled="disabled"
            placeholder="Temperature requirements, handling notes, hazardous material details, access restrictions…"
          />
        </div>
      </div>
    </div>
  </div>
</template>
