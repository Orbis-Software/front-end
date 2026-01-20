<template>
  <div class="contacts-page">
    <!-- required once on the page -->
    <ConfirmDialog />

    <div class="contacts-header">
      <div class="left">
        <h1 class="title">{{ headerTitle }}</h1>
        <p class="subtitle">Manage contacts for {{ headerTitle.toLowerCase() }}</p>
      </div>

      <div class="right">
        <span class="p-input-icon-left search">
          <i class="pi pi-search" />
          <InputText v-model="search" placeholder="Search..." />
        </span>

        <Button class="btn-primary" icon="pi pi-plus" label="New Contact" @click="onCreate" />
      </div>
    </div>

    <div class="contacts-panel">
      <DataTable
        :value="filteredItems"
        :loading="store.loading"
        dataKey="id"
        responsiveLayout="scroll"
        class="contacts-table"
        :pt="{
          mask: { class: 'contacts-loading-mask' }
        }"
      >
        <Column header="Type" style="width: 180px">
          <template #body="{ data }">
            <span class="badge">{{ prettyType(data.contact_type) }}</span>
          </template>
        </Column>

        <!-- ✅ NEW: Primary Person -->
        <Column header="Primary Contact" style="width: 260px">
          <template #body="{ data }">
            <div class="primary-person">
              <div class="pp-name">{{ primaryPerson(data).name || "—" }}</div>
              <div class="pp-sub">
                <span v-if="primaryPerson(data).email">{{ primaryPerson(data).email }}</span>
                <span v-else class="muted">No email</span>

                <span class="dot">•</span>

                <span v-if="primaryPerson(data).phone">{{ primaryPerson(data).phone }}</span>
                <span v-else class="muted">No phone</span>
              </div>
            </div>
          </template>
        </Column>

        <Column field="address" header="Address" />
        <Column field="country" header="Country" style="width: 140px" />
        <Column field="eori" header="EORI" style="width: 200px" />

        <Column header="Status" style="width: 140px">
          <template #body="{ data }">
            <span class="status" :class="data.status === 'active' ? 'ok' : 'off'">
              {{ data.status }}
            </span>
          </template>
        </Column>

        <Column header="" style="width: 180px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button text icon="pi pi-pencil" label="Edit" @click="onEdit(data.id)" />
              <Button
                text
                severity="danger"
                icon="pi pi-trash"
                label="Delete"
                @click="onDelete(data)"
              />
            </div>
          </template>
        </Column>

        <!-- ✅ Optional: custom loading content -->
        <template #loading>
          <div class="loading-wrap">
            <i class="pi pi-spin pi-spinner" />
            <span>Loading contacts…</span>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import "./ContactsPage.css";
import { useContactsPage } from "./ContactsPage";

const {
  store,
  search,
  filteredItems,
  headerTitle,
  prettyType,
  primaryPerson,
  onCreate,
  onEdit,
  onDelete,
} = useContactsPage();
</script>
