<script setup lang="ts">
import { computed, reactive, watch } from "vue"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Dropdown from "primevue/dropdown"
import Calendar from "primevue/calendar"
import Button from "primevue/button"
import Textarea from "primevue/textarea"

type Option = {
  label: string
  value: string
}

type ReceiptLine = {
  description: string
  qty: number | null
  unit: string
}

export type WarehouseReceiptPayload = {
  receiptNumber: string
  jobReference: string
  receivedDate: Date | null
  customer: string
  supplier: string
  location: string
  receivedBy: string
  notes: string
  lines: ReceiptLine[]
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "saved", payload: WarehouseReceiptPayload): void
}>()

const customerOptions: Option[] = [
  { label: "Greenfield Imports", value: "Greenfield Imports" },
  { label: "NovaTech Solutions", value: "NovaTech Solutions" },
]

const supplierOptions: Option[] = [
  { label: "TechSource Ltd", value: "TechSource Ltd" },
  { label: "Global Imports Co", value: "Global Imports Co" },
]

const unitOptions: Option[] = [
  { label: "Pallets", value: "Pallets" },
  { label: "Cartons", value: "Cartons" },
  { label: "Pieces", value: "Pieces" },
  { label: "Rolls", value: "Rolls" },
]

const locationOptions: Option[] = [
  { label: "A01-L1", value: "A01-L1" },
  { label: "A01-L3", value: "A01-L3" },
  { label: "A02-L1", value: "A02-L1" },
]

function buildReceiptNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `WR-${year}${month}${day}-${suffix}`
}

function createInitialForm() {
  return {
    receiptNumber: buildReceiptNumber(),
    jobReference: "",
    receivedDate: new Date() as Date | null,
    customer: "",
    supplier: "",
    location: "",
    receivedBy: "Ian H",
    notes: "",
    lines: [
      {
        description: "",
        qty: null,
        unit: "",
      },
    ] as ReceiptLine[],
  }
}

const form = reactive(createInitialForm())

function resetForm() {
  Object.assign(form, createInitialForm())
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      resetForm()
    }
  },
)

const isValid = computed(() => {
  return !!(form.jobReference.trim() && form.customer && form.supplier)
})

function addLine() {
  form.lines.push({
    description: "",
    qty: null,
    unit: "",
  })
}

function removeLine(index: number) {
  form.lines.splice(index, 1)
}

function onClose() {
  emit("close")
}

