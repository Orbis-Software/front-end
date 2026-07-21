<template>
  <section class="login-details-page">
    <Toast />
    <ConfirmDialog />

    <header class="login-details-page__header">
      <div class="login-details-page__title-wrap">
        <h1 class="login-details-page__title">Login Details</h1>
      </div>
      <span
        class="login-details-page__status"
        :class="{ 'login-details-page__status--secure': twoFactorEnabled }"
      >
        <i class="pi pi-shield" />
        {{ twoFactorEnabled ? "MFA Enabled" : "MFA Not Enabled" }}
      </span>
    </header>

    <div class="login-details-page__card">
      <nav class="login-details-page__tabs" aria-label="Login details sections">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="login-details-page__tab"
          :class="{ 'login-details-page__tab--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="login-details-page__tab-count">{{ tab.badge }}</span>
        </button>
      </nav>

      <div class="login-details-page__content">
        <section
          v-if="activeTab === 'account'"
          class="login-details-panel login-details-panel--account"
        >
          <div class="login-details-account">
            <section class="login-details-account__card">
              <div class="login-details-panel__header login-details-panel__header--flat">
                <div>
                  <h2>Account Details</h2>
                  <p>Your current login identity in Orbis.</p>
                </div>
              </div>

              <div class="login-details-page__details">
                <label>
                  <span>Name</span>
                  <div class="login-details-page__input-shell">
                    <i class="pi pi-user" />
                    <InputText :model-value="displayName" readonly />
                  </div>
                </label>
                <label>
                  <span>Email Address</span>
                  <div class="login-details-page__input-shell">
                    <i class="pi pi-envelope" />
                    <InputText :model-value="displayEmail" readonly />
                  </div>
                </label>
                <label>
                  <span>Role</span>
                  <div class="login-details-page__input-shell">
                    <i class="pi pi-id-card" />
                    <InputText :model-value="roleLabel" readonly />
                  </div>
                </label>
              </div>
            </section>

            <aside class="login-details-account__aside">
              <section class="login-details-account__profile">
                <div class="login-details-page__avatar login-details-page__avatar--large">
                  <i class="pi pi-user" />
                  <strong>{{ initials }}</strong>
                </div>
                <div>
                  <h3>{{ displayName }}</h3>
                  <p>{{ roleLabel }}</p>
                </div>
                <span>{{ displayEmail }}</span>
              </section>

              <section class="login-details-account__security">
                <div class="login-details-account__security-head">
                  <div>
                    <h3>Sign-in Protection</h3>
                    <p>Current controls for this user account.</p>
                  </div>
                  <i class="pi pi-lock login-details-panel__icon" />
                </div>

                <div class="login-details-account__rows">
                  <div class="login-details-account__row">
                    <div>
                      <strong>Password</strong>
                      <span>Stored privately for account access.</span>
                    </div>
                    <Button
                      label="Change"
                      class="p-button-text"
                      type="button"
                      @click="activeTab = 'password'"
                    />
                  </div>

                  <div class="login-details-account__row">
                    <div>
                      <strong>Multi-Factor Authentication</strong>
                      <span>{{
                        twoFactorEnabled
                          ? "A second step is required at sign in."
                          : "No second step is required."
                      }}</span>
                    </div>
                    <Button
                      :label="twoFactorEnabled ? 'Manage' : 'Enable'"
                      class="p-button-text"
                      type="button"
                      @click="activeTab = 'mfa'"
                    />
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </section>

        <section v-else-if="activeTab === 'password'" class="login-details-panel">
          <div class="login-details-password">
            <aside class="login-details-password__summary">
              <div class="login-details-page__avatar login-details-page__avatar--hero">
                <i class="pi pi-lock" />
              </div>
              <div>
                <h2>Password</h2>
                <p>Update the password used to access your account.</p>
              </div>
              <div class="login-details-password__checks">
                <span><i class="pi pi-check-circle" /> Minimum 8 characters</span>
                <span><i class="pi pi-check-circle" /> Requires your current password</span>
                <span><i class="pi pi-check-circle" /> Keeps your MFA settings unchanged</span>
              </div>
            </aside>

            <form class="login-details-password__form" @submit.prevent="updatePassword">
              <div class="login-details-panel__header login-details-panel__header--flat">
                <div>
                  <h2>Change Password</h2>
                  <p>Use a password that is unique to Orbis.</p>
                </div>
                <i class="pi pi-key login-details-panel__icon" />
              </div>

              <div class="login-details-page__details">
                <label>
                  <span>Current Password</span>
                  <div class="login-details-page__input-shell">
                    <i class="pi pi-lock" />
                    <Password
                      v-model="passwordForm.currentPassword"
                      autocomplete="current-password"
                      toggle-mask
                      :feedback="false"
                      input-class="login-details-page__password-input"
                      :disabled="passwordUpdating"
                    />
                  </div>
                </label>
                <label>
                  <span>New Password</span>
                  <div class="login-details-page__input-shell">
                    <i class="pi pi-shield" />
                    <Password
                      v-model="passwordForm.newPassword"
                      autocomplete="new-password"
                      toggle-mask
                      input-class="login-details-page__password-input"
                      :disabled="passwordUpdating"
                    />
                  </div>
                </label>
                <label>
                  <span>Confirm New Password</span>
                  <div class="login-details-page__input-shell">
                    <i class="pi pi-check-circle" />
                    <Password
                      v-model="passwordForm.confirmPassword"
                      autocomplete="new-password"
                      toggle-mask
                      :feedback="false"
                      input-class="login-details-page__password-input"
                      :disabled="passwordUpdating"
                    />
                  </div>
                </label>
              </div>

              <div class="login-details-page__actions">
                <Button
                  label="Update Password"
                  icon="pi pi-save"
                  class="orbis-primary"
                  type="submit"
                  :loading="passwordUpdating"
                />
              </div>
            </form>
          </div>
        </section>

        <section v-else class="login-details-panel">
          <div class="login-details-panel__header login-details-panel__header--mfa">
            <div>
              <h2>Multi-Factor Authentication</h2>
              <p>Require a second verification step when signing in to this account.</p>
            </div>
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              class="p-button-outlined"
              type="button"
              :loading="loading"
              @click="loadSettings"
            />
          </div>

          <div v-if="loading && !settings" class="login-details-page__loading">
            <i class="pi pi-spin pi-spinner" />
            Loading MFA settings...
          </div>

          <div v-else class="login-details-mfa">
            <div class="login-details-mfa__summary">
              <article class="login-details-mfa__summary-card">
                <span class="login-details-mfa__summary-label">Overall Status</span>
                <strong :class="{ 'is-secure': twoFactorEnabled }">
                  {{ twoFactorEnabled ? "Protected" : "Not protected" }}
                </strong>
              </article>
              <article class="login-details-mfa__summary-card">
                <span class="login-details-mfa__summary-label">Email Codes</span>
                <strong :class="{ 'is-secure': settings?.email_enabled }">
                  {{ settings?.email_enabled ? "Enabled" : "Disabled" }}
                </strong>
              </article>
              <article class="login-details-mfa__summary-card">
                <span class="login-details-mfa__summary-label">Authenticator App</span>
                <strong :class="{ 'is-secure': settings?.authenticator_enabled }">
                  {{ settings?.authenticator_enabled ? "Enabled" : "Disabled" }}
                </strong>
              </article>
              <article class="login-details-mfa__summary-card">
                <span class="login-details-mfa__summary-label">Recovery Codes</span>
                <strong>{{ recoveryCodes.length }}</strong>
              </article>
            </div>

            <div class="login-details-mfa__grid">
              <section class="login-details-mfa__method">
                <div class="login-details-mfa__method-head">
                  <div class="login-details-mfa__method-title">
                    <i class="pi pi-envelope" />
                    <div>
                      <h3>Email Codes</h3>
                      <p>Send a 6 digit sign-in code to {{ displayEmail }}.</p>
                    </div>
                  </div>
                  <span
                    class="login-details-mfa__pill"
                    :class="{ 'login-details-mfa__pill--enabled': settings?.email_enabled }"
                  >
                    {{ settings?.email_enabled ? "Enabled" : "Disabled" }}
                  </span>
                </div>

                <div class="login-details-mfa__method-body">
                  <Button
                    :label="emailCodeSent ? 'Resend Email Code' : 'Send Email Code'"
                    icon="pi pi-send"
                    class="p-button-outlined"
                    type="button"
                    :loading="emailLoading"
                    @click="sendEmailCode"
                  />

                  <label class="login-details-page__field">
                    <span>Email Verification Code</span>
                    <InputText
                      v-model="emailCode"
                      inputmode="numeric"
                      maxlength="6"
                      placeholder="000000"
                      @keyup.enter="verifyEmailCode"
                    />
                  </label>

                  <div class="login-details-page__actions login-details-page__actions--left">
                    <Button
                      label="Verify Email MFA"
                      icon="pi pi-check"
                      class="orbis-primary"
                      type="button"
                      :loading="emailVerifying"
                      @click="verifyEmailCode"
                    />
                    <Button
                      v-if="settings?.email_enabled"
                      icon="pi pi-times"
                      class="p-button-outlined p-button-danger"
                      type="button"
                      aria-label="Disable email MFA"
                      :loading="disablingMethod === 'email'"
                      @click="confirmDisable('email')"
                    />
                  </div>
                </div>
              </section>

              <section class="login-details-mfa__method login-details-mfa__method--authenticator">
                <div class="login-details-mfa__method-head">
                  <div class="login-details-mfa__method-title">
                    <i class="pi pi-mobile" />
                    <div>
                      <h3>Authenticator App</h3>
                      <p>Use Google Authenticator, Microsoft Authenticator, Authy, or 1Password.</p>
                    </div>
                  </div>
                  <span
                    class="login-details-mfa__pill"
                    :class="{ 'login-details-mfa__pill--enabled': settings?.authenticator_enabled }"
                  >
                    {{ settings?.authenticator_enabled ? "Enabled" : "Disabled" }}
                  </span>
                </div>

                <div class="login-details-mfa__auth-body">
                  <div class="login-details-page__qr-panel">
                    <div class="login-details-page__qr" aria-label="Authenticator QR code">
                      <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="Authenticator QR code" />
                      <div v-else class="login-details-page__qr-empty">
                        <i class="pi pi-qrcode" />
                        <span>Start setup to show QR</span>
                      </div>
                    </div>
                    <Button
                      :label="
                        settings?.authenticator_enabled ? 'Reconfigure App' : 'Start App Setup'
                      "
                      icon="pi pi-qrcode"
                      class="p-button-outlined"
                      type="button"
                      :loading="authenticatorLoading"
                      @click="beginAuthenticatorSetup"
                    />
                  </div>

                  <div class="login-details-page__setup">
                    <div class="login-details-mfa__steps">
                      <span>1. Open authenticator app</span>
                      <span>2. Scan QR or copy setup key</span>
                      <span>3. Verify the 6 digit code</span>
                    </div>

                    <label class="login-details-page__field">
                      <span>Manual Setup Key</span>
                      <div class="login-details-page__copy-row">
                        <InputText
                          :model-value="manualSetupKey"
                          readonly
                          placeholder="Setup key appears here"
                        />
                        <Button
                          icon="pi pi-copy"
                          class="p-button-outlined"
                          type="button"
                          aria-label="Copy setup key"
                          :disabled="!manualSetupKey"
                          @click="copySetupKey"
                        />
                      </div>
                    </label>

                    <label class="login-details-page__field">
                      <span>Authenticator Verification Code</span>
                      <InputText
                        v-model="authenticatorCode"
                        inputmode="numeric"
                        maxlength="6"
                        placeholder="000000"
                        @keyup.enter="verifyAuthenticatorCode"
                      />
                    </label>

                    <div class="login-details-page__actions login-details-page__actions--left">
                      <Button
                        label="Verify App MFA"
                        icon="pi pi-shield"
                        class="orbis-primary"
                        type="button"
                        :loading="authenticatorVerifying"
                        @click="verifyAuthenticatorCode"
                      />
                      <Button
                        v-if="settings?.authenticator_enabled"
                        icon="pi pi-times"
                        class="p-button-outlined p-button-danger"
                        type="button"
                        aria-label="Disable authenticator MFA"
                        :loading="disablingMethod === 'authenticator'"
                        @click="confirmDisable('authenticator')"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <aside class="login-details-mfa__recovery">
                <div class="login-details-mfa__method-head">
                  <div class="login-details-mfa__method-title">
                    <i class="pi pi-list-check" />
                    <div>
                      <h3>Recovery Codes</h3>
                      <p>Use one code if email and authenticator access are unavailable.</p>
                    </div>
                  </div>
                  <Button
                    icon="pi pi-download"
                    class="p-button-text"
                    type="button"
                    aria-label="Download recovery codes"
                    :disabled="!recoveryCodes.length"
                    @click="downloadRecoveryCodes"
                  />
                </div>

                <div v-if="recoveryCodes.length" class="login-details-page__codes">
                  <code v-for="code in recoveryCodes" :key="code">{{ code }}</code>
                </div>
                <p v-else class="login-details-page__empty">
                  Recovery codes are created after MFA is enabled.
                </p>
              </aside>
            </div>

            <div v-if="twoFactorEnabled" class="login-details-mfa__danger-zone">
              <div>
                <strong>Disable multi-factor authentication</strong>
                <p>Turns off all enabled MFA methods for this account.</p>
              </div>
              <Button
                label="Disable All MFA"
                icon="pi pi-lock-open"
                class="p-button-outlined p-button-danger"
                type="button"
                :loading="disablingMethod === 'all'"
                @click="confirmDisable('all')"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import QRCode from "qrcode"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import AuthService from "@/app/services/auth"
