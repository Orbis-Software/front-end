<script setup lang="ts">
import "./RoadJobDetails.css"

import JobInformationSection from "./sections/JobInformationSection.vue"
import OrderTypeSection from "./sections/OrderTypeSection.vue"
import LocalCollectionSection from "./sections/LocalCollectionSection.vue"

defineProps<{
  form: any
  activeTab: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-details">
    <template v-if="activeTab === 'job_details'">
      <JobInformationSection :form="form" :disabled="disabled" />
      <OrderTypeSection :form="form" :disabled="disabled" />
      <LocalCollectionSection :form="form" :disabled="disabled" />
    </template>

    <div v-else-if="activeTab === 'packages'" class="card">
      <div class="section-title">Packages</div>
      <div class="placeholder-text">Road packages section here.</div>
    </div>

    <div v-else-if="activeTab === 'charges'" class="card">
      <div class="section-title">Charges</div>
      <div class="placeholder-text">Road charges section here.</div>
    </div>

    <div v-else-if="activeTab === 'tracking'" class="card">
      <div class="section-title">Tracking</div>
      <div class="placeholder-text">Road tracking section here.</div>
    </div>

    <div v-else-if="activeTab === 'documents'" class="card">
      <div class="section-title">Documents</div>
      <div class="placeholder-text">Road documents section here.</div>
    </div>

    <div v-else-if="activeTab === 'reference_data'" class="card">
      <div class="section-title">Reference Data</div>
      <div class="placeholder-text">Road reference data section here.</div>
    </div>
  </div>
</template>
