<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <section class="air-card">
    <div class="air-card__head">
      <h3 class="air-card__title">Documents</h3>
    </div>

    <div class="air-card__body">
      <p class="air-note-text">
        No documents attached. Upload AWB copy, commercial invoice, packing list, and supporting
        documents.
      </p>
    </div>
  </section>
</template>
