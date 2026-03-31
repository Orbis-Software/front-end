<script setup lang="ts">
import "./JobProgressStepper.css"

export type JobProgressStep = {
  key: string
  number: number
  title: string
  subtitle?: string
  done?: boolean
  active?: boolean
}

defineProps<{
  steps: JobProgressStep[]
}>()
</script>

<template>
  <div class="job-progress-stepper">
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      class="job-progress-step"
      :class="{
        'is-done': step.done,
        'is-active': step.active,
      }"
    >
      <div class="job-progress-step__head">
        <div class="job-progress-step__dot">
          <i v-if="step.done" class="pi pi-check"></i>
          <span v-else>{{ step.number }}</span>
        </div>

        <div class="job-progress-step__text">
          <div class="job-progress-step__title">{{ step.title }}</div>
          <div v-if="step.subtitle" class="job-progress-step__subtitle">
            {{ step.subtitle }}
          </div>
        </div>
      </div>

      <div v-if="index < steps.length - 1" class="job-progress-step__line"></div>
    </div>
  </div>
</template>
