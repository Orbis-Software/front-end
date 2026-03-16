<script setup lang="ts">
import "./ContactCustomerCharges.css"

import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import Button from "primevue/button"
import Calendar from "primevue/calendar"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"

import { useContactStore } from "@/app/stores/contact"
import type { ContactChargeTable, ContactChargeTablePayload } from "@/app/types/contact"

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

const route = useRoute()
const toast = useToast()
const contactStore = useContactStore()

const contactId = computed<number | null>(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) && id > 0 ? id : null
})

const loading = computed(() => contactStore.chargeTablesLoading)
const saving = ref(false)
const deleting = ref(false)
const creating = ref(false)

const newSheetName = ref("")
const nextLineId = ref(1)

const sheets = ref<ChargeSheet[]>([])
const activeSheetId = ref<number | null>(null)

const activeSheet = computed<ChargeSheet | null>(() => {
  return sheets.value.find(sheet => sheet.id === activeSheetId.value) ?? null
})

function showSuccess(summary: string, detail: string) {
  toast.add({
    severity: "success",
    summary,
    detail,
    life: 3000,
  })
}

function showWarn(summary: string, detail: string) {
  toast.add({
    severity: "warn",
    summary,
    detail,
    life: 3500,
  })
}

function showError(summary: string, detail: string) {
  toast.add({
    severity: "error",
    summary,
    detail,
    life: 4500,
  })
}

function extractErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message ?? error?.message ?? fallback
}

function createEmptyLine(): ChargeLine {
  return {
    id: nextLineId.value++,
    description: "",
    uom: "Per Shipment",
    rate: null,
    transport_mode: "Road",
  }
}

function createEmptySheet(name = ""): ChargeSheet {
  const tempId = Date.now() + Math.floor(Math.random() * 1000)

  return {
    id: tempId,
    name,
    currency: "GBP",
    valid_until: null,
    lines: [],
  }
}

function mapChargeBasisFromUom(uom: UOM): string {
  switch (uom) {
    case "Per Shipment":
      return "per_shipment"
    case "Per KG":
      return "per_kg"
    case "Each":
      return "each"
    default:
      return "per_shipment"
  }
}

function mapUomFromChargeBasis(value: string | null | undefined): UOM {
  switch (String(value ?? "").toLowerCase()) {
    case "per_kg":
      return "Per KG"
    case "each":
      return "Each"
    case "per_shipment":
    default:
      return "Per Shipment"
  }
}

function mapCurrency(value: string | null | undefined): CurrencyCode {
  const currency = String(value ?? "GBP").toUpperCase()

  if (currency === "USD" || currency === "EUR") {
    return currency
  }

  return "GBP"
}

function mapTransportMode(value: string | null | undefined): TransportMode {
  const mode = String(value ?? "Road")

  if (mode === "Air" || mode === "Sea") {
    return mode
  }

  return "Road"
}

