<script setup lang="ts">
import { ref } from "vue"

import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"
import InputSwitch from "primevue/inputswitch"
import Textarea from "primevue/textarea"
import InputNumber from "primevue/inputnumber"
import Dialog from "primevue/dialog"
import Checkbox from "primevue/checkbox"

import {
  orderTypeOptions,
  packagingOptions,
  hazardClassOptions,
  cubeM3,
  volumeM3,
  badgeClass,
  useJobTransportTab,
} from "./useJobTransportTab"

const props = defineProps<{ form: any; disabled?: boolean }>()

const {
  open,
  collection,
  transport,
  selectedContact,
  carrierOptions,
  collectionAddressOptions,
  deliveryAddressOptions,
  collectionTotals,
  transportTotals,
  collectionAppliedCharges,
  transportAppliedCharges,
  collectionCostTotal,
  transportCostTotal,
  existingCollectionOrders,
  existingTransportOrders,
  addDimRow,
  togglePanel,
  handleHazardousChange,
  createAddressForSelectedContact,
} = useJobTransportTab(props.form)

const showAddressModal = ref(false)
const addressTarget = ref<"collection" | "delivery">("collection")
const savingAddress = ref(false)

const addressForm = ref({
  label: "",
  address_line_1: "",
  address_line_2: "",
  address_line_3: "",
  city: "",
  county_state: "",
  postal_code: "",
  country: "",
  contact_person: "",
  phone: "",
  email: "",
  special_instructions: "",
  is_collection: true,
  is_delivery: false,
})

function resetAddressForm() {
  addressForm.value = {
    label: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    city: "",
    county_state: "",
    postal_code: "",
    country: "",
    contact_person: "",
    phone: "",
    email: "",
    special_instructions: "",
    is_collection: addressTarget.value === "collection",
    is_delivery: addressTarget.value === "delivery",
  }
}

function openAddressModal(target: "collection" | "delivery") {
  addressTarget.value = target
  resetAddressForm()
  showAddressModal.value = true
}

async function saveAddress() {
  if (!selectedContact.value?.id) return

  savingAddress.value = true
  try {
    await createAddressForSelectedContact({
      ...addressForm.value,
      is_collection: addressForm.value.is_collection,
      is_delivery: addressForm.value.is_delivery,
    })

    showAddressModal.value = false
    resetAddressForm()
  } finally {
    savingAddress.value = false
  }
}
</script>

