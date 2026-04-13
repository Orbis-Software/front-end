<script setup lang="ts">
import "./RoadJobDetails.css"

import RoadJobInformationSection from "./sections/RoadJobInformationSection.vue"
import RoadOrderTypeSection from "./sections/RoadOrderTypeSection.vue"
import RoadLocalCollectionSection from "./sections/RoadLocalCollectionSection.vue"
import RoadFullTransportSection from "./sections/RoadFullTransportSection.vue"
import RoadCollectionSection from "./sections/RoadCollectionSection.vue"
import RoadDeliverySection from "./sections/RoadDeliverySection.vue"
import RoadCarrierSection from "./sections/RoadCarrierSection.vue"
import RoadPackagesTab from "./sections/RoadPackagesTab.vue"
import RoadChargesTab from "./sections/RoadChargesTab.vue"
import RoadTrackingTab from "./sections/RoadTrackingTab.vue"
import RoadDocumentsTab from "./sections/RoadDocumentsTab.vue"
import RoadReferenceDataTab from "./sections/RoadReferenceDataTab.vue"

defineProps<{
  form: any
  activeTab: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-details">
    <template v-if="activeTab === 'job_details'">
      <RoadJobInformationSection :form="form" :disabled="disabled" />
      <RoadOrderTypeSection :form="form" :disabled="disabled" />

      <RoadLocalCollectionSection
        v-if="form.order_type === 'local_collection'"
        :form="form"
        :disabled="disabled"
      />

      <RoadFullTransportSection v-else :form="form" :disabled="disabled" />

      <div class="road-two-col">
        <RoadCollectionSection :form="form" :disabled="disabled" />
        <RoadDeliverySection :form="form" :disabled="disabled" />
      </div>

      <RoadCarrierSection :form="form" :disabled="disabled" />
    </template>

    <RoadPackagesTab v-else-if="activeTab === 'packages'" :form="form" :disabled="disabled" />

    <RoadChargesTab v-else-if="activeTab === 'charges'" :form="form" :disabled="disabled" />

    <RoadTrackingTab v-else-if="activeTab === 'tracking'" :form="form" :disabled="disabled" />

    <RoadDocumentsTab v-else-if="activeTab === 'documents'" :form="form" :disabled="disabled" />

    <RoadReferenceDataTab
      v-else-if="activeTab === 'reference_data'"
      :form="form"
      :disabled="disabled"
    />
  </div>
</template>