function parseDateString(value: string | null): Date | null {
  if (!value) return null

  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function normalizeApiDate(value: string | null | undefined): string | null {
  if (!value) return null
  return String(value).slice(0, 10)
}

function formatDateToYmd(value: Date | null): string | null {
  if (!value) return null

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const activeSheetValidUntilDate = computed<Date | null>({
  get() {
    return parseDateString(activeSheet.value?.valid_until ?? null)
  },
  set(value) {
    if (!activeSheet.value) return
    activeSheet.value.valid_until = formatDateToYmd(value)
  },
})

function tableToSheet(table: ContactChargeTable): ChargeSheet {
  return {
    id: Number(table.id),
    name: String(table.name ?? ""),
    currency: mapCurrency(table.currency_code),
    valid_until: normalizeApiDate(table.valid_until),
    lines: Array.isArray(table.rows)
      ? table.rows
          .slice()
          .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
          .map(row => ({
            id: Number(row.id),
            description: String(row.description ?? ""),
            uom: mapUomFromChargeBasis(row.charge_basis),
            rate:
              Array.isArray(row.values) && row.values.length > 0
                ? Number(row.values[0]?.amount ?? 0)
                : null,
            transport_mode: mapTransportMode(row.transport_mode),
          }))
      : [],
  }
}

function sheetToPayload(sheet: ChargeSheet): ContactChargeTablePayload {
  return {
    name: sheet.name.trim(),
    code: null,
    charge_type: "customer_flat",
    applies_to: "collection",
    currency_code: sheet.currency,
    valid_from: null,
    valid_until: sheet.valid_until,
    is_active: true,
    is_default: false,
    sort_order: 0,
    notes: null,
    breaks: [],
    rows: sheet.lines.map((line, index) => ({
      description: line.description.trim(),
      code: null,
      value_type: "money",
      charge_basis: mapChargeBasisFromUom(line.uom),
      transport_mode: line.transport_mode,
      is_required: false,
      sort_order: index + 1,
      values: [
        {
          charge_break_id: null,
          amount: line.rate ?? 0,
        },
      ],
    })),
  }
}

function selectSheet(id: number) {
  activeSheetId.value = id
}

function syncActiveSheetAfterDelete(previousIndex: number) {
  if (!sheets.value.length) {
    activeSheetId.value = null
    return
  }

  const fallbackIndex = Math.max(0, previousIndex - 1)
  const fallbackSheet = sheets.value[fallbackIndex] ?? sheets.value[0]
  activeSheetId.value = fallbackSheet?.id ?? null
}

async function loadSheets() {
  if (!contactId.value) return

  await contactStore.fetchChargeTables(contactId.value, {
    charge_type: "customer_flat",
    applies_to: "collection",
    is_active: true,
  })

  console.log("chargeTables from store", contactStore.chargeTables)

  sheets.value = (contactStore.chargeTables ?? []).map(tableToSheet)

  console.log("mapped sheets", sheets.value)

  const maxLineId = sheets.value.reduce((max, sheet) => {
    const lineMax = sheet.lines.reduce((rowMax, line) => Math.max(rowMax, Number(line.id) || 0), 0)
    return Math.max(max, lineMax)
  }, 0)

  nextLineId.value = maxLineId + 1

  if (!sheets.value.length) {
    activeSheetId.value = null
    return
  }

  const hasActive =
    activeSheetId.value !== null && sheets.value.some(sheet => sheet.id === activeSheetId.value)
  if (!hasActive) {
    activeSheetId.value = sheets.value[0]?.id ?? null
  }
}
function validateForCreate(name: string): boolean {
  if (!contactId.value) {
    showError(
      "Contact not found",
      "Unable to create a charge sheet because the contact could not be identified.",
    )
    return false
  }

  if (!name.trim()) {
    showWarn("Missing name", "Please enter a charge sheet name first.")
    return false
  }

  return true
}

function validateForSave(sheet: ChargeSheet): boolean {
  if (!contactId.value) {
    showError("Contact not found", "Unable to save because the contact could not be identified.")
    return false
  }

  if (!sheet.name.trim()) {
    showWarn("Missing title", "Please enter a charge sheet title.")
    return false
  }

  const hasEmptyDescription = sheet.lines.some(line => !line.description.trim())
  if (hasEmptyDescription) {
    showWarn("Incomplete lines", "Please complete all line descriptions before saving.")
    return false
  }

  return true
}

async function createSheet() {
  const name = newSheetName.value.trim()

  if (!validateForCreate(name) || !contactId.value) {
    return
  }

  creating.value = true

  try {
    const draftSheet = createEmptySheet(name)
    const payload = sheetToPayload(draftSheet)

    const created = await contactStore.createChargeTable(contactId.value, payload)
    const normalized = tableToSheet(created)

    await loadSheets()
    activeSheetId.value = normalized.id
    newSheetName.value = ""

    showSuccess("Charge sheet created", "Draft charge sheet was created successfully.")
  } catch (error: any) {
    console.error("Failed to create charge sheet:", error)
    showError("Create failed", extractErrorMessage(error, "Failed to create charge sheet."))
  } finally {
    creating.value = false
  }
}

async function saveActiveSheet() {
  const sheet = activeSheet.value

  if (!sheet) {
    showWarn("No active sheet", "Please select a charge sheet first.")
    return
  }

  if (!validateForSave(sheet) || !contactId.value) {
    return
  }

  saving.value = true

  try {
    const payload = sheetToPayload(sheet)
    const existingTable = contactStore.chargeTables.find(
      table => Number(table.id) === Number(sheet.id),
    )

    if (existingTable) {
      const updated = await contactStore.updateChargeTable(contactId.value, sheet.id, payload)
      const normalized = tableToSheet(updated)

      sheets.value = sheets.value.map(item => (item.id === sheet.id ? normalized : item))
      activeSheetId.value = normalized.id

      showSuccess("Charge sheet updated", "Customer charge sheet was updated successfully.")
    } else {
      const created = await contactStore.createChargeTable(contactId.value, payload)
      const normalized = tableToSheet(created)

      sheets.value = sheets.value.map(item => (item.id === sheet.id ? normalized : item))
      activeSheetId.value = normalized.id

      showSuccess("Charge sheet saved", "Customer charge sheet was saved successfully.")
    }

    await loadSheets()
  } catch (error: any) {
    console.error("Failed to save charge sheet:", error)
    showError("Save failed", extractErrorMessage(error, "Failed to save charge sheet."))
  } finally {
    saving.value = false
  }
}

async function deleteSheet() {
  const sheet = activeSheet.value
  if (!sheet) {
    showWarn("No active sheet", "Please select a charge sheet first.")
    return
  }

  const existingTable = contactStore.chargeTables.find(
    table => Number(table.id) === Number(sheet.id),
  )

  const previousIndex = sheets.value.findIndex(item => item.id === sheet.id)

  deleting.value = true

  try {
    if (existingTable && contactId.value) {
      await contactStore.removeChargeTable(contactId.value, sheet.id)
    }

    sheets.value = sheets.value.filter(item => item.id !== sheet.id)
    syncActiveSheetAfterDelete(previousIndex)

    if (existingTable) {
      await loadSheets()
      showSuccess("Charge sheet deleted", "Customer charge sheet was deleted successfully.")
    } else {
      showSuccess("Draft removed", "Unsaved charge sheet draft was removed.")
    }
  } catch (error: any) {
    console.error("Failed to delete charge sheet:", error)
    showError("Delete failed", extractErrorMessage(error, "Failed to delete charge sheet."))
  } finally {
    deleting.value = false
  }
}

function addLine() {
  if (!activeSheet.value) return

  activeSheet.value.lines.push(createEmptyLine())
}

function removeLine(id: number) {
  if (!activeSheet.value) return

  activeSheet.value.lines = activeSheet.value.lines.filter(line => line.id !== id)
}

watch(
  () => route.params.id,
  async () => {
    sheets.value = []
    activeSheetId.value = null
    contactStore.clearCurrentChargeTable()
    await loadSheets()
  },
)

onMounted(async () => {
  await loadSheets()
})
</script>

<template>
  <div class="customer-charges">
    <Toast />

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

            <Button
              type="button"
              :label="creating ? 'Creating...' : '+ Create New Sheet'"
              class="btn btn--primary"
              :disabled="creating"
              @click="createSheet"
            />

            <Button
              type="button"
              :label="deleting ? 'Deleting...' : 'Delete Current Sheet'"
              class="btn btn--danger"
              :disabled="!activeSheet || deleting"
              @click="deleteSheet"
            />
          </div>

          <div class="sheet-panel">
            <div class="sheet-panel__top">
              <div class="section-kicker">Customer Charge Sheets</div>
              <span class="sheet-count">
                {{ sheets.length }} sheet{{ sheets.length > 1 ? "s" : "" }}
              </span>
            </div>

            <div v-if="loading" class="sheet-list-empty">Loading charge sheets...</div>

            <div v-else-if="!sheets.length" class="sheet-list-empty">
              No customer charge sheets yet.
            </div>

            <div v-else class="sheet-list">
              <button
                v-for="sheet in sheets"
                :key="sheet.id"
                type="button"
                :class="['sheet-item', { active: sheet.id === activeSheetId }]"
                @click="selectSheet(sheet.id)"
              >
                <span>{{ sheet.name || "Untitled Sheet" }}</span>
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
              <Calendar
                v-model="activeSheetValidUntilDate"
                dateFormat="yy-mm-dd"
                showIcon
                input-class="form-control form-control--date"
                class="customer-charges__calendar"
                placeholder="Select valid until date"
              />
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
                  <tr v-if="!activeSheet.lines.length">
                    <td colspan="6" class="table-empty">
                      No charge lines yet. Click “Add New Charge Line”.
                    </td>
                  </tr>

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
                        v-model.number="line.rate"
                        type="number"
                        step="0.01"
                        class="form-control form-control--table"
                      />
                    </td>

                    <td>
                      <select
                        v-model="line.transport_mode"
                        class="form-control form-control--table"
                      >
                        <option>Road</option>
                        <option>Air</option>
                        <option>Sea</option>
                      </select>
                    </td>

                    <td>
                      <button type="button" class="delete-line" @click="removeLine(line.id)">
                        🗑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-actions">
              <Button
                type="button"
                label="+ Add New Charge Line"
                class="btn btn--ghost"
                @click="addLine"
              />
            </div>
          </div>

          <div class="content-section">
            <div class="save-actions">
              <Button
                type="button"
                :label="saving ? 'Saving...' : 'Save Charge Sheet'"
                class="btn btn--primary"
                :disabled="saving"
                @click="saveActiveSheet"
              />
            </div>
          </div>
        </div>

        <div v-else class="content-empty">Create or select a customer charge sheet to begin.</div>
      </div>
    </div>
  </div>
</template>
