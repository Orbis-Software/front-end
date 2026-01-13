<template>
  <Card class="auth-card auth-card--enterprise">
    <template #content>
      <!-- Header -->
      <div class="auth-enterprise-header">
        <img
          src="/orbis-logo.png"
          alt="Orbis"
          class="auth-enterprise-logo"
        />

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
              class="w-full auth-enterprise-input"
              :disabled="loading || step === 2"
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
            <small
              v-if="emailError"
              class="field-error"
            >
              {{ emailError }}
            </small>

            <!-- same placement as reference: right aligned hint -->
            <small class="field-hint">
              Default domain is orbis.local
            </small>
          </div>
        </div>

        <!-- Password (step 2 only) -->
        <div
          v-if="step === 2"
          class="form-group"
        >
          <label class="form-label required">Password</label>

          <div class="input-shell">
            <Password
              v-model="password"
              toggleMask
              :feedback="false"
              class="w-full auth-enterprise-password"
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
            <small
              v-if="passwordError"
              class="field-error"
            >
              {{ passwordError }}
            </small>
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

          <Button
            v-if="step === 1"
            label="Next"
            class="auth-enterprise-btn"
            :loading="loading"
            @click="nextFromEmail"
          />

          <Button
            v-else
            label="Sign In"
            class="auth-enterprise-btn"
            :loading="loading"
            @click="submit"
          />
        </div>

        <!-- Footer link (bottom-left like reference) -->
        <div class="auth-enterprise-footer">
          <a
            href="#"
            class="auth-enterprise-link"
            @click.prevent
          >
            Customer Support
          </a>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useLoginPage } from './useLoginPage'

const {
  email,
  password,
  loading,
  step,
  emailError,
  passwordError,
  nextFromEmail,
  backToEmail,
  submit,
} = useLoginPage()
</script>

<style scoped src="./LoginPage.css"></style>