import type { LoginDetailsTab, MfaMethod, MfaSettings } from "@/app/types/auth"
import { useAuthStore } from "@/app/stores/auth"
import "./LoginDetailsPage.css"

const auth = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

const activeTab = ref<LoginDetailsTab>("account")
const settings = ref<MfaSettings | null>(null)
const loading = ref(false)
const emailLoading = ref(false)
const emailVerifying = ref(false)
const authenticatorLoading = ref(false)
const authenticatorVerifying = ref(false)
const passwordUpdating = ref(false)
const disablingMethod = ref<MfaMethod | null>(null)

const emailCode = ref("")
const emailCodeSent = ref(false)
const authenticatorCode = ref("")
const manualSetupKey = ref("")
const qrCodeDataUrl = ref("")

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
})

const twoFactorEnabled = computed(() => settings.value?.enabled ?? false)
const recoveryCodes = computed(() => settings.value?.recovery_codes ?? [])
const displayName = computed(() => auth.user?.name || "Admin User")
const displayEmail = computed(() => auth.user?.email || "admin@orbis.local")
const roleLabel = computed(() => auth.roles?.join(", ") || (auth.isAdmin ? "Admin" : "User"))
const initials = computed(
  () =>
    displayName.value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("") || "AU",
)
const tabs = computed(() => [
  { key: "account" as const, label: "Account", icon: "pi pi-user" },
  { key: "password" as const, label: "Password", icon: "pi pi-key" },
  {
    key: "mfa" as const,
    label: "Multi-Factor Authentication",
    icon: "pi pi-shield",
    badge: twoFactorEnabled.value ? "On" : "Off",
  },
])

