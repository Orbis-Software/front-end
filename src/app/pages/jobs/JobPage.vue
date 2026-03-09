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

    <section class="card section">
      <JobStepHeader
        title="Select a Job Type"
        badge="NEW JOBS"
        subtitle="Choose what you want to create"
      />
      <JobTypeSelector :items="JOB_TYPES" :selected="jobType" @select="selectJobType" />
    </section>

    <!-- ✅ MODE: Only show when NOT Multi Modal -->
    <section v-if="jobType && jobType !== 'multi_modal'" class="card section">
      <JobStepHeader
        :title="`Mode of Transport for ${jobTypeLabel}`"
        subtitle="Choose the transport mode"
      />
      <ModeSelector :items="availableModes" :selected="mode" @select="selectMode" />
    </section>

    <!-- ✅ MULTI MODAL: different display (empty placeholder for now) -->
    <section v-else-if="jobType === 'multi_modal'" class="card section">
      <JobStepHeader title="Multi Modal" subtitle="Multi-modal setup (coming soon)" />
      <div style="height: 80px"></div>
    </section>

    <!-- ✅ META: show when jobType AND (mode OR multi_modal) -->
    <section v-if="jobType && (jobType === 'multi_modal' || mode)" class="card section">
      <div class="meta-title">
        {{
          jobType === "multi_modal"
            ? `New ${jobTypeLabel} Job`
            : `New ${jobTypeLabel} Job — ${modeLabel}`
        }}
      </div>

      <div class="grid-3">
        <div class="field">
          <label class="label">Customer Name</label>

          <AutoComplete
            v-model="selectedCustomer"
            :suggestions="customerSuggestions"
            :optionLabel="customerOptionLabel"
            placeholder="Start typing... (select from CRM)"
            class="control"
            inputClass="control"
            dropdown
            forceSelection
            :completeOnFocus="true"
            @complete="onCustomerComplete"
            @item-select="onCustomerSelect"
            @clear="onCustomerClear"
          />
        </div>

        <div class="field">
          <label class="label">Account Number</label>
          <InputText :modelValue="accountNumberPreview" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Customer Quote Ref</label>
          <InputText v-model="form.customer_quote_ref" class="control" placeholder="Optional" />
        </div>
      </div>

      <div class="grid-3" style="margin-top: 12px">
        <div class="field">
          <label class="label">Job Number</label>
          <InputText :modelValue="form.job_number" class="control" readonly />
        </div>

        <div class="field">
          <label class="label">Job Date</label>
          <Calendar
            v-model="form.job_date"
            class="control"
            inputClass="control"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/mm/yy"
            showIcon
            showButtonBar
            :manualInput="false"
          />
        </div>

        <div class="field">
          <label class="label">Mode of Transport</label>
          <InputText
            :modelValue="jobType === 'multi_modal' ? '' : modeLabel"
            class="control"
            readonly
          />
        </div>
      </div>

      <div v-if="createError" style="margin-top: 10px" class="error-text">
        {{ createError }}
      </div>
    </section>

    <!-- ✅ RIGHT SIDE ACTIONS: show when jobType AND (mode OR multi_modal) -->
    <div v-if="jobType && (jobType === 'multi_modal' || mode)" class="two-col">
      <section class="card section">
        <JobStepHeader title="Documents & Notes" subtitle="Optional attachments and internal notes" />

        <div class="docs-grid">
          <div class="drop-box">Drag &amp; drop documents</div>

          <div class="field">
            <label class="label">Internal Notes</label>
            <Textarea
              v-model="form.note"
              class="control textarea"
              placeholder="Operational notes, special handling, etc."
              autoResize
            />
          </div>
        </div>
      </section>

      <section class="card section actions">
        <Button
          class="create-btn orbis-primary"
          type="button"
          :loading="creating"
          :disabled="!canCreate"
          @click="onSave"
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
import "@/app/pages/jobs/JobPage.css"
import AutoComplete from "primevue/autocomplete"

import JobStepHeader from "@/app/components/jobs/JobStepHeader.vue"
import JobTypeSelector from "@/app/components/jobs/JobTypeSelector.vue"
import ModeSelector from "@/app/components/jobs/ModeSelector.vue"

import { onBeforeUnmount, onMounted } from "vue"
import { useJobCreatePage } from "./JobPage.logic"

const {
  store,

  JOB_TYPES,
  MODES,
  availableModes,

  jobType,
  mode,
  jobTypeLabel,
  modeLabel,
  selectJobType,
  selectMode,

  form,
  selectedCustomer,
  customerSuggestions,
  customerOptionLabel,
  accountNumberPreview,

  creating,
  canCreate,
  createError,

  initJobPage,
  cleanupJobPage,
  onCustomerComplete,
  onCustomerSelect,
  onCustomerClear,

  onSave,
  onCancel,
} = useJobCreatePage()

onMounted(async () => {
  await initJobPage()
})

onBeforeUnmount(() => {
  cleanupJobPage()
})
</script>