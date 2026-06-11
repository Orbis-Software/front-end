<script setup lang="ts">
import "@/app/pages/consolidations/ConsolidationPage.css"

import ConsolidationDialogs from "@/app/components/consolidations/ConsolidationDialogs.vue"
import ConsolidationCollectionsTab from "@/app/components/consolidations/tabs/ConsolidationCollectionsTab.vue"
import { useJobConsolidationStandaloneContext } from "./useJobConsolidationStandaloneContext"

const consolidationPage = useJobConsolidationStandaloneContext()
</script>

<template>
  <section class="consolidation-page consolidation-page--job-tab">
    <ConsolidationCollectionsTab :context="consolidationPage" />
    <ConsolidationDialogs :context="consolidationPage" />
  </section>
</template>
