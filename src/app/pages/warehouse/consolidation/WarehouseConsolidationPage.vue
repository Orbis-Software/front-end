<script setup lang="ts">
import "./WarehouseConsolidationPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useWarehouseConsolidationPage } from "./WarehouseConsolidationPage"

const { tabs, isActive } = useWarehouseConsolidationPage()
</script>

<template>
  <section class="warehouse-consolidation-page">
    <header class="warehouse-consolidation-page__header">
      <div class="warehouse-consolidation-page__title-wrap">
        <h1 class="warehouse-consolidation-page__title">Consolidation</h1>
      </div>
    </header>

    <div class="warehouse-consolidation-page__card">
      <nav class="warehouse-consolidation-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="warehouse-consolidation-page__tab"
          :class="{ 'warehouse-consolidation-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="warehouse-consolidation-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
