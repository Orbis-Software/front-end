<script setup lang="ts">
import "./AccountsClientBankDetailsSection.css"

import { computed, onMounted, reactive, ref } from "vue"
import { storeToRefs } from "pinia"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Paginator from "primevue/paginator"
import { useToast } from "primevue/usetoast"

import { useClientBankDetailStore } from "@/app/stores/client-bank-details"
import { useContactStore } from "@/app/stores/contact"
import { useGlobalReferenceDataStore } from "@/app/stores/global-reference-data"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type { ClientBankDetail, ClientBankDetailPayload } from "@/app/types/client-bank-detail"
import type { Contact } from "@/app/types/contact"
import type { GlobalReferenceDataRow } from "@/app/types/globalReferenceData"

type SelectOption = {
  label: string
  value: string
}

type ContactOption = {
  label: string
  value: number
  subLabel: string
  searchText: string
}

type CityOption = {
  label: string
  value: string
  subLabel: string
  searchText: string
}

const bankDetailStore = useClientBankDetailStore()
const contactStore = useContactStore()
const globalReferenceDataStore = useGlobalReferenceDataStore()
const referenceDataStore = useReferenceDataStore()
const { data: globalReferenceData } = storeToRefs(globalReferenceDataStore)
const toast = useToast()

const editingId = ref<number | null>(null)
const formVisible = ref(false)
const deleteDialogVisible = ref(false)
const pendingDeleteBankDetail = ref<ClientBankDetail | null>(null)
const filterState = reactive({
  search: "",
  contactId: null as number | null,
  sort: "account",
  direction: "asc" as "asc" | "desc",
  page: 1,
  perPage: 15,
})

const form = reactive({
  contactId: null as number | null,
  account: "",
  branch: "",
  prefix: "",
  currency: "GBP",
  accountNo: "",
  sortCode: "",
  bic: "",
  swift: "",
  iban: "",
  bank: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  city: "",
  countyState: "",
  postCodeZip: "",
  country: "GB",
})

const countsText = computed(() => {
  const range =
    bankDetailStore.from && bankDetailStore.to
      ? `${bankDetailStore.from}-${bankDetailStore.to}`
      : "0"

  return `Showing ${range} of ${bankDetailStore.filtered} bank details`
})
const firstRow = computed(() => (filterState.page - 1) * filterState.perPage)
const formTitle = computed(() => (editingId.value ? "Edit Bank Detail" : "Add Bank Detail"))
const fallbackCurrencyOptions: SelectOption[] = [
  { label: "GBP", value: "GBP" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
]
const currencyOptions = computed<SelectOption[]>(() => {
  const category = referenceDataStore.getByKey("currency")
  const options = (category?.options ?? []).map(optionFromReference).filter(option => option.value)
  const nextOptions = options.length ? options : fallbackCurrencyOptions
  const selected = form.currency

  if (!selected || nextOptions.some(option => option.value === selected)) {
    return nextOptions
  }

  return [{ label: selected, value: selected }, ...nextOptions]
})
const cityOptions = computed<CityOption[]>(() => {
  const sourceRows = globalReferenceData.value.locations.length
    ? globalReferenceData.value.locations
    : globalReferenceData.value.cities
  const options = sourceRows
    .map(row => {
      const city = firstValue(row, ["fullName", "full_name", "city", "location", "name"])
      const code = firstValue(row, ["code", "iata", "iataCode", "iata_code", "unlocode"])
      const country = firstValue(row, ["country", "countryName", "country_name"])
      const label = labelWithCode(city, code)

      return {
        label,
        value: city || code,
        subLabel: [country, code].filter(Boolean).join(" | "),
        searchText: searchText(row, [city, code, country, label]),
      }
    })
    .filter(option => option.value)

  if (!form.city || options.some(option => option.value === form.city)) {
    return options
  }

  return [
    {
      label: form.city,
      value: form.city,
      subLabel: "",
      searchText: form.city,
    },
    ...options,
  ]
})
const contactOptions = computed<ContactOption[]>(() => {
  return contactStore.items.map(contact => {
    const label = displayContactName(contact)
    const subLabel = [contact.account_number, contact.email].filter(Boolean).join(" | ")

    return {
      label,
      value: contact.id,
      subLabel,
      searchText: [label, subLabel].filter(Boolean).join(" "),
    }
  })
})

function displayContactName(contact: Contact): string {
  return contact.company_name || contact.account_number || contact.email || `Contact ${contact.id}`
}

function cleanReferenceName(value: string): string {
  return String(value ?? "")
    .replace(/\*$/, "")
    .trim()
}

function optionFromReference(option: any): SelectOption {
  const name = cleanReferenceName(option?.name ?? option?.label ?? option)

  return {
    label: name,
    value: name,
  }
}

function firstValue(row: GlobalReferenceDataRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    if (value) return String(value).trim()
  }

  return ""
}

