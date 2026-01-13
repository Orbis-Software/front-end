<template>
  <div class="lane">
    <div class="lane-title">{{ lane.title }}</div>

    <div v-for="tile in lane.tiles" :key="tile.ref" class="tile">
      {{ tile.ref }}<br />
      <span>{{ tile.meta }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Lane = {
  key: string;
  title: string;
  tiles: { ref: string; meta: string }[];
};

defineProps<{ lane: Lane }>();
</script>
