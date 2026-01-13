<template>
  <div class="quote-page">
    <!-- Page header -->
    <header class="quote-header">
      <div class="qh-left">
        <div class="qh-title">
          <i class="pi pi-file"></i>
          <span class="title-text">New Quotation</span>
          <span class="draft-pill">Draft</span>
        </div>
      </div>

      <div class="qh-right">
        <Button class="btn" outlined type="button" @click="onCancel">
          <i class="pi pi-times" style="margin-right: 8px"></i>
          Cancel
        </Button>

        <Button class="btn" outlined type="button" :loading="saving" @click="onSave">
          <i class="pi pi-save" style="margin-right: 8px"></i>
          Save Quote
        </Button>

        <Button class="btn btn-primary" type="button" :loading="sending" @click="onSend">
          <i class="pi pi-send" style="margin-right: 8px"></i>
          Send to Customer
        </Button>
      </div>
    </header>

    <!-- Top meta row -->
    <section class="card section">
      <div class="grid-4">
        <div class="field">
          <label class="label">Ref</label>
          <InputText v-model="form.ref" class="control" />
        </div>

        <div class="field">
          <label class="label">Quote Ref</label>
          <InputText v-model="form.quoteRef" class="control" />
        </div>

        <div class="field">
          <label class="label">Quote Date</label>
          <InputText v-model="form.quoteDate" class="control" />
        </div>

        <div class="field">
          <label class="label">Follow Up</label>
          <InputText v-model="form.followUp" class="control" placeholder="dd/mm/yyyy" />
        </div>
      </div>
    </section>

    <!-- Quote type / mode / incoterms -->
    <section class="card section">
      <div class="grid-3">
        <div class="field">
          <label class="label">Quote Type</label>
          <Dropdown
            v-model="form.quoteType"
            :options="quoteTypes"
            optionLabel="label"
            optionValue="value"
            class="control"
          />
        </div>

        <div class="field">
          <label class="label">Mode</label>
          <Dropdown
            v-model="form.mode"
            :options="modes"
            optionLabel="label"
            optionValue="value"
            class="control"
          />
        </div>

        <div class="field">
          <label class="label">Incoterms</label>
          <Dropdown
            v-model="form.incoterms"
            :options="incoterms"
            optionLabel="label"
            optionValue="value"
            class="control"
          />
        </div>
      </div>

      <div class="grid-3" style="margin-top: 14px">
        <div class="field">
          <label class="label">Equipment</label>
          <InputText v-model="form.equipment" class="control" />
        </div>

        <div class="field">
          <label class="label">Quoted By</label>
          <InputText v-model="form.quotedBy" class="control" />
        </div>

        <div class="field hazard">
          <label class="label">Hazardous</label>
          <div class="hazard-row">
            <InputSwitch v-model="form.hazardous" />
            <span class="hazard-text">Yes</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Customer -->
    <section class="card section">
      <div class="section-title">Customer</div>

      <div class="grid-2">
        <div class="field">
          <label class="label">Company</label>
          <InputText v-model="form.customer.company" class="control" />
        </div>

        <div class="field">
          <label class="label">Contact</label>
          <Dropdown
            v-model="form.customer.contact"
            :options="contacts"
            optionLabel="label"
            optionValue="value"
            class="control"
          />
        </div>
      </div>

      <div class="grid-2" style="margin-top: 14px">
        <div class="field">
          <label class="label">Email</label>
          <InputText v-model="form.customer.email" class="control" />
        </div>

        <div class="field">
          <label class="label">Phone</label>
          <InputText v-model="form.customer.phone" class="control" />
        </div>
      </div>
    </section>

    <!-- Route & Schedule -->
    <section class="card section">
      <div class="section-title">Route &amp; Schedule</div>

      <div class="grid-2">
        <div class="field">
          <label class="label">Origin</label>
          <InputText
            v-model="form.route.origin"
            class="control"
            placeholder="Pickup location / Port / Airport"
          />
        </div>

        <div class="field">
          <label class="label">Destination</label>
          <InputText
            v-model="form.route.destination"
            class="control"
            placeholder="Delivery location / Port / Airport"
          />
        </div>
      </div>

      <div class="grid-2" style="margin-top: 14px">
        <div class="field">
          <label class="label">Pickup Date</label>
          <InputText v-model="form.route.pickupDate" class="control" placeholder="dd/mm/yyyy" />
        </div>

        <div class="field">
          <label class="label">ETA</label>
          <InputText v-model="form.route.eta" class="control" placeholder="dd/mm/yyyy" />
        </div>
      </div>
    </section>

    <!-- Attachments -->
    <section class="card section">
      <div class="section-title">Attachments</div>
      <div class="attach-row">
        <div class="attach-box">
          <i class="pi pi-upload"></i>
          <span>Attach service tariffs, terms, or rate sheets</span>
        </div>

        <Button class="btn" outlined type="button" @click="onUpload">
          Upload File
        </Button>
      </div>
    </section>

    <!-- Notes -->
    <section class="card section">
      <div class="section-title">Notes</div>
      <Textarea
        v-model="form.notes"
        class="control textarea"
        placeholder="Special conditions or internal comments"
      />
    </section>

    <!-- ✅ NEW: Shipment Summary -->
    <ShipmentSummaryCard :data="shipmentSummary" @edit-dimensions="onEditDimensions" />

    <!-- ✅ NEW: Charges -->
    <ChargesCard
      :lines="chargeLines"
      :initial="chargesInitial"
      @clear="onClearCharges"
      @add-line="onAddChargeLine"
    />

    <!-- ✅ Bottom action bar -->
    <FormActionBar
      cancel-label="Cancel"
      save-label="Save Quote"
      send-label="Send to Customer"
      :loading="saving"
      :loading-primary="sending"
      :save-disabled="!canSave"
      :send-disabled="!canSend"
      @cancel="onCancel"
      @save="onSave"
      @send="onSend"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import InputSwitch from "primevue/inputswitch";

