<script setup lang="ts">
import { computed, inject } from "vue"

import type { JobDetailsContext } from "@/app/types/job-details"
import JobConsolidationSupplierInvoicesTab from "../Consolidation/JobConsolidationSupplierInvoicesTab.vue"
import JobNormalSupplierInvoicesTab from "./JobNormalSupplierInvoicesTab.vue"

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobSupplierInvoicesTab must be used inside JobDetailsPage.")
}

const isConsolidationJob = computed(() => context.form.job_type === "consolidation")
</script>

<template>
  <JobConsolidationSupplierInvoicesTab v-if="isConsolidationJob" />
  <JobNormalSupplierInvoicesTab v-else />
</template>
