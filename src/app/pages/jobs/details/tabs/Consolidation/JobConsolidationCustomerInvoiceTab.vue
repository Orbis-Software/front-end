<script setup lang="ts">
import "@/app/pages/consolidations/ConsolidationPage.css"

import ConsolidationCustomerInvoiceTab from "@/app/components/consolidations/tabs/ConsolidationCustomerInvoiceTab.vue"
import ConsolidationDialogs from "@/app/components/consolidations/ConsolidationDialogs.vue"
import { useJobConsolidationStandaloneContext } from "./useJobConsolidationStandaloneContext"

const consolidationPage = useJobConsolidationStandaloneContext()
</script>

<template>
  <section class="consolidation-page consolidation-page--job-tab">
    <ConsolidationCustomerInvoiceTab :context="consolidationPage" />
    <ConsolidationDialogs :context="consolidationPage" />
  </section>
</template>
