<template>
  <div class="sa-page">
    <section class="sa-header">
      <div>
        <h1 class="sa-title">System Access</h1>
        <p class="sa-subtitle">Manage employee roles and direct permissions.</p>
      </div>

      <div v-if="store.selected" class="sa-header__actions">
        <div class="sa-stat">
          <span>Roles</span><strong>{{ selectedRoleCount }}</strong>
        </div>
        <div class="sa-stat">
          <span>Direct</span><strong>{{ selectedDirectCount }}</strong>
        </div>
        <div class="sa-stat">
          <span>Effective</span><strong>{{ effectiveCount }}</strong>
        </div>
        <Button
          label="Save Access"
          icon="pi pi-save"
          class="btn btn--primary"
          :loading="store.savingRoles || store.savingPerms"
          @click="saveAllAccess"
        />
      </div>
    </section>

    <section class="sa-grid">
      <aside class="sa-card sa-card--list">
        <div class="sa-card__header">
          <div>
            <h2 class="sa-card__title">Employees</h2>
            <small class="sa-muted">{{ store.employees.length }} shown</small>
          </div>

          <div class="sa-search">
            <i class="pi pi-search sa-search__icon" />
            <InputText
              v-model="searchLocal"
              class="sa-search__input"
              placeholder="Search name or email"
            />
            <Button icon="pi pi-times" outlined :disabled="!searchLocal" @click="clearSearch" />
          </div>
          <small v-if="searching" class="sa-muted">Searching...</small>
        </div>

        <DataTable
          :value="store.employees"
          :loading="store.loadingList"
          responsiveLayout="scroll"
          selectionMode="single"
          dataKey="id"
          class="sa-employee-table"
          @rowClick="onRowClick"
        >
          <Column header="Employee">
            <template #body="{ data }">
              <div
                class="sa-employee"
                :class="{ 'sa-employee--active': store.selected?.id === data.id }"
              >
                <span class="sa-avatar">{{
                  String(data.name || data.email || "?").slice(0, 1)
                }}</span>
                <span>
                  <strong>{{ data.name }}</strong>
                  <small>{{ data.email }}</small>
                </span>
              </div>
            </template>
          </Column>
        </DataTable>
      </aside>

      <main class="sa-card sa-card--details">
        <div v-if="store.selected" class="sa-details">
          <section class="sa-person">
            <div>
              <div class="sa-person__eyebrow">Editing Access For</div>
              <div class="sa-person__name">{{ store.selected.name }}</div>
              <div class="sa-person__email">{{ store.selected.email }}</div>
            </div>
            <div class="sa-person__badges">
              <span>{{ selectedRoleCount }} roles</span>
              <span>{{ selectedDirectCount }} direct permissions</span>
              <span>{{ effectiveCount }} effective</span>
            </div>
          </section>

          <section v-if="rolesOptions.length" class="sa-section">
            <div class="sa-section__header">
              <div>
                <div class="sa-section__title">Roles</div>
                <div class="sa-muted">
                  Role permissions are inherited. Direct permissions below are extra access.
                </div>
              </div>
              <Button
                label="Save Roles"
                icon="pi pi-save"
                class="btn btn--ghost"
                :loading="store.savingRoles"
                @click="saveRoles"
              />
            </div>

            <div class="sa-role-grid">
              <label v-for="role in rolesOptions" :key="role" class="sa-role">
                <input v-model="rolesDraft" class="sa-check" type="checkbox" :value="role" />
                <span>{{ roleLabel(role) }}</span>
                <small>{{ role }}</small>
              </label>
            </div>
          </section>

          <section class="sa-section">
            <div class="sa-section__header sa-section__header--sticky">
              <div>
                <div class="sa-section__title">Direct Permissions</div>
                <div class="sa-muted">
                  Search and assign only the extra permissions this employee needs.
                </div>
              </div>
              <div class="sa-section__tools">
                <div class="sa-search sa-search--compact">
                  <i class="pi pi-search sa-search__icon" />
                  <InputText
                    v-model="permissionQuery"
                    class="sa-search__input"
                    placeholder="Filter permissions"
                  />
                  <Button
                    icon="pi pi-times"
                    outlined
                    :disabled="!permissionQuery"
                    @click="permissionQuery = ''"
                  />
                </div>
                <Button
                  label="Save Permissions"
                  icon="pi pi-save"
                  class="btn btn--primary"
                  :loading="store.savingPerms"
                  @click="savePermissions"
                />
              </div>
            </div>

            <div v-if="!permissionGroups.length" class="sa-muted">
              No permission mapping found from nav items.
            </div>

            <div v-else class="sa-groups">
              <article v-for="group in filteredPermissionGroups" :key="group.id" class="sa-group">
                <div class="sa-group__header">
                  <div>
                    <div class="sa-group__title">{{ group.label }}</div>
                    <small class="sa-muted">
                      {{ countSelectedInGroup(group) }} of {{ countTotalInGroup(group) }} selected
                    </small>
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
                  </div>
                </div>

                <div class="sa-group__list">
                  <label
                    v-for="item in group.items"
                    :key="item.key"
                    class="sa-permRow"
                    :class="{ 'sa-permRow--checked': isPermSelected(item.permission) }"
                  >
                    <input
                      class="sa-check"
                      type="checkbox"
                      :value="item.permission"
                      v-model="permsDraft"
                    />
                    <span class="sa-permRow__meta">
                      <strong>{{ item.label }}</strong>
                      <span>{{ item.action }}</span>
                      <code>{{ item.permission }}</code>
                    </span>
                  </label>
                </div>
              </article>

              <details
                v-if="filteredUnmappedPermissions.length"
                class="sa-group sa-group--other"
                open
              >
                <summary class="sa-group__header">
                  <div>
                    <div class="sa-group__title">
                      <i class="pi pi-ellipsis-h sa-group__icon" />
                      Other Permissions
                    </div>
                    <small class="sa-muted">
                      {{ countSelectedUnmapped }} of
                      {{ filteredUnmappedPermissions.length }} selected
                    </small>
                  </div>

                  <div class="sa-group__actions">
                    <Button
                      label="Select all"
                      icon="pi pi-check-square"
                      outlined
                      @click.prevent="selectAllUnmapped"
                    />
                    <Button
                      label="Clear"
                      icon="pi pi-times"
                      outlined
                      @click.prevent="clearAllUnmapped"
                    />
                  </div>
                </summary>

                <div class="sa-group__list sa-group__list--other">
                  <label
                    v-for="p in filteredUnmappedPermissions"
                    :key="p"
                    class="sa-permOther"
                    :class="{ 'sa-permOther--checked': isPermSelected(p) }"
                  >
                    <input class="sa-check" type="checkbox" :value="p" v-model="permsDraft" />
                    <span>{{ permissionLabel(p) }}</span>
                    <code>{{ p }}</code>
                  </label>
                </div>
              </details>
            </div>
          </section>

          <section class="sa-section">
            <div class="sa-section__header">
              <div>
                <div class="sa-section__title">Effective Permissions</div>
                <div class="sa-muted">
                  This is the final access after roles and direct permissions are combined.
                </div>
              </div>
            </div>

            <div v-if="!store.selected.effective_permissions.length" class="sa-muted">
              No effective permissions.
            </div>

            <div v-else class="sa-effective">
              <article v-for="group in effectiveGroups" :key="group.id" class="sa-effectiveGroup">
                <div class="sa-effectiveGroup__title">{{ group.label }}</div>
                <div class="sa-effectiveGroup__items">
                  <div v-for="p in group.permissions" :key="p.key" class="sa-effItem">
                    <span>
                      <strong>{{ p.label }}</strong>
                      <code>{{ p.permission }}</code>
                    </span>
                    <span v-if="p.source === 'direct'" class="sa-badge sa-badge--direct"
                      >Direct</span
                    >
                    <span v-else class="sa-badge sa-badge--role">Role</span>
                  </div>
                </div>
              </article>

              <article v-if="effectiveUnmapped.length" class="sa-effectiveGroup">
                <div class="sa-effectiveGroup__title">Other</div>
                <div class="sa-effectiveGroup__items">
                  <div v-for="p in effectiveUnmapped" :key="p" class="sa-effItem">
                    <span>
                      <strong>{{ permissionLabel(p) }}</strong>
                      <code>{{ p }}</code>
                    </span>
                    <span class="sa-badge sa-badge--role">Effective</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div v-else class="sa-empty">
          <i class="pi pi-user sa-empty__icon" />
          <div class="sa-empty__text">Select an employee from the left to manage access.</div>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import "./SystemAccessPage.css"

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
  roleLabel,

  permsDraft,
  permissionQuery,
  selectedDirectCount,
  selectedRoleCount,
  effectiveCount,
  permissionLabel,
  isPermSelected,

  permissionGroups,
  filteredPermissionGroups,
  filteredUnmappedPermissions,

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
  saveAllAccess,

  init,
} = useSystemAccessPage()

onMounted(async () => {
  await init()
})
</script>
