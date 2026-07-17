<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import Button from "primevue/button"
import Calendar from "primevue/calendar"
import InputSwitch from "primevue/inputswitch"
import AutoComplete from "primevue/autocomplete"

import { useCountryStore } from "@/app/stores/country"
import type { Country } from "@/app/types/country"
import type { ContactCollectionAddress } from "@/app/types/contact"

type CollectionUI = ContactCollectionAddress

const props = withDefaults(
  defineProps<{
    items: ContactCollectionAddress[]
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const emit = defineEmits<{
  (e: "add"): void
  (e: "remove", id: number): void
  (e: "duplicate", id: number): void
  (e: "save", id: number, payload: Partial<ContactCollectionAddress>): void
  (e: "cancel"): void
}>()

/* =========================
   LIST/SELECTION
========================= */
const localRows = ref<CollectionUI[]>(cloneAddressArray(props.items ?? []))
const rows = computed(() => localRows.value)

const selectedIndex = ref(0)
const lastLength = ref(rows.value.length)
const selected = computed(() => rows.value[selectedIndex.value])
const lastSavedSnapshot = ref("")
const autosaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const autosaveState = ref<"idle" | "pending" | "saving" | "saved">("idle")

watch(
  () => rows.value.length,
  async len => {
    if (len === 0) {
      selectedIndex.value = 0
      lastLength.value = 0
      return
    }

    if (len > lastLength.value) {
      selectedIndex.value = len - 1
      await nextTick()
    } else if (selectedIndex.value > len - 1) {
      selectedIndex.value = len - 1
    }

    lastLength.value = len
  },
  { immediate: true },
)

function select(i: number) {
  flushAutosave()
  selectedIndex.value = i
}

function onAdd() {
  emit("add")
}

function onDeleteSelected() {
  flushAutosave()
  if (!selected.value) return
  if (!selected.value.id || selected.value.id <= 0) return
  emit("remove", selected.value.id)
}

function onDuplicateSelected() {
  flushAutosave()
  if (!selected.value) return
  if (!selected.value.id || selected.value.id <= 0) return
  emit("duplicate", selected.value.id)
}

function onCancel() {
  clearAutosaveTimer()
  syncLocalRows(props.items ?? [], true)
  emit("cancel")
}

/* =========================
   COUNTRY (same pattern as ContactCreatePage)
========================= */

const countryStore = useCountryStore()

const selectedCountry = ref<Country | null>(null)
const countrySuggestions = ref<Country[]>([])
const countrySearching = ref(false)

onMounted(async () => {
  if (!countryStore.items.length) {
    await countryStore.fetch()
  }

  hydrateSelectedCountryFromRow()
})

function hydrateSelectedCountryFromRow() {
  const cid = selected.value?.country_id ?? null
  selectedCountry.value = cid ? (countryStore.items.find(x => x.id === cid) ?? null) : null
}

watch(
  () => selected.value?.country_id,
  () => hydrateSelectedCountryFromRow(),
  { immediate: true },
)

async function searchCountries(q: string) {
  const query = (q ?? "").trim()
  if (!query) {
    countrySuggestions.value = countryStore.items.slice(0, 20)
    return
  }

  countrySearching.value = true
  try {
    countryStore.setSearch?.(query)
    await countryStore.fetch()
    countrySuggestions.value = countryStore.items.slice(0, 30)
  } finally {
    countrySearching.value = false
  }
}

function onCountrySelect(country: Country | null) {
  selectedCountry.value = country
  if (!selected.value) return
  selected.value.country_id = country?.id ?? null

  // ✅ optional: auto-fill phone dial code if phone is empty
  if (!selected.value.phone?.trim() && country?.dial_code) {
    selected.value.phone = String(country.dial_code).trim()
  }
}

/* =========================
   HOURS OF OPERATION helpers
   Persisted format: "HH:mm – HH:mm"
========================= */

const hoursFrom = ref<Date | null>(null)
const hoursTo = ref<Date | null>(null)
const hoursHydrating = ref(false)

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatHHmm(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function parseHHmmToDate(hhmm: string): Date | null {
  const m = String(hhmm ?? "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null

  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  if (hh < 0 || hh > 23) return null
  if (mm < 0 || mm > 59) return null

  const d = new Date()
  d.setHours(hh, mm, 0, 0)
  return d
}

// Accepts: "06:00 – 22:00" or "06:00-22:00" or "06:00 to 22:00"
function splitHoursString(v: string | null | undefined): { from: Date | null; to: Date | null } {
  const raw = String(v ?? "").trim()
  if (!raw) return { from: null, to: null }

  const normalized = raw
    .replace("—", "-")
    .replace("–", "-")
    .replace(/\s+to\s+/i, "-")
    .replace(/\s+/g, " ")

  const parts = normalized
    .split("-")
    .map(x => x.trim())
    .filter(Boolean)

  const fromStr = parts[0]
  const toStr = parts[1]

  if (!fromStr || !toStr) {
    return { from: null, to: null }
  }

  return {
    from: parseHHmmToDate(fromStr),
    to: parseHHmmToDate(toStr),
  }
}

function buildHoursString(from: Date | null, to: Date | null): string | null {
  if (!from || !to) return null
  return `${formatHHmm(from)} – ${formatHHmm(to)}`
}

watch(
  () => selected.value?.hours_of_operation,
  v => {
    hoursHydrating.value = true
    const { from, to } = splitHoursString(v ?? null)
    hoursFrom.value = from
    hoursTo.value = to
    nextTick(() => {
      hoursHydrating.value = false
    })
  },
  { immediate: true },
)

watch([hoursFrom, hoursTo], ([from, to]) => {
  if (hoursHydrating.value) return
  if (!selected.value) return
  selected.value.hours_of_operation = buildHoursString(from, to)
})

/* =========================
   FLAGS GUARD
========================= */

function ensureAtLeastOneFlag() {
  if (!selected.value) return

  const c = Boolean(selected.value.is_collection)
  const d = Boolean(selected.value.is_delivery)

  if (!c && !d) selected.value.is_collection = true
}

watch(
  () => [selected.value?.is_collection, selected.value?.is_delivery],
  () => ensureAtLeastOneFlag(),
  { immediate: true },
)

/* =========================
   SAVE
========================= */

function cloneAddressArray(items: ContactCollectionAddress[]): CollectionUI[] {
  return (items ?? []).map(cloneAddress)
}

function cloneAddress(row: ContactCollectionAddress): CollectionUI {
  return {
    id: Number(row.id),
    contact_id: row.contact_id ?? null,
    label: row.label ?? null,
    address_line_1: row.address_line_1 ?? null,
    address_line_2: row.address_line_2 ?? null,
    address_line_3: row.address_line_3 ?? null,
    city: row.city ?? null,
    county_state: row.county_state ?? null,
    postal_code: row.postal_code ?? null,
    country_id: row.country_id ?? null,
    country_name: row.country_name ?? null,
    sequence_no: row.sequence_no ?? null,
    reference_code: row.reference_code ?? null,
    is_collection: Boolean(row.is_collection),
    is_delivery: Boolean(row.is_delivery),
    hours_of_operation: row.hours_of_operation ?? null,
    contact_person: row.contact_person ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    special_instructions: row.special_instructions ?? null,
  }
}

function cleanText(value: string | null | undefined): string | null {
  const trimmed = String(value ?? "").trim()
  return trimmed === "" ? null : trimmed
}

function onSave() {
  if (!selected.value) return
  if (!selected.value.id || selected.value.id <= 0) return

  const payload: Partial<ContactCollectionAddress> = {
    label: cleanText(selected.value.label),

    address_line_1: cleanText(selected.value.address_line_1),
    address_line_2: cleanText(selected.value.address_line_2),
    address_line_3: cleanText(selected.value.address_line_3),

    city: cleanText(selected.value.city),
    county_state: cleanText(selected.value.county_state),
    postal_code: cleanText(selected.value.postal_code),

    country_id: selected.value.country_id ?? null,

    // ✅ flags
    is_collection: Boolean(selected.value.is_collection),
    is_delivery: Boolean(selected.value.is_delivery),

    // ✅ persisted UI fields
    hours_of_operation: cleanText(selected.value.hours_of_operation),
    contact_person: cleanText(selected.value.contact_person),
    email: cleanText(selected.value.email),
    phone: cleanText(selected.value.phone),
    special_instructions: cleanText(selected.value.special_instructions),
  }

  emit("save", selected.value.id, payload)
  lastSavedSnapshot.value = JSON.stringify(payload)
  autosaveState.value = "saved"
}

function buildSavePayload(row: ContactCollectionAddress): Partial<ContactCollectionAddress> {
  return {
    label: cleanText(row.label),
    address_line_1: cleanText(row.address_line_1),
    address_line_2: cleanText(row.address_line_2),
    address_line_3: cleanText(row.address_line_3),
    city: cleanText(row.city),
    county_state: cleanText(row.county_state),
    postal_code: cleanText(row.postal_code),
    country_id: row.country_id ?? null,
    is_collection: Boolean(row.is_collection),
    is_delivery: Boolean(row.is_delivery),
    hours_of_operation: cleanText(row.hours_of_operation),
    contact_person: cleanText(row.contact_person),
    email: cleanText(row.email),
    phone: cleanText(row.phone),
    special_instructions: cleanText(row.special_instructions),
  }
}

function clearAutosaveTimer() {
  if (!autosaveTimer.value) return
  clearTimeout(autosaveTimer.value)
  autosaveTimer.value = null
}

function queueAutosave() {
  if (!selected.value?.id) return

  clearAutosaveTimer()
  autosaveState.value = "pending"

  autosaveTimer.value = setTimeout(() => {
    if (!selected.value?.id) return

    autosaveState.value = "saving"
    onSave()
  }, 700)
}

const selectedSaveSnapshot = computed(() => {
  if (!selected.value?.id) return ""
  return JSON.stringify(buildSavePayload(selected.value))
})

function selectedIsDirty() {
  return Boolean(
    selectedSaveSnapshot.value && selectedSaveSnapshot.value !== lastSavedSnapshot.value,
  )
}

function syncLocalRows(items: ContactCollectionAddress[], force = false) {
  const selectedId = selected.value?.id ?? null
  const keepSelectedDraft = !force && selectedId !== null && selectedIsDirty()
  const currentById = new Map(localRows.value.map(row => [row.id, row]))

  localRows.value = cloneAddressArray(items ?? []).map(serverRow => {
    const currentRow = currentById.get(serverRow.id)
    if (!keepSelectedDraft || serverRow.id !== selectedId || !currentRow) {
      return serverRow
    }

    return {
      ...serverRow,
      ...currentRow,
      sequence_no: serverRow.sequence_no,
      reference_code: serverRow.reference_code,
      country_name: serverRow.country_name,
    }
  })

  if (selectedIndex.value > localRows.value.length - 1) {
    selectedIndex.value = Math.max(0, localRows.value.length - 1)
  }

  if (!keepSelectedDraft) {
    lastSavedSnapshot.value = selectedSaveSnapshot.value
    autosaveState.value = selected.value?.id ? "saved" : "idle"
  }
}

watch(
  () => props.items,
  items => syncLocalRows(items ?? []),
  { deep: true },
)

function flushAutosave() {
  if (!selected.value?.id) return
  if (!selectedIsDirty()) return

  clearAutosaveTimer()
  autosaveState.value = "saving"
  onSave()
}

function onEditorFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const nextTarget = event.relatedTarget as Node | null

  if (currentTarget && nextTarget && currentTarget.contains(nextTarget)) {
    return
  }

  flushAutosave()
}

watch(
  () => selected.value?.id,
  () => {
    clearAutosaveTimer()
    lastSavedSnapshot.value = selectedSaveSnapshot.value
    autosaveState.value = selected.value?.id ? "saved" : "idle"
  },
  { immediate: true },
)

watch(selectedSaveSnapshot, snapshot => {
  if (!snapshot) return
  if (snapshot === lastSavedSnapshot.value) return
  queueAutosave()
})

onBeforeUnmount(() => {
  clearAutosaveTimer()
})

/* =========================
   DISPLAY HELPERS
========================= */

function displayTitle(c: CollectionUI) {
  return c.label?.trim() || "New address"
}

function displayLine(c: CollectionUI) {
  const parts = [
    c.address_line_1,
    c.address_line_2,
    c.address_line_3,
    c.city,
    c.county_state,
    c.postal_code,
  ].filter(Boolean)
  return parts.join(", ")
}

function displayRef(c: CollectionUI) {
  return c.reference_code?.trim() || (c.id ? `#${c.id}` : "New")
}

function displayType(c: CollectionUI) {
  const isC = Boolean(c.is_collection)
  const isD = Boolean(c.is_delivery)
  if (isC && isD) return "Collection + Delivery"
  if (isD) return "Delivery"
  return "Collection"
}
</script>

<template>
  <div class="tabHeader">
    <div>
      <div class="tabHeader__title">Supplier addresses</div>
      <div class="tabHeader__subtitle">
        Click any address to edit full details. Changes auto-save after editing.
      </div>
    </div>

    <Button
      type="button"
      class="btn btn--primary"
      icon="pi pi-plus"
      label="Add address"
      :disabled="props.busy"
      @click="onAdd"
    />
  </div>

  <div v-if="rows.length === 0" class="emptyState">
    No addresses yet. Click <b>New address</b> to add one.
  </div>

  <div v-else class="split">
    <!-- LEFT: list -->
    <aside class="list">
      <div class="listInner">
        <button
          v-for="(c, i) in rows"
          :key="c.id ?? `new-${i}`"
          class="listItem"
          :class="{ 'listItem--active': i === selectedIndex }"
          type="button"
          @click="select(i)"
        >
          <div class="listItem__top">
            <div class="listItem__title">
              <span class="pinIcon" aria-hidden="true">📍</span>
              <span class="truncate">{{ displayTitle(c) }}</span>
            </div>

            <span class="badge">
              {{ displayRef(c) }}
            </span>
          </div>

          <div class="listItem__desc">
            {{ displayLine(c) || "—" }}
          </div>

          <div class="listItem__meta">
            <span class="metaChip"> <i class="pi pi-tag" /> {{ displayType(c) }} </span>

            <span v-if="c.contact_person" class="metaChip">
              <i class="pi pi-user" /> {{ c.contact_person }}
            </span>

            <span v-if="c.hours_of_operation" class="metaChip">
              <i class="pi pi-clock" /> {{ c.hours_of_operation }}
            </span>
          </div>
        </button>
      </div>
    </aside>

    <!-- RIGHT: editor -->
    <section class="editor">
      <div class="editorHead">
        <div class="editorTitleRow">
          <i class="pi pi-pencil" />
          <div>
            <div class="editorTitle">Edit address</div>
            <div class="editorSub">
              {{
                autosaveState === "pending"
                  ? "Unsaved changes"
                  : autosaveState === "saving"
                    ? "Saving..."
                    : selected?.reference_code
                      ? `Ref: ${selected.reference_code}`
                      : selected?.id
                        ? `#${selected.id}`
                        : "New record"
              }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!selected" class="emptyEditor">Select an address on the left.</div>

      <div v-else class="editorBody" @focusout="onEditorFocusOut">
        <div class="formGrid">
          <div class="row2">
            <div class="field">
              <label class="label">Collection</label>
              <div class="switchRow">
                <InputSwitch v-model="selected.is_collection" />
                <span class="switchHint">Used for collections</span>
              </div>
            </div>

            <div class="field">
              <label class="label">Delivery</label>
              <div class="switchRow">
                <InputSwitch v-model="selected.is_delivery" />
                <span class="switchHint">Used for deliveries</span>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">Label</label>
            <input class="input" v-model="selected.label" placeholder="e.g. Salford Quays" />
          </div>

          <div class="field">
            <label class="label">Address line 1</label>
            <input
              class="input"
              v-model="selected.address_line_1"
              placeholder="Unit 12, The Wharf"
            />
          </div>

          <div class="field">
            <label class="label">Address line 2 (optional)</label>
            <input class="input" v-model="selected.address_line_2" placeholder="Salford Quays" />
          </div>

          <div class="field">
            <label class="label">Address line 3 (optional)</label>
            <input class="input" v-model="selected.address_line_3" placeholder="Additional info" />
          </div>

          <div class="row2">
            <div class="field">
              <label class="label">City / Town</label>
              <input class="input" v-model="selected.city" placeholder="Salford" />
            </div>

            <div class="field">
              <label class="label">County / State</label>
              <input
                class="input"
                v-model="selected.county_state"
                placeholder="Greater Manchester"
              />
            </div>
          </div>

          <div class="row2">
            <div class="field">
              <label class="label">Postcode / ZIP</label>
              <input class="input" v-model="selected.postal_code" placeholder="M50 3AH" />
            </div>

            <div class="field">
              <label class="label">Country</label>

              <AutoComplete
                v-model="selectedCountry"
                :suggestions="countrySuggestions"
                optionLabel="name"
                :forceSelection="true"
                :dropdown="true"
                :loading="countrySearching"
                placeholder="Search country (e.g. United Kingdom, GB, +44)"
                @complete="e => searchCountries(e.query)"
                @item-select="e => onCountrySelect(e.value)"
                @clear="() => onCountrySelect(null)"
              >
                <template #option="{ option }">
                  <div style="display: flex; justify-content: space-between; gap: 12px">
                    <span>{{ option.name }}</span>
                    <span style="opacity: 0.7">{{ option.alpha_2 }} • {{ option.dial_code }}</span>
                  </div>
                </template>
              </AutoComplete>

              <div class="hint">
                Selecting a country will set the country_id (and can prefill phone if empty).
              </div>
            </div>
          </div>

          <hr class="divider" />

          <div class="row2">
            <div class="field">
              <label class="label">Hours of operation</label>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
                <Calendar
                  v-model="hoursFrom"
                  timeOnly
                  hourFormat="24"
                  class="control"
                  inputClass="input"
                  placeholder="From"
                  :manualInput="false"
                  :showIcon="false"
                />

                <Calendar
                  v-model="hoursTo"
                  timeOnly
                  hourFormat="24"
                  class="control"
                  inputClass="input"
                  placeholder="To"
                  :manualInput="false"
                  :showIcon="false"
                />
              </div>

              <div class="hint" style="margin-top: 6px">
                Saved as: <b>{{ selected.hours_of_operation || "—" }}</b>
              </div>
            </div>

            <div class="field">
              <label class="label">Contact person</label>
              <input class="input" v-model="selected.contact_person" placeholder="Marta Bellini" />
            </div>
          </div>

          <div class="row2">
            <div class="field">
              <label class="label">Email</label>
              <input class="input" v-model="selected.email" placeholder="name@company.com" />
            </div>

            <div class="field">
              <label class="label">Phone</label>
              <input class="input" v-model="selected.phone" placeholder="+44 ..." />
            </div>
          </div>

          <div class="field">
            <label class="label">Special instructions / gate code</label>
            <input
              class="input"
              v-model="selected.special_instructions"
              placeholder="Tail lift required"
            />
          </div>
        </div>

        <div class="editorActions">
          <Button
            type="button"
            class="btn btn--ghost"
            label="Reset"
            :disabled="props.busy"
            @click="onCancel"
          />

          <div class="editorActions__right">
            <Button
              type="button"
              class="btn btn--ghost"
              icon="pi pi-copy"
              label="Duplicate"
              :disabled="props.busy || !selected?.id"
              @click="onDuplicateSelected"
            />

            <Button
              type="button"
              class="btn btn--danger"
              icon="pi pi-trash"
              label="Delete"
              :disabled="props.busy || !selected?.id"
              @click="onDeleteSelected"
            />

            <Button
              type="button"
              class="btn btn--primary"
              icon="pi pi-check"
              label="Save"
              :disabled="props.busy || !selected?.id"
              @click="onSave"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.switchRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.switchHint {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

/* InputSwitch size tweak (optional) */
:global(.p-inputswitch) {
  transform: scale(0.95);
}
.emptyState {
  padding: 16px;
  color: #6b7280;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
}

/* layout */
.split {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 14px;
  align-items: stretch;
}

@media (max-width: 1100px) {
  .split {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

/* left list */
.list {
  position: relative;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}

.listInner {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-width: 1100px) {
  .list {
    position: static;
    width: 100%;
  }

  .listInner {
    position: static;
    max-height: min(620px, 55vh);
  }
}

.listItem {
  width: 100%;
  text-align: left;
  border: 0;
  background: #fff;
  padding: 12px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.listItem:hover {
  background: #fafafa;
}

.listItem--active {
  background: #fff7ed;
  border-left: 4px solid var(--primary);
  padding-left: 8px;
}

.listItem__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.listItem__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  color: #111827;
  min-width: 0;
}

.pinIcon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #fed7aa;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listItem__desc {
  margin-top: 6px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.35;
}

.listItem__meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metaChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.badge {
  font-size: 11px;
  font-weight: 800;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 8px;
  background: #fff;
}

.badge--muted {
  color: #6b7280;
}

/* right editor */
.editor {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}

.editorHead {
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.editorTitleRow {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.editorTitle {
  font-weight: 900;
  color: #111827;
}

.editorSub {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}

.emptyEditor {
  padding: 18px;
  color: #6b7280;
}

.editorBody {
  padding: 14px;
}

.formGrid {
  display: grid;
  gap: 10px;
}

.field {
  margin-top: 0;
}

.label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 800;
}

.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 10px;
  outline: none;
  background: #fff;
}

.input:focus {
  border-color: #111827;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 900px) {
  .row2 {
    grid-template-columns: 1fr;
  }
}

.divider {
  border: 0;
  border-top: 1px solid #f3f4f6;
  margin: 10px 0;
}

/* bottom actions */
.editorActions {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.editorActions__right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

:global(.p-button.btn) {
  width: auto !important;
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: none;
  white-space: nowrap;
}

:global(.p-button.btn:focus) {
  box-shadow: none;
}

.btn--danger {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecaca;
}

.btn--danger:hover {
  background: #ffe4e6;
  border-color: #fecaca;
}

/* Contact Details standard palette */
.emptyState {
  border-color: var(--contact-details-border);
  background: var(--contact-details-panel-body);
  color: var(--contact-details-muted);
}

.list {
  border-color: var(--contact-details-border);
  background: var(--contact-details-surface);
}

.listItem {
  border-color: var(--contact-details-border);
  background: var(--contact-details-control-bg);
}

.listItem:hover {
  background: var(--contact-details-panel-soft);
}

.listItem--active {
  border-left-color: var(--contact-details-accent);
  background: var(--contact-details-accent-soft);
}

.listItem__title,
.metaChip,
.badge,
.editorTitle {
  color: var(--contact-details-text);
}

.listItem__desc,
.switchHint,
.editorSub,
.emptyEditor,
.label,
.hint,
.badge--muted {
  color: var(--contact-details-muted);
}

.pinIcon,
.metaChip,
.badge {
  border-color: var(--contact-details-control-border);
  background: var(--contact-details-control-bg);
}

.pinIcon {
  border-color: #fdba74;
  background: var(--contact-details-accent-soft);
}

.editor {
  border-color: var(--contact-details-border);
  background: var(--contact-details-panel-body);
}

.editorHead {
  border-color: var(--contact-details-border);
  background: var(--contact-details-section-head);
}

.editorBody {
  background: var(--contact-details-panel-body);
}

.switchRow {
  border-color: var(--contact-details-control-border);
  background: var(--contact-details-panel-soft);
}

.input {
  min-height: 40px;
  border-color: var(--contact-details-control-border);
  border-radius: 8px;
  background: var(--contact-details-control-bg);
  color: var(--contact-details-text);
}

.input:hover,
.input:focus {
  border-color: var(--contact-details-accent);
  box-shadow: 0 0 0 2px rgba(236, 105, 26, 0.12);
}

.divider,
.editorActions {
  border-color: var(--contact-details-border);
}
</style>