function labelWithCode(name: string, code: string): string {
  if (name && code && !name.toLowerCase().includes(code.toLowerCase())) return `${code} - ${name}`
  if (name) return name

  return code
}

function searchText(row: GlobalReferenceDataRow, values: string[]): string {
  return [...values, ...Object.values(row)].filter(Boolean).join(" ")
}

function errorMessage(error: unknown, fallback: string): string {
  const nextError = error as any

  return (
    nextError?.response?.data?.message || nextError?.message || bankDetailStore.error || fallback
  )
}

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    contactId: null,
    account: "",
    branch: "",
    prefix: "",
    currency: "GBP",
    accountNo: "",
    sortCode: "",
    bic: "",
    swift: "",
    iban: "",
    bank: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    countyState: "",
    postCodeZip: "",
    country: "GB",
  })
}

function requestParams() {
  return { ...filterState }
}

async function fetchBankDetails() {
  await bankDetailStore.fetch(requestParams())
}

async function fetchContacts() {
  if (!contactStore.items.length) {
    contactStore.perPage = 100
    await contactStore.fetch()
  }
}

async function fetchCurrencyOptions() {
  if (!referenceDataStore.getByKey("currency")) {
    await referenceDataStore.fetchCategory("currency")
  }
}

async function fetchGlobalReferenceData() {
  if (
    !globalReferenceData.value.locations.length &&
    !globalReferenceData.value.terminals.length &&
    !globalReferenceData.value.airlines.length &&
    !globalReferenceData.value.cities.length
  ) {
    await globalReferenceDataStore.fetchAll()
  }
}

async function applyFilters() {
  filterState.page = 1
  await fetchBankDetails()
}

function openCreateModal() {
  resetForm()
  formVisible.value = true
}

function closeForm() {
  formVisible.value = false
  resetForm()
}

function closeDeleteDialog() {
  deleteDialogVisible.value = false
  pendingDeleteBankDetail.value = null
}

function payloadFromForm(): ClientBankDetailPayload {
  return {
    contactId: form.contactId,
    account: form.account,
    branch: form.branch,
    prefix: form.prefix,
    currency: form.currency.toUpperCase(),
    accountNo: form.accountNo,
    sortCode: form.sortCode,
    bic: form.bic,
    swift: form.swift,
    iban: form.iban,
    bank: form.bank,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2,
    addressLine3: form.addressLine3,
    city: form.city,
    countyState: form.countyState,
    postCodeZip: form.postCodeZip,
    country: form.country.toUpperCase(),
  }
}

async function saveBankDetail() {
  const isEditing = Boolean(editingId.value)

  try {
    if (editingId.value) await bankDetailStore.update(editingId.value, payloadFromForm())
    else await bankDetailStore.create(payloadFromForm())

    toast.add({
      severity: "success",
      summary: isEditing ? "Bank detail updated" : "Bank detail added",
      detail: isEditing
        ? "The bank detail was updated successfully."
        : "The bank detail was added successfully.",
      life: 3000,
    })

    closeForm()
    await fetchBankDetails()
  } catch (error) {
    toast.add({
      severity: "error",
      summary: isEditing ? "Update failed" : "Save failed",
      detail: errorMessage(error, "Unable to save the bank detail."),
      life: 5000,
    })
  }
}

