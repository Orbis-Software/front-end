<script setup lang="ts">
import "@/app/pages/consolidations/ConsolidationPage.css"

import ConsolidationGoodsWmsTab from "@/app/components/consolidations/tabs/ConsolidationGoodsWmsTab.vue"
import { useJobConsolidationStandaloneContext } from "./useJobConsolidationStandaloneContext"

const consolidationPage = useJobConsolidationStandaloneContext()
</script>

<template>
  <section class="consolidation-page consolidation-page--job-tab">
    <ConsolidationGoodsWmsTab :context="consolidationPage" />
  </section>
</template>