onMounted(() => {
  loadSettings()
})

async function loadSettings() {
  loading.value = true

  try {
    applySettings(await AuthService.getMfaSettings())
  } catch (error: any) {
    showError("Unable to load MFA settings.", error)
  } finally {
    loading.value = false
  }
}

async function beginAuthenticatorSetup() {
  authenticatorLoading.value = true
  authenticatorCode.value = ""

  try {
    const setup = await AuthService.startAuthenticatorSetup()
    manualSetupKey.value = setup.secret
    qrCodeDataUrl.value = await QRCode.toDataURL(setup.otpauth_url, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
    })
    toast.add({
      severity: "info",
      summary: "Authenticator Setup Ready",
      detail: "Scan the QR code, then enter the 6 digit code from your app.",
      life: 4000,
    })
  } catch (error: any) {
    showError("Unable to start authenticator setup.", error)
  } finally {
    authenticatorLoading.value = false
  }
}

async function verifyAuthenticatorCode() {
  const code = cleanCode(authenticatorCode.value)
  if (!code) {
    showWarn("Enter the 6 digit code from your authenticator app.")
    return
  }

  authenticatorVerifying.value = true

  try {
    applySettings(await AuthService.verifyAuthenticatorSetup(code))
    authenticatorCode.value = ""
    manualSetupKey.value = ""
    qrCodeDataUrl.value = ""
    toast.add({
      severity: "success",
      summary: "Authenticator Enabled",
      detail: "Your account now requires authenticator MFA at sign in.",
      life: 3500,
    })
  } catch (error: any) {
    showError("Authenticator code was not accepted.", error)
  } finally {
    authenticatorVerifying.value = false
  }
}

