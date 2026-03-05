<script setup lang="ts">
import { computed, ref } from "vue"
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputText from "primevue/inputtext"
import Calendar from "primevue/calendar"
import InputSwitch from "primevue/inputswitch"
import Textarea from "primevue/textarea"
import InputNumber from "primevue/inputnumber"

type Option = { label: string; value: string }

type DimensionRow = {
  packaging: string | null
  qty: number
  length_cm: number
  width_cm: number
  height_cm: number
  gross_kg: number
  ldm: number
}

type ExistingOrder = {
  id: string
  carrier: string
  pickup: string
  ref: string
  type: string
  customer: string
  status: "Confirmed" | "Draft" | "Sent"
}

defineProps<{ form: any; disabled?: boolean }>() // keep consistent with your JobDetails usage

const orderTypeOptions: Option[] = [
  { label: "Domestic", value: "DOMESTIC" },
  { label: "Export", value: "EXPORT" },
  { label: "Import", value: "IMPORT" },
]

const packagingOptions: Option[] = [
  { label: "Pallet", value: "PALLET" },
  { label: "Carton", value: "CARTON" },
  { label: "Crate", value: "CRATE" },
  { label: "Bag", value: "BAG" },
]

const carrierOptions: Option[] = [
  { label: "Select carrier", value: "" },
  { label: "ABC Logistics", value: "ABC Logistics" },
  { label: "XYZ Transport", value: "XYZ Transport" },
  { label: "Global Freight", value: "Global Freight" },
]

/** Panels (simple accordion) */
const open = ref<{ collection: boolean; transport: boolean }>({
  collection: true,
  transport: true,
})

/** Collection Orders form */
const collection = ref({
  type: "DOMESTIC",
  collection_address: null as string | null,
  delivery_address: null as string | null,
  order_reference: "CO-2026-000003",
  customer_ref: "",
  collection_ref: "",
  carrier: "",
  pickup_date: null as Date | null,
  pickup_time: "",
  delivery_date: null as Date | null,
  delivery_time: "",
  hazardous: false,
  goods_description: "",
  dimensions: [
    {
      packaging: null,
      qty: 1,
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      gross_kg: 0,
      ldm: 0,
    },
  ] as DimensionRow[],
  collection_cost: 0,
  additional_costs: 0,
  fsc_percent: 0,
})

/** Transport Orders form (same layout, different reference prefix) */
const transport = ref({
  type: "DOMESTIC",
  collection_address: null as string | null,
  delivery_address: null as string | null,
  order_reference: "TO-2026-000003",
  customer_ref: "",
  collection_ref: "",
  carrier: "",
  pickup_date: null as Date | null,
  pickup_time: "",
  delivery_date: null as Date | null,
  delivery_time: "",
  hazardous: false,
  goods_description: "",
  dimensions: [
    {
      packaging: null,
      qty: 1,
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      gross_kg: 0,
      ldm: 0,
    },
  ] as DimensionRow[],
  collection_cost: 0,
  additional_costs: 0,
  fsc_percent: 0,
})

function cubeM3(r: DimensionRow) {
  const m3 = (r.length_cm / 100) * (r.width_cm / 100) * (r.height_cm / 100)
  return Number.isFinite(m3) ? m3 : 0
}

function volumeM3(r: DimensionRow) {
  return cubeM3(r) * (r.qty || 0)
}

function totals(rows: DimensionRow[]) {
  const qty = rows.reduce((a, r) => a + (r.qty || 0), 0)
  const gross = rows.reduce((a, r) => a + (r.gross_kg || 0), 0)
  const cube = rows.reduce((a, r) => a + cubeM3(r), 0)
  const vol = rows.reduce((a, r) => a + volumeM3(r), 0)
  const ldm = rows.reduce((a, r) => a + (r.ldm || 0), 0)
  return { qty, gross, cube, vol, ldm }
}

const collectionTotals = computed(() => totals(collection.value.dimensions))
const transportTotals = computed(() => totals(transport.value.dimensions))

function addDimRow(target: "collection" | "transport") {
  const t = target === "collection" ? collection.value : transport.value
  t.dimensions.push({
    packaging: null,
    qty: 1,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    gross_kg: 0,
    ldm: 0,
  })
}

function calcTotalCost(t: {
  collection_cost: number
  additional_costs: number
  fsc_percent: number
}) {
  const base = (t.collection_cost || 0) + (t.additional_costs || 0)
  const fsc = base * ((t.fsc_percent || 0) / 100)
  return base + fsc
}

const collectionCostTotal = computed(() => calcTotalCost(collection.value))
const transportCostTotal = computed(() => calcTotalCost(transport.value))