function onSave() {
  if (!isValid.value) return

  emit("saved", {
    receiptNumber: form.receiptNumber,
    jobReference: form.jobReference.trim(),
    receivedDate: form.receivedDate,
    customer: form.customer,
    supplier: form.supplier,
    location: form.location,
    receivedBy: form.receivedBy.trim(),
    notes: form.notes.trim(),
    lines: form.lines
      .filter(line => line.description.trim())
      .map(line => ({
        description: line.description.trim(),
        qty: line.qty,
        unit: line.unit,
      })),
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :closable="false"
    :style="{ width: '1040px', maxWidth: '96vw' }"
    class="warehouse-receipt-modal"
    @update:visible="value => !value && onClose()"
  >
    <template #container>
      <div class="warehouse-receipt-modal__shell">
        <div class="warehouse-receipt-modal__header">
          <h2 class="warehouse-receipt-modal__title">Warehouse Receipt</h2>

          <button
            type="button"
            class="warehouse-receipt-modal__close"
            aria-label="Close"
            @click="onClose"
          >
            ×
          </button>
        </div>

        <div class="warehouse-receipt-modal__body">
          <div class="warehouse-receipt-modal__section">
            <div class="warehouse-receipt-modal__section-title">Receipt Details</div>

            <div class="warehouse-receipt-modal__grid warehouse-receipt-modal__grid--3">
              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">Receipt Number</label>
                <InputText
                  v-model="form.receiptNumber"
                  disabled
                  class="warehouse-receipt-modal__control"
                />
              </div>

              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">
                  Job Ref / PO <span class="warehouse-receipt-modal__req">*</span>
                </label>
                <InputText
                  v-model="form.jobReference"
                  placeholder="e.g. PW1229"
                  class="warehouse-receipt-modal__control"
                />
              </div>

              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">Received Date</label>
                <Calendar
                  v-model="form.receivedDate"
                  show-icon
                  date-format="dd/mm/yy"
                  placeholder="Select date"
                  class="warehouse-receipt-modal__control"
                />
              </div>
            </div>
          </div>

          <div class="warehouse-receipt-modal__section">
            <div class="warehouse-receipt-modal__section-title">Parties</div>

            <div class="warehouse-receipt-modal__grid warehouse-receipt-modal__grid--2">
              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">
                  Customer <span class="warehouse-receipt-modal__req">*</span>
                </label>
                <Dropdown
                  v-model="form.customer"
                  :options="customerOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="warehouse-receipt-modal__control"
                />
              </div>

              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">
                  Supplier <span class="warehouse-receipt-modal__req">*</span>
                </label>
                <Dropdown
                  v-model="form.supplier"
                  :options="supplierOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="warehouse-receipt-modal__control"
                />
              </div>
            </div>

            <div class="warehouse-receipt-modal__grid warehouse-receipt-modal__grid--2">
              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">Warehouse Location</label>
                <Dropdown
                  v-model="form.location"
                  :options="locationOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="warehouse-receipt-modal__control"
                />
              </div>

              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">Received By</label>
                <InputText v-model="form.receivedBy" class="warehouse-receipt-modal__control" />
              </div>
            </div>
          </div>

          <div class="warehouse-receipt-modal__section">
            <div class="warehouse-receipt-modal__section-title">Package Details</div>

            <div class="warehouse-receipt-modal__lines">
              <div
                v-for="(line, index) in form.lines"
                :key="index"
                class="warehouse-receipt-modal__line-row"
              >
                <div
                  class="warehouse-receipt-modal__line-col warehouse-receipt-modal__line-col--desc"
                >
                  <InputText
                    v-model="line.description"
                    placeholder="Description / type of packaging"
                    class="warehouse-receipt-modal__line-control"
                  />
                </div>

                <div
                  class="warehouse-receipt-modal__line-col warehouse-receipt-modal__line-col--qty"
                >
                  <InputNumber
                    v-model="line.qty"
                    :min="0"
                    placeholder="Qty"
                    class="warehouse-receipt-modal__line-control"
                    input-class="warehouse-receipt-modal__input-inner"
                  />
                </div>

                <div
                  class="warehouse-receipt-modal__line-col warehouse-receipt-modal__line-col--unit"
                >
                  <Dropdown
                    v-model="line.unit"
                    :options="unitOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Unit"
                    class="warehouse-receipt-modal__line-control"
                  />
                </div>

                <div
                  class="warehouse-receipt-modal__line-col warehouse-receipt-modal__line-col--remove"
                >
                  <button
                    type="button"
                    class="warehouse-receipt-modal__remove-btn"
                    @click="removeLine(index)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <button type="button" class="warehouse-receipt-modal__ghost-btn" @click="addLine">
              + Add Line
            </button>
          </div>

          <div class="warehouse-receipt-modal__section">
            <div class="warehouse-receipt-modal__section-title">Remarks</div>

            <div class="warehouse-receipt-modal__grid warehouse-receipt-modal__grid--1">
              <div class="warehouse-receipt-modal__field">
                <label class="warehouse-receipt-modal__label">General Remarks</label>
                <Textarea
                  v-model="form.notes"
                  rows="3"
                  auto-resize
                  placeholder="Free-text notes"
                  class="warehouse-receipt-modal__control"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="warehouse-receipt-modal__footer">
          <Button label="Cancel" severity="secondary" outlined @click="onClose" />
          <Button label="Save Receipt" :disabled="!isValid" @click="onSave" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.warehouse-receipt-modal__shell {
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.16);
  max-height: min(90vh, 900px);
}

.warehouse-receipt-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.55rem 1.75rem 1.15rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
  background: #ffffff;
  flex-shrink: 0;
}

.warehouse-receipt-modal__title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text, #262626);
}

