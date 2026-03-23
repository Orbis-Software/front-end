<script setup lang="ts">
import "./SystemSettingsPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useSystemSettingsPage } from "./SystemSettingsPage"

const { tabs, isActive } = useSystemSettingsPage()
</script>

<template>
  <section class="system-settings-page">
    <header class="system-settings-page__header">
      <div class="system-settings-page__title-wrap">
        <h1 class="system-settings-page__title">System Settings</h1>
        <p class="system-settings-page__subtitle">
          Manage company, branding, shortcuts, and master settings.
        </p>
      </div>
    </header>

    <div class="system-settings-page__card">
      <nav class="system-settings-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="system-settings-page__tab"
          :class="{ 'system-settings-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="system-settings-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
