<script setup lang="ts">
import { computed, inject } from "vue"

import type { JobDetailsContext } from "@/app/types/job-details"
import JobConsolidationCustomerInvoiceTab from "../Consolidation/JobConsolidationCustomerInvoiceTab.vue"
import JobNormalCustomerInvoiceTab from "./JobNormalCustomerInvoiceTab.vue"

const context = inject<JobDetailsContext>("jobDetails")

if (!context) {
  throw new Error("JobCustomerInvoiceTab must be used inside JobDetailsPage.")
}

const isConsolidationJob = computed(() => context.form.job_type === "consolidation")
</script>

<template>
  <JobConsolidationCustomerInvoiceTab v-if="isConsolidationJob" />
  <JobNormalCustomerInvoiceTab v-else />
</template>
