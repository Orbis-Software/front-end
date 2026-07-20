<script setup lang="ts">
import { computed } from "vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import type { AddressChoice, AddressTarget } from "@/app/types/job-details"
import type { Contact } from "@/app/types/contact"

const props = defineProps<{
  visible: boolean
  target: AddressTarget
  contact: Contact | null
}>()

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void
  (e: "select", value: AddressChoice): void
}>()

const title = computed(() =>
  props.target === "origin" ? "Choose Origin Address" : "Choose Destination Address",
)

const ownerName = computed(() => {
  const contact = props.contact

  return contact?.company_name || contact?.email || (contact?.id ? `Contact ${contact.id}` : "")
})

const choices = computed<AddressChoice[]>(() => {
  const contact = props.contact
  if (!contact) return []

  const addresses = (contact.collection_addresses ?? []).map(address => ({
    id: Number(address.id),
    contact_id: contact.id ? Number(contact.id) : null,
    sourceType: "collection_address" as const,
    label: address.label || address.city || "Address",
    ownerName: ownerName.value,
    address_line_1: address.address_line_1 ?? null,
    address_line_2: address.address_line_2 ?? null,
    address_line_3: address.address_line_3 ?? null,
    city: address.city ?? null,
    county_state: address.county_state ?? null,
    postal_code: address.postal_code ?? null,
    country_id: address.country_id ?? null,
    country_name: address.country_name ?? null,
    contact_person: address.contact_person ?? null,
    phone: address.phone ?? null,
    email: address.email ?? null,
    is_collection: Boolean(address.is_collection),
    is_delivery: Boolean(address.is_delivery),
    special_instructions: address.special_instructions ?? null,
  }))

  const branches = (contact.branches ?? []).map(branch => ({
    id: Number(branch.id),
    contact_id: contact.id ? Number(contact.id) : null,
    sourceType: "branch" as const,
    label: branch.name || branch.delivery_city || "Branch",
    ownerName: ownerName.value,
    address_line_1: branch.delivery_address_line_1,
    address_line_2: branch.delivery_address_line_2,
    address_line_3: branch.delivery_address_line_3,
    city: branch.delivery_city,
    county_state: branch.delivery_county_state,
    postal_code: branch.delivery_postal_code,
    country_id: branch.delivery_country_id,
    country_name: null,
    contact_person: branch.contact_person,
    phone: branch.phone,
    email: branch.email,
    is_collection: branch.is_collection === undefined ? true : Boolean(branch.is_collection),
    is_delivery: branch.is_delivery === undefined ? true : Boolean(branch.is_delivery),
    special_instructions: null,
  }))

  return [...addresses, ...branches].filter(choice =>
    props.target === "origin" ? choice.is_collection : choice.is_delivery,
  )
})

function addressLine(choice: AddressChoice) {
  return [
    choice.address_line_1,
    choice.address_line_2,
    choice.address_line_3,
    choice.city,
    choice.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
}

function contactLine(choice: AddressChoice) {
  return [choice.contact_person, choice.phone, choice.email].filter(Boolean).join(" / ")
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '48rem', maxWidth: '95vw' }"
    :header="title"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="job-address-picker">
      <div class="job-address-picker__contact">
        <span>Contact</span>
        <strong>{{ ownerName || "No contact selected" }}</strong>
      </div>

      <div v-if="!choices.length" class="job-address-picker__empty">
        This contact has no saved addresses or branches.
      </div>

      <div v-else class="job-address-picker__list">
        <button
          v-for="choice in choices"
          :key="`${choice.sourceType}-${choice.id}`"
          type="button"
          class="job-address-picker__item"
          @click="emit('select', choice)"
        >
          <span class="job-address-picker__badge">
            {{ choice.sourceType === "branch" ? "Branch" : "Address" }}
          </span>
          <strong>{{ choice.label }}</strong>
          <span>{{ addressLine(choice) || "No address lines saved" }}</span>
          <small v-if="contactLine(choice)">{{ contactLine(choice) }}</small>
        </button>
      </div>

      <div class="job-address-picker__footer">
        <Button label="Cancel" type="button" text @click="emit('update:visible', false)" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.job-address-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-address-picker__contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  background: #fbfbfa;
}

.job-address-picker__contact span,
.job-address-picker__item small {
  color: #737373;
  font-size: 11px;
  font-weight: 700;
}

.job-address-picker__contact strong,
.job-address-picker__item strong {
  color: #1a1a18;
  font-size: 13px;
  font-weight: 800;
}

.job-address-picker__list {
  display: grid;
  gap: 10px;
  max-height: 55vh;
  overflow: auto;
}

.job-address-picker__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #e2e2e2;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.job-address-picker__item:hover {
  border-color: #ec691a;
  box-shadow: 0 0 0 2px rgba(236, 105, 26, 0.1);
}

.job-address-picker__item > span:not(.job-address-picker__badge),
.job-address-picker__item small {
  grid-column: 2;
}

.job-address-picker__badge {
  grid-row: span 3;
  align-self: start;
  padding: 3px 7px;
  border-radius: 999px;
  background: #fff3e9;
  color: #b84f10;
  font-size: 10px;
  font-weight: 800;
}

.job-address-picker__empty {
  padding: 22px 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  color: #737373;
  text-align: center;
}

.job-address-picker__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