.warehouse-receipt-modal__close {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 999px;
  color: var(--text-muted, #737373);
  font-size: 1.7rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.warehouse-receipt-modal__close:hover {
  background: #f5f5f5;
  color: var(--text, #262626);
}

.warehouse-receipt-modal__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.35rem 1.75rem 1.45rem;
  overflow-y: auto;
  background: #fbfbfb;
}

.warehouse-receipt-modal__section {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ececec;
}

.warehouse-receipt-modal__section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.warehouse-receipt-modal__section-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted, #737373);
}

.warehouse-receipt-modal__grid {
  display: grid;
  gap: 14px;
}

.warehouse-receipt-modal__grid--1 {
  grid-template-columns: 1fr;
}

.warehouse-receipt-modal__grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.warehouse-receipt-modal__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.warehouse-receipt-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.warehouse-receipt-modal__label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text, #262626);
}

.warehouse-receipt-modal__req {
  color: var(--primary, #ec691a);
}

.warehouse-receipt-modal__control {
  width: 100%;
}

.warehouse-receipt-modal__lines {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.warehouse-receipt-modal__line-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px 180px 52px;
  gap: 12px;
  align-items: center;
}

.warehouse-receipt-modal__line-col {
  min-width: 0;
}

.warehouse-receipt-modal__line-col--qty {
  min-width: 140px;
}

.warehouse-receipt-modal__line-col--unit {
  min-width: 170px;
}

.warehouse-receipt-modal__line-col--remove {
  display: flex;
  justify-content: center;
}

.warehouse-receipt-modal__line-control {
  width: 100%;
}

.warehouse-receipt-modal__remove-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #eadfdf;
  background: #ffffff;
  color: #c62828;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.warehouse-receipt-modal__remove-btn:hover {
  background: #fff5f5;
  border-color: #efcaca;
  transform: translateY(-1px);
}

