<script setup lang="ts">
defineProps<{ form: any }>()
</script>

<template>
  <div class="card">
    <div class="section-title blue">
      Local Collection — Short-distance, same-area collection & delivery
    </div>

    <div class="grid-4">
      <div class="field">
        <label>Collection Type</label>
        <select>
          <option>On-Demand</option>
        </select>
      </div>

      <div class="field">
        <label>Priority / Service Level</label>
        <select>
          <option>Standard</option>
        </select>
      </div>

      <div class="field">
        <label>Vehicle Required</label>
        <select>
          <option>Motorbike Courier</option>
        </select>
      </div>

      <div class="field">
        <label>Zone / Area</label>
        <input placeholder="e.g. London Zone 1" />
      </div>
    </div>
  </div>
</template>
