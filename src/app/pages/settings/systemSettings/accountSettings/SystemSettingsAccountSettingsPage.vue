<script setup lang="ts">
import "./SystemSettingsAccountSettingsPage.css"
import { useSystemSettingsAccountSettingsPage } from "./SystemSettingsAccountSettingsPage"

const {
  accountingSystems,
  activeSystem,
  canEdit,
  store,
  xeroStatus,
  isConnected,
  needsAttention,
  isBusy,
  settingsForm,
  accountOptions,
  taxOptions,
  organisationOptions,
  disconnectDialogVisible,
  organisationDialogVisible,
  selectedOrganisationId,
  confirmReplacement,
  replacementRequired,
  hasUnsavedChanges,
  startConnection,
  testConnection,
  saveSettings,
  disconnect,
  selectOrganisation,
  statusFor,
  formatDate,
} = useSystemSettingsAccountSettingsPage()
</script>

<template>
  <section class="account-settings-page">
    <header class="account-settings-page__header">
      <div>
        <h2>Account Settings</h2>
        <p>Connect Orbis securely to your company's accounting organisation.</p>
      </div>
      <span v-if="hasUnsavedChanges" class="account-settings-page__dirty"
        >Unsaved Xero settings</span
      >
    </header>

    <div class="account-settings-page__tabs" role="tablist" aria-label="Accounting integrations">
      <button
        v-for="system in accountingSystems"
        :key="system.key"
        type="button"
        class="account-settings-page__tab"
        :class="{ 'account-settings-page__tab--active': activeSystem === system.key }"
        @click="activeSystem = system.key"
      >
        <strong>{{ system.label }}</strong>
        <span>{{ system.description }}</span>
        <em
          :class="{
            'account-settings-page__status--connected': system.key === 'xero' && isConnected,
            'account-settings-page__status--attention': system.key === 'xero' && needsAttention,
          }"
        >
          {{ statusFor(system.key) }}
        </em>
      </button>
    </div>

    <div v-if="activeSystem !== 'xero'" class="account-settings-page__placeholder">
      <span class="pi pi-clock"></span>
      <div>
        <h3>{{ activeSystem === "sage" ? "Sage" : "QuickBooks" }} integration</h3>
        <strong>Coming soon</strong>
        <p>This integration is not available yet. No connection or credentials are required.</p>
      </div>
    </div>

    <template v-else>
      <div v-if="store.loading && !xeroStatus" class="account-settings-page__loading">
        <span class="pi pi-spin pi-spinner"></span> Loading Xero connection…
      </div>

      <template v-else-if="xeroStatus">
        <section
          v-if="!xeroStatus.configured"
          class="account-settings-page__notice account-settings-page__notice--warning"
        >
          <span class="pi pi-exclamation-triangle"></span>
          <div>
            <h3>Xero connection temporarily unavailable</h3>
            <p>
              Please contact Orbis support. You do not need to create a Xero developer application
              or provide API credentials.
            </p>
          </div>
        </section>

        <section
          v-else-if="needsAttention"
          class="account-settings-page__notice account-settings-page__notice--danger"
        >
          <span class="pi pi-exclamation-circle"></span>
          <div>
            <h3>Xero connection needs attention</h3>
            <p>{{ xeroStatus.message || "The Xero connection needs to be renewed." }}</p>
            <Button
              label="Reconnect Xero"
              icon="pi pi-refresh"
              class="btn btn--primary"
              :loading="store.connecting"
              :disabled="!canEdit"
              @click="startConnection(true)"
            />
          </div>
        </section>

        <section v-else-if="!isConnected" class="account-settings-page__connect-layout">
          <article class="account-settings-page__guide">
            <span class="account-settings-page__eyebrow">Secure customer connection</span>
            <h3>Connect your Xero account</h3>
            <p>
              Connect your Xero organisation to Orbis so customer invoices created in Orbis can be
              transferred securely to your own Xero account.
            </p>

            <h4>Before you begin</h4>
            <ul>
              <li>Make sure your company has an active Xero organisation.</li>
              <li>Make sure you can sign in to Xero.</li>
              <li>You must have a Standard or Adviser role in the Xero organisation.</li>
              <li>Confirm that you are connecting the correct Orbis company account.</li>
            </ul>

            <h4>How to connect</h4>
            <ol>
              <li>Click “Connect Xero Account”.</li>
              <li>Sign in directly on Xero's secure website.</li>
              <li>Select the Xero organisation you want to connect.</li>
              <li>Review the permissions and click “Allow access”.</li>
              <li>Return to Orbis and confirm the organisation name.</li>
              <li>Complete your sales account and tax settings.</li>
            </ol>
          </article>

          <aside class="account-settings-page__connect-action">
            <span class="account-settings-page__badge">Not connected</span>
            <h3>Ready to connect?</h3>
            <p>You will be redirected securely to Xero.</p>
            <Button
              :label="store.connecting ? 'Connecting to Xero…' : 'Connect Xero Account'"
              icon="pi pi-link"
              class="btn btn--primary"
              :loading="store.connecting"
              :disabled="!canEdit || store.connecting"
              @click="startConnection(false)"
            />
            <div class="account-settings-page__security">
              <span class="pi pi-lock"></span>
              <p>
                Your Xero login details are entered directly on Xero's website. Orbis does not
                receive or store your Xero password.
              </p>
            </div>
            <div class="account-settings-page__coverage">
              <strong>Initial sync coverage</strong>
              <p>
                Customer contacts and customer sales invoices are supported initially. Supplier
                bills, payments, attachments and credit notes will be added separately.
              </p>
            </div>
            <small
              >If you connect the wrong organisation, disconnect Xero and repeat the connection. If
              you cannot approve access, ask a Standard or Adviser user to connect.</small
            >
          </aside>
        </section>

        <template v-else>
          <section class="account-settings-page__connection-card">
            <div class="account-settings-page__connection-main">
              <span class="account-settings-page__badge account-settings-page__badge--connected"
                ><span class="pi pi-check-circle"></span> Connected</span
              >
              <h3>{{ xeroStatus.connection?.organisationName }}</h3>
              <p v-if="xeroStatus.connection?.organisationId">
                Organisation ID: <code>{{ xeroStatus.connection.organisationId }}</code>
              </p>
            </div>
            <dl class="account-settings-page__connection-meta">
              <div>
                <dt>Connected by</dt>
                <dd>{{ xeroStatus.connection?.connectedBy?.name || "Orbis administrator" }}</dd>
              </div>
              <div>
                <dt>Connected</dt>
                <dd>{{ formatDate(xeroStatus.connection?.connectedAt) }}</dd>
              </div>
              <div>
                <dt>Last connection test</dt>
                <dd>{{ formatDate(xeroStatus.connection?.lastTestedAt) }}</dd>
              </div>
              <div>
                <dt>Last successful sync</dt>
                <dd>{{ formatDate(xeroStatus.connection?.lastSuccessfulSyncAt) }}</dd>
              </div>
            </dl>
            <div class="account-settings-page__connection-actions">
              <Button
                label="Test Connection"
                icon="pi pi-check"
                class="btn btn--ghost"
                outlined
                :loading="store.testing"
                :disabled="!canEdit || isBusy"
                @click="testConnection"
              />
              <Button
                label="Reconnect"
                icon="pi pi-refresh"
                class="btn btn--ghost"
                outlined
                :disabled="!canEdit || isBusy"
                @click="startConnection(true)"
              />
              <Button
                label="Disconnect"
                icon="pi pi-unlink"
                severity="danger"
                outlined
                :disabled="!canEdit || isBusy"
                @click="disconnectDialogVisible = true"
              />
            </div>
          </section>

          <section class="account-settings-page__settings-card">
            <div class="account-settings-page__card-head">
              <div>
                <h3>Customer invoice settings</h3>
                <p>
                  These Xero values are loaded from the connected organisation and validated when
                  saved.
                </p>
              </div>
              <Button
                :label="store.saving ? 'Saving…' : 'Save Xero Settings'"
                icon="pi pi-save"
                class="btn btn--primary"
                :loading="store.saving"
                :disabled="!canEdit || isBusy"
                @click="saveSettings"
              />
            </div>

            <div class="account-settings-page__settings-grid">
              <label>
                <span>Default Sales Account</span>
                <Dropdown
                  v-model="settingsForm.defaultSalesAccountCode"
                  :options="accountOptions"
                  option-label="label"
                  option-value="value"
                  filter
                  placeholder="Select a Xero sales account"
                />
              </label>
              <label>
                <span>Default Tax Rate</span>
                <Dropdown
                  v-model="settingsForm.defaultTaxType"
                  :options="taxOptions"
                  option-label="label"
                  option-value="value"
                  filter
                  placeholder="Select a Xero tax rate"
                />
              </label>
              <label>
                <span>Invoice Status</span>
                <Dropdown
                  v-model="settingsForm.defaultInvoiceStatus"
                  :options="[
                    { label: 'Draft', value: 'DRAFT' },
                    { label: 'Authorised', value: 'AUTHORISED' },
                  ]"
                  option-label="label"
                  option-value="value"
                />
                <small>Draft is recommended until you have verified the transferred invoice.</small>
              </label>
            </div>

            <div class="account-settings-page__toggles">
              <label
                ><ToggleSwitch v-model="settingsForm.autoSyncCustomerInvoices" /><span
                  ><strong>Automatically sync customer invoices to Xero</strong
                  ><small>Runs after the Orbis customer invoice PDF is completed.</small></span
                ></label
              >
              <label
                ><ToggleSwitch v-model="settingsForm.syncCustomerContacts" /><span
                  ><strong>Create or update customer contacts when required</strong
                  ><small>Uses the saved Xero ContactID on future invoices.</small></span
                ></label
              >
              <label
                ><ToggleSwitch v-model="settingsForm.useOrbisInvoiceNumber" /><span
                  ><strong>Use the Orbis invoice number in Xero</strong
                  ><small
                    >Prevents a separate Xero number from obscuring the Orbis reference.</small
                  ></span
                ></label
              >
            </div>
          </section>

          <p v-if="!canEdit" class="account-settings-page__readonly">
            You can view this connection, but only company administrators can change Xero settings.
          </p>
        </template>
      </template>
    </template>

    <Dialog
      v-model:visible="organisationDialogVisible"
      modal
      header="Select your Xero organisation"
      :closable="false"
      class="account-settings-page__dialog"
    >
      <p>
        More than one Xero organisation is available. Select the organisation that belongs to this
        Orbis company.
      </p>
      <label class="account-settings-page__dialog-field">
        <span>Xero organisation</span>
        <Dropdown
          v-model="selectedOrganisationId"
          :options="organisationOptions"
          option-label="label"
          option-value="value"
          placeholder="Select an organisation"
        />
      </label>
      <label v-if="replacementRequired" class="account-settings-page__confirm-replace">
        <Checkbox v-model="confirmReplacement" binary />
        <span
          >I understand this will replace the Xero organisation currently connected to this Orbis
          company.</span
        >
      </label>
      <template #footer>
        <Button
          label="Cancel"
          text
          severity="secondary"
          :disabled="store.selecting"
          @click="organisationDialogVisible = false"
        />
        <Button
          label="Connect organisation"
          class="btn btn--primary"
          :loading="store.selecting"
          :disabled="!selectedOrganisationId || (replacementRequired && !confirmReplacement)"
          @click="selectOrganisation"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="disconnectDialogVisible"
      modal
      header="Disconnect Xero?"
      class="account-settings-page__dialog"
    >
      <p>
        Disconnecting Xero will stop future synchronisation. It will not delete invoices that have
        already been transferred to Xero.
      </p>
      <template #footer>
        <Button
          label="Cancel"
          text
          severity="secondary"
          :disabled="store.disconnecting"
          @click="disconnectDialogVisible = false"
        />
        <Button
          label="Disconnect Xero"
          icon="pi pi-unlink"
          severity="danger"
          :loading="store.disconnecting"
          @click="disconnect"
        />
      </template>
    </Dialog>
  </section>
</template>
