<script setup lang="ts">
import {
  tabs,
  activeTab,
  activeTabLabel,
  lastSavedLabel,
  toastMessage,
  filteredSections,
  totalOptions,
  newItemValues,
  setActiveTab,
  getTabCount,
  toggleSection,
  toggleAll,
  visibleItems,
  addItem,
  removeItem,
  setDefault,
  moveItem,
  resetDefaults,
  exportSettings,
  saveChanges,
  allExpanded,
} from "./GeneralSettingsPage.logic"

import "./GeneralSettingsPage.css"
</script>

<template>
  <div class="general-settings-page">
    <section class="general-settings-topbar">
      <div class="general-settings-topbar__brand">
        <div class="general-settings-topbar__logo">T</div>
        <div class="general-settings-topbar__text">
          <strong>TMS</strong>
          <span>/ General Settings</span>
        </div>
      </div>

      <div class="general-settings-topbar__right">
        {{ lastSavedLabel }}
      </div>
    </section>

    <div class="general-settings-layout">
      <main class="general-settings-main">
        <section class="general-settings-header">
          <h1>General settings manager</h1>
          <p>
            Manage company-wide settings and defaults used across the TMS / WMS. Changes are saved
            locally and can apply globally.
          </p>
        </section>

        <section class="general-settings-stats">
          <div class="general-settings-stat">
            <span class="general-settings-stat__value">{{ filteredSections.length }}</span>
            <span class="general-settings-stat__label">Sections</span>
          </div>

          <div class="general-settings-stat">
            <span class="general-settings-stat__value">{{ totalOptions }}</span>
            <span class="general-settings-stat__label">Total options</span>
          </div>

          <div class="general-settings-stat">
            <span class="general-settings-stat__value">{{ tabs.length }}</span>
            <span class="general-settings-stat__label">Tabs</span>
          </div>
        </section>

        <section class="general-settings-actions">
          <button class="general-settings-action-btn" type="button" @click="toggleAll">
            {{ allExpanded ? "Collapse all" : "Expand all" }}
          </button>

          <button class="general-settings-action-btn" type="button" @click="exportSettings">
            Export JSON
          </button>

          <button class="general-settings-action-btn" type="button" @click="resetDefaults">
            Reset defaults
          </button>

          <button
            class="general-settings-action-btn general-settings-action-btn--primary"
            type="button"
            @click="saveChanges"
          >
            Save changes
          </button>
        </section>

        <section class="general-settings-shell">
          <div class="general-settings-tabs-wrap">
            <div class="general-settings-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                type="button"
                class="general-settings-tab"
                :class="{ 'general-settings-tab--active': activeTab === tab.key }"
                @click="setActiveTab(tab.key)"
              >
                <span class="general-settings-tab__label">{{ tab.label }}</span>
                <span class="general-settings-tab__count">{{ getTabCount(tab.key) }}</span>
              </button>
            </div>
          </div>

          <div class="general-settings-content">
            <template v-if="filteredSections.length">
              <div class="general-settings-section-label">
                {{ activeTabLabel }}
              </div>

              <div class="general-settings-grid">
                <article
                  v-for="section in filteredSections"
                  :key="section.id"
                  class="general-settings-card"
                >
                  <button
                    type="button"
                    class="general-settings-card__header"
                    :class="{ 'general-settings-card__header--open': section.open }"
                    @click="toggleSection(section.id)"
                  >
                    <div class="general-settings-card__header-left">
                      <div
                        class="general-settings-card__icon"
                        :style="{
                          background: section.iconBg,
                          color: section.iconColor,
                        }"
                      >
                        {{ section.icon }}
                      </div>

                      <div class="general-settings-card__title-wrap">
                        <div class="general-settings-card__title">{{ section.label }}</div>
                        <div class="general-settings-card__subtitle">
                          {{ section.description }}
                        </div>
                      </div>
                    </div>

                    <div class="general-settings-card__meta">
                      <span class="general-settings-card__count">
                        {{ section.items.length }} items
                      </span>
                      <span
                        class="general-settings-card__chevron"
                        :class="{ 'general-settings-card__chevron--open': section.open }"
                      >
                        ▶
                      </span>
                    </div>
                  </button>

                  <div v-if="section.open" class="general-settings-card__body">
                    <ul class="general-settings-item-list">
                      <li
                        v-for="(item, index) in visibleItems(section)"
                        :key="item.id"
                        class="general-settings-item-row"
                      >
                        <div class="general-settings-item-row__left">
                          <span class="general-settings-item-label">{{ item.label }}</span>

                          <span v-if="item.isDefault" class="general-settings-item-default">
                            Default
                          </span>

                          <button
                            v-else
                            type="button"
                            class="general-settings-set-default"
                            @click="setDefault(section.id, item.id)"
                          >
                            Set default
                          </button>
                        </div>

                        <div class="general-settings-item-actions">
                          <button
                            type="button"
                            class="general-settings-icon-btn"
                            title="Move up"
                            :disabled="index === 0"
                            @click="moveItem(section.id, item.id, -1)"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            class="general-settings-icon-btn"
                            title="Move down"
                            :disabled="index === visibleItems(section).length - 1"
                            @click="moveItem(section.id, item.id, 1)"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            class="general-settings-icon-btn general-settings-icon-btn--danger"
                            title="Remove"
                            @click="removeItem(section.id, item.id)"
                          >
                            ✕
                          </button>
                        </div>
                      </li>

                      <li v-if="!visibleItems(section).length" class="general-settings-empty-state">
                        No items available.
                      </li>
                    </ul>

                    <div class="general-settings-add-row">
                      <input
                        v-model="newItemValues[section.id]"
                        type="text"
                        :placeholder="`Add new option to ${section.label}...`"
                        @keydown.enter="addItem(section.id)"
                      />
                      <button
                        type="button"
                        class="general-settings-add-btn"
                        @click="addItem(section.id)"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </template>

            <div v-else class="general-settings-no-results">No sections available.</div>
          </div>
        </section>
      </main>
    </div>

    <transition name="fade">
      <div v-if="toastMessage" class="general-settings-toast">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>