/** Existing list (placeholder) */
const existingCollectionOrders = ref<ExistingOrder[]>([
  {
    id: "COL-2026-0001",
    carrier: "ABC Logistics",
    pickup: "04/02/2026",
    ref: "CO-000001",
    type: "DOMESTIC",
    customer: "CUST-001",
    status: "Confirmed",
  },
  {
    id: "COL-2026-0002",
    carrier: "XYZ Transport",
    pickup: "05/02/2026",
    ref: "CO-000002",
    type: "EXPORT",
    customer: "CUST-002",
    status: "Draft",
  },
])

const existingTransportOrders = ref<ExistingOrder[]>([
  {
    id: "TR-2026-0001",
    carrier: "Global Freight",
    pickup: "—",
    ref: "TO-000001",
    type: "IMPORT",
    customer: "—",
    status: "Sent",
  },
  {
    id: "TR-2026-0002",
    carrier: "Continental Shipping",
    pickup: "—",
    ref: "TO-000002",
    type: "DOMESTIC",
    customer: "—",
    status: "Draft",
  },
])

function badgeClass(s: ExistingOrder["status"]) {
  if (s === "Confirmed") return "badge badge--confirmed"
  if (s === "Sent") return "badge badge--sent"
  return "badge badge--draft"
}

function togglePanel(key: "collection" | "transport") {
  open.value[key] = !open.value[key]
}
</script>

<template>
  <div class="job-transport">
    <!-- COLLECTION ORDERS -->
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
            <Dropdown
              :options="[{ label: 'Select from contacts', value: null }]"
              v-model="collection.collection_address"
              optionLabel="label"
              optionValue="value"
              placeholder="Select from contacts"
              class="field-fluid"
              :disabled="disabled"
            />
          </div>

          <div class="field">
            <label class="label">Delivery Address</label>
            <Dropdown
              :options="[{ label: 'Select from contacts', value: null }]"
              v-model="collection.delivery_address"
              optionLabel="label"
              optionValue="value"
              placeholder="Select from contacts"
              class="field-fluid"
              :disabled="disabled"
            />
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

        <div class="haz-row">
          <div class="haz-left">
            <div class="label">Hazardous</div>
            <InputSwitch v-model="collection.hazardous" :disabled="disabled" />
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

        <!-- DIMENSIONS TABLE -->
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

        <!-- COSTS BOX -->
        <div class="cost-box">
          <div class="cost-row">
            <div>Collection Cost:</div>
            <InputNumber
              v-model="collection.collection_cost"
              class="cost-in"
              :min="0"
              :disabled="disabled"
            />
          </div>
          <div class="cost-row">
            <div>Additional Costs:</div>
            <InputNumber
              v-model="collection.additional_costs"
              class="cost-in"
              :min="0"
              :disabled="disabled"
            />
          </div>
          <div class="cost-row">
            <div>FSC %:</div>
            <InputNumber
              v-model="collection.fsc_percent"
              class="cost-in"
              :min="0"
              :max="100"
              :disabled="disabled"
            />
          </div>
          <div class="cost-row cost-row--total">
            <div><b>Total:</b></div>
            <div class="cost-total">£{{ collectionCostTotal.toFixed(2) }}</div>
          </div>
        </div>

        <!-- ACTIONS -->
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

        <!-- EXISTING -->
        <div class="existing">
          <div class="existing-title">
            Existing Collection Orders ({{ existingCollectionOrders.length }})
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

    <!-- TRANSPORT ORDERS -->
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
        <!-- same fields as collection (kept identical for design consistency) -->
        <div class="grid-3">
          <div class="field">
            <label class="label">Collection Address</label>
            <Dropdown
              :options="[{ label: 'Select from contacts', value: null }]"
              v-model="transport.collection_address"
              optionLabel="label"
              optionValue="value"
              placeholder="Select from contacts"
              class="field-fluid"
              :disabled="disabled"
            />
          </div>

          <div class="field">
            <label class="label">Delivery Address</label>
            <Dropdown
              :options="[{ label: 'Select from contacts', value: null }]"
              v-model="transport.delivery_address"
              optionLabel="label"
              optionValue="value"
              placeholder="Select from contacts"
              class="field-fluid"
              :disabled="disabled"
            />
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

        <div class="haz-row">
          <div class="haz-left">
            <div class="label">Hazardous</div>
            <InputSwitch v-model="transport.hazardous" :disabled="disabled" />
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
          <div class="cost-row">
            <div>Collection Cost:</div>
            <InputNumber
              v-model="transport.collection_cost"
              class="cost-in"
              :min="0"
              :disabled="disabled"
            />
          </div>
          <div class="cost-row">
            <div>Additional Costs:</div>
            <InputNumber
              v-model="transport.additional_costs"
              class="cost-in"
              :min="0"
              :disabled="disabled"
            />
          </div>
          <div class="cost-row">
            <div>FSC %:</div>
            <InputNumber
              v-model="transport.fsc_percent"
              class="cost-in"
              :min="0"
              :max="100"
              :disabled="disabled"
            />
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
</style>
