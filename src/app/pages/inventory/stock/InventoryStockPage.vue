<script setup lang="ts">
import "./InventoryStockPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useInventoryStockPage } from "./InventoryStockPage"

const { tabs, isActive } = useInventoryStockPage()
</script>

<template>
  <section class="inventory-stock-page">
    <header class="inventory-stock-page__header">
      <div class="inventory-stock-page__title-wrap">
        <h1 class="inventory-stock-page__title">Stock</h1>
      </div>
    </header>

    <div class="inventory-stock-page__card">
      <nav class="inventory-stock-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="inventory-stock-page__tab"
          :class="{ 'inventory-stock-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="inventory-stock-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
