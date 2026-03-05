<template>
  <div class="emp-page">
    <section class="emp-header">
      <div>
        <h1 class="emp-title">Employee List</h1>
        <p class="emp-subtitle">List, create, and update employees in your company.</p>
      </div>

      <Button
        label="Add Employee"
        icon="pi pi-user-plus"
        class="btn btn--primary"
        @click="openCreate"
      />
    </section>

    <!-- Search -->
    <section class="emp-search">
      <i class="pi pi-search emp-search__icon" />

      <InputText
        v-model="searchLocal"
        placeholder="Search name or email..."
        class="emp-search__input"
      />

      <Button
        label="Clear"
        icon="pi pi-times"
        outlined
        :disabled="!searchLocal"
        @click="clearSearch"
      />

      <div class="emp-search__right">
        <small class="emp-muted" v-if="searching">Searching…</small>
        <small class="emp-muted" v-else>Showing {{ store.items.length }}</small>
      </div>
    </section>

    <!-- Table -->
    <section class="emp-card">
      <DataTable :value="store.items" :loading="store.loading" responsiveLayout="scroll">
        <Column field="name" header="Name" />
        <Column field="email" header="Email" />

        <Column header="Roles">
          <template #body="{ data }">
            <div class="emp-roles">
              <Tag v-for="r in data.roles || []" :key="r" :value="r" />
              <span v-if="!data.roles || data.roles.length === 0" class="emp-muted">—</span>
            </div>
          </template>
        </Column>

        <Column header="Last Login">
          <template #body="{ data }">
            <span class="emp-text">{{ data.last_login_at ?? "—" }}</span>
          </template>
        </Column>

        <Column header="Actions" style="width: 140px">
          <template #body="{ data }">
            <Button label="Edit" icon="pi pi-pencil" outlined @click="openEdit(data)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <!-- Create Dialog -->
    <Dialog v-model:visible="showCreate" header="Add Employee" modal :style="{ width: '540px' }">
      <div class="emp-form">
        <div class="emp-field">
          <label class="emp-label">Name</label>
          <InputText v-model="createForm.name" class="w-full" />
        </div>

        <div class="emp-field">
          <label class="emp-label">Email</label>
          <InputText v-model="createForm.email" class="w-full" />
        </div>

        <div class="emp-field">
          <label class="emp-label">Password</label>
          <InputText v-model="createForm.password" type="password" class="w-full" />
          <small class="emp-hint">Minimum 8 characters</small>
        </div>

        <!-- <div v-if="store.roles.length" class="emp-field">
          <label class="emp-label">Roles</label>
          <MultiSelect
            v-model="createForm.roles"
            :options="store.roles"
            placeholder="Select roles"
            class="w-full"
          />
        </div> -->
      </div>

      <template #footer>
        <button class="cancel-link" type="button" @click="closeCreate">
          <i class="pi pi-times" style="margin-right: 6px" />
          Cancel
        </button>

        <Button
          label="Create"
          icon="pi pi-check"
          class="btn btn--primary"
          :disabled="!canCreate"
          :loading="store.saving"
          @click="submitCreate"
        />
      </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEdit" header="Edit Employee" modal :style="{ width: '540px' }">
      <div class="emp-form">
        <div class="emp-field">
          <label class="emp-label">Name</label>
          <InputText v-model="editForm.name" class="w-full" />
        </div>

        <div class="emp-field">
          <label class="emp-label">Email</label>
          <InputText v-model="editForm.email" class="w-full" />
        </div>

        <div class="emp-field">
          <label class="emp-label">New Password (optional)</label>
          <InputText v-model="editForm.password" type="password" class="w-full" />
        </div>

        <!-- <div v-if="store.roles.length" class="emp-field">
          <label class="emp-label">Roles</label>
          <MultiSelect
            v-model="editForm.roles"
            :options="store.roles"
            placeholder="Select roles"
            class="w-full"
          />
        </div> -->
      </div>

      <template #footer>
        <button class="cancel-link" type="button" @click="closeEdit">
          <i class="pi pi-times" style="margin-right: 6px" />
          Cancel
        </button>

        <Button
          label="Save"
          icon="pi pi-save"
          class="btn btn--primary"
          :loading="store.saving"
          @click="submitEdit"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import "./EmployeeListPage.css"

import Button from "primevue/button"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import MultiSelect from "primevue/multiselect"
import Tag from "primevue/tag"

import { onMounted } from "vue"
import { useEmployeeListPage } from "./EmployeeListPage.logic"

const {
  store,

  // realtime search state
  searchLocal,
  searching,
  clearSearch,

  showCreate,
  showEdit,

  createForm,
  editForm,

  canCreate,

  openCreate,
  openEdit,
  closeCreate,
  closeEdit,

  submitCreate,
  submitEdit,

  initEmployeePage,
} = useEmployeeListPage()

onMounted(async () => {
  await initEmployeePage()
})
</script>
