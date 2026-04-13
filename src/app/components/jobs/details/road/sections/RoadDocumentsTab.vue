<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title">Documents &amp; Attachments</div>
    </div>

    <div class="road-card__body">
      <div class="road-placeholder-text">
        No documents attached yet. Upload CMR, POD, customs declarations, invoices, or other
        supporting documents.
      </div>
    </div>
  </div>
</template>
