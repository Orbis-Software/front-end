<script setup lang="ts">
import "./ContactWeightCharges.css"
import Button from "primevue/button"
import { ref } from "vue"
import { useConfirm } from "primevue/useconfirm"

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

type ChargeTable = {
  id: number
  name: string
}

const confirm = useConfirm()

const nextBreakId = ref(6)
const nextChargeId = ref(5)
const nextTableId = ref(3)

const newTableName = ref("")

const tables = ref<ChargeTable[]>([
  { id: 1, name: "Main Collection Charges" },
  { id: 2, name: "test" },
])

const activeTableId = ref(1)

const validityDate = ref<Date | null>(new Date("2026-09-06"))
const currency = ref("GBP (£)")
const tableTitle = ref("Main Collection Charges")

const weightBreaks = ref<WeightBreak[]>([
  { id: 1, label: "Minimum", min: 0, max: 49 },
  { id: 2, label: "+50 kgs", min: 50, max: 100 },
  { id: 3, label: "+100 kgs", min: 100, max: 250 },
  { id: 4, label: "+250 kgs", min: 250, max: 500 },
  { id: 5, label: "+500 kgs", min: 500, max: 1000 },
])

const charges = ref<ChargeRow[]>([
  { id: 1, description: "Collection Charges", values: [45.0, 1.1, 0.9, 0.8, 0.7] },
  { id: 2, description: "Additional Handling", values: [0.0, 0.01, 0.01, 0.01, 0.01] },
  { id: 3, description: "Weekend Surcharge", values: [0.0, 0.02, 0.02, 0.01, 0.01] },
])

function currentCurrencySymbol() {
  if (currency.value.includes("USD")) return "$"
  if (currency.value.includes("EUR")) return "€"
  return "£"
}

function createTable() {
  const name = newTableName.value.trim()
  if (!name) return

  const newId = nextTableId.value++
  tables.value.push({
    id: newId,
    name,
  })

  activeTableId.value = newId
  tableTitle.value = name
  newTableName.value = ""
}

function selectTable(table: ChargeTable) {
  activeTableId.value = table.id
  tableTitle.value = table.name
}

function deleteCurrentTable() {
  if (tables.value.length <= 1) return

  const index = tables.value.findIndex((t) => t.id === activeTableId.value)
  if (index === -1) return

  tables.value.splice(index, 1)
  activeTableId.value = tables.value[0].id
  tableTitle.value = tables.value[0].name
}

function addWeightBreak() {
  const last = weightBreaks.value[weightBreaks.value.length - 1]
  const start = last ? last.max : 0
  const end = start + 100

  weightBreaks.value.push({
    id: nextBreakId.value++,
    label: `+${start} kgs`,
    min: start,
    max: end,
  })

  charges.value.forEach((row) => {
    row.values.push(0)
  })
}

function removeWeightBreak(id: number) {
  const index = weightBreaks.value.findIndex((b) => b.id === id)
  if (index === -1) return
  if (weightBreaks.value.length <= 1) return

  weightBreaks.value.splice(index, 1)

  charges.value.forEach((row) => {
    row.values.splice(index, 1)
  })
}

function addCharge() {
  charges.value.push({
    id: nextChargeId.value++,
    description: "New Charge",
    values: weightBreaks.value.map(() => 0),
  })
}

function confirmDeleteCharge(chargeId: number) {
  const row = charges.value.find((item) => item.id === chargeId)
  if (!row) return

  confirm.require({
    header: "Delete Charge",
    message: `Are you sure you want to delete "${row.description}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: () => {
      charges.value = charges.value.filter((item) => item.id !== chargeId)
    },
  })
}
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
            @click="createTable"
          />

          <Button
            label="Delete Current Table"
            icon="pi pi-trash"
            class="p-button-outlined wcBtn wcBtn--danger wcBtn--block"
            @click="deleteCurrentTable"
          />
        </div>

        <div class="wcSplit__col">
          <div class="wcSplit__head">
            <div class="wcSectionTitle">Weight Break Tables</div>
            <div class="wcCount">{{ tables.length }} tables</div>
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

            <span class="wcHint">
            Charges become null and void after this date
            </span>
        </div>
        </div>

        <div class="wcValidity__status">Valid</div>
    </div>
    </section>

    <div class="wcToolbar">
      <Button
        label="Add Weight Break"
        icon="pi pi-plus"
        class="btn btn--primary wcBtn"
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
        <div
          v-for="weightBreak in weightBreaks"
          :key="weightBreak.id"
          class="wcBreakCard"
        >
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
              <input v-model="weightBreak.min" type="number" />
            </div>

            <div class="wcMiniField">
              <label>Max (kg)</label>
              <input v-model="weightBreak.max" type="number" />
            </div>
          </div>

          <div class="wcBreakCard__foot">
            {{ weightBreak.min }} kg - {{ weightBreak.max }} kg
          </div>
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
              <option>GBP (£)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
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
        Current Currency: {{ currency }} - All charges are displayed in this currency.
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
                {{ tableTitle }}
              </th>
            </tr>
            <tr>
              <th
                v-for="weightBreak in weightBreaks"
                :key="weightBreak.id"
              >
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
                  <input
                    v-model="charge.values[index]"
                    type="number"
                    step="0.01"
                  />
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
          @click="addCharge"
        />
      </div>
    </section>
  </div>
</template>