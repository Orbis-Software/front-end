<template>
  <section class="login-details-page">
    <header class="login-details-page__header">
      <div>
        <p class="login-details-page__eyebrow">Account Security</p>
        <h1>Login Details</h1>
        <p>
          Manage your sign-in details and prepare Google Authenticator for additional protection.
        </p>
      </div>
      <span
        class="login-details-page__status"
        :class="{ 'login-details-page__status--secure': twoFactorEnabled }"
      >
        <i :class="twoFactorEnabled ? 'pi pi-shield' : 'pi pi-shield'" />
        {{ twoFactorEnabled ? "2FA Enabled" : "2FA Not Enabled" }}
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
          <h2>Google Authenticator</h2>
          <p>Use a time-based one-time code when signing in.</p>
        </div>
        <div class="login-details-page__toggle">
          <span>{{ twoFactorEnabled ? "Enabled" : "Disabled" }}</span>
          <InputSwitch v-model="twoFactorEnabled" />
        </div>
      </div>

      <div class="login-details-page__auth-grid">
        <div class="login-details-page__qr-panel">
          <div class="login-details-page__qr" aria-label="Authenticator QR placeholder">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <Button
            label="Regenerate Setup Code"
            icon="pi pi-refresh"
            class="p-button-outlined"
            type="button"
          />
        </div>

        <div class="login-details-page__setup">
          <ol>
            <li>Open Google Authenticator on your phone.</li>
            <li>Scan the QR code or enter the setup key manually.</li>
            <li>Enter the 6 digit code to verify setup.</li>
          </ol>

          <label class="login-details-page__field">
            <span>Manual Setup Key</span>
            <div class="login-details-page__copy-row">
              <InputText v-model="manualSetupKey" readonly />
              <Button
                icon="pi pi-copy"
                class="p-button-outlined"
                type="button"
                aria-label="Copy setup key"
              />
            </div>
          </label>

          <label class="login-details-page__field">
            <span>Verification Code</span>
            <InputText
              v-model="verificationCode"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
            />
          </label>

          <div class="login-details-page__actions login-details-page__actions--left">
            <Button
              label="Verify and Enable"
              icon="pi pi-shield"
              class="orbis-primary"
              type="button"
            />
            <Button
              label="Disable 2FA"
              icon="pi pi-times"
              class="p-button-outlined p-button-danger"
              type="button"
            />
          </div>
        </div>

        <aside class="login-details-page__recovery">
          <div class="login-details-page__recovery-head">
            <div>
              <h3>Recovery Codes</h3>
              <p>Keep these somewhere safe after enabling 2FA.</p>
            </div>
            <Button
              icon="pi pi-download"
              class="p-button-text"
              type="button"
              aria-label="Download recovery codes"
            />
          </div>
          <div class="login-details-page__codes">
            <code v-for="code in recoveryCodes" :key="code">{{ code }}</code>
          </div>
        </aside>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import Button from "primevue/button"
import InputSwitch from "primevue/inputswitch"
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import { useAuthStore } from "@/app/stores/auth"
import "./LoginDetailsPage.css"

const auth = useAuthStore()

const twoFactorEnabled = ref(false)
const verificationCode = ref("")
const manualSetupKey = ref("ORBIS-JBSW-Y3K9-QM72")

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
})

const recoveryCodes = ["A9K2-4M7P", "L6QD-8F3H", "R2TN-5V9C", "PX4E-7Q1B"]

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
</script>
