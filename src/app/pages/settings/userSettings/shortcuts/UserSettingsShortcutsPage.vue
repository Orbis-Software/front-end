<script setup lang="ts">
import "./UserSettingsShortcutsPage.css"
import { useUserSettingsShortcutsPage } from "./UserSettingsShortcutsPage"

const { shortcuts, loading, saving, onClearShortcutKey, onShortcutKeyCapture, onSaveShortcuts } =
  useUserSettingsShortcutsPage()
</script>

<template>
  <section class="user-shortcuts-page">
    <header class="user-shortcuts-page__header">
      <div>
        <h2 class="user-shortcuts-page__title">Shortcut</h2>
        <p class="user-shortcuts-page__subtitle">
          Click a shortcut field, press any key or key combination, then save.
        </p>
      </div>

      <Button
        label="Save Shortcuts"
        icon="pi pi-save"
        class="btn btn--primary"
        :loading="saving"
        :disabled="loading"
        @click="onSaveShortcuts"
      />
    </header>

    <div v-if="loading" class="user-shortcuts-page__empty">Loading shortcuts...</div>

    <div v-else class="user-shortcuts-page__list">
      <article v-for="shortcut in shortcuts" :key="shortcut.key" class="user-shortcuts-page__item">
        <div class="user-shortcuts-page__rank">{{ shortcut.keyBinding || "None" }}</div>

        <div class="user-shortcuts-page__content">
          <div class="user-shortcuts-page__name">
            <i :class="shortcut.icon" />
            <span>{{ shortcut.label }}</span>
          </div>
          <p>{{ shortcut.description }}</p>
        </div>

        <div class="user-shortcuts-page__controls">
          <label class="user-shortcuts-page__toggle">
            <ToggleSwitch v-model="shortcut.isEnabled" />
            <span>{{ shortcut.isEnabled ? "Enabled" : "Hidden" }}</span>
          </label>

          <button
            type="button"
            class="user-shortcuts-page__capture"
            @keydown="onShortcutKeyCapture(shortcut, $event)"
          >
            {{ shortcut.keyBinding || "Press keys" }}
          </button>

          <Button
            icon="pi pi-times"
            text
            rounded
            aria-label="Clear shortcut"
            :disabled="!shortcut.keyBinding"
            @click="onClearShortcutKey(shortcut)"
          />
        </div>
      </article>
    </div>
  </section>
</template>
