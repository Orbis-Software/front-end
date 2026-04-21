<template>
  <section class="contacts-page">
    <ConfirmDialog />

    <header class="contacts-page__header">
      <div class="contacts-page__title-wrap">
        <h1 class="contacts-page__title">{{ headerTitle }}</h1>
      </div>

      <div class="contacts-page__actions">
        <div class="contacts-page__search-wrap">
          <i class="pi pi-search contacts-page__search-icon" />
          <InputText
            :modelValue="search"
            @update:modelValue="v => onSearchInput(v ?? '')"
            placeholder="     Search company, address, EORI..."
            class="contacts-page__search-input"
          />
        </div>

        <!-- ✅ NEW: Import Contacts -->
        <Button
          class="contacts-page__import-btn"
          icon="pi pi-upload"
          label="Import Contacts"
          @click="onImportContacts"
        />

        <!-- Existing -->
        <Button
          class="contacts-page__new-btn"
          icon="pi pi-plus"
          label="New Contact"
          @click="onCreate"
        />
      </div>
    </header>

    <div class="contacts-page__card">
      <nav class="contacts-page__tabs" v-if="!store.typesLoading">
        <button
          type="button"
          class="contacts-page__tab"
          :class="{ 'contacts-page__tab--active': store.activeTypeId === null }"
          @click="setTypeId(null)"
        >
          All
        </button>

        <button
          v-for="t in filterTabs"
          :key="t.id"
          type="button"
          class="contacts-page__tab"
          :class="{ 'contacts-page__tab--active': store.activeTypeId === t.id }"
          @click="setTypeId(t.id)"
        >
          {{ t.label }}
        </button>
      </nav>

      <nav class="contacts-page__tabs" v-else>
        <div class="contacts-page__tab-skeleton" />
        <div class="contacts-page__tab-skeleton" />
        <div class="contacts-page__tab-skeleton" />
        <div class="contacts-page__tab-skeleton" />
      </nav>

      <div class="contacts-page__content">
        <div class="contacts-page__panel">
          <DataTable
            :value="store.items"
            :loading="store.loading"
            dataKey="id"
            responsiveLayout="scroll"
            class="contacts-page__table"
            :pt="{ mask: { class: 'contacts-page__loading-mask' } }"
            paginator
            lazy
            :rows="store.perPage"
            :totalRecords="store.total"
            :first="firstRow"
            :rowsPerPageOptions="[15, 25, 50, 100]"
            @page="onPage"
          >
            <Column header="Company" style="width: 300px">
              <template #body="{ data }">
                <button
                  class="contacts-page__link-strong"
                  type="button"
                  @click="onOpenCompany(data.id)"
                >
                  {{ data.company_name || "—" }}
                </button>

                <div class="contacts-page__subline contacts-page__muted">
                  {{ data.account_number || "No account number" }}
                </div>
              </template>
            </Column>

            <Column header="Address">
              <template #body="{ data }">
                {{ data.address_line_1 || "—" }}
              </template>
            </Column>

            <Column header="EORI" style="width: 240px">
              <template #body="{ data }">
                {{ data.eori || "—" }}
              </template>
            </Column>

            <Column header="Types" style="width: 360px">
              <template #body="{ data }">
                <div class="contacts-page__type-badges">
                  <span
                    v-for="t in data.contact_types || []"
                    :key="t.id"
                    class="contacts-page__badge"
                  >
                    {{ t.name }}
                  </span>

                  <span
                    v-if="!(data.contact_types || []).length"
                    class="contacts-page__badge contacts-page__badge--muted"
                  >
                    —
                  </span>
                </div>
              </template>
            </Column>

            <Column header="Status" style="width: 150px">
              <template #body="{ data }">
                <span
                  class="contacts-page__status"
                  :class="
                    data.status === 'active'
                      ? 'contacts-page__status--ok'
                      : 'contacts-page__status--off'
                  "
                >
                  {{ data.status }}
                </span>
              </template>
            </Column>

            <Column header="" style="width: 210px">
              <template #body="{ data }">
                <div class="contacts-page__row-actions">
                  <Button text icon="pi pi-pencil" label="Edit" @click="onEdit(data.id)" />
                  <Button
                    text
                    severity="danger"
                    icon="pi pi-trash"
                    label="Delete"
                    @click="onDelete(data.id)"
                  />
                </div>
              </template>
            </Column>

            <template #loading>
              <div class="contacts-page__loading-wrap">
                <i class="pi pi-spin pi-spinner" />
                <span>Loading contacts…</span>
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import "./ContactsPage.css"
import { useContactsPage } from "./ContactsPage"

const {
  store,
  search,
  headerTitle,
  filterTabs,
  firstRow,
  onPage,
  onSearchInput,
  setTypeId,
  onCreate,
  onEdit,
  onDelete,
  onOpenCompany,
  onImportContacts,
} = useContactsPage()
</script>
