<script setup lang="ts">
import BranchCard from "@/app/components/contacts/BranchCard.vue"

type Address = {
  line1: string
  line2: string
  line3: string
  city: string
  county: string
  postcode: string
  countryCode: string
}

type Branch = {
  id: number | null
  name: string
  contactPerson: string
  email: string
  phone: string
  sameAsBilling: boolean
  delivery: Address
  billing: Address
}

defineProps<{ branches: Branch[] }>()

const emit = defineEmits<{
  (e: "add"): void
  (e: "remove", index: number): void
}>()

function removeAt(index: number) {
  emit("remove", index)
}
</script>

<template>
  <div class="tabHeader">
    <div class="tabHeader__title">
      Branches & billing
      <div class="tabHeader__subtitle">Manage branch delivery + billing details.</div>
    </div>

    <button class="btn btn--primary" type="button" @click="emit('add')">
      + Add new branch
    </button>
  </div>

  <div class="grid">
    <BranchCard
      v-for="(b, index) in branches"
      :key="b.id ?? `new-${index}`"
      :branch="b"
      @delete="removeAt(index)"
    />
  </div>
</template>