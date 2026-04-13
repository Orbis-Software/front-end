<script setup lang="ts">
import "./AirJobDetails.css"

import AirJobInformationSection from "./sections/AirJobInformationSection.vue"
import AirPackagesTab from "./sections/AirPackagesTab.vue"
import AirChargesTab from "./sections/AirChargesTab.vue"
import AirDocumentsTab from "./sections/AirDocumentsTab.vue"
import AirNotesTab from "./sections/AirNotesTab.vue"

defineProps<{
  form: any
  activeTab: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="air-details">
    <AirJobInformationSection
      v-if="activeTab === 'job_details'"
      :form="form"
      :disabled="disabled"
    />

    <AirPackagesTab v-else-if="activeTab === 'packages'" :form="form" :disabled="disabled" />

    <AirChargesTab v-else-if="activeTab === 'charges'" :form="form" :disabled="disabled" />

    <AirDocumentsTab v-else-if="activeTab === 'documents'" :form="form" :disabled="disabled" />

    <AirNotesTab v-else-if="activeTab === 'notes'" :form="form" :disabled="disabled" />
  </div>
</template>
