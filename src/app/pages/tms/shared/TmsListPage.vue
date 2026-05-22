<script setup lang="ts">
import "./TmsListPage.css"
import { computed, ref } from "vue"
import Button from "primevue/button"
import { tmsTables } from "./tmsData"

const props = defineProps<{
  tableKey: string
}>()

const activeTab = ref("all")
const search = ref("")

const table = computed(() => tmsTables[props.tableKey])

const rows = computed(() => {
  const config = table.value
  if (!config) return []

  const query = search.value.trim().toLowerCase()

  return config.rows.filter(row => {
    const matchesTab =
      activeTab.value === "all" || String(row[config.statusKey ?? "status"]) === activeTab.value

    if (!matchesTab) return false
    if (!query) return true

    return Object.values(row).some(value => String(value).toLowerCase().includes(query))
  })
})

function exportCsv() {
  const config = table.value
  if (!config) return

  const header = config.columns.map(column => column.label).join(",")
  const body = rows.value
    .map(row =>
      config.columns
        .map(column => `"${String(row[column.key] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n")

  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${config.title.toLowerCase().replace(/\s+/g, "-")}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section v-if="table" class="tms-list-page">
    <header class="tms-list-page__header">
      <h1 class="tms-list-page__title">{{ table.title }}</h1>

      <div class="tms-list-page__header-actions">
        <div class="tms-list-page__search-wrap">
          <i class="pi pi-search tms-list-page__search-icon" />
          <input
            v-model="search"
            class="tms-list-page__search-input"
            type="search"
            :placeholder="table.searchPlaceholder"
          />
        </div>

        <Button
          class="btn btn--ghost"
          icon="pi pi-download"
          label="Export CSV"
          @click="exportCsv"
        />
        <Button class="btn btn--primary" icon="pi pi-plus" :label="table.actionLabel" />
      </div>
    </header>

    <div class="tms-list-page__card">
      <nav class="tms-list-page__tabs">
        <button
          v-for="tab in table.tabs"
          :key="tab.value"
          class="tms-list-page__tab"
          :class="{ 'tms-list-page__tab--active': activeTab === tab.value }"
          type="button"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="tms-list-page__content">
        <div class="tms-list-page__table-wrap">
          <table v-if="rows.length" class="tms-list-page__table">
            <thead>
              <tr>
                <th v-for="column in table.columns" :key="column.key">
                  {{ column.label }}
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(row, index) in rows" :key="index">
                <td v-for="(column, columnIndex) in table.columns" :key="column.key">
                  <span
                    v-if="column.key === table.statusKey"
                    class="tms-list-page__chip"
                    :class="`tms-list-page__chip--${row[column.key]}`"
                  >
                    {{ row[column.key] }}
                  </span>
                  <span v-else :class="{ 'tms-list-page__primary': columnIndex === 0 }">
                    {{ row[column.key] }}
                  </span>
                </td>
                <td>
                  <div class="tms-list-page__actions">
                    <Button text icon="pi pi-eye" label="View" />
                    <Button text icon="pi pi-pencil" label="Edit" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="tms-list-page__empty">No records found.</div>
        </div>
      </div>
    </div>
  </section>
</template>
