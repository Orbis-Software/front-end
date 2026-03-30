<template>
  <div class="cards">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="card-btn"
      :class="{ active: selected === item.key }"
      @click="$emit('select', item.key)"
    >
      <div class="top">
        <div class="ttl">{{ item.title }}</div>
        <i class="pi pi-angle-right" />
      </div>

      <div class="sub">{{ item.subtitle }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
type CardItem = {
  key: string
  title: string
  subtitle: string
}

defineProps<{
  items: CardItem[]
  selected: string | null
}>()

defineEmits<{
  (e: "select", value: string): void
}>()
</script>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  width: 100%;
}

.card-btn {
  text-align: left;
  border: 1px solid #dedede;
  border-radius: 12px;
  background: #fff;
  padding: 12px 14px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.card-btn:hover {
  border-color: #ec691a;
}

.card-btn.active {
  border-color: #ec691a;
  box-shadow: 0 0 0 1px #ec691a inset;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ttl {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}
</style>
