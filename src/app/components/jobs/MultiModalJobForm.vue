<template>
  <div class="mm-wrap">
    <!-- Top meta card -->
    <div class="card inner">
      <div class="inner-title">New Multi-Modal Job — Multi-Modal</div>

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
          <InputText modelValue="Multi-Modal" class="control" readonly />
        </div>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="two-col">
      <!-- LEFT -->
      <div class="left-col">
        <!-- Segment Builder -->
        <div class="card inner">
          <div class="inner-head">
            <div class="inner-title">Segment Builder (Multi-Modal)</div>
            <div class="wire">Wireframe</div>
          </div>

          <div class="segments">
            <div v-for="(seg, idx) in segments" :key="seg.id" class="segment">
              <div class="segment-head">
                <div class="segment-title">Segment {{ idx + 1 }}</div>

                <button
                  v-if="segments.length > 1"
                  class="mini-link danger"
                  type="button"
                  @click="removeSegment(idx)"
                >
                  Remove
                </button>
              </div>

              <!-- Row 1 -->
              <div class="grid-3">
                <div class="field">
                  <label class="label">Segment {{ idx + 1 }} Mode</label>
                  <Dropdown
                    v-model="seg.mode"
                    :options="segmentModes"
                    optionLabel="label"
                    optionValue="value"
                    class="control"
                    placeholder="Air / Sea / Rail / Road"
                    @change="onModeChange(idx)"
                  />
                </div>

                <div class="field">
                  <label class="label">Origin</label>
                  <InputText
                    v-model="seg.origin"
                    class="control"
                    placeholder="e.g., LHR"
                    :readonly="idx > 0"
                    :class="{ locked: idx > 0 }"
                  />
                  <div v-if="idx > 0" class="hint">Auto-linked from previous destination</div>
                </div>

                <div class="field">
                  <label class="label">Destination</label>
                  <InputText
                    v-model="seg.destination"
                    class="control"
                    placeholder="e.g., IST"
                    @input="onDestinationChange(idx)"
                  />
                </div>
              </div>

              <!-- Row 2 -->
              <div class="grid-2" style="margin-top: 12px">
                <div class="field">
                  <label class="label">ETD</label>
                  <InputText v-model="seg.etd" class="control" placeholder="dd/mm/yyyy" />
                </div>

                <div class="field">
                  <label class="label">ETA</label>
                  <InputText v-model="seg.eta" class="control" placeholder="dd/mm/yyyy" />
                </div>
              </div>

              <!-- Mode-specific form (your existing ) -->
              <div class="mode-form">
                <div class="mode-form-title">
                  {{ modeLabel(seg.mode) }} Segment 
                </div>

                <div class="mode-form-body">
                  <template v-if="seg.mode">
                    <!--
                      ✅ We pass shared fields too (origin/destination/dates) in case your  want them.
                      ✅ We store mode-specific fields in seg. so it's fillable later.
                      ✅ Supports both styles:
                         - v-model="seg."
                         - OR :modelValue + @update:modelValue
                    -->
                  <component
                    :is="modeComponent(seg.mode)"
                    v-model="seg.data"
                    :segment="seg"
                    :segment-index="idx"
                  />

                  </template>

                  <template v-else>
                    <div class="muted">Select a Segment Mode to load the correct form.</div>
                  </template>
                </div>
              </div>

              <div class="divider"></div>
            </div>
          </div>

          <div class="add-row">
            <Button class="btn" outlined type="button" @click="addSegment">
              Add Segment
            </Button>

            <div class="chain-note">
              ✅ Destinations are chained: next segment origin = previous destination
            </div>
          </div>
        </div>

        <!-- Documents & Notes -->
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
                placeholder="Operational notes, special handling, etc."
              />
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="right-col">
        <div class="card inner summary">
          <div class="inner-title">Job Summary</div>

          <div class="sum-row">
            <span>Type</span>
            <strong>Multi-Modal</strong>
          </div>
          <div class="sum-row">
            <span>Mode</span>
            <strong>Multi-Modal</strong>
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

        <div class="card inner actions">
          <Button class="create-btn orbis-primary" type="button" @click="createJob">
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
import { reactive, ref } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Button from "primevue/button";

/**
 * ✅ USE YOUR EXISTING  HERE
 * Update these import paths to match your actual structure.
 */
import AirJobForm from "@/app/components/jobs/AirJobForm.vue";
import RailJobForm from "@/app/components/jobs/RailJobForm.vue";
import RoadJobForm from "@/app/components/jobs/RoadJobForm.vue";
import SeaJobForm from "@/app/components/jobs/SeaJobForm.vue";

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "create", payload: any): void;
}>();

