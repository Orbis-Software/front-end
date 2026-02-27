<script setup lang="ts">
type Address = {
  line1: string
  line2: string
  line3: string
  city: string
  county: string
  postcode: string
  countryCode: string
}

type CollectionAddress = {
  id: number | null
  label: string
  address: Address
}

defineProps<{ items: CollectionAddress[] }>()

const emit = defineEmits<{
  (e: "add"): void
  (e: "remove", index: number): void
}>()
</script>

<template>
  <div class="tabHeader">
    <div class="tabHeader__title">
      Collection addresses
      <div class="tabHeader__subtitle">Addresses used for collection pickup points.</div>
    </div>

    <button class="btn btn--primary" type="button" @click="emit('add')">
      + Add new address
    </button>
  </div>

  <div class="collections">
    <div v-for="(c, index) in items" :key="c.id ?? `new-${index}`" class="collectionCard">
      <div class="branchCard__top">
        <div class="branchCard__title">Collection address</div>
        <button class="iconBtn" type="button" title="Delete" @click="emit('remove', index)">
          ✕
        </button>
      </div>

      <div class="field">
        <label class="label">Label</label>
        <input class="input" v-model="c.label" placeholder="e.g. Liverpool Dock" />
      </div>

      <div class="field">
        <label class="label">Address line 1</label>
        <input class="input" v-model="c.address.line1" />
      </div>
      <div class="field">
        <label class="label">Address line 2</label>
        <input class="input" v-model="c.address.line2" />
      </div>
      <div class="field">
        <label class="label">Address line 3</label>
        <input class="input" v-model="c.address.line3" />
      </div>

      <div class="row3">
        <div class="field">
          <label class="label">City</label>
          <input class="input" v-model="c.address.city" />
        </div>
        <div class="field">
          <label class="label">County / State</label>
          <input class="input" v-model="c.address.county" />
        </div>
        <div class="field">
          <label class="label">Postcode</label>
          <input class="input" v-model="c.address.postcode" />
        </div>
      </div>

      <div class="row3">
        <div class="field">
          <label class="label">Country code</label>
          <input class="input" v-model="c.address.countryCode" placeholder="GB" />
        </div>
      </div>
    </div>
  </div>
</template>