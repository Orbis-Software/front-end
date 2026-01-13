<template>
  <div class="card activity-card">
    <div class="card-title">Today Timeline</div>
    <div class="card-sub">Auto generated activity stream</div>

    <div class="timeline">
      <div v-for="item in items" :key="item.time + item.text" class="timeline-row">
        <div class="timeline-time">{{ item.time }}</div>
        <div class="timeline-box">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { time: string; text: string }[] }>();
</script>
