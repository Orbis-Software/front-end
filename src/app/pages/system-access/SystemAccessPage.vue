<template>
  <div class="sa-page">
    <section class="sa-header">
      <div>
        <h1 class="sa-title">System Access</h1>
        <p class="sa-subtitle">Manage employee roles and direct permissions.</p>
      </div>
    </section>

    <section class="sa-grid">
      <!-- Left: Employees -->
      <div class="sa-card sa-card--list">
        <div class="sa-card__header">
          <h2 class="sa-card__title">Employees</h2>

          <div class="sa-search">
            <i class="pi pi-search sa-search__icon" />
            <InputText
              v-model="searchLocal"
              class="sa-search__input"
              placeholder="Search name/email..."
            />
            <Button icon="pi pi-times" outlined :disabled="!searchLocal" @click="clearSearch" />
          </div>

          <small class="sa-muted" v-if="searching">Searching…</small>
        </div>

        <DataTable
          :value="store.employees"
          :loading="store.loadingList"
          responsiveLayout="scroll"
          selectionMode="single"
          dataKey="id"
          @rowClick="onRowClick"
        >
          <Column field="name" header="Name" />
          <Column field="email" header="Email" />
        </DataTable>
      </div>

      <!-- Right: Access -->
      <div class="sa-card sa-card--details">
        <div class="sa-card__header">
          <h2 class="sa-card__title">Access</h2>
          <small class="sa-muted" v-if="!store.selected">
            Select an employee to edit access.
          </small>
        </div>

        <div v-if="store.selected" class="sa-details">
          <div class="sa-person">
            <div class="sa-person__name">{{ store.selected.name }}</div>
            <div class="sa-person__email">{{ store.selected.email }}</div>
          </div>

          <!-- Roles -->
          <div v-if="rolesOptions.length" class="sa-section">
            <div class="sa-section__header">
              <div>
                <div class="sa-section__title">Roles</div>
                <div class="sa-muted">Roles assigned to this user.</div>
              </div>

              <Button
                label="Save Roles"
                icon="pi pi-save"
                class="btn btn--primary"
                :loading="store.savingRoles"
                @click="saveRoles"
              />
            </div>

            <MultiSelect
              v-model="rolesDraft"
              :options="rolesOptions"
              placeholder="Select roles"
              class="w-full"
              :disabled="store.loadingSelected"
              :showToggleAll="false"
            />
          </div>

          <!-- Direct Permissions -->
          <div class="sa-section">
            <div class="sa-section__header">
              <div>
                <div class="sa-section__title">Direct Permissions</div>
                <div class="sa-muted">
                  Use these like the TopNav access rules (TMS / WMS / Management).
                </div>
              </div>

              <Button
                label="Save Permissions"
                icon="pi pi-save"
                class="btn btn--primary"
                :loading="store.savingPerms"
                @click="savePermissions"
              />
            </div>

            <div v-if="!permissionGroups.length" class="sa-muted">
              No permission mapping found from nav items.
            </div>

            <div v-else class="sa-groups">
              <div v-for="group in permissionGroups" :key="group.id" class="sa-group">
                <div class="sa-group__header">
                  <div class="sa-group__title">
                    {{ group.label }}
                  </div>

                  <div class="sa-group__actions">
                    <Button
                      label="Select all"
                      icon="pi pi-check-square"
                      outlined
                      @click="selectAllGroup(group)"
                    />
                    <Button
                      label="Clear"
                      icon="pi pi-times"
                      outlined
                      @click="clearAllGroup(group)"
                    />
                    <small class="sa-muted sa-group__count">
                      {{ countSelectedInGroup(group) }} / {{ countTotalInGroup(group) }}
                    </small>
                  </div>
                </div>

                <div class="sa-group__list">
                  <label v-for="item in group.items" :key="item.key" class="sa-permRow">
                    <input
                      class="sa-check"
                      type="checkbox"
                      :value="item.permission"
                      v-model="permsDraft"
                    />

                    <div class="sa-permRow__meta">
                      <div class="sa-permRow__label">
                        {{ item.label }}
                      </div>

                      <div class="sa-permRow__code">
                        {{ item.permission }}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Unmapped -->
              <div v-if="unmappedPermissions.length" class="sa-group">
                <div class="sa-group__header">
                  <div class="sa-group__title">
                    <i class="pi pi-ellipsis-h sa-group__icon" />
                    Other Permissions
                  </div>

                  <div class="sa-group__actions">
                    <Button
                      label="Select all"
                      icon="pi pi-check-square"
                      outlined
                      @click="selectAllUnmapped"
                    />
                    <Button label="Clear" icon="pi pi-times" outlined @click="clearAllUnmapped" />
                    <small class="sa-muted sa-group__count">
                      {{ countSelectedUnmapped }} / {{ unmappedPermissions.length }}
                    </small>
                  </div>
                </div>

                <div class="sa-group__list sa-group__list--other">
                  <label v-for="p in unmappedPermissions" :key="p" class="sa-permOther">
                    <input class="sa-check" type="checkbox" :value="p" v-model="permsDraft" />
                    <span class="sa-permOther__label">{{ p }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Effective Permissions -->
          <div class="sa-section">
            <div class="sa-section__title">Effective Permissions</div>
            <div class="sa-muted">
              Effective = roles + direct. “Role” ones won’t be removed by unchecking direct
              permissions.
            </div>

            <div v-if="!store.selected.effective_permissions.length" class="sa-muted">—</div>

            <div v-else class="sa-effective">
              <div v-for="group in effectiveGroups" :key="group.id" class="sa-effectiveGroup">
                <div class="sa-effectiveGroup__title">
                  {{ group.label }}
                </div>

                <div class="sa-effectiveGroup__items">
                  <div v-for="p in group.permissions" :key="p.key" class="sa-effItem">
                    <span class="sa-effItem__label">{{ p.label }}</span>
                    <span class="sa-effItem__code">{{ p.permission }}</span>

                    <span v-if="p.source === 'direct'" class="sa-badge sa-badge--direct">
                      Direct
                    </span>
                    <span v-else class="sa-badge sa-badge--role"> Role </span>
                  </div>
                </div>
              </div>

              <div v-if="effectiveUnmapped.length" class="sa-effectiveGroup">
                <div class="sa-effectiveGroup__title">Other</div>

                <div class="sa-effectiveGroup__items">
                  <div v-for="p in effectiveUnmapped" :key="p" class="sa-effItem">
                    <span class="sa-effItem__label">{{ p }}</span>
                    <span class="sa-badge sa-badge--role">Effective</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="sa-empty">
          <i class="pi pi-user sa-empty__icon" />
          <div class="sa-empty__text">Select an employee from the left to manage access.</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import "./SystemAccessPage.css"

import Button from "primevue/button"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import InputText from "primevue/inputtext"
import MultiSelect from "primevue/multiselect"

import { onMounted } from "vue"
import { useSystemAccessPage } from "./SystemAccessPage.logic"

const {
  store,

  searchLocal,
  searching,
  clearSearch,
  onRowClick,

  rolesDraft,
  rolesOptions,

  permsDraft,

  permissionGroups,
  unmappedPermissions,

  selectAllGroup,
  clearAllGroup,
  countSelectedInGroup,
  countTotalInGroup,

  selectAllUnmapped,
  clearAllUnmapped,
  countSelectedUnmapped,

  effectiveGroups,
  effectiveUnmapped,

  saveRoles,
  savePermissions,

  init,
} = useSystemAccessPage()

onMounted(async () => {
  await init()
})
</script>
