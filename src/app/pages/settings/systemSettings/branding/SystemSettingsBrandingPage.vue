<script setup lang="ts">
import "./SystemSettingsBrandingPage.css"
import { useSystemSettingsBrandingPage } from "./SystemSettingsBrandingPage"

const { sections } = useSystemSettingsBrandingPage()
</script>

<template>
  <section class="system-settings-branding-page">
    <header class="system-settings-branding-page__header">
      <h2 class="system-settings-branding-page__title">Branding</h2>
      <p class="system-settings-branding-page__subtitle">
        Control your visual identity across the application and generated outputs.
      </p>
    </header>

    <div class="system-settings-branding-page__list">
      <article
        v-for="section in sections"
        :key="section.title"
        class="system-settings-branding-page__item"
      >
        <h3 class="system-settings-branding-page__item-title">{{ section.title }}</h3>
        <p class="system-settings-branding-page__item-text">
          {{ section.description }}
        </p>
      </article>
    </div>
  </section>
</template>
