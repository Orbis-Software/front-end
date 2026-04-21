<script setup lang="ts">
import "./WarehouseGoodsOutPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useWarehouseGoodsOutPage } from "./WarehouseGoodsOutPage"

const { tabs, isActive } = useWarehouseGoodsOutPage()
</script>

<template>
  <section class="warehouse-goods-out-page">
    <header class="warehouse-goods-out-page__header">
      <div class="warehouse-goods-out-page__title-wrap">
        <h1 class="warehouse-goods-out-page__title">Goods Out</h1>
      </div>
    </header>

    <div class="warehouse-goods-out-page__card">
      <nav class="warehouse-goods-out-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="warehouse-goods-out-page__tab"
          :class="{ 'warehouse-goods-out-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="warehouse-goods-out-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
