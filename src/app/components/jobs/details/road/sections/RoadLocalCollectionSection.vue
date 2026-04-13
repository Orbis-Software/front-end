<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  form: any
  disabled?: boolean
}>()

const estimatedMileageCost = computed(() => {
  const distance = Number(props.form.est_distance_miles || 0)
  const rate = Number(props.form.rate_per_mile || 0)
  const total = distance * rate
  return total > 0 ? total.toFixed(2) : ""
})
</script>

<template>
  <div class="road-details">
    <div class="road-banner road-banner--local">
      <div>
        <strong>Local Collection</strong> — Short-distance, same-area collection and delivery.
        Typically same-day or next-day. Van or rigid vehicle. No customs required.
      </div>
    </div>

    <div class="road-card road-card--local">
      <div class="road-card__head">
        <div class="road-card__title road-card__title--blue">Local Collection Details</div>
      </div>

      <div class="road-card__body">
        <div class="road-grid road-grid--4">
          <div class="road-field">
            <label class="road-label">Collection Type</label>
            <select v-model="form.collection_type" class="road-select" :disabled="disabled">
              <option>On-Demand</option>
              <option>Scheduled</option>
              <option>Return Collection</option>
              <option>Multi-Stop Local</option>
              <option>Overnight Parcel</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Priority / Service Level</label>
            <select v-model="form.priority_service_level" class="road-select" :disabled="disabled">
              <option>Standard</option>
              <option>Express (Same-Day)</option>
              <option>Next-Day AM (Pre-12)</option>
              <option>Next-Day PM</option>
              <option>Economy (2–3 Day)</option>
              <option>Time-Critical</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Vehicle Required</label>
            <select v-model="form.vehicle_required" class="road-select" :disabled="disabled">
              <option>Motorbike Courier</option>
              <option>Car / Estate</option>
              <option>Small Van (SWB)</option>
              <option>Transit Van (LWB)</option>
              <option>Luton Box Van</option>
              <option>7.5t Rigid</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Zone / Area</label>
            <input
              v-model="form.zone_area"
              class="road-input"
              :disabled="disabled"
              placeholder="e.g. London Zone 1, M60 Corridor"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Est. Distance (miles)</label>
            <input
              v-model="form.est_distance_miles"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Est. Duration (hrs)</label>
            <input
              v-model="form.est_duration_hours"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="0.25"
              placeholder="0.0"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Rate per Mile (£)</label>
            <input
              v-model="form.rate_per_mile"
              class="road-input"
              :disabled="disabled"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Estimated Mileage Cost</label>
            <input
              :value="estimatedMileageCost ? `£${estimatedMileageCost}` : ''"
              class="road-input"
              disabled
              placeholder="Auto-calculated"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Round Trip?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.round_trip === 'yes' }"
                :disabled="disabled"
                @click="form.round_trip = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.round_trip === 'no' }"
                :disabled="disabled"
                @click="form.round_trip = 'no'"
              >
                No
              </button>
            </div>
          </div>

          <div class="road-field">
            <label class="road-label">Signature Required?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.signature_required === 'yes' }"
                :disabled="disabled"
                @click="form.signature_required = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.signature_required === 'no' }"
                :disabled="disabled"
                @click="form.signature_required = 'no'"
              >
                No
              </button>
            </div>
          </div>

          <div class="road-field">
            <label class="road-label">POD Method</label>
            <select v-model="form.pod_method" class="road-select" :disabled="disabled">
              <option>Paper POD</option>
              <option>ePOD (App)</option>
              <option>Photo Confirmation</option>
              <option>Email Confirmation</option>
              <option>None Required</option>
            </select>
          </div>

          <div class="road-field">
            <label class="road-label">Parking / Access Code</label>
            <input
              v-model="form.parking_access_code"
              class="road-input"
              :disabled="disabled"
              placeholder="e.g. barrier code, bay number"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Time Critical?</label>
            <div class="road-yn">
              <button
                type="button"
                class="road-yn__btn road-yn__btn--yes"
                :class="{ 'road-yn__btn--active': form.time_critical === 'yes' }"
                :disabled="disabled"
                @click="form.time_critical = 'yes'"
              >
                Yes
              </button>
              <button
                type="button"
                class="road-yn__btn road-yn__btn--no"
                :class="{ 'road-yn__btn--active': form.time_critical === 'no' }"
                :disabled="disabled"
                @click="form.time_critical = 'no'"
              >
                No
              </button>
            </div>
          </div>

          <div class="road-field">
            <label class="road-label">Exact Delivery Time</label>
            <input
              v-model="form.exact_delivery_time"
              class="road-input"
              :disabled="disabled"
              type="time"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Driver Assigned</label>
            <input
              v-model="form.driver_assigned"
              class="road-input"
              :disabled="disabled"
              placeholder="Driver name / ID"
            />
          </div>

          <div class="road-field">
            <label class="road-label">Driver Mobile</label>
            <input
              v-model="form.driver_mobile"
              class="road-input"
              :disabled="disabled"
              placeholder="+44 …"
            />
          </div>

          <div class="road-field road-span-4">
            <label class="road-label">Local Collection Notes</label>
            <textarea
              v-model="form.local_collection_notes"
              class="road-textarea"
              :disabled="disabled"
              placeholder="Safe place instructions, access codes, return address if undelivered, any special local knowledge…"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
