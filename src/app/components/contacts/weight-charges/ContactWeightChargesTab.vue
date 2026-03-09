<script setup lang="ts">
import "./ContactWeightCharges.css"

import { computed, nextTick, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import Button from "primevue/button"
import Calendar from "primevue/calendar"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import { useContactStore } from "@/app/stores/contact"
import type {
  ContactChargeBreakPayload,
  ContactChargeRowPayload,
  ContactChargeTable,
  ContactChargeTablePayload,
} from "@/app/types/contact"

type WeightBreak = {
  id: number
  label: string
  min: number
  max: number
}

type ChargeRow = {
  id: number
  description: string
  values: number[]
}

type ChargeTableListItem = {
  id: number
  name: string
}

const route = useRoute()
const confirm = useConfirm()
const toast = useToast()
const contactStore = useContactStore()

const contactId = computed(() => Number(route.params.id))

const loadingTables = computed(() => contactStore.chargeTablesLoading)
const loadingCurrentTable = computed(() => contactStore.currentChargeTableLoading)

const tables = computed<ChargeTableListItem[]>(() =>
  (contactStore.chargeTables ?? []).map(table => ({
    id: table.id,
    name: table.name,
  })),
)

const activeTableId = ref<number | null>(null)
const newTableName = ref("")
const saving = ref(false)
const isHydrating = ref(false)

const validityDate = ref<Date | null>(null)
const currency = ref("GBP")
const tableTitle = ref("Main Collection Charges")

const nextBreakId = ref(-1)
const nextChargeId = ref(-1)

const weightBreaks = ref<WeightBreak[]>([])
const charges = ref<ChargeRow[]>([])

let autosaveTimer: ReturnType<typeof setTimeout> | null = null

function defaultWeightBreaks(): WeightBreak[] {
  return [
    { id: 1, label: "Minimum", min: 0, max: 49 },
    { id: 2, label: "+50 kgs", min: 50, max: 100 },
    { id: 3, label: "+100 kgs", min: 100, max: 250 },
    { id: 4, label: "+250 kgs", min: 250, max: 500 },
    { id: 5, label: "+500 kgs", min: 500, max: 1000 },
  ]
}

function defaultCharges(): ChargeRow[] {
  return [
    { id: 1, description: "Collection Charges", values: [45.0, 1.1, 0.9, 0.8, 0.7] },
    { id: 2, description: "Additional Handling", values: [0.0, 0.01, 0.01, 0.01, 0.01] },
    { id: 3, description: "Weekend Surcharge", values: [0.0, 0.02, 0.02, 0.01, 0.01] },
  ]
}

function resetLocalState() {
  tableTitle.value = "Main Collection Charges"
  currency.value = "GBP"
  validityDate.value = null
  weightBreaks.value = defaultWeightBreaks()
  charges.value = defaultCharges()
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDateForApi(value: Date | null): string | null {
  if (!value || Number.isNaN(value.getTime())) return null

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function currentCurrencySymbol() {
  if (currency.value === "USD") return "$"
  if (currency.value === "EUR") return "€"
  return "£"
}

async function hydrateFromTable(table: ContactChargeTable | null) {
  isHydrating.value = true

  if (!table) {
    resetLocalState()
    await nextTick()
    isHydrating.value = false
    return
  }

  tableTitle.value = table.name || "Main Collection Charges"
  currency.value = table.currency_code || "GBP"
  validityDate.value = parseDate(table.valid_until)

  const sortedBreaks = [...(table.breaks ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const sortedRows = [...(table.rows ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  weightBreaks.value =
    sortedBreaks.length > 0
      ? sortedBreaks.map(item => ({
          id: item.id,
          label: item.label,
          min: Number(item.min_value ?? 0),
          max: Number(item.max_value ?? 0),
        }))
      : defaultWeightBreaks()

  charges.value =
    sortedRows.length > 0
      ? sortedRows.map(row => ({
          id: row.id,
          description: row.description,
          values: (sortedBreaks.length > 0 ? sortedBreaks : defaultWeightBreaks()).map(
            breakItem => {
              const match = row.values?.find(value => value.charge_break_id === breakItem.id)
              return Number(match?.amount ?? 0)
            },
          ),
        }))
      : defaultCharges()

  await nextTick()
  isHydrating.value = false
}

function buildPayload(nameOverride?: string): ContactChargeTablePayload {
  const finalName = (nameOverride ?? tableTitle.value).trim() || "Main Collection Charges"

  const breaks: ContactChargeBreakPayload[] = weightBreaks.value.map((item, index) => ({
    label: item.label?.trim() || `Break ${index + 1}`,
    min_value: Number(item.min ?? 0),
    max_value: Number(item.max ?? 0),
    unit: "kg",
    sort_order: index + 1,
  }))

  const rows: ContactChargeRowPayload[] = charges.value.map((row, rowIndex) => ({
    description: row.description?.trim() || "New Charge",
    value_type: "money",
    charge_basis: "flat",
    is_required: false,
    sort_order: rowIndex + 1,
    values: weightBreaks.value.map((_, breakIndex) => ({
      break_sort_order: breakIndex + 1,
      amount: Number(row.values[breakIndex] ?? 0),
    })),
  }))

  return {
    name: finalName,
    charge_type: "weight_break",
    applies_to: "collection",
    currency_code: currency.value,
    valid_until: formatDateForApi(validityDate.value),
    is_active: true,
    is_default: tables.value.length <= 1,
    sort_order: 1,
    notes: null,
    breaks,
    rows,
  }
}

async function fetchTables() {
  await contactStore.fetchChargeTables(contactId.value, {
    charge_type: "weight_break",
  })
}

async function ensureAtLeastOneTable() {
  await fetchTables()

  if (contactStore.chargeTables.length > 0) {
    return
  }

  const created = await contactStore.createChargeTable(contactId.value, {
    ...buildPayload("Main Collection Charges"),
    is_default: true,
  })

  activeTableId.value = created.id
  await hydrateFromTable(created)
}

async function selectTable(table: ChargeTableListItem) {
  activeTableId.value = table.id
  const loaded = await contactStore.loadChargeTable(contactId.value, table.id)
  await hydrateFromTable(loaded)
}

async function createTable() {
  const name = newTableName.value.trim()
  if (!name) return

  try {
    const created = await contactStore.createChargeTable(contactId.value, buildPayload(name))
    activeTableId.value = created.id
    newTableName.value = ""
    await hydrateFromTable(created)

    toast.add({
      severity: "success",
      summary: "Created",
      detail: "Charge table created successfully",
      life: 2500,
    })
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Failed to create table",
      detail: error?.response?.data?.message || error?.message || "Something went wrong.",
      life: 4000,
    })
  }
}

function deleteCurrentTable() {
  if (!activeTableId.value) return
  if (tables.value.length <= 1) return

  const currentTable = tables.value.find(item => item.id === activeTableId.value)
  if (!currentTable) return

  confirm.require({
    header: "Delete Table",
    message: `Are you sure you want to delete "${currentTable.name}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await contactStore.removeChargeTable(contactId.value, currentTable.id)

        const firstTable = contactStore.chargeTables[0]
        if (firstTable) {
          activeTableId.value = firstTable.id
          const loaded = await contactStore.loadChargeTable(contactId.value, firstTable.id)
          await hydrateFromTable(loaded)
        } else {
          await ensureAtLeastOneTable()
        }

        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: "Charge table deleted successfully",
          life: 2500,
        })
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Failed to delete table",
          detail: error?.response?.data?.message || error?.message || "Something went wrong.",
          life: 4000,
        })
      }
    },
  })
}

async function saveCurrentTableSilently() {
  if (!activeTableId.value || isHydrating.value) return

  saving.value = true

  try {
    const payload = buildPayload()

    const updated = await contactStore.updateChargeTable(
      contactId.value,
      activeTableId.value,
      payload,
    )

    if (updated?.name) {
      tableTitle.value = updated.name
    }

    await contactStore.fetchChargeTables(contactId.value, {
      charge_type: "weight_break",
    })

    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "Charge table auto-saved",
      life: 1200,
    })
  } catch (error: any) {
    console.error("AUTOSAVE FAILED", error)

    toast.add({
      severity: "error",
      summary: "Auto-save failed",
      detail: error?.response?.data?.message || error?.message || "Something went wrong.",
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}

function queueAutosave() {
  if (!activeTableId.value || isHydrating.value) return

  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
  }

  autosaveTimer = setTimeout(async () => {
    await saveCurrentTableSilently()
  }, 700)
}

function addWeightBreak() {
  const last = weightBreaks.value[weightBreaks.value.length - 1]
  const start = last ? last.max : 0
  const end = start + 100

  weightBreaks.value.push({
    id: nextBreakId.value--,
    label: `+${start} kgs`,
    min: start,
    max: end,
  })

  charges.value.forEach(row => {
    row.values.push(0)
  })
}

function removeWeightBreak(id: number) {
  const index = weightBreaks.value.findIndex(item => item.id === id)
  if (index === -1) return
  if (weightBreaks.value.length <= 1) return

  weightBreaks.value.splice(index, 1)

  charges.value.forEach(row => {
    row.values.splice(index, 1)
  })
}

function addCharge() {
  charges.value.push({
    id: nextChargeId.value--,
    description: "New Charge",
    values: weightBreaks.value.map(() => 0),
  })
}

function confirmDeleteCharge(chargeId: number) {
  const row = charges.value.find(item => item.id === chargeId)
  if (!row) return

  confirm.require({
    header: "Delete Charge",
    message: `Are you sure you want to delete "${row.description}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: () => {
      charges.value = charges.value.filter(item => item.id !== chargeId)
    },
  })
}

watch(
  () => contactStore.currentChargeTable,
  async table => {
    if (table) {
      await hydrateFromTable(table)
    }
  },
)

const autosaveSnapshot = computed(() =>
  JSON.stringify({
    activeTableId: activeTableId.value,
    tableTitle: tableTitle.value,
    currency: currency.value,
    valid_until: formatDateForApi(validityDate.value),
    weightBreaks: weightBreaks.value,
    charges: charges.value,
  }),
)

watch(autosaveSnapshot, () => {
  queueAutosave()
})

onMounted(async () => {
  await ensureAtLeastOneTable()

  const firstTable = contactStore.chargeTables[0]
  if (firstTable) {
    activeTableId.value = firstTable.id
    const loaded = await contactStore.loadChargeTable(contactId.value, firstTable.id)
    await hydrateFromTable(loaded)
  }
})
</script>

<template>
  <div class="weightCharges">
    <div class="weightCharges__top">
      <div class="weightCharges__titleWrap">
        <h2 class="weightCharges__title">Weight Break Collection Charges</h2>
        <p class="weightCharges__subtitle">
          Create and manage weight-based charge tables for collection calculations
        </p>
      </div>
    </div>

    <section class="wcCard">
      <div class="wcSplit">
        <div class="wcSplit__col">
          <div class="wcSectionTitle">Create New Weight Break Table</div>

          <input
            v-model="newTableName"
            type="text"
            class="wcInput"
            placeholder="Enter table name..."
          />

          <Button
            label="Create New Table"
            icon="pi pi-plus"
            class="btn btn--primary wcBtn wcBtn--block"
            :disabled="!newTableName.trim()"
            @click="createTable"
          />

          <Button
            label="Delete Current Table"
            icon="pi pi-trash"
            class="p-button-outlined wcBtn wcBtn--danger wcBtn--block"
            :disabled="!activeTableId || tables.length <= 1"
            @click="deleteCurrentTable"
          />
        </div>

        <div class="wcSplit__col">
          <div class="wcSplit__head">
            <div class="wcSectionTitle">Weight Break Tables</div>
            <div class="wcCount">
              <span v-if="loadingTables">Loading...</span>
              <span v-else>{{ tables.length }} tables</span>
            </div>
          </div>

          <button
            v-for="table in tables"
            :key="table.id"
            type="button"
            class="wcTableListItem"
            :class="{ 'wcTableListItem--active': table.id === activeTableId }"
            @click="selectTable(table)"
          >
            <span>{{ table.name }}</span>
            <i class="pi pi-pencil"></i>
          </button>
        </div>
      </div>
    </section>

    <section class="wcCard">
      <div class="wcValidity">
        <div class="wcValidity__left">
          <div class="wcSectionTitle wcSectionTitle--icon">
            <i class="pi pi-calendar"></i>
            <span>Validity Date</span>
          </div>

          <div class="wcValidity__row">
            <span class="wcLabel">These charges are valid until:</span>

            <Calendar
              v-model="validityDate"
              showIcon
              iconDisplay="input"
              dateFormat="dd/mm/yy"
              class="wcCalendar"
            />

            <span class="wcHint">Charges become null and void after this date</span>
          </div>
        </div>

        <div class="wcValidity__status">
          <span v-if="saving">Saving...</span>
          <span v-else-if="loadingCurrentTable">Loading...</span>
          <span v-else>Valid</span>
        </div>
      </div>
    </section>

    <div class="wcToolbar">
      <Button
        label="Add Weight Break"
        icon="pi pi-plus"
        class="btn btn--primary wcBtn"
        :disabled="!activeTableId"
        @click="addWeightBreak"
      />
    </div>

    <section class="wcCard">
      <div class="wcPanelHead">
        <div class="wcSectionTitle wcSectionTitle--icon">
          <i class="pi pi-briefcase"></i>
          <span>Custom Weight Breaks</span>
          <i class="pi pi-chevron-down wcChevron"></i>
        </div>
      </div>

      <p class="wcHelpText">
        Define custom weight ranges for your collection charges. Each break will create a column in
        the charges table.
      </p>

      <div class="wcBreaks">
        <div v-for="weightBreak in weightBreaks" :key="weightBreak.id" class="wcBreakCard">
          <div class="wcBreakCard__head">
            <span>{{ weightBreak.label }}</span>
            <div class="wcBreakCard__icons">
              <i class="pi pi-pencil"></i>
              <i class="pi pi-times" @click="removeWeightBreak(weightBreak.id)"></i>
            </div>
          </div>

          <div class="wcBreakCard__fields">
            <div class="wcMiniField">
              <label>Min (kg)</label>
              <input v-model.number="weightBreak.min" type="number" />
            </div>

            <div class="wcMiniField">
              <label>Max (kg)</label>
              <input v-model.number="weightBreak.max" type="number" />
            </div>
          </div>

          <div class="wcBreakCard__foot">{{ weightBreak.min }} kg - {{ weightBreak.max }} kg</div>
        </div>
      </div>
    </section>

    <section class="wcCard wcCard--tight">
      <div class="wcMetaRow">
        <div class="wcMetaRow__field wcMetaRow__field--grow">
          <label class="wcMetaLabel">Table Title</label>
          <input v-model="tableTitle" type="text" class="wcInput" />
        </div>

        <div class="wcMetaRow__field wcMetaRow__field--currency">
          <label class="wcMetaLabel">Select Currency</label>

          <div class="wcCurrencyWrap">
            <select v-model="currency" class="wcSelect">
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>

            <div class="wcCurrencySymbol">
              {{ currentCurrencySymbol() }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="wcCard wcCard--notice">
      <div class="wcNotice">
        Current Currency:
        {{ currency }}
        - All charges are displayed in this currency.
      </div>
    </section>

    <section class="wcCard">
      <div class="wcTableWrap">
        <table class="wcChargeTable">
          <thead>
            <tr>
              <th rowspan="2" class="is-description">Description</th>
              <th rowspan="2" class="is-actions">Actions</th>
              <th :colspan="weightBreaks.length" class="is-group">
                {{ tableTitle || "Main Collection Charges" }}
              </th>
            </tr>
            <tr>
              <th v-for="weightBreak in weightBreaks" :key="weightBreak.id">
                <div class="wcThMain">{{ weightBreak.label }}</div>
                <div class="wcThSub">{{ weightBreak.min }} - {{ weightBreak.max }} kg</div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="charge in charges" :key="charge.id">
              <td>
                <input
                  v-model="charge.description"
                  class="wcCellInput wcCellInput--text"
                  type="text"
                />
              </td>

              <td>
                <Button
                  type="button"
                  icon="pi pi-trash"
                  class="p-button-text wcRowDeleteBtn"
                  @click="confirmDeleteCharge(charge.id)"
                />
              </td>

              <td v-for="(_, index) in weightBreaks" :key="index">
                <div class="wcMoneyInput">
                  <span>{{ currentCurrencySymbol() }}</span>
                  <input v-model.number="charge.values[index]" type="number" step="0.01" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="wcFooter">
        <Button
          label="Add New Charge"
          icon="pi pi-plus-circle"
          class="p-button-outlined wcBtn wcBtn--footer"
          :disabled="!activeTableId"
          @click="addCharge"
        />
      </div>
    </section>
  </div>
</template>
