<template>
  <div class="contacts-page">
    <ConfirmDialog />

    <!-- Header -->
    <div class="contacts-header">
      <div class="left">
        <h1 class="title">{{ headerTitle }}</h1>
        <p class="subtitle">Manage all contacts</p>
      </div>

      <div class="right">
        <span class="p-input-icon-left search">
          <i class="pi pi-search" />
          <InputText
            :modelValue="search"
            @update:modelValue="(v) => onSearchInput(v ?? '')"
            placeholder="Search company, address, EORI..."
          />
        </span>

        <Button class="btn-primary" icon="pi pi-plus" label="New Contact" @click="onCreate" />
      </div>
    </div>

    <!-- Types pills -->
    <div class="type-switch" v-if="!store.typesLoading">
      <button
        class="type-btn"
        :class="{ active: store.activeTypeId === null }"
        type="button"
        @click="setTypeId(null)"
      >
        ALL
      </button>

      <button
        v-for="t in store.types"
        :key="t.id"
        class="type-btn"
        :class="{ active: store.activeTypeId === t.id }"
        type="button"
        @click="setTypeId(t.id)"
        :title="t.name"
      >
        {{ t.name.toUpperCase() }}
      </button>
    </div>

    <div class="type-switch" v-else>
      <div class="type-skeleton" />
      <div class="type-skeleton" />
      <div class="type-skeleton" />
      <div class="type-skeleton" />
    </div>

    <!-- Table -->
    <div class="contacts-panel">
      <DataTable
        :value="store.items"
        :loading="store.loading"
        dataKey="id"
        responsiveLayout="scroll"
        class="contacts-table"
        :pt="{ mask: { class: 'contacts-loading-mask' } }"
      >
        <Column header="Types" style="width: 340px">
          <template #body="{ data }">
            <div class="type-badges">
              <span v-for="t in (data.contact_types || [])" :key="t.id" class="badge">
                {{ t.name }}
              </span>
              <span v-if="!(data.contact_types || []).length" class="badge muted">—</span>
            </div>
          </template>
        </Column>

        <Column header="Company" style="width: 280px">
          <template #body="{ data }">
            <strong>{{ data.company_name || '—' }}</strong>
            <div class="muted subline">
              {{ data.account_number || 'No account number' }}
            </div>
          </template>
        </Column>

        <Column header="Address">
          <template #body="{ data }">
            {{ data.address_line_1 || '—' }}
          </template>
        </Column>

        <Column header="EORI" style="width: 220px">
          <template #body="{ data }">
            {{ data.eori || '—' }}
          </template>
        </Column>

        <Column header="Status" style="width: 140px">
          <template #body="{ data }">
            <span class="status" :class="data.status === 'active' ? 'ok' : 'off'">
              {{ data.status }}
            </span>
          </template>
        </Column>

        <Column header="" style="width: 200px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button text icon="pi pi-pencil" label="Edit" @click="onEdit(data.id)" />
              <Button text severity="danger" icon="pi pi-trash" label="Delete" @click="onDelete(data.id)" />
            </div>
          </template>
        </Column>

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
import './ContactsPage.css'
import { useContactsPage } from './ContactsPage'

const {
  store,
  search,
  headerTitle,
  onSearchInput,
  setTypeId,
  onCreate,
  onEdit,
  onDelete,
} = useContactsPage()
</script>