function editBankDetail(row: ClientBankDetail) {
  editingId.value = row.id
  Object.assign(form, {
    contactId: row.contactId,
    account: row.account,
    branch: row.branch,
    prefix: row.prefix,
    currency: row.currency,
    accountNo: row.accountNo,
    sortCode: row.sortCode,
    bic: row.bic,
    swift: row.swift,
    iban: row.iban,
    bank: row.bank,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    addressLine3: row.addressLine3,
    city: row.city,
    countyState: row.countyState,
    postCodeZip: row.postCodeZip,
    country: row.country,
  })
  formVisible.value = true
}

function requestDeleteBankDetail(row: ClientBankDetail) {
  pendingDeleteBankDetail.value = row
  deleteDialogVisible.value = true
}

async function confirmDeleteBankDetail() {
  if (!pendingDeleteBankDetail.value) return

  try {
    await bankDetailStore.remove(pendingDeleteBankDetail.value.id)
    toast.add({
      severity: "success",
      summary: "Bank detail deleted",
      detail: "The bank detail was deleted successfully.",
      life: 3000,
    })
    closeDeleteDialog()
    await fetchBankDetails()
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Delete failed",
      detail: errorMessage(error, "Unable to delete the bank detail."),
      life: 5000,
    })
  }
}

async function onPage(event: { first?: number; rows?: number }) {
  const rows = Number(event.rows ?? filterState.perPage)
  filterState.perPage = rows
  filterState.page = Math.floor(Number(event.first ?? 0) / rows) + 1
  await fetchBankDetails()
}

function sortBy(key: string) {
  if (filterState.sort === key) {
    filterState.direction = filterState.direction === "asc" ? "desc" : "asc"
  } else {
    filterState.sort = key
    filterState.direction = "asc"
  }

  fetchBankDetails()
}

function sortMarker(key: string) {
  if (filterState.sort !== key) return ""

  return filterState.direction === "asc" ? "^" : "v"
}

function contactLabel(row: ClientBankDetail) {
  if (row.contact) return row.contact.companyName || row.contact.accountNumber || row.contact.email

  return "-"
}

onMounted(async () => {
  await Promise.all([
    fetchBankDetails(),
    fetchContacts(),
    fetchCurrencyOptions(),
    fetchGlobalReferenceData(),
  ])
})
</script>

