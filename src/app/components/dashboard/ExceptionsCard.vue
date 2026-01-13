<template>
  <div class="card activity-card">
    <div class="card-title">Exceptions</div>
    <div class="card-sub">Newest first</div>

    <div class="exceptions">
      <div v-for="ex in items" :key="ex.ref" class="exception-row">
        <div class="exception-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>

        <div class="exception-body">
          <div class="exception-ref">{{ ex.ref }}</div>
          <div class="exception-desc">{{ ex.desc }}</div>
          <div class="exception-time">{{ ex.timeAgo }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { ref: string; desc: string; timeAgo: string }[] }>();
</script>
