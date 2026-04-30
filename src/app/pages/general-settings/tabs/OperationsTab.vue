<script setup lang="ts">
import { useGeneralSettingsTab } from "./useGeneralSettingsTab"

const {
  sections,
  totalOptions,
  newItemValues,
  loading,
  saving,
  error,
  addItem,
  hideItem,
  setDefault,
} = useGeneralSettingsTab("Operations")
</script>

<template>
  <section class="general-settings-tab-page">
    <div v-if="loading" class="general-settings-tab-page__empty">Loading reference data...</div>
    <div v-else-if="error" class="general-settings-tab-page__empty">{{ error }}</div>
    <div v-else-if="!sections.length" class="general-settings-tab-page__empty">
      No reference data found.
    </div>

    <div v-else class="general-settings-tab-page__grid">
      <article
        v-for="section in sections"
        :key="section.id"
        class="general-settings-tab-page__card"
      >
        <header class="general-settings-tab-page__card-header">
          <span
            class="general-settings-tab-page__icon"
            :style="{
              background: section.icon_bg || '#f0f0f0',
              color: section.icon_color || '#222',
            }"
          >
            {{ section.icon }}
          </span>

          <div>
            <h3 class="general-settings-tab-page__card-title">{{ section.label }}</h3>
            <div class="general-settings-tab-page__card-count">
              {{ section.options.length }} items
            </div>
          </div>
        </header>

        <ul class="general-settings-tab-page__options">
          <li
            v-for="option in section.options"
            :key="option.id"
            class="general-settings-tab-page__option"
          >
            <div class="general-settings-tab-page__option-left">
              <span class="general-settings-tab-page__option-name">{{ option.name }}</span>
              <span v-if="option.is_default" class="general-settings-tab-page__default"
                >Default</span
              >
            </div>

            <div class="general-settings-tab-page__actions">
              <button
                v-if="!option.is_default"
                type="button"
                class="general-settings-tab-page__text-btn"
                :disabled="saving"
                @click="setDefault(section.key, option.id)"
              >
                Set default
              </button>

              <button
                type="button"
                class="general-settings-tab-page__danger-btn"
                :disabled="saving"
                @click="hideItem(section.key, option.id)"
              >
                Remove
              </button>
            </div>
          </li>
        </ul>

        <div class="general-settings-tab-page__add-row">
          <input
            v-model="newItemValues[section.id]"
            type="text"
            :placeholder="`Add new ${section.label}...`"
            :disabled="saving"
            @keydown.enter="addItem(section.key, section.id)"
          />

          <button type="button" :disabled="saving" @click="addItem(section.key, section.id)">
            Add
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
