<script setup lang="ts">
import "./InventoryReportsPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useInventoryReportsPage } from "./InventoryReportsPage"

const { tabs, isActive } = useInventoryReportsPage()
</script>

<template>
  <section class="inventory-reports-page">
    <header class="inventory-reports-page__header">
      <div class="inventory-reports-page__title-wrap">
        <h1 class="inventory-reports-page__title">WMS Reports</h1>
      </div>
    </header>

    <div class="inventory-reports-page__card">
      <nav class="inventory-reports-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="inventory-reports-page__tab"
          :class="{ 'inventory-reports-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="inventory-reports-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
