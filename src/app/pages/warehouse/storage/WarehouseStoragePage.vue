<script setup lang="ts">
import "./WarehouseStoragePage.css"
import { RouterLink, RouterView } from "vue-router"
import { useWarehouseStoragePage } from "./WarehouseStoragePage"

const { tabs, isActive } = useWarehouseStoragePage()
</script>

<template>
  <section class="warehouse-storage-page">
    <header class="warehouse-storage-page__header">
      <div class="warehouse-storage-page__title-wrap">
        <h1 class="warehouse-storage-page__title">Storage</h1>
      </div>
    </header>

    <div class="warehouse-storage-page__card">
      <nav class="warehouse-storage-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="warehouse-storage-page__tab"
          :class="{ 'warehouse-storage-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="warehouse-storage-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
