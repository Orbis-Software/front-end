<script setup lang="ts">
import { ref } from "vue"
import { settingsTabs } from "./CustomerSettingsPage"

const activeTab = ref("profile")
</script>

<template>
  <div class="customer-page">
    <div class="page-header">
      <div>
        <h1>Settings</h1>
        <p>Manage your account, notifications and preferences</p>
      </div>
    </div>

    <div class="settings-grid">
      <aside class="settings-nav">
        <button
          v-for="tab in settingsTabs"
          :key="tab.value"
          class="settings-nav-item"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          <i :class="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </aside>

      <section class="settings-panel">
        <div class="panel-head">
          <h2>{{ settingsTabs.find(tab => tab.value === activeTab)?.label }}</h2>
          <p>Customer portal configuration</p>
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
            <div class="empty-state">
              {{ settingsTabs.find(tab => tab.value === activeTab)?.label }} settings content goes
              here.
            </div>
          </template>

          <div class="panel-actions">
            <button class="primary-btn">Save Changes</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped src="./CustomerSettingsPage.css"></style>
