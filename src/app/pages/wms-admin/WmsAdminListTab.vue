<script setup lang="ts">
import "@/app/pages/wms/shared/WmsListTable.css"
import { computed, reactive, ref } from "vue"
import Button from "primevue/button"
import { wmsAdminLists } from "@/app/pages/wms/shared/wmsData"
import type { WmsRow } from "@/app/types/wms"

const props = defineProps<{
  listKey: string
}>()

const search = ref("")
const editingId = ref<string | null>(null)
const draft = reactive<Record<string, string>>({})

const config = computed(() => wmsAdminLists[props.listKey])

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  const rows = config.value?.rows ?? []
  if (!term) return rows

  return rows.filter(row =>
    Object.values(row).some(value => String(value).toLowerCase().includes(term)),
  )
})

const isEditing = computed(() => editingId.value !== null)

function resetDraft() {
  Object.keys(draft).forEach(key => delete draft[key])
  config.value?.columns.forEach(column => {
    draft[column.key] = ""
  })
}

function addRow() {
  editingId.value = ""
  resetDraft()
}

function editRow(row: WmsRow) {
  editingId.value = String(row.id)
  resetDraft()
  config.value?.columns.forEach(column => {
    draft[column.key] = String(row[column.key] ?? "")
  })
}

function cancelEdit() {
  editingId.value = null
  resetDraft()
}

function saveRow() {
  if (!config.value) return

  const primary = config.value.primaryKey
  if (!draft[primary]?.trim()) return

  if (editingId.value) {
    const row = config.value.rows.find(item => String(item.id) === editingId.value)
    if (row) {
      config.value.columns.forEach(column => {
        row[column.key] = draft[column.key] ?? ""
      })
    }
  } else {
    const row: WmsRow = { id: `${props.listKey}-${Date.now()}` }
    config.value.columns.forEach(column => {
      row[column.key] = draft[column.key] ?? ""
    })
    config.value.rows.unshift(row)
  }

  cancelEdit()
}

function deleteRow(row: WmsRow) {
  if (!config.value) return
  const index = config.value.rows.findIndex(item => String(item.id) === String(row.id))
  if (index >= 0) config.value.rows.splice(index, 1)
}
</script>

<template>
  <section v-if="config" class="wms-list-table">
    <div class="wms-list-table__toolbar">
      <div class="wms-list-table__search-wrap">
        <i class="pi pi-search wms-list-table__search-icon" />
        <input
          v-model="search"
          class="wms-list-table__search"
          :placeholder="`Search ${config.title.toLowerCase()}...`"
        />
      </div>

      <div class="wms-list-table__spacer" />

      <Button
        class="btn btn--primary"
        icon="pi pi-plus"
        :label="`Add ${config.singular}`"
        @click="addRow"
      />
    </div>

    <div v-if="isEditing" class="wms-list-table__table-card">
      <div class="wms-admin-form">
        <label v-for="column in config.columns" :key="column.key" class="wms-admin-form__field">
          <span>{{ column.label }}</span>
          <input v-model="draft[column.key]" />
        </label>

        <div class="wms-admin-form__actions">
          <Button class="btn btn--ghost" label="Cancel" @click="cancelEdit" />
          <Button class="btn btn--primary" label="Save" @click="saveRow" />
        </div>
      </div>
    </div>

    <div class="wms-list-table__table-card">
      <div class="wms-list-table__scroll">
        <table class="wms-list-table__table">
          <thead>
            <tr>
              <th v-for="column in config.columns" :key="column.key">{{ column.label }}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in filteredRows" :key="String(row.id)">
              <td v-for="(column, index) in config.columns" :key="column.key">
                <button v-if="index === 0" class="wms-list-table__link" type="button">
                  {{ row[column.key] }}
                </button>
                <span v-else>{{ row[column.key] }}</span>
              </td>

              <td>
                <div class="wms-list-table__actions">
                  <Button class="btn btn--ghost" label="Edit" @click="editRow(row)" />
                  <Button class="btn btn--ghost" label="Delete" @click="deleteRow(row)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!filteredRows.length" class="wms-list-table__empty">No entries yet.</div>
    </div>
  </section>
</template>

<style scoped>
.wms-admin-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 16px;
}

.wms-admin-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  color: #262626;
}

.wms-admin-form__field input {
  height: 40px;
  border: 1px solid #c7c7c7;
  border-radius: 8px;
  padding: 0 12px;
}

.wms-admin-form__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 900px) {
  .wms-admin-form {
    grid-template-columns: 1fr;
  }
}
</style>
