<script setup lang="ts">
import "./WmsListTable.css"
import { computed, ref } from "vue"
import Button from "primevue/button"
import { wmsTables } from "./wmsData"
import type { WmsRow } from "@/app/types/wms"

const props = defineProps<{
  tableKey: string
}>()

const search = ref("")

const config = computed(() => wmsTables[props.tableKey])

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  const rows = config.value?.rows ?? []
  if (!term) return rows

  return rows.filter(row => {
    return Object.values(row).some(value => String(value).toLowerCase().includes(term))
  })
})

function statusTone(status: string | number) {
  const value = String(status).toLowerCase()

  if (["active", "available", "in storage", "posted", "dispatched"].includes(value)) return "green"
  if (["allocated", "ready", "open", "draft", "building"].includes(value)) return "amber"
  if (["expected", "occupied"].includes(value)) return "blue"
  if (["low stock", "overdue"].includes(value)) return "red"
  if (["packed"].includes(value)) return "purple"
  return ""
}

function primaryValue(row: WmsRow) {
  const firstColumn = config.value?.columns[0]
  return firstColumn ? row[firstColumn.key] : ""
}

function exportCsv() {
  if (!config.value) return

  const table = config.value
  const headers = table.columns.map(column => column.label)
  const rows = filteredRows.value.map(row => table.columns.map(column => row[column.key] ?? ""))
  const csv = [headers, ...rows]
    .map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""').replace(/\n/g, " ")}"`).join(","),
    )
    .join("\n")

  const link = document.createElement("a")
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
  link.download = `${props.tableKey}.csv`
  link.click()
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
          :placeholder="config.searchPlaceholder"
        />
      </div>

      <div class="wms-list-table__spacer" />

      <Button class="btn btn--ghost" icon="pi pi-download" label="CSV" @click="exportCsv" />
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
            <tr v-for="row in filteredRows" :key="String(primaryValue(row))">
              <td v-for="(column, index) in config.columns" :key="column.key">
                <button v-if="index === 0" class="wms-list-table__link" type="button">
                  {{ row[column.key] }}
                </button>

                <span
                  v-else-if="column.key === config.statusKey"
                  class="wms-list-table__chip"
                  :class="`wms-list-table__chip--${statusTone(row[column.key] ?? '')}`"
                >
                  {{ row[column.key] }}
                </span>

                <span v-else>{{ row[column.key] }}</span>
              </td>

              <td>
                <div class="wms-list-table__actions">
                  <Button class="btn btn--ghost" label="View" />
                  <Button class="btn btn--primary" label="Process" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!filteredRows.length" class="wms-list-table__empty">No records found.</div>
    </div>
  </section>
</template>
