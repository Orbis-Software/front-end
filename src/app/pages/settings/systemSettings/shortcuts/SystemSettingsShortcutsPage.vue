<script setup lang="ts">
import "./SystemSettingsShortcutsPage.css"
import { useSystemSettingsShortcutsPage } from "./SystemSettingsShortcutsPage"

const { items } = useSystemSettingsShortcutsPage()
</script>

<template>
  <section class="system-settings-shortcuts-page">
    <header class="system-settings-shortcuts-page__header">
      <h2 class="system-settings-shortcuts-page__title">Shortcuts</h2>
      <p class="system-settings-shortcuts-page__subtitle">
        Configure quick actions and frequently used navigation shortcuts.
      </p>
    </header>

    <div class="system-settings-shortcuts-page__table">
      <div v-for="item in items" :key="item.key" class="system-settings-shortcuts-page__row">
        <div class="system-settings-shortcuts-page__key">{{ item.key }}</div>
        <div class="system-settings-shortcuts-page__value">{{ item.value }}</div>
      </div>
    </div>
  </section>
</template>
