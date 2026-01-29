<template>
  <div class="job-page">
    <!-- HEADER -->
    <div class="job-top">
      <div class="job-title">
        <i class="pi pi-briefcase" />
        <span>Job Page</span>
      </div>

      <div class="job-actions">
        <Button class="btn orbis-primary" outlined type="button">
          <i class="pi pi-folder-open" style="margin-right: 8px" />
          Browse Jobs
        </Button>
        <Button class="btn orbis-primary" type="button">
          <i class="pi pi-search" style="margin-right: 8px" />
          Find Job
        </Button>
      </div>
    </div>

    <!-- STEP 1 -->
    <section class="card section">
      <JobStepHeader
        title="Select a Job Type"
        badge="NEW JOBS"
        subtitle="Choose what you want to create"
      />
      <JobTypeSelector
        :items="JOB_TYPES"
        :selected="jobType"
        @select="selectJobType"
      />
    </section>

    <!-- STEP 2 -->
    <section v-if="jobType" class="card section">
      <JobStepHeader
        :title="`Mode of Transport for ${jobTypeLabel}`"
        subtitle="Choose the transport mode"
      />
      <ModeSelector
        :items="MODES"
        :selected="mode"
        @select="selectMode"
      />
    </section>

    <!-- META SECTION -->
    <section v-if="jobType && mode" class="card section">
      <div class="meta-title">{{ `New ${jobTypeLabel} Job — ${modeLabel}` }}</div>

      <div class="grid-3">
        <div class="field">
          <label class="label">Customer Name</label>
          <InputText
            v-model="meta.customerName"
            class="control"
            placeholder="Start typing... (select from CRM)"
          />
        </div>

        <div class="field">
          <label class="label">Account Number</label>
          <InputText v-model="meta.accountNumber" class="control" />
        </div>

        <div class="field">
          <label class="label">Customer Quote Ref</label>
          <InputText
            v-model="meta.customerQuoteRef"
            class="control"
            placeholder="Optional"
          />
        </div>
      </div>

      <div class="grid-3" style="margin-top: 12px">
        <div class="field">
          <label class="label">Job Number</label>
          <InputText v-model="meta.jobNumber" class="control" />
        </div>

        <div class="field">
          <label class="label">Job Date</label>
          <InputText
            v-model="meta.jobDate"
            class="control"
            placeholder="dd/mm/yyyy"
          />
        </div>

        <div class="field">
          <label class="label">Mode of Transport</label>
          <InputText :modelValue="modeLabel" class="control" readonly />
        </div>
      </div>
    </section>

    <!-- ✅ FINAL ROW (same as 2nd image): Docs/Notes LEFT, Actions RIGHT -->
    <div v-if="jobType && mode" class="two-col">
      <!-- LEFT: Documents & Notes -->
      <section class="card section">
        <JobStepHeader
          title="Documents & Notes"
          subtitle="Optional attachments and internal notes"
        />

        <div class="docs-grid">
          <!-- Documents -->
          <div class="drop-box">
            Drag &amp; drop documents
          </div>

          <!-- Notes -->
          <div class="field">
            <label class="label">Internal Notes</label>
            <Textarea
              v-model="internalNotes"
              class="control textarea"
              placeholder="Operational notes, special handling, etc."
              autoResize
            />
          </div>
        </div>
      </section>

      <!-- RIGHT: Create/Cancel actions card -->
      <section class="card section actions">
        <Button
          class="create-btn orbis-primary"
          type="button"
          @click="createJob"
        >
          <i class="pi pi-file" style="margin-right: 8px" />
          Create Job
        </Button>

        <button class="cancel-link" type="button" @click="onCancel">
          <i class="pi pi-times" style="margin-right: 6px" />
          Cancel
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";

import "@/app/pages/jobs/JobPage.css";

import JobStepHeader from "@/app/components/jobs/JobStepHeader.vue";
import JobTypeSelector from "@/app/components/jobs/JobTypeSelector.vue";
import ModeSelector from "@/app/components/jobs/ModeSelector.vue";

import {
  JOB_TYPES,
  MODES,
  jobType,
  mode,
  jobTypeLabel,
  modeLabel,
  selectJobType,
  selectMode,
  resetAll,
} from "@/app/pages/jobs/JobPage.logic";

const internalNotes = ref("");

const meta = reactive({
  customerName: "",
  accountNumber: "ACC000000001",
  customerQuoteRef: "",
  jobNumber: "JOB000000001",
  jobDate: "",
});

function createJob() {
  const payload = {
    jobType: jobType.value,
    mode: mode.value,
    meta: { ...meta },
    internalNotes: internalNotes.value,
  };

  console.log("CREATE JOB", payload);
}

function onCancel() {
  // reset local fields
  internalNotes.value = "";
  meta.customerName = "";
  meta.accountNumber = "ACC000000001";
  meta.customerQuoteRef = "";
  meta.jobNumber = "JOB000000001";
  meta.jobDate = "";

  // reset selections
  resetAll();
}
</script>
