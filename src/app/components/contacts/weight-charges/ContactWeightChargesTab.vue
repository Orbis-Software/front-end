<script setup lang="ts">
import "./ContactWeightCharges.css"

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

import { useContactStore } from "@/app/stores/contact"
import { useReferenceDataStore } from "@/app/stores/reference-data"
import type {
  ContactChargeAutosaveChange as AutosaveChange,
  ContactChargeAutosaveSnapshot as AutosaveSnapshot,
  ContactChargeBreakPayload,
  ContactChargeMeasurementType as MeasurementType,
  ContactChargeRowMigrationResult as ChargeRowMigrationResult,
  ContactChargeRowPayload,
  ContactChargeSelectOption as SelectOption,
  ContactChargeTable,
  ContactChargeTableListItem as ChargeTableListItem,
  ContactChargeTablePayload,
  ContactWeightBreak as WeightBreak,
  ContactWeightChargeRow as ChargeRow,
} from "@/app/types/contact"

const route = useRoute()
const confirm = useConfirm()
const toast = useToast()
const contactStore = useContactStore()
const referenceDataStore = useReferenceDataStore()

const fallbackCurrencyOptions: SelectOption[] = [
  { label: "GBP", value: "GBP" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
]
const fallbackWeightUnitOptions: SelectOption[] = [
  { label: "kg", value: "kg" },
  { label: "lb", value: "lb" },
  { label: "tonne", value: "tonne" },
]
const fallbackVolumeUnitOptions: SelectOption[] = [
  { label: "CBM", value: "CBM" },
  { label: "m3", value: "m3" },
  { label: "ft3", value: "ft3" },
]
const contactId = computed<number | null>(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) && id > 0 ? id : null
})

const loadingTables = computed(() => contactStore.chargeTablesLoading)
const loadingCurrentTable = computed(() => contactStore.currentChargeTableLoading)

const tables = computed<ChargeTableListItem[]>(() =>
  (contactStore.chargeTables ?? [])
    .filter(table => table.charge_type === "weight_break")
    .map(table => ({
      id: table.id,
      name: table.name,
    })),
)

const activeTableId = ref<number | null>(null)
const newTableName = ref("")
const saving = ref(false)
const isHydrating = ref(false)
const creating = ref(false)
const deleting = ref(false)
const loadError = ref<string | null>(null)

const validityDate = ref<Date | null>(null)
const currency = ref("GBP")
const tableTitle = ref("Collection Charges")
const measurementType = ref<MeasurementType>("weight")
const weightUnit = ref("kg")
const volumeUnit = ref("CBM")

const nextBreakId = ref(-1)
const nextChargeId = ref(-1)

const weightBreaks = ref<WeightBreak[]>([])
const charges = ref<ChargeRow[]>([])

let autosaveTimer: ReturnType<typeof setTimeout> | null = null
const pendingAutosaveChanges = new Map<string, string>()
let suppressCurrentTableHydrate = false

function cleanReferenceName(value: string): string {
  return String(value ?? "")
    .replace(/\*$/, "")
    .trim()
}

function optionFromReference(option: any): SelectOption {
  const name = cleanReferenceName(option?.name ?? option?.label ?? option)

  return {
    label: name,
    value: name,
  }
}

const currencyOptions = computed<SelectOption[]>(() => {
  const category = referenceDataStore.getByKey("currency")
  const options = (category?.options ?? []).map(optionFromReference).filter(option => option.value)

  const nextOptions = options.length ? options : fallbackCurrencyOptions
  const hasSelected = nextOptions.some(option => option.value === currency.value)

  if (!currency.value || hasSelected) {
    return nextOptions
  }

  return [{ label: currency.value, value: currency.value }, ...nextOptions]
})

function referenceOptions(categoryKeys: string[], fallback: SelectOption[], selectedValue: string) {
  const options = categoryKeys.flatMap(key => {
    const category = referenceDataStore.getByKey(key)
    return (category?.options ?? []).map(optionFromReference).filter(option => option.value)
  })
  const deduped = Array.from(new Map(options.map(option => [option.value, option])).values())
  const nextOptions = deduped.length ? deduped : fallback
  const hasSelected = nextOptions.some(option => option.value === selectedValue)

  if (!selectedValue || hasSelected) return nextOptions

  return [{ label: selectedValue, value: selectedValue }, ...nextOptions]
}

