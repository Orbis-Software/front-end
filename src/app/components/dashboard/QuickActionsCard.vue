<template>
  <section class="card quick">
    <div class="card-title">Quick Actions</div>
    <div class="card-sub">Create or import common items</div>

    <div class="quick-grid">
      <Button class="quick-btn orbis-primary" outlined type="button" @click="$emit('action','new-quote')">New Quote</Button>
      <Button class="quick-btn orbis-primary" outlined type="button" @click="$emit('action','new-job')">New Job</Button>
      <Button class="quick-btn orbis-primary" outlined type="button" @click="$emit('action','add-contact')">Add Contact</Button>
      <Button class="quick-btn orbis-primary" outlined type="button" @click="$emit('action','create-invoice')">Create Invoice</Button>
      <Button class="quick-btn orbis-primary" outlined type="button" @click="$emit('action','import-csv')">Import CSV</Button>
      <Button class="quick-btn orbis-primary" outlined type="button" @click="$emit('action','open-reports')">Open Reports</Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from "primevue/button";
defineEmits<{ (e: "action", key: string): void }>();
</script>
