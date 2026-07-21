<script setup lang="ts">
import { computed } from "vue"
import type {
  JobDestinationAddressOption as DestinationAddressOption,
  JobDestinationAddressOwner as DestinationAddressOwner,
  JobDestinationCustomerOption as DestinationCustomerOption,
} from "@/app/types/job-details"

const props = withDefaults(
  defineProps<{
    visible: boolean
    owner: DestinationAddressOwner
    selectedCustomerName?: string
    otherCustomerId: number | null
    customerOptions: DestinationCustomerOption[]
    addressOptions: DestinationAddressOption[]
    addressValue: string | null
    loadingCustomers?: boolean
    disabled?: boolean
  }>(),
  {
    selectedCustomerName: "",
    loadingCustomers: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (event: "update:visible", value: boolean): void
  (event: "update:owner", value: DestinationAddressOwner): void
  (event: "search-customers", value: string): void
  (event: "select-customer", value: number | null): void
  (event: "select-address", value: string | null): void
}>()

const canChooseAddress = computed(() => {
  if (props.disabled) return false
  if (props.owner === "selected_customer") return Boolean(props.selectedCustomerName)

  return Boolean(props.otherCustomerId)
})

function close() {
  emit("update:visible", false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Choose Destination Address"
    class="destination-address-modal"
    :style="{ width: 'min(760px, calc(100vw - 32px))' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="destination-address-modal__body">
      <section class="destination-address-modal__section">
        <span class="destination-address-modal__label">Address source</span>

        <div class="destination-address-modal__source-grid">
          <button
            type="button"
            class="destination-address-modal__source"
            :class="{
              'destination-address-modal__source--active': owner === 'selected_customer',
            }"
            :disabled="disabled"
            @click="emit('update:owner', 'selected_customer')"
          >
            <i class="pi pi-user" />
            <span>
              <strong>Selected customer</strong>
              <small>{{ selectedCustomerName || "Choose the quote or job customer first" }}</small>
            </span>
          </button>

          <button
            type="button"
            class="destination-address-modal__source"
            :class="{
              'destination-address-modal__source--active': owner === 'other_customer',
            }"
            :disabled="disabled"
            @click="emit('update:owner', 'other_customer')"
          >
            <i class="pi pi-users" />
            <span>
              <strong>Other customer</strong>
              <small>Search another customer and use their delivery location</small>
            </span>
          </button>
        </div>
      </section>

      <section v-if="owner === 'other_customer'" class="destination-address-modal__section">
        <label class="destination-address-modal__label" for="destination-customer">
          Destination customer
        </label>
        <Dropdown
          input-id="destination-customer"
          :model-value="otherCustomerId"
          :options="customerOptions"
          option-label="label"
          option-value="value"
          placeholder="Search and select another customer"
          filter
          show-clear
          append-to="body"
          class="destination-address-modal__control"
          :loading="loadingCustomers"
          :disabled="disabled"
          @filter="emit('search-customers', $event.value ?? '')"
          @update:model-value="emit('select-customer', $event)"
        />
      </section>

      <section class="destination-address-modal__section">
        <span class="destination-address-modal__label">Delivery branch or address</span>

        <div v-if="!canChooseAddress" class="destination-address-modal__empty">
          Choose a customer before selecting a destination address.
        </div>

        <div v-else-if="!addressOptions.length" class="destination-address-modal__empty">
          This customer has no branch or address tagged for delivery.
        </div>

        <div v-else class="destination-address-modal__address-list">
          <button
            v-for="option in addressOptions"
            :key="option.value"
            type="button"
            class="destination-address-modal__address"
            :class="{
              'destination-address-modal__address--active': option.value === addressValue,
            }"
            @click="emit('select-address', option.value)"
          >
            <i
              class="pi"
              :class="option.value.startsWith('branch:') ? 'pi-building' : 'pi-map-marker'"
            />
            <span>{{ option.label }}</span>
            <i v-if="option.value === addressValue" class="pi pi-check-circle" />
          </button>
        </div>
      </section>
    </div>

    <template #footer>
      <Button label="Close" severity="secondary" outlined type="button" @click="close" />
      <Button
        label="Use Address"
        icon="pi pi-check"
        type="button"
        :disabled="!addressValue"
        @click="close"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.destination-address-modal__body,
.destination-address-modal__section {
  display: flex;
  flex-direction: column;
}

.destination-address-modal__body {
  gap: 20px;
}

.destination-address-modal__section {
  gap: 9px;
}

.destination-address-modal__label {
  color: #3d3d3a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.destination-address-modal__source-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.destination-address-modal__source {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  min-height: 82px;
  padding: 14px;
  border: 1px solid #dededb;
  border-radius: 10px;
  background: #fff;
  color: #262622;
  text-align: left;
  cursor: pointer;
}

.destination-address-modal__source > i {
  margin-top: 2px;
  color: #ec691a;
  font-size: 18px;
}

.destination-address-modal__source span {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.destination-address-modal__source strong {
  font-size: 13px;
}

.destination-address-modal__source small {
  color: #73736f;
  line-height: 1.35;
}

.destination-address-modal__source--active {
  border-color: #ec691a;
  background: #fff7f1;
  box-shadow: 0 0 0 2px rgba(236, 105, 26, 0.1);
}

.destination-address-modal__control {
  width: 100%;
}

.destination-address-modal__address-list {
  display: grid;
  gap: 8px;
  max-height: 310px;
  overflow: auto;
  padding: 2px;
}

.destination-address-modal__address {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 13px;
  border: 1px solid #e2e2df;
  border-radius: 9px;
  background: #fff;
  color: #292925;
  text-align: left;
  cursor: pointer;
}

.destination-address-modal__address > i {
  color: #ec691a;
}

.destination-address-modal__address--active {
  border-color: #ec691a;
  background: #fff7f1;
}

.destination-address-modal__empty {
  padding: 22px 14px;
  border: 1px dashed #d5d5d1;
  border-radius: 9px;
  background: #fafaf8;
  color: #73736f;
  text-align: center;
}

@media (max-width: 640px) {
  .destination-address-modal__source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
