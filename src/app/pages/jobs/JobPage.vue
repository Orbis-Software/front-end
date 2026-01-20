<template>
  <div class="job-page">
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
      <JobTypeSelector :items="JOB_TYPES" :selected="jobType" @select="selectJobType" />
    </section>

    <!-- STEP 2 -->
    <section v-if="jobType" class="card section">
      <JobStepHeader
        :title="`Mode of Transport for ${jobTypeLabel}`"
        subtitle="Choose the transport mode"
      />
      <ModeSelector :items="MODES" :selected="mode" @select="selectMode" />
    </section>

    <!-- STEP 3 -->
    <section v-if="jobType && mode" class="card section">
        <AirJobForm
        v-if="mode === 'air'"
        :job-type="jobType"
        :job-type-label="jobTypeLabel"
        mode-label="Air"
        @cancel="resetAll"
        @create="onCreateJob"
        />

        <RailJobForm
        v-else-if="mode === 'rail'"
        :job-type="jobType"
        :job-type-label="jobTypeLabel"
        mode-label="Rail"
        @cancel="resetAll"
        @create="onCreateJob"
        />

        <RoadJobForm
        v-else-if="mode === 'road'"
        :job-type="jobType"
        :job-type-label="jobTypeLabel"
        mode-label="Road"
        @cancel="resetAll"
        @create="onCreateJob"
        />

        <SeaJobForm
        v-else-if="mode === 'sea'"
        :job-type="jobType"
        :job-type-label="jobTypeLabel"
        mode-label="Sea"
        @cancel="resetAll"
        @create="onCreateJob"
        />

        <div v-else class="mode-placeholder">
        <div class="mp-title">Form for {{ modeLabel }} not added yet.</div>
        <div class="mp-sub">Next: you’ll send the {{ modeLabel }} layout and we’ll plug it in.</div>

        <div class="mp-actions">
            <Button class="btn" outlined type="button" @click="resetMode">
            <i class="pi pi-arrow-left" style="margin-right: 8px" />
            Change Mode
            </Button>
            <Button class="btn" outlined type="button" @click="resetAll">
            <i class="pi pi-refresh" style="margin-right: 8px" />
            Change Job Type
            </Button>
        </div>
        </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import "@/app/pages/jobs/JobPage.css";

import JobStepHeader from "@/app/components/jobs/JobStepHeader.vue";
import JobTypeSelector from "@/app/components/jobs/JobTypeSelector.vue";
import ModeSelector from "@/app/components/jobs/ModeSelector.vue";
import AirJobForm from "@/app/components/jobs/AirJobForm.vue";
import RailJobForm from "@/app/components/jobs/RailJobForm.vue";
import RoadJobForm from "@/app/components/jobs/RoadJobForm.vue";
import SeaJobForm from "@/app/components/jobs/SeaJobForm.vue";
// import MultiModalJobForm from "@/app/components/jobs/MultiModalJobForm.vue";

import {
  JOB_TYPES,
  MODES,
  jobType,
  mode,
  jobTypeLabel,
  modeLabel,
  selectJobType,
  selectMode,
  resetMode,
  resetAll,
} from "@/app/pages/jobs/JobPage.logic";

function onCreateJob(payload: any) {
  // dummy handler (wire to API/store later)
  console.log("CREATE JOB", payload);
}
</script>
