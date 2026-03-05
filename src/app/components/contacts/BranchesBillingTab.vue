<script setup lang="ts">
import type { ContactBranch } from "@/app/types/contact"
import BranchCard from "@/app/components/contacts/BranchCard.vue"
import Button from "primevue/button"

defineProps<{ branches: ContactBranch[] }>()

const emit = defineEmits<{
  (e: "add"): void
  (e: "remove", index: number): void
  (e: "save", branchId: number, patch: Partial<ContactBranch>): void
}>()

function removeAt(index: number) {
  emit("remove", index)
}

function saveBranch(branchId: number, patch: Partial<ContactBranch>) {
  emit("save", branchId, patch)
}
</script>

<template>
  <div class="tabHeader">
    <div>
      <div class="tabHeader__title">Branch addresses & contacts</div>
    </div>

    <Button
      type="button"
      class="btn btn--primary"
      icon="pi pi-plus"
      label="Add new branch"
      @click="emit('add')"
    />
  </div>

  <div class="grid">
    <BranchCard
      v-for="(b, index) in branches"
      :key="b.id ?? `new-${index}`"
      :branch="b"
      @delete="removeAt(index)"
      @save="patch => saveBranch(b.id, patch)"
    />
  </div>

  <div v-if="branches.length === 0" class="loading" style="padding: 14px 0">
    No branches yet. Click “Add new branch”.
  </div>
</template>