<template>
  <div class="accounts-client-bank-details">
    <section class="accounts-client-bank-details__panel">
      <div class="accounts-client-bank-details__head">
        <div>
          <div class="accounts-client-bank-details__eyebrow">CLIENT BANK DETAILS</div>
          <h2 class="accounts-client-bank-details__title">Business bank accounts by currency</h2>
        </div>

        <div class="accounts-client-bank-details__actions">
          <Button label="Add Bank Detail" class="btn btn--primary" @click="openCreateModal" />
        </div>
      </div>

      <div class="accounts-client-bank-details__filters">
        <div
          class="accounts-client-bank-details__field accounts-client-bank-details__field--search"
        >
          <label>Search</label>
          <InputText
            v-model="filterState.search"
            placeholder="Search account, IBAN, bank, contact..."
            @input="applyFilters"
          />
        </div>

        <div class="accounts-client-bank-details__field">
          <label>Contact</label>
          <Dropdown
            v-model="filterState.contactId"
            :options="contactOptions"
            option-label="label"
            option-value="value"
            placeholder="All contacts"
            filter
            show-clear
            filter-by="label,subLabel,searchText"
            class="accounts-client-bank-details__control"
            @change="applyFilters"
          >
            <template #option="{ option }">
              <div class="accounts-client-bank-details__contact-option">
                <strong>{{ option.label }}</strong>
                <small v-if="option.subLabel">{{ option.subLabel }}</small>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>

      <Dialog
        v-model:visible="formVisible"
        :header="formTitle"
        modal
        class="accounts-client-bank-details__dialog"
        :style="{ width: '920px', maxWidth: 'calc(100vw - 32px)' }"
        @hide="resetForm"
      >
        <div class="accounts-client-bank-details__form-stack">
          <section class="accounts-client-bank-details__form-card">
            <div class="accounts-client-bank-details__form-card-head">
              <span class="accounts-client-bank-details__form-card-kicker">Account</span>
              <h3>Client account details</h3>
            </div>

            <div class="accounts-client-bank-details__form-grid">
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--xlarge"
              >
                <label>Contact</label>
                <Dropdown
                  v-model="form.contactId"
                  :options="contactOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select contact..."
                  filter
                  show-clear
                  filter-by="label,subLabel,searchText"
                  class="accounts-client-bank-details__control"
                >
                  <template #option="{ option }">
                    <div class="accounts-client-bank-details__contact-option">
                      <strong>{{ option.label }}</strong>
                      <small v-if="option.subLabel">{{ option.subLabel }}</small>
                    </div>
                  </template>
                </Dropdown>
              </div>

              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--xlarge"
              >
                <label>Account Name</label>
                <InputText v-model="form.account" placeholder="PC Cargo UK Ltd - GBP" autofocus />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--large"
              >
                <label>Branch Name</label>
                <InputText v-model="form.branch" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--small"
              >
                <label>Prefix</label>
                <InputText v-model="form.prefix" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--small"
              >
                <label>Currency</label>
                <Dropdown
                  v-model="form.currency"
                  :options="currencyOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select currency"
                  filter
                  class="accounts-client-bank-details__control"
                  :disabled="referenceDataStore.loading && !currencyOptions.length"
                />
              </div>
            </div>
          </section>

          <section class="accounts-client-bank-details__form-card">
            <div class="accounts-client-bank-details__form-card-head">
              <span class="accounts-client-bank-details__form-card-kicker">Bank</span>
              <h3>Identifiers</h3>
            </div>

            <div class="accounts-client-bank-details__form-grid">
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--medium"
              >
                <label>Account Number</label>
                <InputText v-model="form.accountNo" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--small"
              >
                <label>Sort Code</label>
                <InputText v-model="form.sortCode" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--medium"
              >
                <label>BIC</label>
                <InputText v-model="form.bic" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--medium"
              >
                <label>SWIFT</label>
                <InputText v-model="form.swift" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--xlarge"
              >
                <label>IBAN</label>
                <InputText v-model="form.iban" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--xlarge"
              >
                <label>Bank Name</label>
                <InputText v-model="form.bank" />
              </div>
            </div>
          </section>

          <section class="accounts-client-bank-details__form-card">
            <div class="accounts-client-bank-details__form-card-head">
              <span class="accounts-client-bank-details__form-card-kicker">Address</span>
              <h3>Bank location</h3>
            </div>

            <div class="accounts-client-bank-details__form-grid">
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--large"
              >
                <label>Address Line 1</label>
                <InputText v-model="form.addressLine1" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--large"
              >
                <label>Address Line 2</label>
                <InputText v-model="form.addressLine2" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--large"
              >
                <label>Address Line 3</label>
                <InputText v-model="form.addressLine3" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--medium"
              >
                <label>City</label>
                <Dropdown
                  v-model="form.city"
                  :options="cityOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select city"
                  filter
                  show-clear
                  filter-by="label,value,subLabel,searchText"
                  class="accounts-client-bank-details__control"
                  :disabled="globalReferenceDataStore.loading && !cityOptions.length"
                >
                  <template #option="{ option }">
                    <div class="accounts-client-bank-details__contact-option">
                      <strong>{{ option.label }}</strong>
                      <small v-if="option.subLabel">{{ option.subLabel }}</small>
                    </div>
                  </template>
                </Dropdown>
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--medium"
              >
                <label>County / State</label>
                <InputText v-model="form.countyState" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--small"
              >
                <label>Post Code / ZIP</label>
                <InputText v-model="form.postCodeZip" />
              </div>
              <div
                class="accounts-client-bank-details__field accounts-client-bank-details__field--small"
              >
                <label>Country Code</label>
                <InputText v-model="form.country" maxlength="3" />
              </div>
            </div>
          </section>
        </div>

        <template #footer>
          <div class="accounts-client-bank-details__dialog-actions">
            <Button label="Cancel" class="btn btn--ghost" @click="closeForm" />
            <Button
              :label="editingId ? 'Save Bank Detail' : 'Add Bank Detail'"
              class="btn btn--primary"
              :loading="bankDetailStore.saving"
              @click="saveBankDetail"
            />
          </div>
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteDialogVisible"
        header="Delete Bank Detail"
        modal
        class="accounts-client-bank-details__dialog"
        :style="{ width: '460px', maxWidth: 'calc(100vw - 32px)' }"
        @hide="closeDeleteDialog"
      >
        <p class="accounts-client-bank-details__confirm-message">
          Delete "{{ pendingDeleteBankDetail?.account }}"? This cannot be undone.
        </p>

        <template #footer>
          <div class="accounts-client-bank-details__dialog-actions">
            <Button label="Cancel" class="btn btn--ghost" @click="closeDeleteDialog" />
            <Button
              label="Delete"
              class="btn btn--primary"
              :loading="bankDetailStore.saving"
              @click="confirmDeleteBankDetail"
            />
          </div>
        </template>
      </Dialog>

      <div class="accounts-client-bank-details__counts">{{ countsText }}</div>
      <div v-if="bankDetailStore.error" class="accounts-client-bank-details__error">
        {{ bankDetailStore.error }}
      </div>

      <div class="accounts-client-bank-details__table-wrap">
        <table class="accounts-client-bank-details__table">
          <thead>
            <tr>
              <th @click="sortBy('account')">Account {{ sortMarker("account") }}</th>
              <th @click="sortBy('contact')">Contact {{ sortMarker("contact") }}</th>
              <th @click="sortBy('currency')">Currency {{ sortMarker("currency") }}</th>
              <th @click="sortBy('branch')">Branch {{ sortMarker("branch") }}</th>
              <th @click="sortBy('accountNo')">Account No. {{ sortMarker("accountNo") }}</th>
              <th>Sort Code</th>
              <th>IBAN</th>
              <th>SWIFT</th>
              <th @click="sortBy('bank')">Bank {{ sortMarker("bank") }}</th>
              <th @click="sortBy('country')">Country {{ sortMarker("country") }}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bankDetailStore.loading">
              <td colspan="11">Loading bank details...</td>
            </tr>
            <tr v-else-if="!bankDetailStore.bankDetails.length">
              <td colspan="11">No bank details found.</td>
            </tr>
            <tr v-for="row in bankDetailStore.bankDetails" v-else :key="row.id">
              <td>{{ row.account }}</td>
              <td>{{ contactLabel(row) }}</td>
              <td>{{ row.currency }}</td>
              <td>{{ row.branch || "-" }}</td>
              <td>{{ row.accountNo || "-" }}</td>
              <td>{{ row.sortCode || "-" }}</td>
              <td>{{ row.iban || "-" }}</td>
              <td>{{ row.swift || "-" }}</td>
              <td>{{ row.bank || "-" }}</td>
              <td>{{ row.country || "-" }}</td>
              <td>
                <div class="accounts-client-bank-details__table-actions">
                  <Button label="Edit" class="btn btn--ghost" @click="editBankDetail(row)" />
                  <Button
                    label="Delete"
                    class="btn btn--ghost"
                    @click="requestDeleteBankDetail(row)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Paginator
        v-if="bankDetailStore.filtered > 0"
        :rows="filterState.perPage"
        :total-records="bankDetailStore.filtered"
        :first="firstRow"
        :rows-per-page-options="[15, 25, 50, 100]"
        class="accounts-client-bank-details__paginator"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPage"
      />
    </section>
  </div>
</template>
