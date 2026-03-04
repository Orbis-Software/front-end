<script setup lang="ts">
import Button from "primevue/button"

export type JobMilestoneStatus = "done" | "active" | "pending"

export type JobMilestone = {
  id: string
  title: string
  subtitle?: string | null
  status: JobMilestoneStatus
  start_date?: string | null // "dd/mm/yyyy"
  end_date?: string | null   // "dd/mm/yyyy"
}

const props = defineProps<{
  disabled?: boolean
  milestones?: JobMilestone[]
}>()

const list: JobMilestone[] = props.milestones ?? [
  {
    id: "created",
    title: "Job Created",
    subtitle: "Job setup completed in system",
    status: "done",
    start_date: "03/02/2026",
    end_date: "03/02/2026",
  },
  {
    id: "collection_booked",
    title: "Collection Booked",
    subtitle: "Carrier confirmed for pickup",
    status: "done",
    start_date: "03/02/2026",
    end_date: "04/02/2026",
  },
  {
    id: "cargo_collected",
    title: "Cargo Collected",
    subtitle: "Goods picked up from shipper",
    status: "active",
    start_date: "04/02/2026",
    end_date: "04/02/2026",
  },
  {
    id: "origin_wh",
    title: "At Origin Warehouse",
    subtitle: "Cargo received at warehouse",
    status: "pending",
    start_date: "05/02/2026",
    end_date: "05/02/2026",
  },
  {
    id: "departure",
    title: "Departure",
    subtitle: "Cargo departed origin",
    status: "pending",
    start_date: "06/02/2026",
    end_date: "07/02/2026",
  },
  {
    id: "arrival",
    title: "Arrival at Destination",
    subtitle: "Cargo arrived destination port",
    status: "pending",
    start_date: "08/02/2026",
    end_date: "08/02/2026",
  },
  {
    id: "dest_wh",
    title: "At Destination Warehouse",
    subtitle: "Cargo at destination warehouse",
    status: "pending",
    start_date: "09/02/2026",
    end_date: "09/02/2026",
  },
  {
    id: "out_for_delivery",
    title: "Out for Delivery",
    subtitle: "Final delivery in progress",
    status: "pending",
    start_date: "10/02/2026",
    end_date: "10/02/2026",
  },
  {
    id: "delivered",
    title: "Delivery Completed",
    subtitle: "Job successfully closed",
    status: "pending",
    start_date: "11/02/2026",
    end_date: "11/02/2026",
  },
]

const total = list.length
const completed = list.filter((m) => m.status === "done").length
const progressPct = total === 0 ? 0 : Math.round((completed / total) * 100)

function statusIcon(status: JobMilestoneStatus) {
  if (status === "done") return "pi pi-check"
  if (status === "active") return "pi pi-clock"
  return "pi pi-circle"
}

function statusClass(status: JobMilestoneStatus) {
  if (status === "done") return "ms-ico ms-ico--done"
  if (status === "active") return "ms-ico ms-ico--active"
  return "ms-ico ms-ico--pending"
}

function onAddMilestone() {
  // placeholder (hook later)
  // emit("add") if you want
}
</script>

<template>
  <div class="job-milestones">
    <div class="ms-card">
      <div class="ms-head">
        <div class="ms-title">Job Milestones</div>

        <Button
          class="ms-add-btn"
          icon="pi pi-plus"
          label="Add Milestone"
          :disabled="disabled"
          @click="onAddMilestone"
        />
      </div>

      <div class="ms-progress-row">
        <div class="ms-progress-text">
          Progress: <b>{{ progressPct }}%</b> ({{ completed }} of {{ total }} milestones)
        </div>
      </div>

      <div class="ms-progress-track">
        <div class="ms-progress-fill" :style="{ width: progressPct + '%' }" />
      </div>

      <div class="ms-grid">
        <div v-for="m in list" :key="m.id" class="ms-item">
          <div class="ms-item-head">
            <div :class="statusClass(m.status)">
              <i :class="statusIcon(m.status)" />
            </div>

            <div class="ms-item-text">
              <div class="ms-item-title">{{ m.title }}</div>
              <div v-if="m.subtitle" class="ms-item-sub">{{ m.subtitle }}</div>
            </div>
          </div>

          <div class="ms-item-dates">
            <div class="ms-date">
              <div class="ms-date-label">Start Date</div>
              <div class="ms-date-val">{{ m.start_date ?? "—" }}</div>
            </div>

            <div class="ms-date">
              <div class="ms-date-label">End Date</div>
              <div class="ms-date-val">{{ m.end_date ?? "—" }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./JobMilestonesTab.css";
</style>