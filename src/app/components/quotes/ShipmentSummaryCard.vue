<template>
  <section class="card section">
    <div class="ss-head">
      <div class="section-title" style="margin:0">Shipment Summary</div>

      <Button class="btn" outlined type="button" @click="$emit('edit-dimensions')">
        Edit Dimensions
      </Button>
    </div>

    <div class="ss-grid">
      <div class="ss-item">
        <div class="ss-label">NOP</div>
        <div class="ss-value">{{ data.nop }}</div>
      </div>

      <div class="ss-item">
        <div class="ss-label">Actual Weight</div>
        <div class="ss-value">
          {{ data.actualWeight }}
          <span class="ss-unit">{{ data.weightUnit }}</span>
        </div>
      </div>

      <div class="ss-item">
        <div class="ss-label">Chargeable</div>
        <div class="ss-value">
          {{ data.chargeableWeight }}
          <span class="ss-unit">{{ data.weightUnit }}</span>
        </div>
      </div>

      <div class="ss-item">
        <div class="ss-label">Cube</div>
        <div class="ss-value">
          {{ data.cube }}
          <span class="ss-unit">{{ data.cubeUnit }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from "primevue/button";

export type ShipmentSummary = {
  nop: number;
  actualWeight: string | number;
  chargeableWeight: string | number;
  cube: string | number;
  weightUnit?: string; // kg
  cubeUnit?: string; // m³
};

withDefaults(
  defineProps<{
    data: ShipmentSummary;
  }>(),
  {
    data: () => ({
      nop: 0,
      actualWeight: 0,
      chargeableWeight: 0,
      cube: 0,
      weightUnit: "kg",
      cubeUnit: "m³",
    }),
  }
);

defineEmits<{
  (e: "edit-dimensions"): void;
}>();
</script>