async function sendEmailCode() {
  emailLoading.value = true

  try {
    await AuthService.sendEmailMfaSetupCode()
    emailCodeSent.value = true
    toast.add({
      severity: "success",
      summary: "Email Code Sent",
      detail: `A security code was sent to ${displayEmail.value}.`,
      life: 3500,
    })
  } catch (error: any) {
    showError("Unable to send email code.", error)
  } finally {
    emailLoading.value = false
  }
}

async function verifyEmailCode() {
  const code = cleanCode(emailCode.value)
  if (!code) {
    showWarn("Enter the 6 digit code sent to your email.")
    return
  }

  emailVerifying.value = true

  try {
    applySettings(await AuthService.verifyEmailMfaSetup(code))
    emailCode.value = ""
    emailCodeSent.value = false
    toast.add({
      severity: "success",
      summary: "Email MFA Enabled",
      detail: "Your account now requires an email security code at sign in.",
      life: 3500,
    })
  } catch (error: any) {
    showError("Email code was not accepted.", error)
  } finally {
    emailVerifying.value = false
  }
}

async function updatePassword() {
  const currentPassword = passwordForm.currentPassword
  const newPassword = passwordForm.newPassword
  const confirmPassword = passwordForm.confirmPassword

  if (!currentPassword.trim()) {
    showWarn("Enter your current password.")
    return
  }

  if (newPassword.length < 8) {
    showWarn("New password must be at least 8 characters.")
    return
  }

  if (newPassword !== confirmPassword) {
    showWarn("New password and confirmation do not match.")
    return
  }

  passwordUpdating.value = true

  try {
    await AuthService.changePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    })

    passwordForm.currentPassword = ""
    passwordForm.newPassword = ""
    passwordForm.confirmPassword = ""

    toast.add({
      severity: "success",
      summary: "Password Updated",
      detail: "Your password was changed successfully.",
      life: 3500,
    })
  } catch (error: any) {
    showError("Unable to update password.", error, "Password Error")
  } finally {
    passwordUpdating.value = false
  }
}

