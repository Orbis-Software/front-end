<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()

function copyFromCollection(form: any) {
  form.delivery_company_name = form.collection_company_name
  form.delivery_address_1 = form.collection_address_1
  form.delivery_address_2 = form.collection_address_2
  form.delivery_city = form.collection_city
  form.delivery_county_state = form.collection_county_state
  form.delivery_postcode = form.collection_postcode
  form.delivery_country = form.collection_country
  form.delivery_contact_name = form.collection_contact_name
  form.delivery_phone = form.collection_phone
  form.delivery_email = form.collection_email
}
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title road-card__title--green">Delivery (Destination)</div>

      <button
        type="button"
        class="road-segmented__btn road-segmented__btn--active"
        :disabled="disabled"
        @click="copyFromCollection(form)"
      >
        Copy from Collection
      </button>
    </div>

    <div class="road-card__body">
      <div class="road-grid road-grid--2">
        <div class="road-field road-span-2">
          <label class="road-label">Company Name</label>
          <input
            v-model="form.delivery_company_name"
            class="road-input"
            :disabled="disabled"
            placeholder="Company name"
          />
        </div>

        <div class="road-field road-span-2">
          <label class="road-label">Address Line 1</label>
          <input
            v-model="form.delivery_address_1"
            class="road-input"
            :disabled="disabled"
            placeholder="Street address"
          />
        </div>

        <div class="road-field road-span-2">
          <label class="road-label">Address Line 2</label>
          <input
            v-model="form.delivery_address_2"
            class="road-input"
            :disabled="disabled"
            placeholder="Unit / building"
          />
        </div>

        <div class="road-field">
          <label class="road-label">City / Town</label>
          <input
            v-model="form.delivery_city"
            class="road-input"
            :disabled="disabled"
            placeholder="City"
          />
        </div>

        <div class="road-field">
          <label class="road-label">County / State</label>
          <input
            v-model="form.delivery_county_state"
            class="road-input"
            :disabled="disabled"
            placeholder="County"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Postcode</label>
          <input
            v-model="form.delivery_postcode"
            class="road-input"
            :disabled="disabled"
            placeholder="Postcode"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Country</label>
          <input
            v-model="form.delivery_country"
            class="road-input"
            :disabled="disabled"
            placeholder="Country"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Contact Name</label>
          <input
            v-model="form.delivery_contact_name"
            class="road-input"
            :disabled="disabled"
            placeholder="Contact name"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Phone</label>
          <input
            v-model="form.delivery_phone"
            class="road-input"
            :disabled="disabled"
            placeholder="+44 …"
          />
        </div>

        <div class="road-field road-span-2">
          <label class="road-label">Email</label>
          <input
            v-model="form.delivery_email"
            class="road-input"
            :disabled="disabled"
            placeholder="contact@company.com"
          />
        </div>

        <hr class="road-divider road-span-2" />

        <div class="road-field">
          <label class="road-label">Delivery Date</label>
          <input
            v-model="form.delivery_date_ui"
            class="road-input"
            :disabled="disabled"
            type="date"
          />
        </div>

        <div class="road-field">
          <label class="road-label">Delivery From</label>
          <input v-model="form.delivery_from" class="road-input" :disabled="disabled" type="time" />
        </div>

        <div class="road-field">
          <label class="road-label">Delivery By</label>
          <input v-model="form.delivery_by" class="road-input" :disabled="disabled" type="time" />
        </div>

        <div class="road-field">
          <label class="road-label">Delivery Booking Ref</label>
          <input
            v-model="form.delivery_booking_ref"
            class="road-input"
            :disabled="disabled"
            placeholder="Booking / delivery ref"
          />
        </div>

        <div class="road-field road-span-2">
          <label class="road-label">Delivery Instructions</label>
          <textarea
            v-model="form.delivery_instructions"
            class="road-textarea"
            :disabled="disabled"
            placeholder="Access codes, parking, unloading notes, POD requirements…"
          />
        </div>
      </div>
    </div>
  </div>
</template>
