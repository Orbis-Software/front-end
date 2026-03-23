<script setup lang="ts">
import "./SystemSettingsCompanyPage.css"
import { useSystemSettingsCompanyPage } from "./SystemSettingsCompanyPage"

const { cards } = useSystemSettingsCompanyPage()
</script>

<template>
  <section class="system-settings-company-page">
    <header class="system-settings-company-page__header">
      <h2 class="system-settings-company-page__title">Company</h2>
      <p class="system-settings-company-page__subtitle">
        Configure core company information used throughout the platform.
      </p>
    </header>

    <div class="system-settings-company-page__grid">
      <article v-for="card in cards" :key="card.title" class="system-settings-company-page__card">
        <h3 class="system-settings-company-page__card-title">{{ card.title }}</h3>
        <p class="system-settings-company-page__card-text">{{ card.description }}</p>
      </article>
    </div>
  </section>
</template>
