<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()

const chargeTypes = [
  { code: "FREIGHT", name: "Base Freight Rate", category: "Freight" },
  { code: "FUEL", name: "Fuel Surcharge", category: "Fuel" },
  { code: "TOLL", name: "Toll / Road Charges", category: "Surcharge" },
  { code: "CUST", name: "Customs Clearance", category: "Customs" },
  { code: "WAIT", name: "Waiting Time", category: "Handling" },
]
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title">Charge Types</div>
    </div>

    <div class="road-card__body" style="padding: 0">
      <ul class="road-ref-list">
        <li v-for="item in chargeTypes" :key="item.code" class="road-ref-item">
          <span class="road-ref-code">{{ item.code }}</span>
          <span class="road-ref-name">{{ item.name }}</span>
          <span class="road-ref-cat">{{ item.category }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
