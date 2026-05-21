<script setup lang="ts">
import "../CustomerPortalListPage.css"
import { ref } from "vue"
import Button from "primevue/button"
import { settingsTabs } from "./CustomerSettingsPage"

const activeTab = ref("profile")
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
            @click="activeTab = tab.value"
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
                  <input value="Acme Corporation Ltd" />
                </label>

                <label>
                  Account Reference
                  <input value="ACME-001" readonly />
                </label>

                <label>
                  Primary Contact
                  <input value="Alex Chen" />
                </label>

                <label>
                  Email
                  <input value="alex.chen@acmecorp.com" />
                </label>
              </div>
            </template>

            <template v-else-if="activeTab === 'notifications'">
              <div class="toggle-row">
                <div>
                  <strong>Shipment status changes</strong>
                  <p>Notify when a shipment moves between stages</p>
                </div>

                <input type="checkbox" checked />
              </div>

              <div class="toggle-row">
                <div>
                  <strong>Quote expiry reminder</strong>
                  <p>Remind 48h before a quote expires</p>
                </div>

                <input type="checkbox" checked />
              </div>
            </template>

            <template v-else>
              <div class="customer-list-page__empty">
                {{ settingsTabs.find(tab => tab.value === activeTab)?.label }} settings content goes
                here.
              </div>
            </template>

            <div class="panel-actions">
              <Button class="btn btn--primary" label="Save Changes" />
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped src="./CustomerSettingsPage.css"></style>