const weightUnitOptions = computed<SelectOption[]>(() =>
  referenceOptions(["weight_units", "weight_unit"], fallbackWeightUnitOptions, weightUnit.value),
)
const volumeUnitOptions = computed<SelectOption[]>(() =>
  referenceOptions(["volume_units", "volume_unit"], fallbackVolumeUnitOptions, volumeUnit.value),
)
const activeMeasurementUnit = computed(() =>
  measurementType.value === "volume" ? volumeUnit.value : weightUnit.value,
)

const autosaveStatus = computed(() => {
  if (saving.value) return "Saving..."
  if (loadingCurrentTable.value) return "Loading..."
  if (activeTableId.value) return "All changes saved"
  return ""
})

function defaultWeightBreaks(): WeightBreak[] {
  return [
    { id: 1, label: "Minimum", min: 0, max: 49, unit: activeMeasurementUnit.value },
    { id: 2, label: "+50", min: 50, max: 100, unit: activeMeasurementUnit.value },
    { id: 3, label: "+100", min: 100, max: 250, unit: activeMeasurementUnit.value },
    { id: 4, label: "+250", min: 250, max: 500, unit: activeMeasurementUnit.value },
    { id: 5, label: "+500", min: 500, max: 1000, unit: activeMeasurementUnit.value },
  ]
}

function defaultCharges(): ChargeRow[] {
  return [
    { id: 1, description: "Non ADR Collection Charges", values: [45.0, 1.1, 0.9, 0.8, 0.7] },
    { id: 2, description: "ADR Collection Charges", values: [55.0, 1.25, 1.05, 0.95, 0.85] },
    { id: 3, description: "Additional Handling", values: [0.0, 0.01, 0.01, 0.01, 0.01] },
    { id: 4, description: "Weekend Surcharge", values: [0.0, 0.02, 0.02, 0.01, 0.01] },
  ]
}

function resetLocalState() {
  tableTitle.value = "Collection Charges"
  currency.value = "GBP"
  measurementType.value = "weight"
  weightUnit.value = "kg"
  volumeUnit.value = "CBM"
  validityDate.value = null
  weightBreaks.value = defaultWeightBreaks()
  charges.value = defaultCharges()
}

