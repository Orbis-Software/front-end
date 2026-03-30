<script setup lang="ts">
import "./SeaJobDetails.css"

defineProps<{
  form: any
}>()
</script>

<template>
  <div class="mode-coming">
    <div class="mode-coming-card">
      <div class="mode-coming-header">🌊 Sea Freight Module</div>

      <div class="mode-coming-body">
        <p>This section will support ocean freight operations including:</p>

        <ul>
          <li>Bill of Lading (BL) management</li>
          <li>Vessel schedules and voyages</li>
          <li>Port-to-port routing</li>
          <li>Container tracking (FCL / LCL)</li>
          <li>Shipping line coordination</li>
        </ul>

        <div class="mode-coming-status">🚧 Currently under development</div>
      </div>
    </div>
  </div>
</template>
