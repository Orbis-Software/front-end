<template>
  <div class="rail-wrap">
    <!-- Top meta card -->
    <div class="card inner">
      <div class="inner-title">{{ `New ${jobTypeLabel} Job — Rail` }}</div>

      <div class="grid-3">
        <div class="field">
          <label class="label">Customer Name</label>
          <InputText
            v-model="form.customerName"
            class="control"
            placeholder="Start typing... (select from CRM)"
          />
        </div>

        <div class="field">
          <label class="label">Account Number</label>
          <InputText v-model="form.accountNumber" class="control" />
        </div>

        <div class="field">
          <label class="label">Customer Quote Ref</label>
          <InputText v-model="form.customerQuoteRef" class="control" placeholder="Optional" />
        </div>
      </div>

      <div class="grid-3" style="margin-top: 12px">
        <div class="field">
          <label class="label">Job Number</label>
          <InputText v-model="form.jobNumber" class="control" />
        </div>

        <div class="field">
          <label class="label">Job Date</label>
          <InputText v-model="form.jobDate" class="control" placeholder="dd/mm/yyyy" />
        </div>

        <div class="field">
          <label class="label">Mode of Transport</label>
          <InputText :modelValue="modeLabel" class="control" readonly />
        </div>
      </div>
    </div>

    <!-- Two-column area: details + summary/actions -->
    <div class="two-col">
      <!-- LEFT -->
      <div class="left-col">
        <!-- Rail Details -->
        <div class="card inner">
          <div class="inner-head">
            <div class="inner-title">{{ `${jobTypeLabel} — Rail Details` }}</div>
            <div class="wire">Wireframe</div>
          </div>

          <div class="grid-3">
            <div class="field">
              <label class="label">Origin Terminal</label>
              <InputText v-model="form.originTerminal" class="control" placeholder="Origin Terminal" />
            </div>

            <div class="field">
              <label class="label">Destination Terminal</label>
              <InputText
                v-model="form.destinationTerminal"
                class="control"
                placeholder="Destination Terminal"
              />
            </div>

            <div class="field">
              <label class="label">Rail Operator</label>
              <InputText v-model="form.railOperator" class="control" placeholder="Rail Operator" />
            </div>
          </div>

          <div class="grid-2" style="margin-top: 12px">
            <div class="field">
              <label class="label">Departure</label>
              <InputText v-model="form.departureDate" class="control" placeholder="dd/mm/yyyy" />
            </div>

            <div class="field">
              <label class="label">Arrival</label>
              <InputText v-model="form.arrivalDate" class="control" placeholder="dd/mm/yyyy" />
            </div>
          </div>
        </div>

        <!-- Routing / Customs -->
        <div class="card inner">
          <div class="inner-head">
            <div class="inner-title">Routing / Customs</div>
            <div class="wire">Wireframe</div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="label">Transit Route</label>
              <InputText v-model="form.transitRoute" class="control" placeholder="e.g., DE → PL → BY → TM" />
            </div>

            <div class="field">
              <label class="label">Customs Regime</label>
              <InputText v-model="form.customsRegime" class="control" placeholder="T1 / T2 / Export" />
            </div>
          </div>
        </div>

        <!-- Documents & Notes (same block style we used in Air) -->
        <div class="card inner">
          <div class="inner-title">Documents &amp; Notes</div>

          <div class="docs-grid">
            <div class="drop">
              <div class="drop-box">Drag &amp; drop documents</div>
            </div>

            <div class="field">
              <label class="label">Internal Notes</label>
              <Textarea
                v-model="form.internalNotes"
                class="control textarea"
                placeholder="Operational notes, routing, customs, etc."
              />
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="right-col">
        <!-- Job Summary -->
        <div class="card inner summary">
          <div class="inner-title">Job Summary</div>

          <div class="sum-row">
            <span>Type</span>
            <strong>{{ jobTypeLabel }}</strong>
          </div>
          <div class="sum-row">
            <span>Mode</span>
            <strong>{{ modeLabel }}</strong>
          </div>

          <div class="sum-spacer"></div>

          <div class="sum-row muted">
            <span>Charges</span>
            <span>—</span>
          </div>
          <div class="sum-row muted">
            <span>Costs</span>
            <span>—</span>
          </div>
          <div class="sum-row muted">
            <span>Margin</span>
            <span>—</span>
          </div>
        </div>

        <!-- Create/Cancel -->
        <div class="card inner actions">
          <Button class="create-btn orbis-primary" type="button" @click="create">
            <i class="pi pi-file" style="margin-right: 8px" />
            Create Job
          </Button>

          <button class="cancel-link" type="button" @click="$emit('cancel')">
            <i class="pi pi-times" style="margin-right: 6px" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";

const props = defineProps<{
  jobType: string;          // "import" | ...
  jobTypeLabel: string;     // "Import"
  modeLabel: string;        // "Rail"
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "create", payload: any): void;
}>();

/**
 * ✅ Dummy + fillable later
 */
const form = reactive({
  customerName: "",
  accountNumber: "ACC000000001",
  customerQuoteRef: "",

  jobNumber: "JOB000000001",
  jobDate: "",

  originTerminal: "",
  destinationTerminal: "",
  railOperator: "",

  departureDate: "",
  arrivalDate: "",

  transitRoute: "",
  customsRegime: "",

  internalNotes: "",
});

function create() {
  emit("create", {
    jobType: props.jobType,
    mode: "rail",
    ...JSON.parse(JSON.stringify(form)),
  });
}
</script>

<style scoped>
.rail-wrap {
  margin-top: 10px;
}

.card.inner {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  padding: 16px;
  margin-bottom: 14px;
}

.inner-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.inner-title {
  font-weight: 800;
}

.wire {
  font-size: 12px;
  color: #666;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 700;
}

.control {
  width: 100%;
}

.textarea {
  min-height: 92px;
}

.two-col {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 14px;
}

.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.drop-box {
  height: 110px;
  border: 1px dashed #d8d8d8;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #777;
  background: #fafafa;
}

/* summary */
.summary .sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.sum-spacer {
  height: 8px;
}

.muted {
  color: #666;
}

/* actions */
.actions {
  display: grid;
  gap: 10px;
  align-content: start;
}

.create-btn {
  width: 100%;
  justify-content: center;
  border-radius: 10px;
}

.cancel-link {
  border: none;
  background: transparent;
  color: #b42318;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 10px;
}

.cancel-link:hover {
  background: #fdecec;
}
</style>
