<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"

import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import Dialog from "primevue/dialog"
import Checkbox from "primevue/checkbox"
import AutoComplete from "primevue/autocomplete"

import { useCountryStore } from "@/app/stores/country"
import type { Country } from "@/app/types/country"
import { useToast } from "primevue/usetoast"

type AddressTarget = "collection" | "delivery"

export type JobTransportAddressPayload = {
  label: string | null
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  city: string | null
  county_state: string | null
  postal_code: string | null
  country_id: number | null
  contact_person: string | null
  phone: string | null
  email: string | null
  special_instructions: string | null
  is_collection: boolean
  is_delivery: boolean
}

type AddressForm = {
  label: string
  address_line_1: string
  address_line_2: string
  address_line_3: string
  city: string
  county_state: string
  postal_code: string
  country_id: number | null
  contact_person: string
  phone: string
  email: string
  special_instructions: string
  is_collection: boolean
  is_delivery: boolean
}

const props = defineProps<{
  visible: boolean
  target: AddressTarget
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void
  (e: "save", value: JobTransportAddressPayload): void
}>()

const countryStore = useCountryStore()

const selectedCountry = ref<Country | null>(null)
const countrySuggestions = ref<Country[]>([])
const countrySearching = ref(false)
const toast = useToast()

const addressForm = ref<AddressForm>({
  label: "",
  address_line_1: "",
  address_line_2: "",
  address_line_3: "",
  city: "",
  county_state: "",
  postal_code: "",
  country_id: null,
  contact_person: "",
  phone: "",
  email: "",
  special_instructions: "",
  is_collection: true,
  is_delivery: false,
})

const headerTitle = computed(() =>
  props.target === "collection" ? "Add Collection Address" : "Add Delivery Address",
)

function buildDefaultForm(target: AddressTarget): AddressForm {
  return {
    label: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    city: "",
    county_state: "",
    postal_code: "",
    country_id: null,
    contact_person: "",
    phone: "",
    email: "",
    special_instructions: "",
    is_collection: target === "collection",
    is_delivery: target === "delivery",
  }
}

