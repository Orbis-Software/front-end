<template>
  <Card class="auth-card auth-card--enterprise">
    <template #content>
      <!-- Header -->
      <div class="auth-enterprise-header">
        <img src="/orbis-logo.png" alt="Orbis" class="auth-enterprise-logo" />

        <h1 class="auth-enterprise-title">Sign In</h1>
      </div>

      <!-- Form -->
      <div class="auth-enterprise-form">
        <!-- Email -->
        <div class="form-group">
          <label class="form-label required">Email</label>

          <div class="input-shell">
            <InputText
              v-model="email"
              type="email"
              autofocus
              class="auth-enterprise-input w-full"
              :disabled="loading || step !== 1"
              @keyup.enter="nextFromEmail"
            />

            <!-- Optional warning icon (show only when emailError exists) -->
            <i
              v-if="emailError"
              class="pi pi-exclamation-triangle input-warning"
              aria-hidden="true"
            />
          </div>

          <div class="field-meta">
            <small v-if="emailError" class="field-error">
              {{ emailError }}
            </small>

            <!-- same placement as reference: right aligned hint -->
            <small class="field-hint"> Default domain is orbis.local </small>
          </div>
        </div>

        <!-- Password (step 2 only) -->
        <div v-if="step === 2" class="form-group">
          <label class="form-label required">Password</label>

          <div class="input-shell">
            <Password
              v-model="password"
              toggleMask
              :feedback="false"
              class="auth-enterprise-password w-full"
              inputClass="auth-enterprise-input auth-enterprise-password-input"
              :disabled="loading"
              @keyup.enter="submit"
            />

            <i
              v-if="passwordError"
              class="pi pi-exclamation-triangle input-warning"
              aria-hidden="true"
            />
          </div>

          <div class="field-meta">
            <small v-if="passwordError" class="field-error">
              {{ passwordError }}
            </small>
          </div>
        </div>

        <div v-if="step === 3" class="auth-mfa-panel">
          <div class="auth-mfa-panel__head">
            <h2>Multi-factor authentication</h2>
            <p>Enter a security code to finish signing in.</p>
          </div>

          <div class="auth-mfa-methods">
            <button
              v-if="mfaMethods.includes('authenticator')"
              type="button"
              :class="{ active: mfaMethod === 'authenticator' }"
              :disabled="loading"
              @click="mfaMethod = 'authenticator'"
            >
              Authenticator
            </button>
            <button
              v-if="mfaMethods.includes('email')"
              type="button"
              :class="{ active: mfaMethod === 'email' }"
              :disabled="loading"
              @click="mfaMethod = 'email'"
            >
              Email
            </button>
            <button
              v-if="mfaMethods.includes('recovery')"
              type="button"
              :class="{ active: mfaMethod === 'recovery' }"
              :disabled="loading"
              @click="mfaMethod = 'recovery'"
            >
              Recovery
            </button>
          </div>

          <p class="auth-mfa-help">
            {{
              mfaMethod === "email"
                ? `Use the 6 digit code sent to ${mfaEmailHint}.`
                : mfaMethod === "recovery"
                  ? "Use one of your saved recovery codes."
                  : "Use the 6 digit code from your authenticator app."
            }}
          </p>

          <div class="form-group">
            <label class="form-label required">Security Code</label>
            <div class="input-shell">
              <InputText
                v-model="mfaCode"
                class="auth-enterprise-input w-full"
                :maxlength="mfaMethod === 'recovery' ? 16 : 6"
                :inputmode="mfaMethod === 'recovery' ? 'text' : 'numeric'"
                :disabled="loading"
                placeholder="000000"
                @keyup.enter="verifyMfa"
              />
              <i
                v-if="mfaError"
                class="pi pi-exclamation-triangle input-warning"
                aria-hidden="true"
              />
            </div>
            <div class="field-meta">
              <small v-if="mfaError" class="field-error">{{ mfaError }}</small>
              <button
                v-if="mfaMethod === 'email'"
                type="button"
                class="auth-enterprise-link-button"
                :disabled="resending"
                @click="resendEmailCode"
              >
                {{ resending ? "Sending..." : "Resend email code" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Actions row (button right aligned like reference) -->
        <div class="auth-enterprise-actions">
          <button
            v-if="step === 2"
            type="button"
            class="auth-enterprise-back"
            :disabled="loading"
            @click="backToEmail"
          >
            Back
          </button>

          <button
            v-if="step === 3"
            type="button"
            class="auth-enterprise-back"
            :disabled="loading"
            @click="backToPassword"
          >
            Back
          </button>

          <Button
            v-if="step === 1"
            label="Next"
            class="auth-enterprise-btn"
            :loading="loading"
            @click="nextFromEmail"
          />

          <Button
            v-else-if="step === 2"
            label="Sign In"
            class="auth-enterprise-btn"
            :loading="loading"
            @click="submit"
          />

          <Button
            v-else
            label="Verify"
            class="auth-enterprise-btn"
            :loading="loading"
            @click="verifyMfa"
          />
        </div>

        <!-- Footer link (bottom-left like reference) -->
        <div class="auth-enterprise-footer">
          <a href="#" class="auth-enterprise-link" @click.prevent> Customer Support </a>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useLoginPage } from "./useLoginPage"

const {
  email,
  password,
  mfaCode,
  mfaMethod,
  mfaMethods,
  mfaEmailHint,
  loading,
  resending,
  step,
  emailError,
  passwordError,
  mfaError,
  nextFromEmail,
  backToEmail,
  backToPassword,
  submit,
  verifyMfa,
  resendEmailCode,
} = useLoginPage()
</script>

<style scoped src="./loginPage.css"></style>
