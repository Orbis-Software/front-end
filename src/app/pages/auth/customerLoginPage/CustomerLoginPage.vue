<template>
  <Card class="customer-auth-card">
    <template #content>
      <div class="customer-auth-header">
        <img src="/orbis-logo.png" alt="Orbis" class="customer-auth-logo" />

        <div class="customer-auth-badge">Customer Portal</div>

        <h1 class="customer-auth-title">Customer Sign In</h1>

        <p class="customer-auth-subtitle">
          Access your shipments, documents, invoices, and tracking information.
        </p>
      </div>

      <div class="customer-auth-form">
        <!-- Email -->
        <div class="form-group">
          <label class="form-label required">Email</label>

          <InputText
            v-model="email"
            type="email"
            autofocus
            class="customer-auth-input w-full"
            :disabled="loading"
            @keyup.enter="submit"
          />

          <small v-if="emailError" class="field-error">
            {{ emailError }}
          </small>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label required">Password</label>

          <Password
            v-model="password"
            toggleMask
            :feedback="false"
            class="customer-auth-password w-full"
            inputClass="customer-auth-input"
            :disabled="loading"
            @keyup.enter="submit"
          />

          <small v-if="passwordError" class="field-error">
            {{ passwordError }}
          </small>
        </div>

        <!-- Actions -->
        <div class="customer-auth-actions">
          <Button label="Sign In" class="customer-auth-btn" :loading="loading" @click="submit" />
        </div>

        <!-- Footer -->
        <div class="customer-auth-footer">
          <a href="#" class="customer-auth-link" @click.prevent>
            Need help accessing your account?
          </a>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useCustomerLoginPage } from "./CustomerLoginPage"

const { email, password, loading, emailError, passwordError, submit } = useCustomerLoginPage()
</script>

<style scoped src="./CustomerLoginPage.css"></style>