import FormActionBar from "@/app/components/common/FormActionBar.vue";
import ShipmentSummaryCard, {
  type ShipmentSummary,
} from "@/app/components/quotes/ShipmentSummaryCard.vue";
import ChargesCard, { type ChargeLine } from "@/app/components/quotes/ChargesCard.vue";

import "@/app/pages/quotes/QuoteCreatePage.css";

/**
 * ✅ ALL dummy & fillable later.
 * Replace with API + store when ready.
 */

type Option = { label: string; value: string };

const quoteTypes = ref<Option[]>([
  { label: "Import", value: "import" },
  { label: "Export", value: "export" },
  { label: "Domestic", value: "domestic" },
  { label: "Cross-trade", value: "cross" },
]);

const modes = ref<Option[]>([
  { label: "Road", value: "road" },
  { label: "Sea", value: "sea" },
  { label: "Air", value: "air" },
  { label: "Rail", value: "rail" },
]);

const incoterms = ref<Option[]>([
  { label: "EXW", value: "EXW" },
  { label: "FOB", value: "FOB" },
  { label: "CFR", value: "CFR" },
  { label: "CIF", value: "CIF" },
  { label: "DAP", value: "DAP" },
]);

const contacts = ref<Option[]>([
  { label: "Raj Chohan", value: "raj" },
  { label: "Ian Harper", value: "ian" },
  { label: "Maral", value: "maral" },
]);

const form = reactive({
  ref: "Mini Spares UK Order",
  quoteRef: "PQ2081",
  quoteDate: "12/01/2026",
  followUp: "",

  quoteType: "import",
  mode: "road",
  incoterms: "CFR",

  equipment: "LTL Service",
  quotedBy: "Ian Michael Harper",
  hazardous: false,

  customer: {
    company: "MapCargo International Ltd",
    contact: "raj",
    email: "raj@example.com",
    phone: "+44 20 0000 0000",
  },

  route: {
    origin: "",
    destination: "",
    pickupDate: "",
    eta: "",
  },

  notes: "",
});

/** ✅ Shipment Summary (dummy) */
const shipmentSummary = reactive<ShipmentSummary>({
  nop: 4,
  actualWeight: "1,728",
  chargeableWeight: "2,933",
  cube: "11.732",
  weightUnit: "kg",
  cubeUnit: "m³",
});

/** ✅ Charges (dummy + fillable) */
const chargeLines = ref<ChargeLine[]>([]);

const chargesInitial = reactive({
  currency: "GBP",
  defaultTax: "0",
  discount: "0",
  addCharge: "freight",
  conditions: "Payment terms, validity, fuel clauses, etc.",
});

const saving = ref(false);
const sending = ref(false);

const canSave = computed(() => {
  // dummy validation; replace later
  return !!form.customer.company && !!form.quoteRef;
});

const canSend = computed(() => canSave.value);

/** Actions */
async function onCancel() {
  console.log("cancel");
}

async function onSave() {
  saving.value = true;
  try {
    console.log("save quote", JSON.parse(JSON.stringify(form)));
    console.log("shipmentSummary", JSON.parse(JSON.stringify(shipmentSummary)));
    console.log("chargeLines", JSON.parse(JSON.stringify(chargeLines.value)));
    console.log("chargesInitial", JSON.parse(JSON.stringify(chargesInitial)));
    // await api...
  } finally {
    saving.value = false;
  }
}

async function onSend() {
  sending.value = true;
  try {
    console.log("send to customer", JSON.parse(JSON.stringify(form)));
    // await api...
  } finally {
    sending.value = false;
  }
}

function onUpload() {
  console.log("upload file");
}

function onEditDimensions() {
  console.log("edit dimensions");
}

function onClearCharges() {
  console.log("clear charges");
  chargeLines.value = [];
}

function onAddChargeLine(chargeKey: string) {
  console.log("add charge line:", chargeKey);

  // dummy behavior: add one line (you'll replace with real form later)
  chargeLines.value.push({
    description:
      chargeKey === "freight"
        ? "Freight"
        : chargeKey === "handling"
          ? "Handling"
          : chargeKey === "customs"
            ? "Customs"
            : chargeKey === "insurance"
              ? "Insurance"
              : chargeKey,
    qty: 1,
    unit: "Each",
    cost: 0,
    markup: 0,
    sell: 0,
    total: 0,
  });
}
</script>
