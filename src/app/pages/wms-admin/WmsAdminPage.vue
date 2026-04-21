<script setup lang="ts">
import "./WmsAdminPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useWmsAdminPage } from "./WmsAdminPage"

const { tabs, isActive } = useWmsAdminPage()
</script>

<template>
  <section class="wms-admin-page">
    <header class="wms-admin-page__header">
      <div class="wms-admin-page__title-wrap">
        <h1 class="wms-admin-page__title">WMS Admin Lists</h1>
      </div>
    </header>

    <div class="wms-admin-page__card">
      <nav class="wms-admin-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="wms-admin-page__tab"
          :class="{ 'wms-admin-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="wms-admin-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
