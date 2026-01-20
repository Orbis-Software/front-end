<template>
  <div class="fab">
    <div class="fab-inner">
      <Button
        class="fab-btn orbis-primary"
        outlined
        type="button"
        :disabled="cancelDisabled || loading || loadingPrimary"
        @click="$emit('cancel')"
      >
        <i class="pi pi-times" style="margin-right: 8px"></i>
        {{ cancelLabel }}
      </Button>

      <Button
        class="fab-btn orbis-primary"
        outlined
        type="button"
        :loading="loading"
        :disabled="saveDisabled || loadingPrimary"
        @click="$emit('save')"
      >
        <i class="pi pi-save" style="margin-right: 8px"></i>
        {{ saveLabel }}
      </Button>

      <Button
        class="fab-btn fab-primary orbis-primary"
        type="button"
        :loading="loadingPrimary"
        :disabled="sendDisabled || loading"
        @click="$emit('send')"
      >
        <i class="pi pi-send" style="margin-right: 8px"></i>
        {{ sendLabel }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";

withDefaults(
  defineProps<{
    cancelLabel?: string;
    saveLabel?: string;
    sendLabel?: string;

    loading?: boolean; // loading for Save
    loadingPrimary?: boolean; // loading for Send

    cancelDisabled?: boolean;
    saveDisabled?: boolean;
    sendDisabled?: boolean;
  }>(),
  {
    cancelLabel: "Cancel",
    saveLabel: "Save",
    sendLabel: "Send",
    loading: false,
    loadingPrimary: false,
    cancelDisabled: false,
    saveDisabled: false,
    sendDisabled: false,
  }
);

defineEmits<{
  (e: "cancel"): void;
  (e: "save"): void;
  (e: "send"): void;
}>();
</script>

<style scoped>
/* Sticky bottom action bar */
.fab {
  position: sticky;
  bottom: 0;
  z-index: 30;

  margin-top: 14px;
  padding: 10px 0;

  background: linear-gradient(to top, #fff 70%, rgba(255, 255, 255, 0));
}

.fab-inner {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background: #fff;
}

.fab-btn.p-button {
  border-radius: 10px;
  min-width: 140px;
  justify-content: center;
}

/* primary = green (like your screenshot) */
.fab-primary.p-button {
  background: #16a34a;
  border-color: #16a34a;
}

.fab-primary.p-button:hover {
  background: #12833d;
  border-color: #12833d;
}
</style>
