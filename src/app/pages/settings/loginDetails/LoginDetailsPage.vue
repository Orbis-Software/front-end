<template>
  <section class="login-details-page">
    <Toast />
    <ConfirmDialog />

    <header class="login-details-page__header">
      <div>
        <p class="login-details-page__eyebrow">Account Security</p>
        <h1>Login Details</h1>
        <p>Manage your sign-in details and require MFA when your account signs in.</p>
      </div>
      <span
        class="login-details-page__status"
        :class="{ 'login-details-page__status--secure': twoFactorEnabled }"
      >
        <i class="pi pi-shield" />
        {{ twoFactorEnabled ? "MFA Enabled" : "MFA Not Enabled" }}
      </span>
    </header>

    <div class="login-details-page__grid">
      <section class="login-details-card login-details-card--profile">
        <div class="login-details-card__head">
          <div>
            <h2>Account Details</h2>
            <p>Your current login identity in Orbis.</p>
          </div>
          <div class="login-details-page__avatar">{{ initials }}</div>
        </div>

        <div class="login-details-page__details">
          <label>
            <span>Name</span>
            <InputText :model-value="displayName" readonly />
          </label>
          <label>
            <span>Email Address</span>
            <InputText :model-value="displayEmail" readonly />
          </label>
          <label>
            <span>Role</span>
            <InputText :model-value="roleLabel" readonly />
          </label>
        </div>
      </section>

      <section class="login-details-card">
        <div class="login-details-card__head">
          <div>
            <h2>Password</h2>
            <p>Update the password used to access your account.</p>
          </div>
          <i class="pi pi-key login-details-card__icon" />
        </div>

        <div class="login-details-page__details">
          <label>
            <span>Current Password</span>
            <Password
              v-model="passwordForm.currentPassword"
              toggle-mask
              :feedback="false"
              input-class="login-details-page__password-input"
            />
          </label>
          <label>
            <span>New Password</span>
            <Password
              v-model="passwordForm.newPassword"
              toggle-mask
              input-class="login-details-page__password-input"
            />
          </label>
          <label>
            <span>Confirm New Password</span>
            <Password
              v-model="passwordForm.confirmPassword"
              toggle-mask
              :feedback="false"
              input-class="login-details-page__password-input"
            />
          </label>
        </div>

        <div class="login-details-page__actions">
          <Button label="Update Password" icon="pi pi-save" class="orbis-primary" type="button" />
        </div>
      </section>
    </div>

    <section class="login-details-card login-details-card--wide">
      <div class="login-details-card__head">
        <div>
          <h2>Multi-Factor Authentication</h2>
          <p>Use email security codes, an authenticator app, or recovery codes at sign in.</p>
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

      <div v-else class="login-details-page__mfa-layout">
        <section class="login-details-page__method">
          <div class="login-details-page__method-head">
            <div>
              <h3>Email Codes</h3>
              <p>Receive a 6 digit code at {{ displayEmail }} whenever you sign in.</p>
            </div>
            <div class="login-details-page__toggle">
              <span>{{ settings?.email_enabled ? "Enabled" : "Disabled" }}</span>
              <InputSwitch :model-value="settings?.email_enabled ?? false" disabled />
            </div>
          </div>

          <div class="login-details-page__method-body">
            <Button
              :label="emailCodeSent ? 'Resend Email Code' : 'Send Email Code'"
              icon="pi pi-envelope"
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
                label="Disable Email"
                icon="pi pi-times"
                class="p-button-outlined p-button-danger"
                type="button"
                :loading="disablingMethod === 'email'"
                @click="confirmDisable('email')"
              />
            </div>
          </div>
        </section>

        <section class="login-details-page__method">
          <div class="login-details-page__method-head">
            <div>
              <h3>Authenticator App</h3>
              <p>Scan a QR code with Google Authenticator, Microsoft Authenticator, Authy, or 1Password.</p>
            </div>
            <div class="login-details-page__toggle">
              <span>{{ settings?.authenticator_enabled ? "Enabled" : "Disabled" }}</span>
              <InputSwitch :model-value="settings?.authenticator_enabled ?? false" disabled />
            </div>
          </div>

          <div class="login-details-page__auth-grid">
            <div class="login-details-page__qr-panel">
              <div class="login-details-page__qr" aria-label="Authenticator QR code">
                <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="Authenticator QR code" />
                <div v-else class="login-details-page__qr-empty">
                  <i class="pi pi-qrcode" />
                  <span>Start setup to show QR</span>
                </div>
              </div>
              <Button
                :label="settings?.authenticator_enabled ? 'Reconfigure App' : 'Start App Setup'"
                icon="pi pi-qrcode"
                class="p-button-outlined"
                type="button"
                :loading="authenticatorLoading"
                @click="beginAuthenticatorSetup"
              />
            </div>

            <div class="login-details-page__setup">
              <ol>
                <li>Open your authenticator app on your phone.</li>
                <li>Scan the QR code or enter the setup key manually.</li>
                <li>Enter the 6 digit code to verify setup.</li>
              </ol>

              <label class="login-details-page__field">
                <span>Manual Setup Key</span>
                <div class="login-details-page__copy-row">
                  <InputText :model-value="manualSetupKey" readonly placeholder="Setup key appears here" />
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
                  label="Disable App"
                  icon="pi pi-times"
                  class="p-button-outlined p-button-danger"
                  type="button"
                  :loading="disablingMethod === 'authenticator'"
                  @click="confirmDisable('authenticator')"
                />
              </div>
            </div>
          </div>
        </section>

        <aside class="login-details-page__recovery">
          <div class="login-details-page__recovery-head">
            <div>
              <h3>Recovery Codes</h3>
              <p>Use one code if email and authenticator access are unavailable.</p>
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
          <p v-else class="login-details-page__empty">Recovery codes are created after MFA is enabled.</p>
        </aside>

        <div v-if="twoFactorEnabled" class="login-details-page__actions">
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
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import QRCode from "qrcode"
import Button from "primevue/button"
import ConfirmDialog from "primevue/confirmdialog"
import InputSwitch from "primevue/inputswitch"
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import Toast from "primevue/toast"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import AuthService from "@/app/services/auth"
import type { MfaSettings } from "@/app/services/auth/mfa"
import { useAuthStore } from "@/app/stores/auth"
import "./LoginDetailsPage.css"

type MfaMethod = "email" | "authenticator" | "all"

const auth = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

const settings = ref<MfaSettings | null>(null)
const loading = ref(false)
const emailLoading = ref(false)
const emailVerifying = ref(false)
const authenticatorLoading = ref(false)
const authenticatorVerifying = ref(false)
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

function showError(fallback: string, error: any) {
  toast.add({
    severity: "error",
    summary: "MFA Error",
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
