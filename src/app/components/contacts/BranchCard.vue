<script setup lang="ts">
import { computed, reactive } from "vue"
import type { ContactBranch } from "@/app/types/contact"
import Button from "primevue/button"

const props = defineProps<{
  branch: ContactBranch
}>()

const emit = defineEmits<{
  (e: "delete"): void
  (e: "save", patch: Partial<ContactBranch>): void
}>()

// stable checkbox id per card
const sameId = computed(() => `same-${props.branch.id ?? Math.random().toString(16).slice(2)}`)

/**
 * Track last-saved snapshot so we only emit real changes.
 * (We intentionally track only the fields the backend accepts.)
 */
const last = reactive<Partial<ContactBranch>>({})

function snapshotFromBranch(b: ContactBranch): Partial<ContactBranch> {
  return {
    name: b.name,

    contact_person: b.contact_person,
    email: b.email,
    phone: b.phone,

    delivery_address_line_1: b.delivery_address_line_1,
    delivery_address_line_2: b.delivery_address_line_2,
    delivery_address_line_3: b.delivery_address_line_3,
    delivery_city: b.delivery_city,
    delivery_county_state: b.delivery_county_state,
    delivery_postal_code: b.delivery_postal_code,
    delivery_country_id: b.delivery_country_id,

    billing_same_as_delivery: b.billing_same_as_delivery,

    billing_address_line_1: b.billing_address_line_1,
    billing_address_line_2: b.billing_address_line_2,
    billing_address_line_3: b.billing_address_line_3,
    billing_city: b.billing_city,
    billing_county_state: b.billing_county_state,
    billing_postal_code: b.billing_postal_code,
    billing_country_id: b.billing_country_id,
  }
}

// initialize snapshot once (component created)
Object.assign(last, snapshotFromBranch(props.branch))

function canSave(): boolean {
  // If you only create branches via backend, id will always be > 0.
  // If you still have temp rows, prevent PATCH calls for id <= 0.
  return Number(props.branch.id) > 0
}

function emitIfChanged(keys: (keyof ContactBranch)[]) {
  if (!canSave()) return

  const patch: Partial<ContactBranch> = {}
  let changed = false

  for (const k of keys) {
    const curr = (props.branch as any)[k]
    const prev = (last as any)[k]

    // compare (simple equality is enough for primitives here)
    if (curr !== prev) {
      ;(patch as any)[k] = curr
      ;(last as any)[k] = curr
      changed = true
    }
  }

  if (changed) emit("save", patch)
}

// computed checkbox handler with auto-copy + auto-save
const sameAsDelivery = computed({
  get: () => !!props.branch.billing_same_as_delivery,
  set: (v: boolean) => {
    props.branch.billing_same_as_delivery = v

    if (v) {
      props.branch.billing_address_line_1 = props.branch.delivery_address_line_1
      props.branch.billing_address_line_2 = props.branch.delivery_address_line_2
      props.branch.billing_address_line_3 = props.branch.delivery_address_line_3
      props.branch.billing_city = props.branch.delivery_city
      props.branch.billing_county_state = props.branch.delivery_county_state
      props.branch.billing_postal_code = props.branch.delivery_postal_code
      props.branch.billing_country_id = props.branch.delivery_country_id
    }

    emitIfChanged([
      "billing_same_as_delivery",
      "billing_address_line_1",
      "billing_address_line_2",
      "billing_address_line_3",
      "billing_city",
      "billing_county_state",
      "billing_postal_code",
      "billing_country_id",
    ])
  },
})
</script>

