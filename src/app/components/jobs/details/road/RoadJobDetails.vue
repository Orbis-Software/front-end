<script setup lang="ts">
import "./RoadJobDetails.css"

import JobInformationSection from "./sections/JobInformationSection.vue"
import OrderTypeSection from "./sections/OrderTypeSection.vue"
import LocalCollectionSection from "./sections/LocalCollectionSection.vue"

defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-details">
    <JobInformationSection :form="form" />
    <OrderTypeSection :form="form" />
    <LocalCollectionSection :form="form" />
  </div>
</template>