/**
 * Dummy fillable state
 */
const form = reactive({
  customerName: "",
  accountNumber: "ACC000000001",
  customerQuoteRef: "",
  jobNumber: "JOB000000001",
  jobDate: "",
  internalNotes: "",
});

type SegmentMode = "air" | "sea" | "rail" | "road" | "";

type Segment = {
  id: string;
  mode: SegmentMode;
  origin: string;
  destination: string;
  etd: string;
  eta: string;

  // ✅ mode-specific fields live here
  data: Record<string, any>;
};


const segmentModes = ref([
  { label: "Air", value: "air" },
  { label: "Sea", value: "sea" },
  { label: "Rail", value: "rail" },
  { label: "Road", value: "road" },
]);

const segments = ref<Segment[]>([
  {
    id: crypto.randomUUID(),
    mode: "",
    origin: "",
    destination: "",
    etd: "",
    eta: "",
    data: {},
  },
]);

/**
 * Resolve component per mode
 */
const MODE_COMPONENTS: Record<Exclude<SegmentMode, "">, any> = {
  air: AirJobForm,
  sea: SeaJobForm,
  rail: RailJobForm,
  road: RoadJobForm,
};

function modeComponent(mode: SegmentMode) {
  if (!mode) return null;
  return MODE_COMPONENTS[mode];
}

function modeLabel(mode: SegmentMode) {
  if (mode === "air") return "Air";
  if (mode === "sea") return "Sea";
  if (mode === "rail") return "Rail";
  if (mode === "road") return "Road";
  return "—";
}

/**
 * CHAINING LOGIC:
 * - segment[0].origin is free
 * - segment[n].origin is locked to segment[n-1].destination
 * - destination change cascades forward
 */
function cascadeOriginsFrom(index: number) {
  const list = segments.value;

  for (let i = index + 1; i < list.length; i++) {
    const prev = list[i - 1];
    const cur = list[i];

    if (!prev || !cur) continue;

    cur.origin = prev.destination || "";
  }
}


function onDestinationChange(index: number) {
  cascadeOriginsFrom(index);
}

function addSegment() {
  const list = segments.value;
  const last = list.length > 0 ? list[list.length - 1] : undefined;


  list.push({
    id: crypto.randomUUID(),
    mode: "",
    origin: last?.destination || "",
    destination: "",
    etd: "",
    eta: "",
    data: {},
  });
}




function removeSegment(index: number) {
  segments.value.splice(index, 1);

  // re-enforce chaining after removal
  if (segments.value.length > 0) {
    cascadeOriginsFrom(0);
  }
}

/**
 * If mode changes, optionally reset  so you don't keep wrong-mode fields.
 */
function onModeChange(index: number) {
  const seg = segments.value[index];
  if (!seg) return;
  seg.data = {};
}


/**
 * Create payload (dummy for now)
 */
function createJob() {
  emit("create", {
    jobType: "multi_modal",
    mode: "multi_modal",
    header: JSON.parse(JSON.stringify(form)),
    segments: JSON.parse(JSON.stringify(segments.value)),
  });
}
</script>

<style scoped>
.mm-wrap {
  margin-top: 10px;
}

.card.inner {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

.two-col {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 14px;
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

.locked {
  background: #fafafa;
}

.hint {
  font-size: 11px;
  color: #777;
  margin-top: 2px;
}

.segments {
  display: grid;
  gap: 10px;
}

.segment {
  padding-top: 6px;
}

.segment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.segment-title {
  font-weight: 800;
}

.mini-link {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
  color: #333;
}

.mini-link.danger {
  color: #b42318;
}

.mode-form {
  margin-top: 12px;
  border: 1px solid #ededed;
  border-radius: 12px;
  background: #fafafa;
  padding: 12px;
}

.mode-form-title {
  font-weight: 800;
  margin-bottom: 10px;
}

.mode-form-body {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 12px;
}

.divider {
  margin-top: 14px;
  border-top: 1px solid #ededed;
}

.add-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chain-note {
  font-size: 12px;
  color: #666;
}

.docs-grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.summary .sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.sum-spacer {
  height: 10px;
}

.actions {
  display: grid;
  gap: 10px;
  justify-items: stretch;
  padding: 14px;
}

.create-btn {
  width: 100%;
  justify-content: center;
  border-radius: 10px;
}

.cancel-link {
  width: 100%;
  border: none;
  background: transparent;
  color: #b42318;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 10px;
}

.cancel-link:hover {
  background: #fdecec;
}

.muted {
  color: #777;
}
</style>