function confirmDisable(method: MfaMethod) {
  const label = method === "all" ? "all MFA methods" : `${method} MFA`

  confirm.require({
    header: "Disable MFA",
    message: `Disable ${label} for this account?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Disable",
    rejectLabel: "Cancel",
    acceptClass: "p-button-danger",
    accept: () => disableMethod(method),
  })
}

async function disableMethod(method: MfaMethod) {
  disablingMethod.value = method

  try {
    applySettings(await AuthService.disableMfa(method))
    if (method === "authenticator" || method === "all") {
      authenticatorCode.value = ""
      manualSetupKey.value = ""
      qrCodeDataUrl.value = ""
    }
    if (method === "email" || method === "all") {
      emailCode.value = ""
      emailCodeSent.value = false
    }
    toast.add({
      severity: "success",
      summary: "MFA Updated",
      detail: "Your MFA settings were updated.",
      life: 3000,
    })
  } catch (error: any) {
    showError("Unable to disable MFA.", error)
  } finally {
    disablingMethod.value = null
  }
}

async function copySetupKey() {
  if (!manualSetupKey.value) return

  try {
    await navigator.clipboard.writeText(manualSetupKey.value)
    toast.add({
      severity: "success",
      summary: "Copied",
      detail: "Authenticator setup key copied.",
      life: 2500,
    })
  } catch {
    showWarn("Unable to copy the setup key from this browser.")
  }
}

function downloadRecoveryCodes() {
  if (!recoveryCodes.value.length) return

  const blob = new Blob([recoveryCodes.value.join("\n")], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "orbis-mfa-recovery-codes.txt"
  link.click()
  URL.revokeObjectURL(url)
}

function applySettings(nextSettings: MfaSettings) {
  settings.value = nextSettings
  if (auth.user) {
    auth.user.mfa = {
      enabled: nextSettings.enabled,
      email_enabled: nextSettings.email_enabled,
      authenticator_enabled: nextSettings.authenticator_enabled,
      confirmed_at: nextSettings.confirmed_at,
      last_used_at: nextSettings.last_used_at,
    }
  }
}

function cleanCode(value: string): string {
  return value.replace(/\D/g, "")
}

function showWarn(detail: string) {
  toast.add({
    severity: "warn",
    summary: "Check MFA",
    detail,
    life: 3000,
  })
}

function showError(fallback: string, error: any, summary = "MFA Error") {
  toast.add({
    severity: "error",
    summary,
    detail: error?.response?.data?.message ?? firstValidationMessage(error) ?? fallback,
    life: 4500,
  })
}

function firstValidationMessage(error: any): string | null {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== "object") return null

  const first = Object.values(errors)[0]
  return Array.isArray(first) ? String(first[0] ?? "") : null
}
</script>
