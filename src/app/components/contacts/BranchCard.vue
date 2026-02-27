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

const props = defineProps<{ branch: Branch }>()
const emit = defineEmits<{ (e: "delete"): void }>()

function onToggleSameAsBilling(v: boolean) {
  props.branch.sameAsBilling = v

  // If same-as, copy delivery → billing to keep in sync at least once
  if (v) {
    props.branch.billing = { ...props.branch.delivery }
  }
}
</script>

<template>
  <div class="branchCard">
    <div class="branchCard__top">
      <div class="branchCard__title">Branch</div>
      <button class="iconBtn" type="button" title="Delete branch" @click="emit('delete')">
        ✕
      </button>
    </div>

    <div class="field">
      <label class="label">Branch name</label>
      <input class="input" v-model="branch.name" placeholder="e.g. Head Office" />
    </div>

    <div class="row3">
      <div class="field">
        <label class="label">Contact person</label>
        <input class="input" v-model="branch.contactPerson" placeholder="Name" />
      </div>
      <div class="field">
        <label class="label">Email</label>
        <input class="input" v-model="branch.email" placeholder="email@company.com" />
      </div>
      <div class="field">
        <label class="label">Phone</label>
        <input class="input" v-model="branch.phone" placeholder="+44..." />
      </div>
    </div>

    <div class="sectionTitle">Delivery address</div>

    <div class="field">
      <label class="label">Address line 1</label>
      <input class="input" v-model="branch.delivery.line1" />
    </div>
    <div class="field">
      <label class="label">Address line 2</label>
      <input class="input" v-model="branch.delivery.line2" />
    </div>
    <div class="field">
      <label class="label">Address line 3</label>
      <input class="input" v-model="branch.delivery.line3" />
    </div>

    <div class="row3">
      <div class="field">
        <label class="label">City</label>
        <input class="input" v-model="branch.delivery.city" />
      </div>
      <div class="field">
        <label class="label">County / State</label>
        <input class="input" v-model="branch.delivery.county" />
      </div>
      <div class="field">
        <label class="label">Postcode</label>
        <input class="input" v-model="branch.delivery.postcode" />
      </div>
    </div>

    <div class="row3">
      <div class="field">
        <label class="label">Country code</label>
        <input class="input" v-model="branch.delivery.countryCode" placeholder="GB" />
      </div>
    </div>

    <div class="toggleRow">
      <input
        id="sameAsBilling"
        type="checkbox"
        class="checkbox"
        :checked="branch.sameAsBilling"
        @change="onToggleSameAsBilling(($event.target as HTMLInputElement).checked)"
      />
      <label class="toggleLabel" for="sameAsBilling">Same as billing</label>
    </div>

    <div class="sectionTitle">Billing address</div>

    <div :class="{ muted: branch.sameAsBilling }">
      <div class="field">
        <label class="label">Address line 1</label>
        <input class="input" v-model="branch.billing.line1" :disabled="branch.sameAsBilling" />
      </div>
      <div class="field">
        <label class="label">Address line 2</label>
        <input class="input" v-model="branch.billing.line2" :disabled="branch.sameAsBilling" />
      </div>
      <div class="field">
        <label class="label">Address line 3</label>
        <input class="input" v-model="branch.billing.line3" :disabled="branch.sameAsBilling" />
      </div>

      <div class="row3">
        <div class="field">
          <label class="label">City</label>
          <input class="input" v-model="branch.billing.city" :disabled="branch.sameAsBilling" />
        </div>
        <div class="field">
          <label class="label">County / State</label>
          <input class="input" v-model="branch.billing.county" :disabled="branch.sameAsBilling" />
        </div>
        <div class="field">
          <label class="label">Postcode</label>
          <input class="input" v-model="branch.billing.postcode" :disabled="branch.sameAsBilling" />
        </div>
      </div>

      <div class="row3">
        <div class="field">
          <label class="label">Country code</label>
          <input
            class="input"
            v-model="branch.billing.countryCode"
            :disabled="branch.sameAsBilling"
            placeholder="GB"
          />
        </div>
      </div>
    </div>
  </div>
</template>