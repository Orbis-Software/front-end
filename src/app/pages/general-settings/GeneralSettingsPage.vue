<script setup lang="ts">
import "./GeneralSettingsPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useGeneralSettingsPage } from "./GeneralSettingsPage.logic"

const { tabs, isActive, getTabCount } = useGeneralSettingsPage()
</script>

<template>
  <section class="general-settings-page">
    <header class="general-settings-page__header">
      <div class="general-settings-page__title-wrap">
        <h1 class="general-settings-page__title">General Settings</h1>
      </div>
    </header>

    <div class="general-settings-page__card">
      <nav class="general-settings-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="general-settings-page__tab"
          :class="{ 'general-settings-page__tab--active': isActive(tab.name) }"
        >
          <span>{{ tab.label }}</span>

          <span class="general-settings-page__tab-count">
            {{ getTabCount(tab) }}
          </span>
        </RouterLink>
      </nav>

      <div class="general-settings-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
