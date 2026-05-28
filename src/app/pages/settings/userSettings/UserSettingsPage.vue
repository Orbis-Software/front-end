<script setup lang="ts">
import "./UserSettingsPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useUserSettingsPage } from "./UserSettingsPage"

const { tabs, isActive } = useUserSettingsPage()
</script>

<template>
  <section class="user-settings-page">
    <header class="user-settings-page__header">
      <div class="user-settings-page__title-wrap">
        <h1 class="user-settings-page__title">User Settings</h1>
      </div>
    </header>

    <div class="user-settings-page__card">
      <nav class="user-settings-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="user-settings-page__tab"
          :class="{ 'user-settings-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="user-settings-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