function parseTableNotes(notes?: string | null) {
  if (!notes) return null

  try {
    const parsed = JSON.parse(notes)
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function buildTableNotes() {
  return JSON.stringify({
    measurement_type: measurementType.value,
    weight_unit: weightUnit.value,
    volume_unit: volumeUnit.value,
  })
}

function normalizeMeasurementType(value: unknown): MeasurementType {
  return String(value ?? "").toLowerCase() === "volume" ? "volume" : "weight"
}

function normalizeChargeDescription(value: string) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function chargeDescriptionTokens(value: string) {
  return normalizeChargeDescription(value).split(" ").filter(Boolean)
}

function isCollectionChargeDescription(value: string) {
  const tokens = chargeDescriptionTokens(value)
  const compact = tokens.join("")

  return (
    tokens.includes("collection") &&
    (tokens.some(token => token === "charge" || token === "charges") ||
      compact.includes("collectioncharge"))
  )
}

function isNonAdrCollectionCharge(value: string) {
  const tokens = chargeDescriptionTokens(value)
  const compact = tokens.join("")

  return (
    isCollectionChargeDescription(value) &&
    (tokens.includes("nonadr") ||
      compact.includes("nonadr") ||
      (tokens.includes("non") && tokens.includes("adr")))
  )
}

function isAdrCollectionCharge(value: string) {
  const tokens = chargeDescriptionTokens(value)

  return (
    isCollectionChargeDescription(value) &&
    !isNonAdrCollectionCharge(value) &&
    tokens.includes("adr")
  )
}

function isMainCollectionCharge(value: string) {
  const tokens = chargeDescriptionTokens(value)

  return isCollectionChargeDescription(value) && tokens.includes("main")
}

function isLegacyCollectionCharge(value: string) {
  const tokens = chargeDescriptionTokens(value)

  return (
    isCollectionChargeDescription(value) &&
    !isMainCollectionCharge(value) &&
    !isNonAdrCollectionCharge(value) &&
    !isAdrCollectionCharge(value)
  )
}

function ensureCollectionChargeRows(rows: ChargeRow[]): ChargeRowMigrationResult {
  const nextRows = rows.map(row => ({ ...row, values: [...row.values] }))
  const nonAdrCollection = nextRows.find(row => isNonAdrCollectionCharge(row.description))
  const adrCollection = nextRows.find(row => isAdrCollectionCharge(row.description))
  const legacyCollection = nextRows.find(row => isLegacyCollectionCharge(row.description))
  const messages: string[] = []
  const fallbackValues =
    nonAdrCollection?.values ??
    adrCollection?.values ??
    legacyCollection?.values ??
    nextRows[0]?.values ??
    weightBreaks.value.map(() => 0)

  if (nonAdrCollection) {
    if (nonAdrCollection.description !== "Non ADR Collection Charges") {
      nonAdrCollection.description = "Non ADR Collection Charges"
      messages.push("Non ADR Collection Charges row label was standardized.")
    }
  } else if (legacyCollection) {
    legacyCollection.description = "Non ADR Collection Charges"
    messages.push("Collection Charges row was migrated to Non ADR Collection Charges.")
  } else {
    nextRows.unshift({
      id: nextChargeId.value--,
      description: "Non ADR Collection Charges",
      values: [...fallbackValues],
    })
    messages.push("Non ADR Collection Charges row was added.")
  }

  if (adrCollection) {
    if (adrCollection.description !== "ADR Collection Charges") {
      adrCollection.description = "ADR Collection Charges"
      messages.push("ADR Collection Charges row label was standardized.")
    }
  } else {
    const insertIndex = Math.min(1, nextRows.length)
    nextRows.splice(insertIndex, 0, {
      id: nextChargeId.value--,
      description: "ADR Collection Charges",
      values: [...fallbackValues],
    })
    messages.push("ADR Collection Charges row was added.")
  }

  return {
    rows: nextRows,
    changed: messages.length > 0,
    messages,
  }
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
  try {
    const parts = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.value || "GBP",
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0)

    return parts.find(part => part.type === "currency")?.value ?? currency.value
  } catch {
    return currency.value || "GBP"
  }
}

function sanitizeNumericInput(value: string, allowDecimal = false) {
  if (!allowDecimal) {
    return value.replace(/\D/g, "")
  }

  let sanitized = value.replace(/[^\d.]/g, "")
  const firstDecimal = sanitized.indexOf(".")

  if (firstDecimal !== -1) {
    sanitized =
      sanitized.slice(0, firstDecimal + 1) + sanitized.slice(firstDecimal + 1).replace(/\./g, "")
  }

  return sanitized.startsWith(".") ? `0${sanitized}` : sanitized
}

function updateWeightBreakValue(weightBreak: WeightBreak, field: "min" | "max", event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumericInput(input.value)

  input.value = sanitized
  weightBreak[field] = sanitized
}

function updateChargeValue(charge: ChargeRow, index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const sanitized = sanitizeNumericInput(input.value, true)

  input.value = sanitized
  charge.values[index] = sanitized
}

function parseAutosaveSnapshot(snapshot?: string): AutosaveSnapshot | null {
  if (!snapshot) return null

  try {
    return JSON.parse(snapshot) as AutosaveSnapshot
  } catch {
    return null
  }
}

function valueText(value: unknown) {
  const text = String(value ?? "").trim()
  return text || "blank"
}

function quotedValue(value: unknown) {
  return `"${valueText(value)}"`
}

function formatDateChangeValue(value: string | null) {
  return value || "no date"
}

function formatMoneyValue(value: unknown) {
  return `${currentCurrencySymbol()}${valueText(value)}`
}

function valuesMatch(left: unknown, right: unknown) {
  return String(left ?? "") === String(right ?? "")
}

function breakLabel(snapshot: AutosaveSnapshot, breakId: number) {
  return snapshot.weightBreaks.find(item => item.id === breakId)?.label || "weight break"
}

function snapshotUnit(snapshot: AutosaveSnapshot) {
  return snapshot.measurementType === "volume" ? snapshot.volumeUnit : snapshot.weightUnit
}

function summarizeAutosaveChanges(
  nextSnapshot: AutosaveSnapshot,
  previousSnapshot: AutosaveSnapshot,
) {
  const changes: AutosaveChange[] = []

  if (!valuesMatch(nextSnapshot.tableTitle, previousSnapshot.tableTitle)) {
    changes.push({
      key: "tableTitle",
      message: `Table title changed from ${quotedValue(previousSnapshot.tableTitle)} to ${quotedValue(nextSnapshot.tableTitle)}.`,
    })
  }

  if (!valuesMatch(nextSnapshot.currency, previousSnapshot.currency)) {
    changes.push({
      key: "currency",
      message: `Currency changed from ${quotedValue(previousSnapshot.currency)} to ${quotedValue(nextSnapshot.currency)}.`,
    })
  }

  if (!valuesMatch(nextSnapshot.valid_until, previousSnapshot.valid_until)) {
    changes.push({
      key: "valid_until",
      message: `Validity date changed from ${formatDateChangeValue(previousSnapshot.valid_until)} to ${formatDateChangeValue(nextSnapshot.valid_until)}.`,
    })
  }

  if (!valuesMatch(nextSnapshot.measurementType, previousSnapshot.measurementType)) {
    changes.push({
      key: "measurementType",
      message: `Measurement type changed from ${quotedValue(previousSnapshot.measurementType)} to ${quotedValue(nextSnapshot.measurementType)}.`,
    })
  }

  if (!valuesMatch(nextSnapshot.weightUnit, previousSnapshot.weightUnit)) {
    changes.push({
      key: "weightUnit",
      message: `Weight unit changed from ${quotedValue(previousSnapshot.weightUnit)} to ${quotedValue(nextSnapshot.weightUnit)}.`,
    })
  }

  if (!valuesMatch(nextSnapshot.volumeUnit, previousSnapshot.volumeUnit)) {
    changes.push({
      key: "volumeUnit",
      message: `Volume unit changed from ${quotedValue(previousSnapshot.volumeUnit)} to ${quotedValue(nextSnapshot.volumeUnit)}.`,
    })
  }

  const previousBreaksById = new Map(previousSnapshot.weightBreaks.map(item => [item.id, item]))
  const nextBreaksById = new Map(nextSnapshot.weightBreaks.map(item => [item.id, item]))

  nextSnapshot.weightBreaks.forEach(weightBreak => {
    const previousBreak = previousBreaksById.get(weightBreak.id)

    if (!previousBreak) {
      changes.push({
        key: `break:${weightBreak.id}:added`,
        message: `Added weight break ${quotedValue(weightBreak.label)}.`,
      })
      return
    }

    if (!valuesMatch(weightBreak.min, previousBreak.min)) {
      changes.push({
        key: `break:${weightBreak.id}:min`,
        message: `${weightBreak.label} minimum ${snapshotUnit(nextSnapshot)} changed from ${valueText(previousBreak.min)} to ${valueText(weightBreak.min)}.`,
      })
    }

    if (!valuesMatch(weightBreak.max, previousBreak.max)) {
      changes.push({
        key: `break:${weightBreak.id}:max`,
        message: `${weightBreak.label} maximum ${snapshotUnit(nextSnapshot)} changed from ${valueText(previousBreak.max)} to ${valueText(weightBreak.max)}.`,
      })
    }
  })

  previousSnapshot.weightBreaks.forEach(weightBreak => {
    if (nextBreaksById.has(weightBreak.id)) return

    changes.push({
      key: `break:${weightBreak.id}:removed`,
      message: `Removed weight break ${quotedValue(weightBreak.label)}.`,
    })
  })

  const previousBreakIndexById = new Map(
    previousSnapshot.weightBreaks.map((item, index) => [item.id, index]),
  )
  const nextBreakIndexById = new Map(
    nextSnapshot.weightBreaks.map((item, index) => [item.id, index]),
  )
  const previousChargesById = new Map(previousSnapshot.charges.map(item => [item.id, item]))
  const nextChargesById = new Map(nextSnapshot.charges.map(item => [item.id, item]))

  nextSnapshot.charges.forEach(charge => {
    const previousCharge = previousChargesById.get(charge.id)

    if (!previousCharge) {
      changes.push({
        key: `charge:${charge.id}:added`,
        message: `Added charge ${quotedValue(charge.description)}.`,
      })
      return
    }

    if (!valuesMatch(charge.description, previousCharge.description)) {
      changes.push({
        key: `charge:${charge.id}:description`,
        message: `Charge description changed from ${quotedValue(previousCharge.description)} to ${quotedValue(charge.description)}.`,
      })
    }

    nextSnapshot.weightBreaks.forEach(weightBreak => {
      const previousBreakIndex = previousBreakIndexById.get(weightBreak.id)
      const nextBreakIndex = nextBreakIndexById.get(weightBreak.id)

      if (previousBreakIndex === undefined || nextBreakIndex === undefined) return

      const previousValue = previousCharge.values[previousBreakIndex]
      const nextValue = charge.values[nextBreakIndex]

      if (valuesMatch(nextValue, previousValue)) return

      changes.push({
        key: `charge:${charge.id}:value:${weightBreak.id}`,
        message: `${charge.description || "Charge"} for ${breakLabel(nextSnapshot, weightBreak.id)} changed from ${formatMoneyValue(previousValue)} to ${formatMoneyValue(nextValue)}.`,
      })
    })
  })

  previousSnapshot.charges.forEach(charge => {
    if (nextChargesById.has(charge.id)) return

    changes.push({
      key: `charge:${charge.id}:removed`,
      message: `Removed charge ${quotedValue(charge.description)}.`,
    })
  })

  return changes
}

function rememberAutosaveChanges(changes: AutosaveChange[]) {
  changes.forEach(change => {
    pendingAutosaveChanges.set(change.key, change.message)
  })
}

function flushAutosaveChangeDetail() {
  const detail = Array.from(pendingAutosaveChanges.values()).join(" ")
  pendingAutosaveChanges.clear()

  return detail || "Weight charge table changes saved."
}

function showError(summary: string, error: any, fallback: string) {
  toast.add({
    severity: "error",
    summary,
    detail: error?.response?.data?.message || error?.message || fallback,
    life: 4000,
  })
}

async function hydrateFromTable(table: ContactChargeTable | null) {
  isHydrating.value = true

  if (!table) {
    resetLocalState()
    await nextTick()
    isHydrating.value = false
    return
  }

  if (contactId.value && table.contact_id && Number(table.contact_id) !== contactId.value) {
    isHydrating.value = false
    return
  }

  if (!activeTableId.value) {
    activeTableId.value = table.id
  }

  tableTitle.value = table.name || "Collection Charges"
  currency.value = table.currency_code || "GBP"
  validityDate.value = parseDate(table.valid_until)
  const notes = parseTableNotes(table.notes)
  const firstBreakUnit = table.breaks?.find(item => item.unit)?.unit
  measurementType.value = normalizeMeasurementType(
    table.measurement_type ?? notes?.measurement_type,
  )
  weightUnit.value = String(
    table.weight_unit ||
      notes?.weight_unit ||
      (measurementType.value === "weight" ? firstBreakUnit : "") ||
      "kg",
  )
  volumeUnit.value = String(
    table.volume_unit ||
      notes?.volume_unit ||
      (measurementType.value === "volume" ? firstBreakUnit : "") ||
      "CBM",
  )

  const sortedBreaks = [...(table.breaks ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const sortedRows = [...(table.rows ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  weightBreaks.value =
    sortedBreaks.length > 0
      ? sortedBreaks.map(item => ({
          id: item.id,
          label: item.label,
          min: Number(item.min_value ?? 0),
          max: Number(item.max_value ?? 0),
          unit: item.unit || activeMeasurementUnit.value,
        }))
      : defaultWeightBreaks()

  const hydratedCharges =
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
  const migratedCharges = ensureCollectionChargeRows(hydratedCharges)
  charges.value = migratedCharges.rows

  await nextTick()
  isHydrating.value = false

  if (migratedCharges.changed && contactId.value && activeTableId.value) {
    rememberAutosaveChanges([
      {
        key: "collectionChargeRows",
        message: migratedCharges.messages.join(" "),
      },
    ])
    await saveCurrentTableSilently(table.id)
  }
}

function buildPayload(nameOverride?: string): ContactChargeTablePayload {
  const finalName = (nameOverride ?? tableTitle.value).trim() || "Collection Charges"
  const unit = activeMeasurementUnit.value

  const breaks: ContactChargeBreakPayload[] = weightBreaks.value.map((item, index) => ({
    label: item.label?.trim() || `Break ${index + 1}`,
    min_value: Number(item.min ?? 0),
    max_value: Number(item.max ?? 0),
    unit,
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
    measurement_type: measurementType.value,
    weight_unit: weightUnit.value,
    volume_unit: volumeUnit.value,
    valid_until: formatDateForApi(validityDate.value),
    is_active: true,
    is_default: tables.value.length === 0,
    sort_order: 1,
    notes: buildTableNotes(),
    breaks,
    rows,
  }
}

async function fetchTables() {
  if (!contactId.value) return []

  const fetched = await contactStore.fetchChargeTables(contactId.value, {
    charge_type: "weight_break",
    applies_to: "collection",
    is_active: true,
  })

  return fetched.filter(table => table.charge_type === "weight_break")
}

async function ensureAtLeastOneTable() {
  if (!contactId.value) return null

  const existingTables = await fetchTables()

  if (existingTables.length > 0) {
    return existingTables[0]
  }

  resetLocalState()

  const created = await contactStore.createChargeTable(contactId.value, {
    ...buildPayload("Collection Charges"),
    is_default: true,
  })

  await fetchTables()
  activeTableId.value = created.id
  await hydrateFromTable(created)
  return created
}

async function selectTable(table: ChargeTableListItem) {
  if (!contactId.value) return

  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
  }
  isHydrating.value = true
  activeTableId.value = table.id
  const loaded = await contactStore.loadChargeTable(contactId.value, table.id)
  await hydrateFromTable(loaded)
}

async function createTable() {
  const name = newTableName.value.trim()
  if (!name) return

  creating.value = true

  try {
    if (!contactId.value) {
      throw new Error(
        "Unable to create a charge table because the contact could not be identified.",
      )
    }

    const created = await contactStore.createChargeTable(contactId.value, buildPayload(name))
    await fetchTables()
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
    showError("Failed to create table", error, "Something went wrong.")
  } finally {
    creating.value = false
  }
}

function deleteCurrentTable() {
  if (!activeTableId.value) return

  const currentTable = tables.value.find(item => item.id === activeTableId.value)
  if (!currentTable) return

  confirm.require({
    header: "Delete Table",
    message: `Are you sure you want to delete "${currentTable.name}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: async () => {
      deleting.value = true

      try {
        if (!contactId.value) {
          throw new Error(
            "Unable to delete a charge table because the contact could not be identified.",
          )
        }

        await contactStore.removeChargeTable(contactId.value, currentTable.id)
        const remainingTables = await fetchTables()

        const firstTable = remainingTables[0]
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
        showError("Failed to delete table", error, "Something went wrong.")
      } finally {
        deleting.value = false
      }
    },
  })
}

async function saveCurrentTableSilently(tableId = activeTableId.value) {
  if (!contactId.value || !tableId || isHydrating.value) return

  saving.value = true

  try {
    const payload = buildPayload()

    suppressCurrentTableHydrate = true
    const updated = await contactStore.updateChargeTable(contactId.value, tableId, payload)

    if (updated?.name && tableId === activeTableId.value) {
      tableTitle.value = updated.name
    }

    await fetchTables()

    toast.add({
      severity: "success",
      summary: "Saved changes",
      detail: flushAutosaveChangeDetail(),
      life: 3000,
    })
  } catch (error: any) {
    console.error("AUTOSAVE FAILED", error)

    showError("Auto-save failed", error, "Something went wrong.")
  } finally {
    await nextTick()
    suppressCurrentTableHydrate = false
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
  }, 1200)
}

function addWeightBreak() {
  const last = weightBreaks.value[weightBreaks.value.length - 1]
  const start = last ? Number(last.max || 0) : 0
  const end = start + 100

  weightBreaks.value.push({
    id: nextBreakId.value--,
    label: `+${start}`,
    min: start,
    max: end,
    unit: activeMeasurementUnit.value,
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
    if (suppressCurrentTableHydrate) return

    if (table?.charge_type === "weight_break") {
      await hydrateFromTable(table)
    }
  },
)

async function loadWeightChargeTables() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer)
    autosaveTimer = null
  }

  loadError.value = null
  contactStore.clearCurrentChargeTable()

  try {
    const firstTable = await ensureAtLeastOneTable()

    if (firstTable && contactId.value) {
      isHydrating.value = true
      activeTableId.value = firstTable.id
      const loaded = await contactStore.loadChargeTable(contactId.value, firstTable.id)
      await hydrateFromTable(loaded)
    }
  } catch (error: any) {
    loadError.value =
      error?.response?.data?.message || error?.message || "Unable to load weight charges."
    showError("Failed to load weight charges", error, "Unable to load weight charges.")
  }
}

watch(
  () => route.params.id,
  async () => {
    activeTableId.value = null
    resetLocalState()
    await loadWeightChargeTables()
  },
)

const autosaveSnapshot = computed(() =>
  JSON.stringify({
    activeTableId: activeTableId.value,
    tableTitle: tableTitle.value,
    currency: currency.value,
    valid_until: formatDateForApi(validityDate.value),
    measurementType: measurementType.value,
    weightUnit: weightUnit.value,
    volumeUnit: volumeUnit.value,
    weightBreaks: weightBreaks.value,
    charges: charges.value,
  }),
)

watch(autosaveSnapshot, (nextSnapshot, previousSnapshot) => {
  if (isHydrating.value || !activeTableId.value || !previousSnapshot) return

  const nextState = parseAutosaveSnapshot(nextSnapshot)
  const previousState = parseAutosaveSnapshot(previousSnapshot)

  if (nextState && previousState && nextState.activeTableId === previousState.activeTableId) {
    rememberAutosaveChanges(summarizeAutosaveChanges(nextState, previousState))
  }

  queueAutosave()
})

onMounted(async () => {
  await Promise.allSettled([
    referenceDataStore.categories.length ? Promise.resolve() : referenceDataStore.fetchAll(),
    loadWeightChargeTables(),
  ])
})

onUnmounted(() => {
  if (!autosaveTimer) return
  clearTimeout(autosaveTimer)
  autosaveTimer = null
})
</script>

<template>
  <div class="weightCharges">
    <div class="weightCharges__card">
      <div class="weightCharges__top">
        <div class="weightCharges__titleWrap">
          <h2 class="weightCharges__title">Weight Break Collection Charges</h2>
          <p class="weightCharges__subtitle">
            Create and manage weight-based charge tables for collection calculations
          </p>
        </div>
      </div>

      <div class="weightCharges__body">
        <div v-if="loadError" class="wcLoadError">{{ loadError }}</div>

        <section class="wcCard">
          <div class="wcSplit">
            <div class="wcSplit__col">
              <div class="wcSectionTitle">Create New Weight Charge Sheet</div>

              <input
                v-model="newTableName"
                type="text"
                class="wcInput"
                placeholder="Enter weight charge sheet name..."
                @keydown.enter.prevent="createTable"
              />

              <div class="wcSheetActions">
                <Button
                  :label="creating ? 'Creating...' : 'Create'"
                  icon="pi pi-plus"
                  class="btn btn--primary wcBtn"
                  :disabled="creating || !newTableName.trim()"
                  @click="createTable"
                />

                <Button
                  :label="deleting ? 'Deleting...' : 'Delete'"
                  icon="pi pi-trash"
                  class="btn btn--danger wcBtn"
                  :disabled="!activeTableId || deleting"
                  @click="deleteCurrentTable"
                />
              </div>
            </div>

            <div class="wcSplit__col">
              <div class="wcSplit__head">
                <div class="wcSectionTitle">Weight Charge Sheets</div>
                <div class="wcCount">
                  <span v-if="loadingTables">Loading...</span>
                  <span v-else>{{ tables.length }} sheet{{ tables.length === 1 ? "" : "s" }}</span>
                </div>
              </div>

              <div v-if="loadingTables" class="wcTableListEmpty">
                Loading weight charge sheets...
              </div>

              <div v-else-if="!tables.length" class="wcTableListEmpty">
                Creating default weight charge sheet...
              </div>

              <div v-else class="wcTableList">
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
                <select
                  v-model="currency"
                  class="wcSelect"
                  :disabled="referenceDataStore.loading && !currencyOptions.length"
                >
                  <option
                    v-for="option in currencyOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <div class="wcCurrencySymbol">
                  {{ currentCurrencySymbol() }}
                </div>
              </div>
            </div>

            <div class="wcMetaRow__field">
              <label class="wcMetaLabel">Basis</label>

              <select v-model="measurementType" class="wcSelect">
                <option value="weight">Weight Units</option>
                <option value="volume">Volume Units</option>
              </select>
            </div>

            <div v-if="measurementType === 'weight'" class="wcMetaRow__field">
              <label class="wcMetaLabel">Weight Unit</label>

              <select
                v-model="weightUnit"
                class="wcSelect"
                :disabled="referenceDataStore.loading && !weightUnitOptions.length"
              >
                <option
                  v-for="option in weightUnitOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div v-else class="wcMetaRow__field">
              <label class="wcMetaLabel">Volume Unit</label>

              <select
                v-model="volumeUnit"
                class="wcSelect"
                :disabled="referenceDataStore.loading && !volumeUnitOptions.length"
              >
                <option
                  v-for="option in volumeUnitOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="wcCard">
          <div class="wcValidity__head">
            <div class="wcValidity__title">Validity Date</div>
            <div class="wcValidity__statusGroup">
              <span class="wcStatusBadge">Active</span>
              <span class="wcFieldNote">{{ autosaveStatus }}</span>
            </div>
          </div>

          <div class="wcValidity__row">
            <span class="wcFieldNote">These charges are valid until:</span>

            <Calendar
              v-model="validityDate"
              dateFormat="yy-mm-dd"
              showIcon
              input-class="wcInput wcInput--date"
              class="wcCalendar"
              placeholder="Select valid until date"
            />
          </div>
        </section>

        <div class="wcToolbar">
          <Button
            label="Add break"
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
            Define custom weight or volume ranges for your collection charges. Each break will
            create a column in the charges table.
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
                  <label>Min ({{ activeMeasurementUnit }})</label>
                  <input
                    :value="weightBreak.min"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    @input="updateWeightBreakValue(weightBreak, 'min', $event)"
                  />
                </div>

                <div class="wcMiniField">
                  <label>Max ({{ activeMeasurementUnit }})</label>
                  <input
                    :value="weightBreak.max"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    @input="updateWeightBreakValue(weightBreak, 'max', $event)"
                  />
                </div>
              </div>

              <div class="wcBreakCard__foot">
                {{ weightBreak.min }} {{ activeMeasurementUnit }} - {{ weightBreak.max }}
                {{ activeMeasurementUnit }}
              </div>
            </div>
          </div>
        </section>

        <section class="wcCard wcCard--notice">
          <div class="wcNotice">
            Current Currency:
            {{ currency }}
            - All charges are displayed in this currency and calculated by
            {{ measurementType === "volume" ? "volume" : "weight" }} using
            {{ activeMeasurementUnit }}.
          </div>
        </section>

        <section class="wcCard wcCard--table">
          <div class="wcTableToolbar">
            <div>
              <div class="wcTableToolbar__title">Charge Matrix</div>
              <div class="wcTableToolbar__meta">
                {{ charges.length }} charge{{ charges.length === 1 ? "" : "s" }} across
                {{ weightBreaks.length }} break{{ weightBreaks.length === 1 ? "" : "s" }}
              </div>
            </div>

            <Button
              label="Add charge"
              icon="pi pi-plus"
              class="btn btn--ghost wcBtn"
              :disabled="!activeTableId"
              @click="addCharge"
            />
          </div>

          <div class="wcTableWrap">
            <table class="wcChargeTable">
              <thead>
                <tr>
                  <th rowspan="2" class="is-description">Description</th>
                  <th rowspan="2" class="is-actions">Actions</th>
                  <th :colspan="weightBreaks.length" class="is-group">
                    {{ tableTitle || "Collection Charges" }}
                  </th>
                </tr>
                <tr>
                  <th v-for="weightBreak in weightBreaks" :key="weightBreak.id">
                    <div class="wcThMain">{{ weightBreak.label }}</div>
                    <div class="wcThSub">
                      {{ weightBreak.min }} - {{ weightBreak.max }} {{ activeMeasurementUnit }}
                    </div>
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
                        :value="charge.values[index]"
                        type="text"
                        inputmode="decimal"
                        pattern="[0-9]*[.]?[0-9]*"
                        @input="updateChargeValue(charge, index, $event)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
