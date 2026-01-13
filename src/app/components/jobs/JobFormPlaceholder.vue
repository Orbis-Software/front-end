<template>
  <div class="wrap">
    <div class="note">
      <div class="h">Mode-specific form placeholder</div>
      <div class="p">
        Selected:
        <strong>{{ jobType }}</strong>
        ·
        <strong>{{ mode }}</strong>
      </div>
      <div class="p2">
        Next: you’ll provide the form layout per mode, and we’ll replace this component with the real form.
      </div>
    </div>

    <div class="actions">
      <Button class="btn" outlined type="button" @click="$emit('resetMode')">
        <i class="pi pi-arrow-left" style="margin-right: 8px" />
        Change Mode
      </Button>

      <Button class="btn" outlined type="button" @click="$emit('resetAll')">
        <i class="pi pi-refresh" style="margin-right: 8px" />
        Change Job Type
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";

defineProps<{
  jobType: string;
  mode: string;
}>();

defineEmits<{
  (e: "resetMode"): void;
  (e: "resetAll"): void;
}>();
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #ededed;
  border-radius: 12px;
  background: #fafafa;
}

.note {
  max-width: 680px;
}

.h {
  font-weight: 800;
  margin-bottom: 6px;
}

.p, .p2 {
  color: #555;
  font-size: 13px;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  border-radius: 10px;
}
</style>
