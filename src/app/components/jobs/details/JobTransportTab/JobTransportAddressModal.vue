<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"

import { useCountryStore } from "@/app/stores/country"
import type { Country } from "@/app/types/country"
import { useToast } from "primevue/usetoast"
import type {
  JobTransportAddressPayload,
  JobTransportAddressTarget as AddressTarget,
  JobTransportCustomerOption as CustomerOption,
} from "@/app/types/job-details"

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

const props = withDefaults(
  defineProps<{
    visible: boolean
    target: AddressTarget
    saving?: boolean
    customerName?: string
    customerId?: number | null
    customerOptions?: CustomerOption[]
    customerLoading?: boolean
  }>(),
  {
    saving: false,
    customerName: "",
    customerId: null,
    customerOptions: () => [],
    customerLoading: false,
  },
)

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void
  (e: "save", value: JobTransportAddressPayload): void
  (e: "search-customers", value: string): void
  (e: "select-customer", value: number | null): void
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
  props.target === "collection" ? "Add New Collection Address" : "Add New Delivery Address",
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
    class="job-address-editor"
    :style="{ width: 'min(1040px, calc(100vw - 40px))' }"
    :header="headerTitle"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="address-modal-intro">
      <span class="address-modal-intro__icon">
        <i :class="target === 'collection' ? 'pi pi-box' : 'pi pi-map-marker'" />
      </span>
      <div>
        <strong>
          {{ target === "collection" ? "Collection location" : "Delivery location" }}
        </strong>
        <small>
          Add the location and contact details below. Required fields are marked with an asterisk.
        </small>
      </div>
    </div>

    <div v-if="target === 'collection'" class="address-owner-banner">
      <span>Selected customer</span>
      <strong>{{ customerName || "No customer selected" }}</strong>
      <small>This collection address will be saved under the job customer.</small>
    </div>

    <div v-else class="address-customer-field">
      <div class="address-customer-field__heading">
        <div>
          <span>Save under customer <strong>*</strong></span>
          <small>Search and choose the customer that will own this delivery address.</small>
        </div>
        <i class="pi pi-users" />
      </div>

      <Dropdown
        :model-value="customerId"
        :options="customerOptions"
        option-label="label"
        option-value="value"
        placeholder="Search and select customer"
        filter
        show-clear
        append-to="body"
        class="address-customer-field__control"
        :loading="customerLoading"
        @filter="emit('search-customers', $event.value ?? '')"
        @update:model-value="emit('select-customer', $event)"
      />
    </div>

    <div class="address-modal-grid">
      <div class="field">
        <label class="label">Label <span>*</span></label>
        <InputText
          v-model="addressForm.label"
          class="field-fluid field-input"
          placeholder="e.g. Main Warehouse"
        />
      </div>

      <div class="field">
        <label class="label">Contact Person</label>
        <InputText
          v-model="addressForm.contact_person"
          class="field-fluid field-input"
          placeholder="Contact name"
        />
      </div>

      <div class="field">
        <label class="label">Phone</label>
        <InputText
          v-model="addressForm.phone"
          class="field-fluid field-input"
          placeholder="Phone number"
        />
      </div>

      <div class="field field--span-3">
        <label class="label">Address Line 1 <span>*</span></label>
        <InputText
          v-model="addressForm.address_line_1"
          class="field-fluid field-input"
          placeholder="Building number and street"
        />
      </div>

      <div class="field">
        <label class="label">Address Line 2</label>
        <InputText
          v-model="addressForm.address_line_2"
          class="field-fluid field-input"
          placeholder="Area or district"
        />
      </div>

      <div class="field">
        <label class="label">Address Line 3</label>
        <InputText
          v-model="addressForm.address_line_3"
          class="field-fluid field-input"
          placeholder="Additional address details"
        />
      </div>

      <div class="field">
        <label class="label">City</label>
        <InputText
          v-model="addressForm.city"
          class="field-fluid field-input"
          placeholder="City or town"
        />
      </div>

      <div class="field">
        <label class="label">County / State</label>
        <InputText
          v-model="addressForm.county_state"
          class="field-fluid field-input"
          placeholder="County or state"
        />
      </div>

      <div class="field">
        <label class="label">Postal Code</label>
        <InputText
          v-model="addressForm.postal_code"
          class="field-fluid field-input"
          placeholder="Postal or ZIP code"
        />
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
        <label class="label">Email</label>
        <InputText
          v-model="addressForm.email"
          class="field-fluid field-input"
          placeholder="contact@example.com"
        />
      </div>

      <div class="field field--span-2">
        <label class="label">Special Instructions</label>
        <Textarea
          v-model="addressForm.special_instructions"
          class="field-fluid field-textarea"
          rows="2"
          placeholder="Access notes, opening times, loading requirements..."
          autoResize
        />
      </div>

      <div class="address-type-row field--span-3">
        <span class="label address-type-row__label">Address use</span>
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
      <Button
        class="orbis-btn"
        label="Cancel"
        severity="secondary"
        outlined
        type="button"
        :disabled="saving"
        @click="closeModal"
      />
      <Button
        class="orbis-btn orbis-btn--orange"
        label="Save Address"
        icon="pi pi-check"
        type="button"
        :loading="saving"
        :disabled="target === 'delivery' && !customerId"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<style scoped>
