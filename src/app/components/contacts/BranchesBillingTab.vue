<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { ContactBranch } from "@/app/types/contact"
import BranchCard from "@/app/components/contacts/BranchCard.vue"
import Button from "primevue/button"

const props = defineProps<{ branches: ContactBranch[] }>()

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

const selectedBranchId = ref<number | null>(props.branches[0]?.id ?? null)

watch(
  () => props.branches.map(branch => branch.id),
  ids => {
    if (!ids.length) {
      selectedBranchId.value = null
      return
    }

    if (!selectedBranchId.value || !ids.includes(selectedBranchId.value)) {
      selectedBranchId.value = ids[0] ?? null
    }
  },
  { immediate: true },
)

const selectedBranch = computed(
  () => props.branches.find(branch => branch.id === selectedBranchId.value) ?? null,
)
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
      label="Add branch"
      @click="emit('add')"
    />
  </div>

  <div v-if="branches.length" class="branchesWorkspace">
    <aside class="branchesWorkspace__list" aria-label="Branches">
      <button
        v-for="branch in branches"
        :key="branch.id"
        type="button"
        class="branchListItem"
        :class="{ 'branchListItem--active': branch.id === selectedBranchId }"
        @click="selectedBranchId = branch.id"
      >
        <span class="branchListItem__icon"><i class="pi pi-building"></i></span>
        <span class="branchListItem__copy">
          <strong>{{ branch.name || "Unnamed branch" }}</strong>
          <small>{{
            branch.delivery_city || branch.delivery_postal_code || "Address not set"
          }}</small>
          <span class="branchListItem__flags">
            <em v-if="branch.is_collection">Collection</em>
            <em v-if="branch.is_delivery">Delivery</em>
          </span>
        </span>
      </button>
    </aside>

    <div class="branchesWorkspace__detail">
      <BranchCard
        v-if="selectedBranch"
        :key="selectedBranch.id"
        :branch="selectedBranch"
        @delete="removeAt(branches.findIndex(branch => branch.id === selectedBranch!.id))"
        @save="patch => saveBranch(selectedBranch!.id, patch)"
      />
    </div>
  </div>

  <div v-if="branches.length === 0" class="loading" style="padding: 14px 0">
    No branches yet. Click Add branch.
  </div>
</template>