<template>
  <div class="branchCard">
    <div class="branchCard__top">
      <div class="branchTitleRow">
        <div class="branchIcon">
          <i class="pi pi-building" />
        </div>

        <input
          class="branchNameInput"
          v-model="branch.name"
          placeholder="Head Office"
          @blur="emitIfChanged(['name'])"
        />
      </div>

      <Button
        type="button"
        class="dangerBtn"
        icon="pi pi-trash"
        label="Delete"
        @click="emit('delete')"
      />
    </div>

    <div class="row2">
      <div class="field">
        <label class="label">Contact person</label>
        <input
          class="input"
          v-model="branch.contact_person"
          placeholder="Name"
          @blur="emitIfChanged(['contact_person'])"
        />
      </div>

      <div class="field">
        <label class="label">Email</label>
        <input
          class="input"
          v-model="branch.email"
          placeholder="email@company.com"
          @blur="emitIfChanged(['email'])"
        />
      </div>
    </div>

    <div class="field">
      <label class="label">Phone</label>
      <input
        class="input"
        v-model="branch.phone"
        placeholder="+44..."
        @blur="emitIfChanged(['phone'])"
      />
    </div>

    <div class="sectionTitle">
      <div class="sectionIcon">
        <i class="pi pi-truck" />
      </div>
      <div>Delivery address</div>
    </div>

    <div class="field">
      <label class="label">Address line 1</label>
      <input
        class="input"
        v-model="branch.delivery_address_line_1"
        @blur="emitIfChanged(['delivery_address_line_1'])"
      />
    </div>

    <div class="field">
      <label class="label">Address line 2</label>
      <input
        class="input"
        v-model="branch.delivery_address_line_2"
        @blur="emitIfChanged(['delivery_address_line_2'])"
      />
    </div>

    <div class="field">
      <label class="label">Address line 3</label>
      <input
        class="input"
        v-model="branch.delivery_address_line_3"
        @blur="emitIfChanged(['delivery_address_line_3'])"
      />
    </div>

    <div class="row2">
      <div class="field">
        <label class="label">City</label>
        <input
          class="input"
          v-model="branch.delivery_city"
          @blur="emitIfChanged(['delivery_city'])"
        />
      </div>

      <div class="field">
        <label class="label">County</label>
        <input
          class="input"
          v-model="branch.delivery_county_state"
          @blur="emitIfChanged(['delivery_county_state'])"
        />
      </div>
    </div>

    <div class="row2">
      <div class="field">
        <label class="label">Postcode</label>
        <input
          class="input"
          v-model="branch.delivery_postal_code"
          @blur="emitIfChanged(['delivery_postal_code'])"
        />
      </div>

      <div class="field">
        <label class="label">Country (ID)</label>
        <input
          class="input"
          v-model.number="branch.delivery_country_id"
          placeholder="GB country_id"
          @blur="emitIfChanged(['delivery_country_id'])"
        />
      </div>
    </div>

    <div class="toggleRow">
      <div class="toggleLabel">Same as delivery</div>
      <div style="display: flex; align-items: center; gap: 10px">
        <input :id="sameId" type="checkbox" class="checkbox" v-model="sameAsDelivery" />
        <label :for="sameId" style="color: #6b7280; font-weight: 700">
          Copy delivery → billing
        </label>
      </div>
    </div>

    <div class="sectionTitle">
      <div class="sectionIcon">
        <i class="pi pi-file-invoice" />
      </div>
      <div>Billing address</div>
    </div>

    <div :class="{ muted: branch.billing_same_as_delivery }">
      <div class="field">
        <label class="label">Address line 1</label>
        <input
          class="input"
          v-model="branch.billing_address_line_1"
          :disabled="branch.billing_same_as_delivery"
          @blur="emitIfChanged(['billing_address_line_1'])"
        />
      </div>

      <div class="field">
        <label class="label">Address line 2</label>
        <input
          class="input"
          v-model="branch.billing_address_line_2"
          :disabled="branch.billing_same_as_delivery"
          @blur="emitIfChanged(['billing_address_line_2'])"
        />
      </div>

      <div class="field">
        <label class="label">Address line 3</label>
        <input
          class="input"
          v-model="branch.billing_address_line_3"
          :disabled="branch.billing_same_as_delivery"
          @blur="emitIfChanged(['billing_address_line_3'])"
        />
      </div>

      <div class="row2">
        <div class="field">
          <label class="label">City</label>
          <input
            class="input"
            v-model="branch.billing_city"
            :disabled="branch.billing_same_as_delivery"
            @blur="emitIfChanged(['billing_city'])"
          />
        </div>

        <div class="field">
          <label class="label">County</label>
          <input
            class="input"
            v-model="branch.billing_county_state"
            :disabled="branch.billing_same_as_delivery"
            @blur="emitIfChanged(['billing_county_state'])"
          />
        </div>
      </div>

      <div class="row2">
        <div class="field">
          <label class="label">Postcode</label>
          <input
            class="input"
            v-model="branch.billing_postal_code"
            :disabled="branch.billing_same_as_delivery"
            @blur="emitIfChanged(['billing_postal_code'])"
          />
        </div>

        <div class="field">
          <label class="label">Country (ID)</label>
          <input
            class="input"
            v-model.number="branch.billing_country_id"
            :disabled="branch.billing_same_as_delivery"
            @blur="emitIfChanged(['billing_country_id'])"
          />
        </div>
      </div>
    </div>
  </div>
</template>
