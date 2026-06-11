<script setup lang="ts">
import "@/app/pages/consolidations/ConsolidationPage.css"

import ConsolidationDialogs from "@/app/components/consolidations/ConsolidationDialogs.vue"
import ConsolidationInvoicesTab from "@/app/components/consolidations/tabs/ConsolidationInvoicesTab.vue"
import { useJobConsolidationStandaloneContext } from "./useJobConsolidationStandaloneContext"

const consolidationPage = useJobConsolidationStandaloneContext()
</script>

<template>
  <section class="consolidation-page consolidation-page--job-tab">
    <ConsolidationInvoicesTab :context="consolidationPage" />
    <ConsolidationDialogs :context="consolidationPage" />
  </section>
</template>
