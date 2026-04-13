<script setup lang="ts">
import "./RailJobDetails.css"

import RailShipmentIdentificationSection from "./sections/RailShipmentIdentificationSection.vue"
import RailTransitDatesSection from "./sections/RailTransitDatesSection.vue"
import RailRouteReferencesSection from "./sections/RailRouteReferencesSection.vue"
import RailCustomsTradeSection from "./sections/RailCustomsTradeSection.vue"
import RailDangerousGoodsSection from "./sections/RailDangerousGoodsSection.vue"
import RailGoodsDescriptionSection from "./sections/RailGoodsDescriptionSection.vue"
import RailPartiesSection from "./sections/RailPartiesSection.vue"
import RailPackagesTab from "./sections/RailPackagesTab.vue"
import RailChargesTab from "./sections/RailChargesTab.vue"
import RailDocumentsTab from "./sections/RailDocumentsTab.vue"

defineProps<{
  form: any
  activeTab: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="rail-details">
    <template v-if="activeTab === 'rail_details'">
      <RailShipmentIdentificationSection :form="form" :disabled="disabled" />
      <RailTransitDatesSection :form="form" :disabled="disabled" />
      <RailRouteReferencesSection :form="form" :disabled="disabled" />
      <RailCustomsTradeSection :form="form" :disabled="disabled" />
      <RailDangerousGoodsSection :form="form" :disabled="disabled" />
      <RailGoodsDescriptionSection :form="form" :disabled="disabled" />
    </template>

    <RailPartiesSection v-else-if="activeTab === 'parties'" :form="form" :disabled="disabled" />

    <RailPackagesTab v-else-if="activeTab === 'packages'" :form="form" :disabled="disabled" />

    <RailChargesTab v-else-if="activeTab === 'charges'" :form="form" :disabled="disabled" />

    <RailDocumentsTab v-else-if="activeTab === 'documents'" :form="form" :disabled="disabled" />
  </div>
</template>
