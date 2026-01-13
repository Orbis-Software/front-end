<template>
  <div class="cards">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      class="card-btn"
      :class="{ active: selected === it.key }"
      @click="$emit('select', it.key)"
    >
      <div class="t">{{ it.title }}</div>
      <div class="s">{{ it.subtitle }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
type CardItem<K extends string> = { key: K; title: string; subtitle: string };

defineProps<{
  items: CardItem<string>[];
  selected: string | null;
}>();

defineEmits<{
  (e: "select", key: any): void;
}>();
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.card-btn {
  text-align: left;
  border: 1px solid #ededed;
  border-radius: 12px;
  background: #fff;
  padding: 12px 12px;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.card-btn:hover {
  background: #f7f7f7;
}

.card-btn.active {
  background: #fafafa;
  border-color: #dcdcdc;
}

.t {
  font-weight: 800;
  font-size: 13px;
}

.s {
  color: #666;
  font-size: 11px;
  margin-top: 6px;
}
</style>
