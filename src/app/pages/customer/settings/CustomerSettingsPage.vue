<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { computed, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import Select from "primevue/select"
import Textarea from "primevue/textarea"
import ToggleSwitch from "primevue/toggleswitch"
import { useToast } from "primevue/usetoast"
import http from "@/api/http"
import { useAuthStore } from "@/app/stores/auth"
import { settingsTabs } from "./CustomerSettingsPage"
import type { CustomerContactAccount } from "@/app/types/customer"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const showInviteDialog = ref(false)
const inviting = ref(false)
const updatingAccountId = ref<number | null>(null)
const inviteError = ref("")
const shipmentStatusNotifications = ref(true)
const quoteExpiryNotifications = ref(true)
const roleOptions = [
  { label: "Viewer", value: "customer" },
  { label: "Admin", value: "admin" },
]
const tabValues = settingsTabs.map(tab => tab.value)
const activeTab = ref(
  tabValues.includes(String(route.query.tab)) ? String(route.query.tab) : "profile",
)
const inviteForm = reactive({
  name: "",
  email: "",
  role: "customer",
  password: "",
  password_confirmation: "",
  is_active: true,
})

const customer = computed(() => auth.customer)
const contact = computed(() => customer.value?.contact ?? null)
const portalAccounts = computed(() => {
  const accounts = contact.value?.accounts ?? []

  if (accounts.length) {
    return accounts
  }

  return customer.value
    ? [
        {
          id: customer.value.id,
          contact_id: customer.value.contact_id,
          name: customer.value.name,
          email: customer.value.email,
          role: customer.value.role,
          is_primary: customer.value.is_primary,
          is_active: customer.value.is_active,
          email_verified_at: null,
          last_login_at: null,
          created_at: customer.value.created_at,
          updated_at: customer.value.updated_at,
        },
      ]
    : []
})

const companyAddress = computed(() =>
  [
    contact.value?.address_line_1,
    contact.value?.address_line_2,
    contact.value?.address_line_3,
    contact.value?.address_line_4,
    contact.value?.city,
    contact.value?.county_state,
    contact.value?.postal_code,
  ]
    .filter(Boolean)
    .join(", "),
)
const canInvite = computed(
  () =>
    Boolean(contact.value?.id) &&
    inviteForm.name.trim().length > 0 &&
    inviteForm.email.trim().length > 0 &&
    inviteForm.password.length >= 8 &&
    inviteForm.password === inviteForm.password_confirmation,
)

function resetInviteForm() {
  Object.assign(inviteForm, {
    name: "",
    email: "",
    role: "customer",
    password: "",
    password_confirmation: "",
    is_active: true,
  })
  inviteError.value = ""
}

function openInviteDialog() {
  resetInviteForm()
  showInviteDialog.value = true
}

function selectTab(tab: string) {
  activeTab.value = tab
  router.replace({
    name: "customer.settings",
    query: tab === "profile" ? {} : { tab },
  })
}

function extractErrorMessage(err: any) {
  const errors = err?.response?.data?.errors
  const firstError = errors ? Object.values(errors).flat()[0] : null

  return String(
    firstError ?? err?.response?.data?.message ?? err?.message ?? "Unable to invite user.",
  )
}

async function submitInvite() {
  if (!canInvite.value || !contact.value?.id || inviting.value) return

  inviting.value = true
  inviteError.value = ""

  try {
    await http.post("/contact-accounts", {
      contact_id: contact.value.id,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim().toLowerCase(),
      role: inviteForm.role,
      password: inviteForm.password,
      password_confirmation: inviteForm.password_confirmation,
      is_active: inviteForm.is_active,
    })

    await auth.hydrate()
    showInviteDialog.value = false

    toast.add({
      severity: "success",
      summary: "User invited",
      detail: "The portal account has been created.",
      life: 2500,
    })
  } catch (err: any) {
    inviteError.value = extractErrorMessage(err)
    toast.add({
      severity: "error",
      summary: "Invite failed",
      detail: inviteError.value,
      life: 4000,
    })
  } finally {
    inviting.value = false
  }
}

async function updatePortalAccount(account: CustomerContactAccount) {
  if (updatingAccountId.value) return

  updatingAccountId.value = account.id

  try {
    await http.patch(`/contact-accounts/${account.id}`, {
      name: account.name,
      email: account.email,
      role: account.role,
      is_active: account.is_active,
    })

    await auth.hydrate()

    toast.add({
      severity: "success",
      summary: "Account updated",
      detail: "The portal account permissions have been saved.",
      life: 2200,
    })
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Update failed",
      detail: extractErrorMessage(err),
      life: 4000,
    })

    await auth.hydrate()
  } finally {
    updatingAccountId.value = null
  }
}

