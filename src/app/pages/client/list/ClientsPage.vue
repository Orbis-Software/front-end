<template>
  <ConfirmDialog />

  <div class="clients-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="page-header-left">
        <h1>Clients</h1>
        <p class="text-muted">
          Manage customers, contacts, and billing information.
        </p>
      </div>

      <!-- ACTION: Create Client (disabled for now) -->
      <!--
      <Button
        label="New Client"
        icon="pi pi-plus"
        class="p-button-primary"
        @click="createClient"
      />
      -->
    </header>

    <!-- KPI Widgets -->
    <section class="kpi-grid">
      <div
        class="card kpi-card"
        v-for="kpi in kpis"
        :key="kpi.label"
      >
        <i :class="kpi.icon" class="kpi-icon" />
        <div class="kpi-content">
          <span class="kpi-label">{{ kpi.label }}</span>
          <strong class="kpi-value">{{ kpi.value }}</strong>
        </div>
      </div>
    </section>

    <!-- Clients Table -->
    <section class="card">
      <DataTable
        :value="clients"
        paginator
        :rows="10"
        responsiveLayout="scroll"
      >
        <Column field="name" header="Client Name" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Phone" />
        <Column field="status" header="Status" />
        <Column field="createdAt" header="Created At" />

        <!-- ACTIONS COLUMN (disabled for now) -->
        <!--
        <Column header="Actions" style="width: 160px">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                class="p-button-text p-button-sm"
                @click="viewClient(data.id)"
              />
              <Button
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                @click="editClient(data.id)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-sm p-button-danger"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
        -->
      </DataTable>
    </section>

    <!-- VIEW MODAL (disabled for now) -->
    <!--
    <ClientViewModal
      v-model="showViewModal"
      :client="selectedClient"
    />
    -->
  </div>
</template>

<script setup lang="ts">
// import ClientViewModal from '@/app/components/modals/ClientViewModal.vue'
import { useClientPage } from './useClientPage'

const {
  clients,
  kpis,

  // ACTION STATES (kept for later)
  // showViewModal,
  // selectedClient,

  // ACTION METHODS (kept for later)
  // createClient,
  // viewClient,
  // editClient,
  // confirmDelete,
} = useClientPage()
</script>

<style scoped src="./ClientPage.css"></style>
