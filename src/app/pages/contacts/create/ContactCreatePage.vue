<template>
  <div class="contact-create-page">
    <header class="page-header">
      <h1 class="page-title">{{ isEdit ? 'Edit Contact' : 'Contact Details' }}</h1>
      <p class="page-subtitle">
        Please fill in the contact details below. Fields marked with * are required.
      </p>
    </header>

    <section class="card">
      <div v-if="loadingContact" class="loading-wrap" style="padding: 18px; display:flex; gap:10px; align-items:center;">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Loading contact…</span>
      </div>

      <template v-else>
        <!-- CONTACT TYPE -->
        <div class="section">
          <div class="section-head">
            <i class="pi pi-users"></i>
            <h2>Contact Type</h2>
          </div>

          <div class="type-grid">
            <label
              v-for="t in store.types"
              :key="t.id"
              class="type-pill"
              :class="{ checked: form.contact_type_ids.includes(t.id) }"
            >
              <input
                type="checkbox"
                :checked="form.contact_type_ids.includes(t.id)"
                @change="toggleType(t.id)"
              />
              <span>{{ t.name }}</span>
            </label>
          </div>
        </div>

        <!-- COMPANY DETAILS -->
        <div class="divider"></div>

        <div class="section">
          <div class="section-head">
            <i class="pi pi-building"></i>
            <h2>Company Details</h2>
          </div>

          <div class="grid cols-4">
            <div class="field">
              <label class="required">Company Name</label>
              <input v-model="form.company_name" type="text" placeholder="Enter company name" />
            </div>

            <div class="field">
              <label>Account Number</label>
              <input :value="accountNumberPreview" type="text" class="readonly" readonly />
              <div class="hint">
                <i class="pi pi-bolt"></i>
                Will be auto-generated upon save
              </div>
            </div>

            <div class="field">
              <label>Credit Limit</label>
              <input v-model="creditLimitText" type="text" placeholder="Enter credit limit" />
              <div class="hint">(Management approval required)</div>
            </div>

            <div class="field">
              <label>Currency</label>
              <input
                v-model="form.currency_preference"
                type="text"
                placeholder="e.g. USD, EUR, GBP"
                @blur="onCurrencyBlur"
              />
              <div class="hint">(Leave blank for Multi-currency)</div>
            </div>
          </div>
        </div>

        <!-- REGISTRATION DETAILS -->
        <div class="divider"></div>

        <div class="section">
          <div class="section-head">
            <i class="pi pi-file"></i>
            <h2>Registration Details</h2>
          </div>

          <div class="grid cols-3">
            <div class="field">
              <label>Registration Number</label>
              <input v-model="form.registration_number" type="text" placeholder="Company registration number" />
            </div>

            <div class="field">
              <label>VAT Number</label>
              <input v-model="form.vat_number" type="text" placeholder="VAT identification number" />
            </div>

            <div class="field">
              <label>EORI Number</label>
              <input v-model="form.eori" type="text" placeholder="Economic Operators Registration ID" />
            </div>
          </div>
        </div>

        <!-- ADDRESS & CONTACT DETAILS -->
        <div class="divider"></div>

        <div class="section">
          <div class="section-head">
            <i class="pi pi-map-marker"></i>
            <h2>Address & Contact Details</h2>
          </div>

          <div class="grid cols-4">
            <div class="field">
              <label class="required">Address Line 1</label>
              <input v-model="form.address_line_1" type="text" placeholder="Street address, P.O. box" />
            </div>

            <div class="field">
              <label>Address Line 2</label>
              <input v-model="form.address_line_2" type="text" placeholder="Apartment, suite, unit, building, floor" />
            </div>

            <div class="field">
              <label>Address Line 3</label>
              <input v-model="form.address_line_3" type="text" placeholder="Additional address information" />
            </div>

            <div class="field">
              <label class="required">City</label>
              <input v-model="form.city" type="text" placeholder="Enter city" />
            </div>
          </div>

          <div class="grid cols-4">
            <div class="field">
              <label>County/State</label>
              <input v-model="form.county_state" type="text" placeholder="County or state" />
            </div>

            <div class="field">
              <label class="required">Postcode/ZIP</label>
              <input v-model="form.postal_code" type="text" placeholder="Postal or ZIP code" />
            </div>

            <div class="field">
              <label class="required">Country</label>

              <AutoComplete
                v-model="selectedCountry"
                :suggestions="countrySuggestions"
                optionLabel="name"
                :forceSelection="true"
                :dropdown="true"
                :loading="countrySearching"
                placeholder="Search country (e.g. United Kingdom, GB, +44)"
                @complete="(e) => searchCountries(e.query)"
                @item-select="(e) => onCountrySelect(e.value)"
                @clear="() => onCountrySelect(null)"
              >
                <template #option="{ option }">
                  <div style="display:flex; justify-content:space-between; gap:12px;">
                    <span>{{ option.name }}</span>
                    <span style="opacity:.7;">{{ option.alpha_2 }} • {{ option.dial_code }}</span>
                  </div>
                </template>
              </AutoComplete>

              <div class="hint">Selecting a country will auto-fill the phone dial code.</div>
            </div>

            <div class="field">
              <label>&nbsp;</label>
              <div class="empty-slot"></div>
            </div>
          </div>

          <div class="grid cols-3">
            <div class="field">
              <label class="required">Phone Number</label>
              <div class="phone">
                <input
                  v-model="phoneCountryCodeText"
                  type="text"
                  placeholder="+44"
                  style="width: 120px;"
                />
                <input v-model="form.phone" type="tel" placeholder="(234) 567-8900" />
              </div>
              <div class="hint">Dial code is auto-set from Country (you can edit it if needed).</div>
            </div>

            <div class="field">
              <label class="required">Email Address</label>
              <input v-model="form.email" type="email" placeholder="contact@example.com" />
            </div>

            <div class="field">
              <label>Website</label>
              <input v-model="form.website" type="url" placeholder="https://www.example.com" />
            </div>
          </div>

          <!-- <div class="usage">
            <div class="usage-title">
              <i class="pi pi-tags"></i>
              Address Usage
            </div>

            <div class="usage-row">
              <label class="usage-pill" :class="{ checked: form.address_usage.delivery }">
                <input type="checkbox" :checked="form.address_usage.delivery" @change="toggleUsage('delivery')" />
                <span>Delivery Address</span>
              </label>

              <label class="usage-pill" :class="{ checked: form.address_usage.collection }">
                <input type="checkbox" :checked="form.address_usage.collection" @change="toggleUsage('collection')" />
                <span>Collection Address</span>
              </label>

              <label class="usage-pill" :class="{ checked: form.address_usage.consignee }">
                <input type="checkbox" :checked="form.address_usage.consignee" @change="toggleUsage('consignee')" />
                <span>Consignee Address</span>
              </label>

              <label class="usage-pill" :class="{ checked: form.address_usage.accounts }">
                <input type="checkbox" :checked="form.address_usage.accounts" @change="toggleUsage('accounts')" />
                <span>Accounts Address</span>
              </label>

              <label class="usage-pill" :class="{ checked: form.address_usage.headoffice }">
                <input type="checkbox" :checked="form.address_usage.headoffice" @change="toggleUsage('headoffice')" />
                <span>Head Office Address</span>
              </label>
            </div>
          </div> -->
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <button class="btn ghost" type="button" @click="onClear">Clear All</button>
          <button class="btn ghost" type="button" @click="onCancel">Cancel</button>
          <button class="btn primary" type="button" :disabled="saving" @click="onSave">
            {{ isEdit ? 'Update Contact' : 'Save Contact' }}
          </button>
        </div>
      </template>
    </section>

    <footer class="footer">
      © 2026 Contact Management System. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
import './ContactCreatePage.css'
import AutoComplete from 'primevue/autocomplete'
import { useContactCreatePage } from './ContactCreatePage'

const {
  store,
  form,
  saving,
  loadingContact,
  isEdit,

  accountNumberPreview,
  creditLimitText,

  selectedCountry,
  countrySuggestions,
  countrySearching,
  searchCountries,
  onCountrySelect,

  phoneCountryCodeText,

  toggleType,
  toggleUsage,
  onClear,
  onCancel,
  onSave,
  onCurrencyBlur,
} = useContactCreatePage()
</script>