function isValidEmail(email: string): boolean {
  const value = email.trim()
  if (!value) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function resetForm() {
  addressForm.value = buildDefaultForm(props.target)
  selectedCountry.value = null
  countrySuggestions.value = countryStore.items.slice(0, 20)
}

function closeModal() {
  emit("update:visible", false)
}

function onCountrySelect(country: Country | null) {
  selectedCountry.value = country
  addressForm.value.country_id = country?.id ?? null

  if (!addressForm.value.phone.trim() && country?.dial_code) {
    addressForm.value.phone = String(country.dial_code).trim()
  }
}

async function searchCountries(q: string) {
  const query = String(q ?? "").trim()

  if (!query) {
    countrySuggestions.value = countryStore.items.slice(0, 20)
    return
  }

  countrySearching.value = true
  try {
    countryStore.setSearch?.(query)
    await countryStore.fetch()
    countrySuggestions.value = countryStore.items.slice(0, 30)
  } finally {
    countrySearching.value = false
  }
}

function ensureAtLeastOneFlag() {
  const isCollection = Boolean(addressForm.value.is_collection)
  const isDelivery = Boolean(addressForm.value.is_delivery)

  if (!isCollection && !isDelivery) {
    addressForm.value.is_collection = true
  }
}

function handleSave() {
  if (!addressForm.value.label.trim()) {
    toast.add({
      severity: "warn",
      summary: "Missing Label",
      detail: "Please enter an address label.",
      life: 3000,
    })
    return
  }

  if (!addressForm.value.address_line_1.trim()) {
    toast.add({
      severity: "warn",
      summary: "Missing Address",
      detail: "Address Line 1 is required.",
      life: 3000,
    })
    return
  }

  if (!isValidEmail(addressForm.value.email)) {
    toast.add({
      severity: "warn",
      summary: "Invalid Email",
      detail: "Please enter a valid email address.",
      life: 3000,
    })
    return
  }

  const payload: JobTransportAddressPayload = {
    label: addressForm.value.label || null,
    address_line_1: addressForm.value.address_line_1 || null,
    address_line_2: addressForm.value.address_line_2 || null,
    address_line_3: addressForm.value.address_line_3 || null,
    city: addressForm.value.city || null,
    county_state: addressForm.value.county_state || null,
    postal_code: addressForm.value.postal_code || null,
    country_id: addressForm.value.country_id ?? null,
    contact_person: addressForm.value.contact_person || null,
    phone: addressForm.value.phone || null,
    email: addressForm.value.email || null,
    special_instructions: addressForm.value.special_instructions || null,
    is_collection: Boolean(addressForm.value.is_collection),
    is_delivery: Boolean(addressForm.value.is_delivery),
  }

  emit("save", payload)
}

onMounted(async () => {
  if (!countryStore.items.length) {
    await countryStore.fetch()
  }

  countrySuggestions.value = countryStore.items.slice(0, 20)
})

watch(
  () => [props.visible, props.target],
  ([visible]) => {
    if (visible) resetForm()
  },
  { immediate: true },
)

watch(
  () => [addressForm.value.is_collection, addressForm.value.is_delivery],
  () => ensureAtLeastOneFlag(),
  { immediate: true },
)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '42rem', maxWidth: '95vw' }"
    :header="headerTitle"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="address-modal-grid">
      <div class="field">
        <label class="label">Label</label>
        <InputText v-model="addressForm.label" class="field-fluid field-input" />
      </div>

      <div class="field">
        <label class="label">Contact Person</label>
        <InputText v-model="addressForm.contact_person" class="field-fluid field-input" />
      </div>

      <div class="field field--span-2">
        <label class="label">Address Line 1</label>
        <InputText v-model="addressForm.address_line_1" class="field-fluid field-input" />
      </div>

      <div class="field field--span-2">
        <label class="label">Address Line 2</label>
        <InputText v-model="addressForm.address_line_2" class="field-fluid field-input" />
      </div>

      <div class="field field--span-2">
        <label class="label">Address Line 3</label>
        <InputText v-model="addressForm.address_line_3" class="field-fluid field-input" />
      </div>

      <div class="field">
        <label class="label">City</label>
        <InputText v-model="addressForm.city" class="field-fluid field-input" />
      </div>

      <div class="field">
        <label class="label">County / State</label>
        <InputText v-model="addressForm.county_state" class="field-fluid field-input" />
      </div>

      <div class="field">
        <label class="label">Postal Code</label>
        <InputText v-model="addressForm.postal_code" class="field-fluid field-input" />
      </div>

      <div class="field">
        <label class="label">Country</label>

        <AutoComplete
          v-model="selectedCountry"
          :suggestions="countrySuggestions"
          optionLabel="name"
          :forceSelection="true"
          :dropdown="true"
          :loading="countrySearching"
          placeholder="Search country"
          class="field-fluid"
          @complete="e => searchCountries(e.query)"
          @item-select="e => onCountrySelect(e.value)"
          @clear="() => onCountrySelect(null)"
        >
          <template #option="{ option }">
            <div class="country-option">
              <span>{{ option.name }}</span>
              <span class="country-option__meta">
                {{ option.alpha_2 }} • {{ option.dial_code }}
              </span>
            </div>
          </template>
        </AutoComplete>
      </div>

      <div class="field">
        <label class="label">Phone</label>
        <InputText v-model="addressForm.phone" class="field-fluid field-input" />
      </div>

      <div class="field">
        <label class="label">Email</label>
        <InputText v-model="addressForm.email" class="field-fluid field-input" />
      </div>

      <div class="field field--span-2">
        <label class="label">Special Instructions</label>
        <Textarea v-model="addressForm.special_instructions" class="field-fluid" autoResize />
      </div>

      <div class="checkbox-row field--span-2">
        <div class="checkbox-item">
          <Checkbox v-model="addressForm.is_collection" :binary="true" inputId="is_collection" />
          <label for="is_collection">Collection Address</label>
        </div>

        <div class="checkbox-item">
          <Checkbox v-model="addressForm.is_delivery" :binary="true" inputId="is_delivery" />
          <label for="is_delivery">Delivery Address</label>
        </div>
      </div>
    </div>

    <template #footer>
      <Button class="orbis-btn" label="Cancel" @click="closeModal" />
      <Button
        class="orbis-btn orbis-btn--orange"
        label="Save Address"
        :loading="saving"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.address-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 16px;
}

.field {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 13px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}

.field-fluid {
  width: 100% !important;
}

.field-input,
:deep(.p-inputtext),
:deep(.p-autocomplete),
:deep(.p-autocomplete-input) {
  width: 100% !important;
}

.field-input,
:deep(.p-inputtext),
:deep(.p-autocomplete-input) {
  height: 44px !important;
  border-radius: 10px !important;
}

.field--span-2 {
  grid-column: span 2;
}

.checkbox-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.checkbox-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.country-option {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.country-option__meta {
  opacity: 0.7;
}

.orbis-btn.p-button {
  border-radius: 10px !important;
  padding: 10px 14px !important;
  border: 1px solid #d9d9d9 !important;
  background: #fff !important;
  color: #111 !important;
}

.orbis-btn.p-button:hover {
  background: #f7f7f7 !important;
}

.orbis-btn--orange.p-button {
  background: var(--primary, #ec691a) !important;
  border-color: var(--primary, #ec691a) !important;
  color: #fff !important;
}

.orbis-btn--orange.p-button:hover {
  background: var(--primary-hover, #d85f17) !important;
  border-color: var(--primary-hover, #d85f17) !important;
}

@media (max-width: 900px) {
  .address-modal-grid {
    grid-template-columns: 1fr;
  }

  .field--span-2 {
    grid-column: span 1;
  }

  .checkbox-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