<template>
  <div class="job-transport">
    <Dialog
      v-model:visible="showAddressModal"
      modal
      :style="{ width: '42rem', maxWidth: '95vw' }"
      :header="addressTarget === 'collection' ? 'Add Collection Address' : 'Add Delivery Address'"
    >
      <div class="address-modal-grid">
        <div class="field">
          <label class="label">Label</label>
          <InputText v-model="addressForm.label" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">Contact Person</label>
          <InputText v-model="addressForm.contact_person" class="field-fluid field-input" />
        </div>

        <div class="field field--span-2">
          <label class="label">Address Line 1</label>
          <InputText v-model="addressForm.address_line_1" class="field-fluid field-input" />
        </div>

        <div class="field field--span-2">
          <label class="label">Address Line 2</label>
          <InputText v-model="addressForm.address_line_2" class="field-fluid field-input" />
        </div>

        <div class="field field--span-2">
          <label class="label">Address Line 3</label>
          <InputText v-model="addressForm.address_line_3" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">City</label>
          <InputText v-model="addressForm.city" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">County / State</label>
          <InputText v-model="addressForm.county_state" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">Postal Code</label>
          <InputText v-model="addressForm.postal_code" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">Country</label>
          <InputText v-model="addressForm.country" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">Phone</label>
          <InputText v-model="addressForm.phone" class="field-fluid field-input" />
        </div>

        <div class="field">
          <label class="label">Email</label>
          <InputText v-model="addressForm.email" class="field-fluid field-input" />
        </div>

        <div class="field field--span-2">
          <label class="label">Special Instructions</label>
          <Textarea v-model="addressForm.special_instructions" class="field-fluid" autoResize />
        </div>

        <div class="checkbox-row field--span-2">
          <div class="checkbox-item">
            <Checkbox v-model="addressForm.is_collection" :binary="true" inputId="is_collection" />
            <label for="is_collection">Collection Address</label>
          </div>

          <div class="checkbox-item">
            <Checkbox v-model="addressForm.is_delivery" :binary="true" inputId="is_delivery" />
            <label for="is_delivery">Delivery Address</label>
          </div>
        </div>
      </div>

      <template #footer>
        <Button class="orbis-btn" label="Cancel" @click="showAddressModal = false" />
        <Button
          class="orbis-btn orbis-btn--orange"
          label="Save Address"
          :loading="savingAddress"
          @click="saveAddress"
        />
      </template>
    </Dialog>

    <section class="panel">
      <div class="panel-head">
        <button class="panel-toggle" type="button" @click="togglePanel('collection')">
          <i class="pi pi-chevron-down" :class="{ rot: !open.collection }" />
          <span>Collection Orders</span>
        </button>

        <div class="panel-actions">
          <Dropdown
            v-model="collection.type"
            :options="orderTypeOptions"
            optionLabel="label"
            optionValue="value"
            class="mini-dd"
            filter
            :disabled="disabled"
          />
          <Button
            class="orbis-btn orbis-btn--orange"
            icon="pi pi-plus"
            label="Add Collection Orders"
            :disabled="disabled"
          />
        </div>
      </div>

      <div v-show="open.collection" class="panel-body">
        <div class="grid-3">
          <div class="field">
            <label class="label">Collection Address</label>
            <div class="field-with-action">
              <Dropdown
                :options="collectionAddressOptions"
                v-model="collection.collection_address"
                optionLabel="label"
                optionValue="value"
                placeholder="Select collection address"
                class="field-fluid"
                filter
                showClear
                :disabled="disabled || !selectedContact"
              />
              <Button
                class="orbis-btn orbis-btn--orange-lite add-mini-btn"
                icon="pi pi-plus"
                :disabled="disabled || !selectedContact"
                @click="openAddressModal('collection')"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Delivery Address</label>
            <div class="field-with-action">
              <Dropdown
                :options="deliveryAddressOptions"
                v-model="collection.delivery_address"
                optionLabel="label"
                optionValue="value"
                placeholder="Select delivery address"
                class="field-fluid"
                filter
                showClear
                :disabled="disabled || !selectedContact"
              />
              <Button
                class="orbis-btn orbis-btn--orange-lite add-mini-btn"
                icon="pi pi-plus"
                :disabled="disabled || !selectedContact"
                @click="openAddressModal('delivery')"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Order Reference</label>
            <InputText
              v-model="collection.order_reference"
              class="field-fluid field-input"
              :disabled="true"
            />
          </div>
        </div>

        <div class="grid-3">
          <div class="field">
            <label class="label">Customer Ref</label>
            <InputText
              v-model="collection.customer_ref"
              class="field-fluid field-input"
              placeholder="Enter customer reference"
              :disabled="disabled"
            />
          </div>

          <div class="field">
            <label class="label">Collection Ref</label>
            <InputText
              v-model="collection.collection_ref"
              class="field-fluid field-input"
              placeholder="Enter collection reference"
              :disabled="disabled"
            />
          </div>

          <div class="field">
            <label class="label">Carrier</label>
            <Dropdown
              v-model="collection.carrier"
              :options="carrierOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select carrier"
              class="field-fluid"
              filter
              showClear
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label class="label">Pick Up Date &amp; Time</label>
            <div class="dt-row">
              <Calendar
                v-model="collection.pickup_date"
                dateFormat="dd/mm/yy"
                class="field-fluid"
                inputClass="field-input"
                :disabled="disabled"
              />
              <InputText
                v-model="collection.pickup_time"
                class="time-input"
                placeholder="--:-- --"
                :disabled="disabled"
              />
              <i class="pi pi-clock clock-ico" />
            </div>
          </div>

          <div class="field">
            <label class="label">Delivery Date &amp; Time</label>
            <div class="dt-row">
              <Calendar
                v-model="collection.delivery_date"
                dateFormat="dd/mm/yy"
                class="field-fluid"
                inputClass="field-input"
                :disabled="disabled"
              />
              <InputText
                v-model="collection.delivery_time"
                class="time-input"
                placeholder="--:-- --"
                :disabled="disabled"
              />
              <i class="pi pi-clock clock-ico" />
            </div>
          </div>
        </div>

        <div class="haz-row haz-row--with-class">
          <div class="haz-left">
            <div class="label">Hazardous</div>
            <InputSwitch
              :modelValue="collection.hazardous"
              :disabled="disabled"
              @update:modelValue="handleHazardousChange('collection', $event)"
            />
          </div>

          <div class="haz-class" v-if="collection.hazardous">
            <label class="label">Hazardous Class</label>
            <Dropdown
              v-model="collection.hazardous_class"
              :options="hazardClassOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select class"
              class="field-fluid"
              filter
              showClear
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Description of Goods</label>
          <Textarea
            v-model="collection.goods_description"
            class="field-fluid"
            autoResize
            placeholder="Enter description"
            :disabled="disabled"
          />
        </div>

        <div class="dims">
          <div class="dims-title">Dimensions</div>

          <div class="dims-table">
            <div class="dims-head">
              <div>Packaging</div>
              <div>Qty</div>
              <div>Length (cm)</div>
              <div>Width (cm)</div>
              <div>Height (cm)</div>
              <div>Gross Weight (kg)</div>
              <div>Cube (m³)</div>
              <div>Volume (m³)</div>
              <div>LDM</div>
            </div>

            <div v-for="(r, idx) in collection.dimensions" :key="idx" class="dims-row">
              <Dropdown
                v-model="r.packaging"
                :options="packagingOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select"
                class="cell"
                filter
                showClear
                :disabled="disabled"
              />
              <InputNumber v-model="r.qty" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.length_cm" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.width_cm" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.height_cm" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.gross_kg" class="cell" :min="0" :disabled="disabled" />

              <div class="cell cell--calc">{{ cubeM3(r).toFixed(3) }} m³</div>
              <div class="cell cell--calc">{{ volumeM3(r).toFixed(1) }} m³</div>

              <InputNumber v-model="r.ldm" class="cell" :min="0" :disabled="disabled" />
            </div>

            <div class="dims-total">
              <div class="t-label">TOTAL</div>
              <div>{{ collectionTotals.qty }}</div>
              <div></div>
              <div></div>
              <div></div>
              <div>
                <b>{{ collectionTotals.gross.toFixed(1) }}</b> kg
              </div>
              <div>
                <b>{{ collectionTotals.cube.toFixed(3) }}</b> m³
              </div>
              <div>
                <b>{{ collectionTotals.vol.toFixed(1) }}</b> m³
              </div>
              <div>
                <b>{{ collectionTotals.ldm.toFixed(3) }}</b> LDM
              </div>
            </div>
          </div>

          <Button
            class="orbis-btn orbis-btn--orange-lite"
            icon="pi pi-plus"
            label="Add Item"
            :disabled="disabled"
            @click="addDimRow('collection')"
          />
        </div>

        <div class="cost-box">
          <div class="charge-summary">
            <div class="charge-summary__title">Applied Charges</div>

            <div class="charge-summary__meta">
              <div>
                <span class="charge-summary__label">Weight Table:</span>
                <span>{{ collectionAppliedCharges.weight_table_name ?? "—" }}</span>
              </div>
              <div>
                <span class="charge-summary__label">Customer Table:</span>
                <span>{{ collectionAppliedCharges.customer_table_name ?? "—" }}</span>
              </div>
            </div>

            <div v-if="collectionAppliedCharges.rows.length" class="charge-lines">
              <div v-for="row in collectionAppliedCharges.rows" :key="row.id" class="charge-line">
                <div class="charge-line__left">
                  <b>{{ row.description }}</b>
                  <span class="charge-line__source">{{ row.table_name }}</span>
                  <span class="charge-line__basis">{{ row.basis }}</span>
                </div>
                <div>£{{ row.amount.toFixed(2) }}</div>
              </div>
            </div>

            <div v-else class="empty-state">No charge rows available.</div>
          </div>

          <div class="cost-row cost-row--total">
            <div><b>Total:</b></div>
            <div class="cost-total">£{{ collectionCostTotal.toFixed(2) }}</div>
          </div>
        </div>

        <div class="row-actions">
          <Button
            class="orbis-btn orbis-btn--orange"
            icon="pi pi-plus"
            label="Save & Add Collection Order"
            :disabled="disabled"
          />
          <Button class="orbis-btn" icon="pi pi-print" label="Print All" :disabled="disabled" />
          <Button
            class="orbis-btn"
            icon="pi pi-envelope"
            label="Email to Carrier"
            :disabled="disabled"
          />
        </div>

        <div class="existing">
          <div class="existing-title">
            Existing Collection Orders ({{ existingCollectionOrders.length }})
          </div>

          <div v-if="!existingCollectionOrders.length" class="empty-state">
            No collection orders yet.
          </div>

          <div v-for="o in existingCollectionOrders" :key="o.id" class="order-line">
            <div class="order-main">
              <div class="order-id">{{ o.id }}</div>
              <div class="order-meta">
                <span>Carrier: {{ o.carrier }}</span>
                <span>•</span>
                <span>Pickup: {{ o.pickup }}</span>
                <span>•</span>
                <span>Ref: {{ o.ref }}</span>
                <span>•</span>
                <span>Type: {{ o.type }}</span>
                <span>•</span>
                <span>Customer: {{ o.customer }}</span>
              </div>
            </div>

            <div class="order-right">
              <span :class="badgeClass(o.status)">{{ o.status }}</span>
              <div class="order-icons">
                <i class="pi pi-check" title="Confirm" />
                <i class="pi pi-print" title="Print" />
                <i class="pi pi-envelope" title="Email" />
                <i class="pi pi-trash" title="Delete" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <button class="panel-toggle" type="button" @click="togglePanel('transport')">
          <i class="pi pi-chevron-down" :class="{ rot: !open.transport }" />
          <span>Transport Orders</span>
        </button>

        <div class="panel-actions">
          <Dropdown
            v-model="transport.type"
            :options="orderTypeOptions"
            optionLabel="label"
            optionValue="value"
            class="mini-dd"
            filter
            :disabled="disabled"
          />
          <Button
            class="orbis-btn orbis-btn--orange"
            icon="pi pi-plus"
            label="Add Transport Orders"
            :disabled="disabled"
          />
        </div>
      </div>

      <div v-show="open.transport" class="panel-body">
        <div class="grid-3">
          <div class="field">
            <label class="label">Collection Address</label>
            <div class="field-with-action">
              <Dropdown
                :options="collectionAddressOptions"
                v-model="transport.collection_address"
                optionLabel="label"
                optionValue="value"
                placeholder="Select collection address"
                class="field-fluid"
                filter
                showClear
                :disabled="disabled || !selectedContact"
              />
              <Button
                class="orbis-btn orbis-btn--orange-lite add-mini-btn"
                icon="pi pi-plus"
                :disabled="disabled || !selectedContact"
                @click="openAddressModal('collection')"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Delivery Address</label>
            <div class="field-with-action">
              <Dropdown
                :options="deliveryAddressOptions"
                v-model="transport.delivery_address"
                optionLabel="label"
                optionValue="value"
                placeholder="Select delivery address"
                class="field-fluid"
                filter
                showClear
                :disabled="disabled || !selectedContact"
              />
              <Button
                class="orbis-btn orbis-btn--orange-lite add-mini-btn"
                icon="pi pi-plus"
                :disabled="disabled || !selectedContact"
                @click="openAddressModal('delivery')"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Order Reference</label>
            <InputText
              v-model="transport.order_reference"
              class="field-fluid field-input"
              :disabled="true"
            />
          </div>
        </div>

        <div class="grid-3">
          <div class="field">
            <label class="label">Customer Ref</label>
            <InputText
              v-model="transport.customer_ref"
              class="field-fluid field-input"
              placeholder="Enter customer reference"
              :disabled="disabled"
            />
          </div>

          <div class="field">
            <label class="label">Collection Ref</label>
            <InputText
              v-model="transport.collection_ref"
              class="field-fluid field-input"
              placeholder="Enter collection reference"
              :disabled="disabled"
            />
          </div>

          <div class="field">
            <label class="label">Carrier</label>
            <Dropdown
              v-model="transport.carrier"
              :options="carrierOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select carrier"
              class="field-fluid"
              filter
              showClear
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label class="label">Pick Up Date &amp; Time</label>
            <div class="dt-row">
              <Calendar
                v-model="transport.pickup_date"
                dateFormat="dd/mm/yy"
                class="field-fluid"
                inputClass="field-input"
                :disabled="disabled"
              />
              <InputText
                v-model="transport.pickup_time"
                class="time-input"
                placeholder="--:-- --"
                :disabled="disabled"
              />
              <i class="pi pi-clock clock-ico" />
            </div>
          </div>

          <div class="field">
            <label class="label">Delivery Date &amp; Time</label>
            <div class="dt-row">
              <Calendar
                v-model="transport.delivery_date"
                dateFormat="dd/mm/yy"
                class="field-fluid"
                inputClass="field-input"
                :disabled="disabled"
              />
              <InputText
                v-model="transport.delivery_time"
                class="time-input"
                placeholder="--:-- --"
                :disabled="disabled"
              />
              <i class="pi pi-clock clock-ico" />
            </div>
          </div>
        </div>

        <div class="haz-row haz-row--with-class">
          <div class="haz-left">
            <div class="label">Hazardous</div>
            <InputSwitch
              :modelValue="transport.hazardous"
              :disabled="disabled"
              @update:modelValue="handleHazardousChange('transport', $event)"
            />
          </div>

          <div class="haz-class" v-if="transport.hazardous">
            <label class="label">Hazardous Class</label>
            <Dropdown
              v-model="transport.hazardous_class"
              :options="hazardClassOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select class"
              class="field-fluid"
              filter
              showClear
              :disabled="disabled"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Description of Goods</label>
          <Textarea
            v-model="transport.goods_description"
            class="field-fluid"
            autoResize
            placeholder="Enter description"
            :disabled="disabled"
          />
        </div>

        <div class="dims">
          <div class="dims-title">Dimensions</div>

          <div class="dims-table">
            <div class="dims-head">
              <div>Packaging</div>
              <div>Qty</div>
              <div>Length (cm)</div>
              <div>Width (cm)</div>
              <div>Height (cm)</div>
              <div>Gross Weight (kg)</div>
              <div>Cube (m³)</div>
              <div>Volume (m³)</div>
              <div>LDM</div>
            </div>

            <div v-for="(r, idx) in transport.dimensions" :key="idx" class="dims-row">
              <Dropdown
                v-model="r.packaging"
                :options="packagingOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select"
                class="cell"
                filter
                showClear
                :disabled="disabled"
              />
              <InputNumber v-model="r.qty" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.length_cm" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.width_cm" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.height_cm" class="cell" :min="0" :disabled="disabled" />
              <InputNumber v-model="r.gross_kg" class="cell" :min="0" :disabled="disabled" />
              <div class="cell cell--calc">{{ cubeM3(r).toFixed(3) }} m³</div>
              <div class="cell cell--calc">{{ volumeM3(r).toFixed(1) }} m³</div>
              <InputNumber v-model="r.ldm" class="cell" :min="0" :disabled="disabled" />
            </div>

            <div class="dims-total">
              <div class="t-label">TOTAL</div>
              <div>{{ transportTotals.qty }}</div>
              <div></div>
              <div></div>
              <div></div>
              <div>
                <b>{{ transportTotals.gross.toFixed(1) }}</b> kg
              </div>
              <div>
                <b>{{ transportTotals.cube.toFixed(3) }}</b> m³
              </div>
              <div>
                <b>{{ transportTotals.vol.toFixed(1) }}</b> m³
              </div>
              <div>
                <b>{{ transportTotals.ldm.toFixed(3) }}</b> LDM
              </div>
            </div>
          </div>

          <Button
            class="orbis-btn orbis-btn--orange-lite"
            icon="pi pi-plus"
            label="Add Item"
            :disabled="disabled"
            @click="addDimRow('transport')"
          />
        </div>

        <div class="cost-box">
          <div class="charge-summary">
            <div class="charge-summary__title">Applied Charges</div>

            <div class="charge-summary__meta">
              <div>
                <span class="charge-summary__label">Weight Table:</span>
                <span>{{ transportAppliedCharges.weight_table_name ?? "—" }}</span>
              </div>
              <div>
                <span class="charge-summary__label">Customer Table:</span>
                <span>{{ transportAppliedCharges.customer_table_name ?? "—" }}</span>
              </div>
            </div>

            <div v-if="transportAppliedCharges.rows.length" class="charge-lines">
              <div v-for="row in transportAppliedCharges.rows" :key="row.id" class="charge-line">
                <div class="charge-line__left">
                  <b>{{ row.description }}</b>
                  <span class="charge-line__source">{{ row.table_name }}</span>
                  <span class="charge-line__basis">{{ row.basis }}</span>
                </div>
                <div>£{{ row.amount.toFixed(2) }}</div>
              </div>
            </div>

            <div v-else class="empty-state">No charge rows available.</div>
          </div>

          <div class="cost-row cost-row--total">
            <div><b>Total:</b></div>
            <div class="cost-total">£{{ transportCostTotal.toFixed(2) }}</div>
          </div>
        </div>

        <div class="row-actions">
          <Button
            class="orbis-btn orbis-btn--orange"
            icon="pi pi-plus"
            label="Save & Add Transport Order"
            :disabled="disabled"
          />
          <Button class="orbis-btn" icon="pi pi-print" label="Print All" :disabled="disabled" />
          <Button
            class="orbis-btn"
            icon="pi pi-envelope"
            label="Email to Carrier"
            :disabled="disabled"
          />
        </div>

        <div class="existing">
          <div class="existing-title">
            Existing Transport Orders ({{ existingTransportOrders.length }})
          </div>

          <div v-if="!existingTransportOrders.length" class="empty-state">
            No transport orders yet.
          </div>

          <div v-for="o in existingTransportOrders" :key="o.id" class="order-line">
            <div class="order-main">
              <div class="order-id">{{ o.id }}</div>
              <div class="order-meta">
                <span>Carrier: {{ o.carrier }}</span>
                <span>•</span>
                <span>Pickup: {{ o.pickup }}</span>
                <span>•</span>
                <span>Ref: {{ o.ref }}</span>
                <span>•</span>
                <span>Type: {{ o.type }}</span>
              </div>
            </div>

            <div class="order-right">
              <span :class="badgeClass(o.status)">{{ o.status }}</span>
              <div class="order-icons">
                <i class="pi pi-envelope" title="Email" />
                <i class="pi pi-print" title="Print" />
                <i class="pi pi-map-marker" title="Track" />
                <i class="pi pi-trash" title="Delete" />
              </div>
            </div>
          </div>

          <div class="bottom-actions">
            <Button
              class="orbis-btn orbis-btn--orange"
              icon="pi pi-download"
              label="Export All Orders"
              :disabled="disabled"
            />
            <Button
              class="orbis-btn"
              icon="pi pi-envelope"
              label="Send to All Carriers"
              :disabled="disabled"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import "./JobTransportTab.css";

.field-with-action {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.add-mini-btn {
  min-width: 42px;
  width: 42px;
  height: 42px;
  padding: 0 !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.address-modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 16px;
}

.field--span-2 {
  grid-column: span 2;
}

.checkbox-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.checkbox-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.charge-summary {
  display: grid;
  gap: 12px;
}

.charge-summary__title {
  font-weight: 800;
}

.charge-summary__meta {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

.charge-summary__label {
  font-weight: 700;
  margin-right: 6px;
}

.charge-lines {
  display: grid;
  gap: 8px;
}

.charge-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #ececec;
  border-radius: 10px;
  background: #fafafa;
  font-size: 13px;
}

.charge-line__left {
  display: grid;
  gap: 3px;
}

.charge-line__source {
  color: #666;
  font-size: 12px;
}

.charge-line__basis {
  color: #8a8a8a;
  font-size: 12px;
}

.empty-state {
  border: 1px dashed #d8d8d8;
  border-radius: 12px;
  padding: 14px;
  color: #666;
  background: #fafafa;
}

@media (max-width: 900px) {
  .address-modal-grid {
    grid-template-columns: 1fr;
  }

  .field--span-2 {
    grid-column: span 1;
  }

  .checkbox-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