.warehouse-receipt-modal__ghost-btn {
  margin-top: 0.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 0.95rem;
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 10px;
  background: #ffffff;
  color: var(--text-muted, #737373);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.warehouse-receipt-modal__ghost-btn:hover {
  background: #f7f7f7;
  border-color: #cfcfcf;
  color: var(--text, #262626);
}

.warehouse-receipt-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.75rem 1.2rem;
  border-top: 1px solid var(--border, #e5e5e5);
  background: #ffffff;
  flex-shrink: 0;
}

:deep(.warehouse-receipt-modal .p-dialog) {
  border-radius: 22px;
  box-shadow: none;
  overflow: visible;
}

:deep(.warehouse-receipt-modal .p-dialog-header),
:deep(.warehouse-receipt-modal .p-dialog-content),
:deep(.warehouse-receipt-modal .p-dialog-footer) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.warehouse-receipt-modal .p-dialog-content) {
  overflow: visible;
}

:deep(.warehouse-receipt-modal .p-inputtext),
:deep(.warehouse-receipt-modal .p-inputnumber-input),
:deep(.warehouse-receipt-modal .p-dropdown),
:deep(.warehouse-receipt-modal .p-calendar),
:deep(.warehouse-receipt-modal .p-inputtextarea) {
  width: 100%;
}

:deep(.warehouse-receipt-modal .p-inputtext),
:deep(.warehouse-receipt-modal .p-inputnumber-input),
:deep(.warehouse-receipt-modal .p-dropdown),
:deep(.warehouse-receipt-modal .p-calendar .p-inputtext),
:deep(.warehouse-receipt-modal .p-inputtextarea) {
  min-height: 46px;
  border-radius: 10px;
  border-color: #cfd6df;
  font-size: 0.98rem;
  color: #334155;
  background: #ffffff;
}

:deep(.warehouse-receipt-modal .p-inputtext:disabled) {
  background: #f5f5f5;
  color: #64748b;
  opacity: 1;
}

:deep(.warehouse-receipt-modal .p-inputtextarea) {
  min-height: 92px;
  padding-top: 0.8rem;
}

:deep(.warehouse-receipt-modal .p-dropdown .p-dropdown-label) {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding-top: 0;
  padding-bottom: 0;
  color: #334155;
}

:deep(.warehouse-receipt-modal .p-inputtext::placeholder),
:deep(.warehouse-receipt-modal .p-inputnumber-input::placeholder),
:deep(.warehouse-receipt-modal .p-inputtextarea::placeholder),
:deep(.warehouse-receipt-modal .p-dropdown .p-placeholder) {
  color: #94a3b8;
}

:deep(.warehouse-receipt-modal .p-inputtext:enabled:hover),
:deep(.warehouse-receipt-modal .p-inputnumber-input:enabled:hover),
:deep(.warehouse-receipt-modal .p-dropdown:not(.p-disabled):hover),
:deep(.warehouse-receipt-modal .p-calendar:not(.p-calendar-disabled):hover .p-inputtext),
:deep(.warehouse-receipt-modal .p-inputtextarea:enabled:hover) {
  border-color: #b9c4d1;
}

/* Hover */
:deep(.warehouse-receipt-modal .p-inputtext:enabled:hover),
:deep(.warehouse-receipt-modal .p-inputnumber-input:enabled:hover),
:deep(.warehouse-receipt-modal .p-dropdown:not(.p-disabled):hover),
:deep(.warehouse-receipt-modal .p-calendar:not(.p-calendar-disabled):hover .p-inputtext),
:deep(.warehouse-receipt-modal .p-inputtextarea:enabled:hover) {
  border-color: #b9c4d1;
}

/* Focus */
:deep(.warehouse-receipt-modal .p-inputtext:enabled:focus),
:deep(.warehouse-receipt-modal .p-inputnumber-input:enabled:focus),
:deep(.warehouse-receipt-modal .p-inputtextarea:enabled:focus),
:deep(.warehouse-receipt-modal .p-calendar .p-inputtext:enabled:focus) {
  border-color: var(--primary, #ec691a);
  box-shadow: 0 0 0 3px rgba(236, 105, 26, 0.14);
}

/* Dropdown focus (PrimeVue uses .p-focus) */
:deep(.warehouse-receipt-modal .p-dropdown:not(.p-disabled).p-focus) {
  border-color: var(--primary, #ec691a);
  box-shadow: 0 0 0 3px rgba(236, 105, 26, 0.14);
}

/* Buttons */
:deep(.warehouse-receipt-modal .p-button) {
  min-height: 44px;
  padding: 0 1.2rem;
  border-radius: 12px;
  font-weight: 600;
}

:deep(.warehouse-receipt-modal .p-button.p-button-outlined) {
  background: #ffffff;
}

:deep(.warehouse-receipt-modal .p-button:disabled) {
  opacity: 1;
  background: #f1a775;
  border-color: #f1a775;
}

/* Responsive */
@media (max-width: 960px) {
  .warehouse-receipt-modal__grid--2,
  .warehouse-receipt-modal__grid--3 {
    grid-template-columns: 1fr;
  }

  .warehouse-receipt-modal__line-row {
    grid-template-columns: 1fr;
  }

  .warehouse-receipt-modal__line-col--qty,
  .warehouse-receipt-modal__line-col--unit {
    min-width: 0;
  }

  .warehouse-receipt-modal__line-col--remove {
    justify-content: stretch;
  }

  .warehouse-receipt-modal__remove-btn {
    width: 100%;
  }

  .warehouse-receipt-modal__header,
  .warehouse-receipt-modal__body,
  .warehouse-receipt-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .warehouse-receipt-modal__footer {
    flex-direction: column-reverse;
  }

  :deep(.warehouse-receipt-modal .p-button) {
    width: 100%;
  }
}
</style>
