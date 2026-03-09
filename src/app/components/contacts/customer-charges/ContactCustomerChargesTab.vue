<script setup lang="ts">
import "./ContactCustomerCharges.css"

import { computed, ref } from "vue"

type CurrencyCode = "GBP" | "USD" | "EUR"
type TransportMode = "Road" | "Air" | "Sea"
type UOM = "Per Shipment" | "Per KG" | "Each"

type ChargeLine = {
  id: number
  description: string
  uom: UOM
  rate: number | null
  transport_mode: TransportMode
}

type ChargeSheet = {
  id: number
  name: string
  currency: CurrencyCode
  valid_until: string | null
  lines: ChargeLine[]
}

const newSheetName = ref("")
const nextSheetId = ref(2)
const nextLineId = ref(4)

const sheets = ref<ChargeSheet[]>([
  {
    id: 1,
    name: "test",
    currency: "GBP",
    valid_until: "2026-09-06",
    lines: [
      {
        id: 1,
        description: "Road Freight",
        uom: "Per Shipment",
        rate: 250,
        transport_mode: "Road",
      },
      {
        id: 2,
        description: "Fuel Surcharge",
        uom: "Per KG",
        rate: 0.15,
        transport_mode: "Road",
      },
      {
        id: 3,
        description: "ADR Inspection",
        uom: "Each",
        rate: 85,
        transport_mode: "Road",
      },
    ],
  },
])

const activeSheetId = ref(1)

const activeSheet = computed(() =>
  sheets.value.find(s => s.id === activeSheetId.value),
)

function selectSheet(id: number) {
  activeSheetId.value = id
}

function createSheet() {
  if (!newSheetName.value.trim()) return

  const sheet: ChargeSheet = {
    id: nextSheetId.value++,
    name: newSheetName.value.trim(),
    currency: "GBP",
    valid_until: null,
    lines: [],
  }

  sheets.value.push(sheet)
  activeSheetId.value = sheet.id
  newSheetName.value = ""
}

function deleteSheet() {
  if (sheets.value.length <= 1) return

  const index = sheets.value.findIndex(s => s.id === activeSheetId.value)
  if (index === -1) return

  sheets.value.splice(index, 1)

  const firstSheet = sheets.value[0]
  if (firstSheet) {
    activeSheetId.value = firstSheet.id
  }
}

function addLine() {
  if (!activeSheet.value) return

  activeSheet.value.lines.push({
    id: nextLineId.value++,
    description: "",
    uom: "Per Shipment",
    rate: null,
    transport_mode: "Road",
  })
}

function removeLine(id: number) {
  if (!activeSheet.value) return
  activeSheet.value.lines = activeSheet.value.lines.filter(l => l.id !== id)
}
</script>

<template>
  <div class="customer-charges">
    <div class="customer-charges__card">
      <div class="customer-charges__header">
        <div>
          <h3>Customer Charges Sheet</h3>
          <p>Create itemized charge sheets for individual customers with custom line items</p>
        </div>
      </div>

      <div class="customer-charges__body">
        <div class="sheet-grid">
          <div class="sheet-panel">
            <div class="section-kicker">Create New Customer Charge Sheet</div>

            <input
              v-model="newSheetName"
              class="form-control"
              placeholder="Enter customer name or charge sheet name..."
              @keydown.enter.prevent="createSheet"
            />

            <button class="btn btn--primary" @click="createSheet">
              + Create New Sheet
            </button>

            <button class="btn btn--danger" @click="deleteSheet">
              Delete Current Sheet
            </button>
          </div>

          <div class="sheet-panel">
            <div class="sheet-panel__top">
              <div class="section-kicker">Customer Charge Sheets</div>
              <span class="sheet-count">{{ sheets.length }} sheet{{ sheets.length > 1 ? "s" : "" }}</span>
            </div>

            <div class="sheet-list">
              <button
                v-for="sheet in sheets"
                :key="sheet.id"
                :class="['sheet-item', { active: sheet.id === activeSheetId }]"
                @click="selectSheet(sheet.id)"
              >
                <span>{{ sheet.name }}</span>
                <span class="sheet-item__icon">✎</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeSheet" class="content-stack">
          <div class="content-section">
            <div class="content-section__head">
              <div class="content-section__title">Validity Date</div>
              <span class="status-badge">Active</span>
            </div>

            <div class="validity-row">
              <span class="field-note">These charges are valid until:</span>
              <input type="date" v-model="activeSheet.valid_until" class="form-control form-control--date" />
            </div>
          </div>

          <div class="content-section">
            <div class="title-row">
              <div class="field field--grow">
                <label>Customer Charge Sheet Title</label>
                <input v-model="activeSheet.name" class="form-control" />
              </div>

              <div class="field field--currency">
                <label>Select Currency</label>
                <select v-model="activeSheet.currency" class="form-control">
                  <option>GBP</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div class="content-section">
            <div class="table-toolbar">
              <div class="table-toolbar__title">Charge Lines</div>
              <div class="table-toolbar__meta">
                {{ activeSheet.lines.length }} line{{ activeSheet.lines.length > 1 ? "s" : "" }}
              </div>
            </div>

            <div class="table-wrap">
              <table class="charges-table">
                <thead>
                  <tr>
                    <th class="col-num">#</th>
                    <th>Description</th>
                    <th class="col-uom">UOM</th>
                    <th class="col-rate">Rate</th>
                    <th class="col-mode">Transport Mode</th>
                    <th class="col-actions">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(line, index) in activeSheet.lines" :key="line.id">
                    <td class="row-number">{{ index + 1 }}</td>

                    <td>
                      <input v-model="line.description" class="form-control form-control--table" />
                    </td>

                    <td>
                      <select v-model="line.uom" class="form-control form-control--table">
                        <option>Per Shipment</option>
                        <option>Per KG</option>
                        <option>Each</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        v-model="line.rate"
                        step="0.01"
                        class="form-control form-control--table"
                      />
                    </td>

                    <td>
                      <select v-model="line.transport_mode" class="form-control form-control--table">
                        <option>Road</option>
                        <option>Air</option>
                        <option>Sea</option>
                      </select>
                    </td>

                    <td>
                      <button class="delete-line" @click="removeLine(line.id)">🗑</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-actions">
              <button class="btn btn--ghost" @click="addLine">
                + Add New Charge Line
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>