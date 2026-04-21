<script setup lang="ts">
import "./WarehouseGoodsInPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useWarehouseGoodsInPage } from "./WarehouseGoodsInPage"
import ReceiveConsignmentModal from "@/app/components/warehouse/goods-in/ReceiveConsignmentModal.vue"

const {
  tabs,
  isActive,
  receiveConsignmentOpen,
  onOpenReceiveConsignment,
  onCloseReceiveConsignment,
  onSavedReceiveConsignment,
} = useWarehouseGoodsInPage()
</script>

<template>
  <section class="warehouse-goods-in-page">
    <header class="warehouse-goods-in-page__header">
      <div class="warehouse-goods-in-page__title-wrap">
        <h1 class="warehouse-goods-in-page__title">
          Goods In
          <span class="warehouse-goods-in-page__subtitle">Receiving & arrivals</span>
        </h1>
      </div>

      <div class="warehouse-goods-in-page__actions">
        <button
          class="warehouse-goods-in-page__primary-btn"
          type="button"
          @click="onOpenReceiveConsignment"
        >
          + Receive Consignment
        </button>
      </div>
    </header>

    <div class="warehouse-goods-in-page__card">
      <nav class="warehouse-goods-in-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="warehouse-goods-in-page__tab"
          :class="{ 'warehouse-goods-in-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="warehouse-goods-in-page__content">
        <RouterView />
      </div>
    </div>

    <ReceiveConsignmentModal
      :visible="receiveConsignmentOpen"
      @close="onCloseReceiveConsignment"
      @saved="onSavedReceiveConsignment"
    />
  </section>
</template>
