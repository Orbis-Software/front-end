<script setup lang="ts">
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import ToggleSwitch from "primevue/toggleswitch"
import "./SystemSettingsAccountSettingsPage.css"
import { useSystemSettingsAccountSettingsPage } from "./SystemSettingsAccountSettingsPage"

const {
  accountingSystems,
  activeSystem,
  form,
  loading,
  saving,
  canEdit,
  hasUnsavedChanges,
  unsavedChangesDialog,
  taxCodeOptions,
  switchSystem,
  addTaxMapping,
  removeTaxMapping,
  save,
  resetDefaults,
  saveAndContinue,
  discardAndContinue,
  cancelPendingChange,
} = useSystemSettingsAccountSettingsPage()
</script>

<template>
  <section class="account-settings-page">
    <header class="account-settings-page__header">
      <div>
        <h2>Account Settings</h2>
        <p>Configure nominal codes, tax mappings and export defaults for each accounting system.</p>
      </div>
      <div class="account-settings-page__actions">
        <span v-if="hasUnsavedChanges" class="account-settings-page__dirty">Unsaved changes</span>
        <Button
          label="Reset to Defaults"
          severity="secondary"
          outlined
          :disabled="saving || !canEdit"
          @click="resetDefaults"
        />
        <Button
          :label="saving ? 'Saving...' : 'Save Settings'"
          icon="pi pi-save"
          :loading="saving"
          :disabled="!canEdit"
          @click="save"
        />
      </div>
    </header>

    <div class="account-settings-page__tabs" role="tablist">
      <button
        v-for="system in accountingSystems"
        :key="system.key"
        type="button"
        class="account-settings-page__tab"
        :class="{ 'account-settings-page__tab--active': activeSystem === system.key }"
        @click="switchSystem(system.key)"
      >
        <strong>{{ system.label }}</strong>
        <span>{{ system.description }}</span>
      </button>
    </div>

    <div v-if="loading" class="account-settings-page__loading">Loading account settings...</div>

    <fieldset v-else class="account-settings-page__fieldset" :disabled="saving || !canEdit">
      <section class="account-settings-page__card">
        <div class="account-settings-page__card-head">
          <div>
            <h3>Nominal / Account Codes</h3>
            <p>These defaults are used by invoice and supplier bill line mappings.</p>
          </div>
          <label class="account-settings-page__switch">
            <ToggleSwitch v-model="form.isActive" />
            <span>Active</span>
          </label>
        </div>

        <div class="account-settings-page__grid">
          <label class="account-settings-page__field">
            <span>Sales / Selling Code</span>
            <InputText v-model="form.nominalCodes.sales" class="account-settings-page__mono" />
          </label>
          <label class="account-settings-page__field">
            <span>Purchase Code</span>
            <InputText v-model="form.nominalCodes.purchase" class="account-settings-page__mono" />
          </label>
          <label class="account-settings-page__field">
            <span>Freight / Haulage Code</span>
            <InputText v-model="form.nominalCodes.freight" class="account-settings-page__mono" />
          </label>
          <label class="account-settings-page__field">
            <span>Fuel Surcharge Code</span>
            <InputText v-model="form.nominalCodes.fuel" class="account-settings-page__mono" />
          </label>
          <label class="account-settings-page__field">
            <span>Credit Note Code</span>
            <InputText v-model="form.nominalCodes.credit" class="account-settings-page__mono" />
          </label>
          <label v-if="activeSystem === 'xero'" class="account-settings-page__field">
            <span>Tracking Category</span>
            <InputText v-model="form.nominalCodes.trackingCategory" />
          </label>
          <label v-if="activeSystem === 'sage'" class="account-settings-page__field">
            <span>Sage Department</span>
            <InputText
              v-model="form.nominalCodes.sageDepartment"
              class="account-settings-page__mono"
            />
          </label>
          <label v-if="activeSystem === 'quickbooks'" class="account-settings-page__field">
            <span>QB Class</span>
            <InputText v-model="form.nominalCodes.qbClass" />
          </label>
        </div>
      </section>

      <section class="account-settings-page__card">
        <div class="account-settings-page__card-head">
          <div>
            <h3>VAT / Tax Codes</h3>
            <p>Link Orbis Accounts Tax Codes to external accounting tax codes.</p>
          </div>
          <Button
            label="Add Tax Mapping"
            icon="pi pi-plus"
            size="small"
            outlined
            @click="addTaxMapping"
          />
        </div>

        <div class="account-settings-page__table-wrap">
          <table class="account-settings-page__table">
            <thead>
              <tr>
                <th>Rate Type</th>
                <th>%</th>
                <th>Orbis Tax Code</th>
                <th>Sales Tax Code</th>
                <th>Purchase Tax Code</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in form.taxMappings" :key="index">
                <td><InputText v-model="row.label" placeholder="Standard Rate" /></td>
                <td>
                  <InputNumber
                    v-model="row.rate"
                    :min="0"
                    :max="100"
                    :min-fraction-digits="0"
                    :max-fraction-digits="4"
                  />
                </td>
                <td>
                  <Dropdown
                    v-model="row.internalTaxCode"
                    :options="taxCodeOptions"
                    option-label="label"
                    option-value="value"
                    filter
                    placeholder="Select tax code"
                  />
                </td>
                <td>
                  <InputText v-model="row.salesTaxCode" class="account-settings-page__mono" />
                </td>
                <td>
                  <InputText v-model="row.purchaseTaxCode" class="account-settings-page__mono" />
                </td>
                <td><Checkbox v-model="row.isActive" binary /></td>
                <td>
                  <Button
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    @click="removeTaxMapping(index)"
                  />
                </td>
              </tr>
              <tr v-if="!form.taxMappings.length">
                <td colspan="7" class="account-settings-page__empty">No tax mappings yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="account-settings-page__card">
        <div class="account-settings-page__card-head">
          <div>
            <h3>Export Settings</h3>
            <p>Defaults used by future accounting export and integration payloads.</p>
          </div>
          <label class="account-settings-page__default">
            <Checkbox v-model="form.isDefault" binary />
            <span>Use as default accounting system</span>
          </label>
        </div>

        <div class="account-settings-page__grid">
          <label class="account-settings-page__field">
            <span>Invoice Prefix</span>
            <InputText v-model="form.exportSettings.invoicePrefix" />
          </label>
          <label class="account-settings-page__field">
            <span>Default Payment Terms</span>
            <InputNumber v-model="form.exportSettings.defaultPaymentTerms" :min="0" />
          </label>
          <label class="account-settings-page__field">
            <span>Export Currency</span>
            <InputText
              v-model="form.exportSettings.exportCurrency"
              maxlength="3"
              class="account-settings-page__mono"
            />
          </label>
          <label v-if="activeSystem === 'xero'" class="account-settings-page__field">
            <span>Xero Branding Theme</span>
            <InputText v-model="form.exportSettings.xeroBrandingTheme" />
          </label>
          <label v-if="activeSystem === 'sage'" class="account-settings-page__field">
            <span>Sage Reference Format</span>
            <InputText v-model="form.exportSettings.sageReferenceFormat" />
          </label>
          <label v-if="activeSystem === 'quickbooks'" class="account-settings-page__field">
            <span>QB Memo Format</span>
            <InputText v-model="form.exportSettings.qbMemoFormat" />
          </label>
        </div>
      </section>
    </fieldset>

    <p v-if="!canEdit" class="account-settings-page__readonly">
      You can view Account Settings, but you do not have permission to change Master Settings.
    </p>

    <Dialog
      v-model:visible="unsavedChangesDialog.visible"
      modal
      header="Unsaved Account Settings"
      class="account-settings-page__unsaved-dialog"
      :closable="false"
    >
      <p>
        You have unsaved Account Settings changes. Save them before continuing, discard them, or
        cancel and keep editing.
      </p>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          text
          :disabled="saving"
          @click="cancelPendingChange"
        />
        <Button
          label="Discard"
          severity="danger"
          outlined
          :disabled="saving"
          @click="discardAndContinue"
        />
        <Button label="Save" icon="pi pi-save" :loading="saving" @click="saveAndContinue" />
      </template>
    </Dialog>
  </section>
</template>