:global(.job-address-editor.p-dialog) {
  overflow: hidden;
  border: 1px solid #deded9;
  border-radius: 12px;
}

:global(.job-address-editor .p-dialog-header) {
  padding: 18px 22px;
  border-bottom: 1px solid #edede8;
  color: #272723;
}

:global(.job-address-editor .p-dialog-title) {
  font-size: 18px;
  font-weight: 800;
}

:global(.job-address-editor .p-dialog-content) {
  padding: 20px 22px;
  background: #dededc;
}

:global(.job-address-editor .p-dialog-footer) {
  padding: 14px 22px;
  border-top: 1px solid #edede8;
  background: #fff;
}

.address-modal-intro {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #c9c9c5;
  border-radius: 10px;
  background: #f4f4f2;
  color: #262622;
}

.address-modal-intro__icon {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 10px;
  background: #fff1e8;
  color: #ec691a;
  font-size: 18px;
}

.address-modal-intro > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.address-modal-intro strong {
  font-size: 14px;
}

.address-modal-intro small {
  color: #73736f;
  line-height: 1.4;
}

.address-owner-banner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid #f2b58f;
  border-radius: 10px;
  background: #fff7f1;
}

.address-owner-banner span {
  color: #9a4514;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.address-owner-banner strong {
  overflow: hidden;
  color: #53280e;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-owner-banner small {
  color: #8a5b3c;
  font-size: 11px;
}

.address-customer-field {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(320px, 1.2fr);
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid #c4c4bf;
  border-radius: 10px;
  background: #f4f4f2;
}

.address-customer-field__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.address-customer-field__heading > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-customer-field__heading span {
  color: #292925;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.address-customer-field__heading span strong {
  color: #ec691a;
}

.address-customer-field__heading small {
  color: #676762;
  line-height: 1.35;
}

.address-customer-field__heading > i {
  color: #ec691a;
  font-size: 20px;
}

.address-customer-field__control {
  width: 100%;
}

.address-modal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.label {
  margin-bottom: 7px;
  color: #545450;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.label span {
  color: #ec691a;
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
  height: 42px !important;
  border-color: #b9c2cf !important;
  border-radius: 8px !important;
  background: #fff !important;
  box-shadow: none !important;
}

:deep(.p-dropdown) {
  border-color: #b9c2cf !important;
  border-radius: 8px !important;
  background: #fff !important;
  box-shadow: none !important;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-autocomplete-input:enabled:focus),
:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #ec691a !important;
  box-shadow: 0 0 0 2px rgba(236, 105, 26, 0.12) !important;
}

.field-textarea {
  min-height: 42px;
  border-color: #b9c2cf;
  border-radius: 8px;
  background: #fff;
}

.field--span-2 {
  grid-column: span 2;
}

.field--span-3 {
  grid-column: span 3;
}

.address-type-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 14px;
  border: 1px solid #e6e6e2;
  border-radius: 9px;
  background: #fafaf8;
}

.address-type-row__label {
  margin: 0 auto 0 0;
}

.checkbox-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item label {
  color: #3c3c38;
  font-size: 12px;
  font-weight: 700;
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  border-color: #ec691a;
  background: #ec691a;
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
  min-width: 112px;
  padding: 10px 16px !important;
  border: 1px solid #ec691a !important;
  border-radius: 8px !important;
  background: #fff !important;
  color: #c95612 !important;
  font-weight: 800;
}

.orbis-btn.p-button:hover {
  background: #fff7f1 !important;
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

  .field--span-2,
  .field--span-3 {
    grid-column: span 1;
  }

  .address-owner-banner {
    grid-template-columns: 1fr;
  }

  .address-customer-field {
    grid-template-columns: 1fr;
  }

  .address-type-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .address-type-row__label {
    margin: 0;
  }
}
</style>
