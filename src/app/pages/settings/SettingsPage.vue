<!-- src/app/pages/settings/SettingsPage.vue -->
<template>
  <div class="settings-page">
    <div class="page-head">
      <div class="title-wrap">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Company profile and preferences</p>
      </div>

      <div class="actions">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          outlined
          :loading="loading"
          @click="onRefresh"
        />
        <Button
          label="Save Changes"
          icon="pi pi-save"
          class="btn-primary"
          :loading="saving"
          :disabled="!company"
          @click="onSave"
        />
      </div>
    </div>

    <div v-if="loading" class="card">
      <p>Loading company settings...</p>
    </div>

    <div v-else class="grid">
      <!-- Company Info -->
      <div class="card">
        <h2 class="card-title">Company</h2>

        <div class="form-grid">
          <div class="field">
            <label>Legal Name</label>
            <InputText v-model="form.legal_name" />
          </div>

          <div class="field">
            <label>Trading Name</label>
            <InputText v-model="form.trading_name" />
          </div>

          <div class="field">
            <label>Registration Number</label>
            <InputText v-model="form.registration_number" />
          </div>

          <div class="field">
            <label>Status</label>
            <Select
              v-model="form.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div class="field col-span-2">
            <label>Registered Address</label>
            <Textarea v-model="registeredAddressText" autoResize rows="3" />
            <small class="hint">
              Lines: building, address1, address2, address3, address4, city, state, postcode, country_code
            </small>
          </div>

          <div class="field col-span-2">
            <label>Operational Address</label>
            <Textarea v-model="operationalAddressText" autoResize rows="3" />
            <small class="hint">
              Lines: building, address1, address2, address3, address4, city, state, postcode, country_code
            </small>
          </div>

          <div class="field col-span-2">
            <label>Company Logo</label>

            <FileUpload
              class="btn-primary"
              mode="basic"
              name="logo"
              accept="image/*"
              :maxFileSize="2000000"
              :auto="false"
              :customUpload="true"
              chooseLabel="Choose Logo"
              @select="onLogoSelect"
            />

            <small class="hint">JPG, PNG, WEBP • max 2MB</small>

            <img v-if="logoPreview" :src="logoPreview" class="logo-preview" />
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="card">
        <h2 class="card-title">Preferences</h2>

        <div class="form-grid">
          <div class="field">
            <label>Default Currency</label>
            <InputText v-model="form.default_currency_code" />
            <small class="hint">3-letter code (e.g. USD, GBP, EUR)</small>
          </div>

          <div class="field">
            <label>Language</label>
            <InputText v-model="form.language" />
            <small class="hint">ISO code (e.g. en, en-GB)</small>
          </div>

          <div class="field col-span-2">
            <label>Time Zone</label>
            <InputText v-model="form.time_zone" />
            <small class="hint">IANA time zone preferred (e.g. Europe/London)</small>
          </div>
        </div>
      </div>

      <div v-if="!company && !loading" class="card">
        <p>No company loaded yet. Click “Refresh”.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './SettingsPage.css'
import { useSettingsPage } from './SettingsPage'

const {
  company,
  loading,
  saving,
  statusOptions,
  form,
  registeredAddressText,
  operationalAddressText,
  logoPreview,
  onLogoSelect,
  onRefresh,
  onSave,
} = useSettingsPage()
</script>
