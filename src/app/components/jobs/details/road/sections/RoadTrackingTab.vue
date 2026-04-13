<script setup lang="ts">
defineProps<{
  form: any
  disabled?: boolean
}>()
</script>

<template>
  <div class="road-card">
    <div class="road-card__head">
      <div class="road-card__title">Shipment Timeline</div>
    </div>

    <div class="road-card__body">
      <div class="road-timeline">
        <div class="road-timeline__item">
          <div class="road-timeline__dot road-timeline__dot--done">✓</div>
          <div>
            <div class="road-timeline__title">Job Created</div>
            <div class="road-timeline__meta">System generated</div>
          </div>
        </div>

        <div class="road-timeline__item">
          <div class="road-timeline__dot road-timeline__dot--active">•</div>
          <div>
            <div class="road-timeline__title">Awaiting Booking Confirmation</div>
            <div class="road-timeline__meta">Current stage</div>
          </div>
        </div>

        <div class="road-timeline__item">
          <div class="road-timeline__dot">○</div>
          <div>
            <div class="road-timeline__title">Collection Completed</div>
            <div class="road-timeline__meta">Pending</div>
          </div>
        </div>

        <div class="road-timeline__item">
          <div class="road-timeline__dot">○</div>
          <div>
            <div class="road-timeline__title">In Transit</div>
            <div class="road-timeline__meta">Pending</div>
          </div>
        </div>

        <div class="road-timeline__item">
          <div class="road-timeline__dot">○</div>
          <div>
            <div class="road-timeline__title">Delivered – POD Received</div>
            <div class="road-timeline__meta">Pending</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
