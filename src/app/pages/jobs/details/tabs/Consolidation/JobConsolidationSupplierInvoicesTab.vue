<script setup lang="ts">
import "@/app/pages/consolidations/ConsolidationPage.css"

import ConsolidationDialogs from "@/app/components/consolidations/ConsolidationDialogs.vue"
import ConsolidationSupplierInvoicesTab from "@/app/components/consolidations/tabs/ConsolidationSupplierInvoicesTab.vue"
import { useJobConsolidationStandaloneContext } from "./useJobConsolidationStandaloneContext"

const consolidationPage = useJobConsolidationStandaloneContext()
</script>

<template>
  <section class="consolidation-page consolidation-page--job-tab">
    <ConsolidationSupplierInvoicesTab :context="consolidationPage" />
    <ConsolidationDialogs :context="consolidationPage" />
  </section>
</template>