function formatDate(value: string | null) {
  if (!value) return "Never"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

watch(
  () => route.query.tab,
  tab => {
    const nextTab = tabValues.includes(String(tab)) ? String(tab) : "profile"
    activeTab.value = nextTab
  },
)
</script>

<template>
  <section class="customer-list-page">
    <header class="customer-list-page__header">
      <div class="customer-list-page__title-wrap">
        <h1 class="customer-list-page__title">Settings</h1>
      </div>
    </header>

    <div class="customer-list-page__card">
      <div class="customer-list-page__tabs-bar">
        <nav class="customer-list-page__tabs">
          <button
            v-for="tab in settingsTabs"
            :key="tab.value"
            class="customer-list-page__tab"
            :class="{ 'customer-list-page__tab--active': activeTab === tab.value }"
            type="button"
            @click="selectTab(tab.value)"
          >
            <i :class="tab.icon" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="customer-list-page__content">
        <section class="settings-panel">
          <div class="panel-head">
            <h2>{{ settingsTabs.find(tab => tab.value === activeTab)?.label }}</h2>
          </div>

          <div class="panel-body">
            <template v-if="activeTab === 'profile'">
              <div class="form-grid">
                <label>
                  Company Name
                  <InputText :model-value="contact?.company_name || customer?.name || ''" />
                </label>

                <label>
                  Account Reference
                  <InputText :model-value="contact?.account_number || ''" readonly />
                </label>

                <label>
                  Primary Contact
                  <InputText :model-value="customer?.name || ''" />
                </label>

                <label>
                  Email
                  <InputText :model-value="customer?.email || contact?.email || ''" />
                </label>

                <label>
                  Phone
                  <InputText :model-value="contact?.phone || contact?.mobile || ''" />
                </label>

                <label>
                  Currency Preference
                  <InputText :model-value="contact?.currency_preference || 'GBP'" readonly />
                </label>
              </div>

              <div class="settings-section">
                <h3>Registered Address</h3>
                <Textarea :model-value="companyAddress" rows="3" />
              </div>
            </template>

            <template v-else-if="activeTab === 'contacts'">
              <div class="settings-toolbar">
                <p>
                  {{ portalAccounts.length }} portal account{{
                    portalAccounts.length === 1 ? "" : "s"
                  }}
                </p>
                <Button
                  class="btn btn--primary btn--small"
                  label="Invite User"
                  icon="pi pi-user-plus"
                  @click="openInviteDialog"
                />
              </div>

              <div class="settings-table-wrap">
                <table class="settings-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="account in portalAccounts" :key="account.id">
                      <td>
                        <strong>{{ account.name }}</strong>
                        <span v-if="account.id === customer?.id" class="settings-muted"
                          >Current user</span
                        >
                      </td>
                      <td>{{ account.email }}</td>
                      <td>
                        <Select
                          v-model="account.role"
                          :options="roleOptions"
                          option-label="label"
                          option-value="value"
                          class="settings-role-select"
                          :disabled="updatingAccountId === account.id"
                          @change="updatePortalAccount(account)"
                        />
                      </td>
                      <td>
                        <div class="settings-status-toggle">
                          <ToggleSwitch
                            v-model="account.is_active"
                            :disabled="updatingAccountId === account.id"
                            @update:model-value="updatePortalAccount(account)"
                          />
                          <span
                            class="settings-badge"
                            :class="
                              account.is_active
                                ? 'settings-badge--success'
                                : 'settings-badge--muted'
                            "
                          >
                            {{ account.is_active ? "Active" : "Disabled" }}
                          </span>
                        </div>
                        <span v-if="account.is_primary" class="settings-muted"
                          >Primary contact</span
                        >
                        <span v-if="updatingAccountId === account.id" class="settings-muted"
                          >Saving...</span
                        >
                      </td>
                      <td>{{ formatDate(account.last_login_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-else-if="activeTab === 'notifications'">
              <div class="toggle-row">
                <div>
                  <strong>Shipment status changes</strong>
                  <p>Notify when a shipment moves between stages</p>
                </div>

                <ToggleSwitch v-model="shipmentStatusNotifications" />
              </div>

              <div class="toggle-row">
                <div>
                  <strong>Quote expiry reminder</strong>
                  <p>Remind 48h before a quote expires</p>
                </div>

                <ToggleSwitch v-model="quoteExpiryNotifications" />
              </div>
            </template>

            <template v-else>
              <div class="customer-list-page__empty">
                {{ settingsTabs.find(tab => tab.value === activeTab)?.label }} settings content goes
                here.
              </div>
            </template>
          </div>
        </section>
      </div>
    </div>

    <Dialog
      v-model:visible="showInviteDialog"
      header="Invite Portal User"
      modal
      :style="{ width: '520px' }"
    >
      <div class="settings-invite-form">
        <p v-if="inviteError" class="settings-error">{{ inviteError }}</p>

        <label>
          Full Name
          <InputText v-model="inviteForm.name" autocomplete="name" />
        </label>

        <label>
          Email
          <InputText v-model="inviteForm.email" autocomplete="email" type="email" />
        </label>

        <label>
          Role
          <Select
            v-model="inviteForm.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
          />
        </label>

        <div class="form-grid">
          <label>
            Password
            <InputText v-model="inviteForm.password" autocomplete="new-password" type="password" />
          </label>

          <label>
            Confirm Password
            <InputText
              v-model="inviteForm.password_confirmation"
              autocomplete="new-password"
              type="password"
              @keyup.enter="submitInvite"
            />
          </label>
        </div>

        <div class="settings-check">
          <ToggleSwitch v-model="inviteForm.is_active" />
          <span>Account active</span>
        </div>
      </div>

      <template #footer>
        <Button class="btn btn--ghost" label="Cancel" @click="showInviteDialog = false" />
        <Button
          class="btn btn--primary"
          label="Create Account"
          icon="pi pi-check"
          :disabled="!canInvite"
          :loading="inviting"
          @click="submitInvite"
        />
      </template>
    </Dialog>
  </section>
</template>

<style scoped src="./CustomerSettingsPage.css"></style>
