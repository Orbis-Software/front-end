<script setup lang="ts">
import "./AirJobDetails.css"

defineProps<{
  form: any
}>()
</script>

<template>
  <div class="mode-coming">
    <div class="mode-coming-card">
      <div class="mode-coming-header">✈️ Air Freight Module</div>

      <div class="mode-coming-body">
        <p>This section will handle full air shipment workflows including:</p>

        <ul>
          <li>Air Waybill (AWB) management</li>
          <li>Flight scheduling and routing</li>
          <li>Shipper / Consignee details</li>
          <li>Cargo and weight breakdown</li>
          <li>Airline integrations</li>
        </ul>

        <div class="mode-coming-status">🚧 Currently under development</div>
      </div>
    </div>
  </div>
</template>
