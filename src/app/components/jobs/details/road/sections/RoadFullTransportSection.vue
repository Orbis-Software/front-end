<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-details">
    <div class="road-banner road-banner--transport">
      <div>
        <strong>Full Transport Order</strong> — Long-distance or international freight. May include
        customs, multi-drop, intermodal, or subcontractor legs.
      </div>
    </div>

    <div class="road-card road-card--transport">
      <div class="road-card__head">
        <div class="road-card__title road-card__title--purple">Transit &amp; Load Details</div>
      </div>

      <div class="road-card__body">
        <div class="road-grid road-grid--4">
          <div class="road-field">
            <label class="road-label">Load Type</label>
            <select v-model="form.load_type" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>FTL – Full Truck Load</option>
              <option>LTL – Part Load</option>
              <option>Groupage / Consolidation</option>
              <option>Dedicated Vehicle</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Est. Transit Days</label>
            <input
              v-model="form.est_transit_days"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="1"
              placeholder="0"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Est. Distance (km)</label>
            <input
              v-model="form.est_distance_km"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="1"
              placeholder="0"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Load Plan Ref</label>
            <input
              v-model="form.load_plan_ref"
              class="road-input"
              :disabled="disabled"
              placeholder="Load plan / manifest ref"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Pallet Spaces Required</label>
            <input
              v-model="form.pallet_spaces_required"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="1"
              placeholder="0"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Pallet Type</label>
            <select v-model="form.pallet_type" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>Euro Pallet (120×80)</option>
              <option>UK Pallet (120×100)</option>
              <option>Half Pallet</option>
              <option>Mixed</option>
              <option>N/A – Bulk</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Max Stack Height (cm)</label>
            <input
              v-model="form.max_stack_height_cm"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              placeholder="220"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Insurance Level</label>
            <select v-model="form.insurance_level" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>Standard (RHA Conditions)</option>
              <option>Enhanced Cover</option>
              <option>Full Declared Value</option>
              <option>Customer's Own Insurance</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Multi-Drop?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.multi_drop === 'yes' }"
                :disabled="disabled"
                @click="form.multi_drop = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.multi_drop === 'no' }"
                :disabled="disabled"
                @click="form.multi_drop = 'no'"
              >
                No
              </button>
            </div>
          </div>

          <div class="road-field">
            <label class="road-label">Intermodal Leg?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.intermodal_leg === 'yes' }"
                :disabled="disabled"
                @click="form.intermodal_leg = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.intermodal_leg === 'no' }"
                :disabled="disabled"
                @click="form.intermodal_leg = 'no'"
              >
                No
              </button>
            </div>
          </div>

          <div class="road-field">
            <label class="road-label">Customs Required?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.customs_required === 'yes' }"
                :disabled="disabled"
                @click="form.customs_required = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.customs_required === 'no' }"
                :disabled="disabled"
                @click="form.customs_required = 'no'"
              >
                No
              </button>
            </div>
          </div>

          <div class="road-field">
            <label class="road-label">Subcontractor Used?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.subcontractor_used === 'yes' }"
                :disabled="disabled"
                @click="form.subcontractor_used = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.subcontractor_used === 'no' }"
                :disabled="disabled"
                @click="form.subcontractor_used = 'no'"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="form.customs_required === 'yes'" class="road-card road-card--transport">
      <div class="road-card__head">
        <div class="road-card__title road-card__title--purple">Customs &amp; Border Details</div>
      </div>

      <div class="road-card__body">
        <div class="road-grid road-grid--4">
          <div class="road-field">
            <label class="road-label">Customs Document Type</label>
            <select v-model="form.customs_document_type" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>CMR (Road Waybill)</option>
              <option>T1 – External Transit</option>
              <option>T2 – Internal Transit</option>
              <option>EUR.1 Movement Cert.</option>
              <option>ATA Carnet</option>
              <option>SAD (C88)</option>
              <option>Import Entry (E2)</option>
              <option>Other</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">MRN / Declaration Ref</label>
            <input
              v-model="form.mrn_declaration_ref"
              class="road-input"
              :disabled="disabled"
              placeholder="Movement Reference No."
            />
          </div>

          <div class="road-field">
            <label class="road-label">Port / Border Crossing</label>
            <input
              v-model="form.port_border_crossing"
              class="road-input"
              :disabled="disabled"
              placeholder="Dover / Calais"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Ferry Booking Ref</label>
            <input
              v-model="form.ferry_booking_ref"
              class="road-input"
              :disabled="disabled"
              placeholder="Ferry / tunnel booking ref"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Exporter EORI</label>
            <input
              v-model="form.exporter_eori"
              class="road-input"
              :disabled="disabled"
              placeholder="GB123456789000"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Importer EORI</label>
            <input
              v-model="form.importer_eori"
              class="road-input"
              :disabled="disabled"
              placeholder="GB / EU EORI"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Customs Broker / Agent</label>
            <input
              v-model="form.customs_broker_agent"
              class="road-input"
              :disabled="disabled"
              placeholder="Broker company name"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Broker Reference</label>
            <input
              v-model="form.broker_reference"
              class="road-input"
              :disabled="disabled"
              placeholder="Broker job / entry ref"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Country of Origin</label>
            <input
              v-model="form.country_of_origin"
              class="road-input"
              :disabled="disabled"
              placeholder="e.g. United Kingdom"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Country of Destination</label>
            <input
              v-model="form.country_of_destination"
              class="road-input"
              :disabled="disabled"
              placeholder="e.g. Germany"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Duty Rate (%)</label>
            <input
              v-model="form.duty_rate_percent"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Customs Status</label>
            <select v-model="form.customs_status" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>Pending</option>
              <option>Pre-Lodged</option>
              <option>Cleared</option>
              <option>Held for Inspection</option>
              <option>Released</option>
            </select>
          </div>

          <div class="road-field road-span-4">
            <label class="road-label">Customs Notes</label>
            <textarea
              v-model="form.customs_notes"
              class="road-textarea"
              :disabled="disabled"
              placeholder="Inspection requirements, special declarations, phytosanitary certificates, licence numbers…"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="form.intermodal_leg === 'yes'" class="road-card road-card--transport">
      <div class="road-card__head">
        <div class="road-card__title road-card__title--purple">Intermodal Leg Details</div>
      </div>

      <div class="road-card__body">
        <div class="road-grid road-grid--4">
          <div class="road-field">
            <label class="road-label">Mode</label>
            <select v-model="form.intermodal_mode" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>Rail + Road</option>
              <option>Sea + Road</option>
              <option>Air + Road</option>
              <option>Rail + Sea + Road</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Terminal / Hub</label>
            <input
              v-model="form.intermodal_terminal_hub"
              class="road-input"
              :disabled="disabled"
              placeholder="e.g. Daventry SRFI, DIRFT"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Rail / Vessel Booking Ref</label>
            <input
              v-model="form.intermodal_booking_ref"
              class="road-input"
              :disabled="disabled"
              placeholder="Booking reference"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Container / Unit No.</label>
            <input
              v-model="form.intermodal_container_unit_no"
              class="road-input"
              :disabled="disabled"
              placeholder="Container or unit number"
            />
          </div>

          <div class="road-field road-span-4">
            <label class="road-label">Intermodal Notes</label>
            <textarea
              v-model="form.intermodal_notes"
              class="road-textarea"
              :disabled="disabled"
              placeholder="Terminal gate cut-off times, booking confirmation details, strip/stuff instructions…"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="form.subcontractor_used === 'yes'" class="road-card road-card--transport">
      <div class="road-card__head">
        <div class="road-card__title road-card__title--purple">Subcontractor Details</div>
      </div>

      <div class="road-card__body">
        <div class="road-grid road-grid--4">
          <div class="road-field">
            <label class="road-label">Subcontractor Name</label>
            <input
              v-model="form.subcontractor_name"
              class="road-input"
              :disabled="disabled"
              placeholder="Company name"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Subcontractor Ref</label>
            <input
              v-model="form.subcontractor_ref"
              class="road-input"
              :disabled="disabled"
              placeholder="Their job / booking ref"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Contact Name</label>
            <input
              v-model="form.subcontractor_contact_name"
              class="road-input"
              :disabled="disabled"
              placeholder="Operations contact"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Contact Phone</label>
            <input
              v-model="form.subcontractor_contact_phone"
              class="road-input"
              :disabled="disabled"
              placeholder="+44 …"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Buy Rate (£)</label>
            <input
              v-model="form.buy_rate"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Buy Currency</label>
            <select v-model="form.buy_currency" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>GBP</option>
              <option>EUR</option>
              <option>USD</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Subcon PO / Instruction Ref</label>
            <input
              v-model="form.subcon_po_instruction_ref"
              class="road-input"
              :disabled="disabled"
              placeholder="Purchase order / instruction ref"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Subcon Status</label>
            <select v-model="form.subcon_status" class="road-select" :disabled="disabled">
              <option value="">— Select —</option>
              <option>Pending Confirmation</option>
              <option>Confirmed</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Invoice Received</option>
            </select>
          </div>

          <div class="road-field road-span-4">
            <label class="road-label">Subcontractor Notes</label>
            <textarea
              v-model="form.subcontractor_notes"
              class="road-textarea"
              :disabled="disabled"
              placeholder="Instructions issued, agreed rates, special conditions…"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
