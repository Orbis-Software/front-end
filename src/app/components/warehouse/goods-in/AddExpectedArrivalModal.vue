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

export type AddExpectedArrivalPayload = {
  customer: string
  supplier: string
  description: string
  expectedDate: Date | null
  qty: number | null
  reference: string
  status: string
  notes: string
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "saved", payload: AddExpectedArrivalPayload): void
}>()

const customerOptions: Option[] = [
  { label: "Greenfield Imports", value: "Greenfield Imports" },
  { label: "NovaTech Solutions", value: "NovaTech Solutions" },
]

const supplierOptions: Option[] = [
  { label: "TechSource Ltd", value: "TechSource Ltd" },
  { label: "Global Imports Co", value: "Global Imports Co" },
]

const statusOptions: Option[] = [
  { label: "Expected", value: "Expected" },
  { label: "Delayed", value: "Delayed" },
  { label: "Booked In", value: "Booked In" },
]

function createInitialForm() {
  return {
    customer: "",
    supplier: "",
    description: "",
    expectedDate: null as Date | null,
    qty: null as number | null,
    reference: "",
    status: "Expected",
    notes: "",
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
  return !!(form.customer && form.supplier && form.description.trim())
})

function onClose() {
  emit("close")
}

function onSave() {
  if (!isValid.value) return

  emit("saved", {
    customer: form.customer,
    supplier: form.supplier,
    description: form.description.trim(),
    expectedDate: form.expectedDate,
    qty: form.qty,
    reference: form.reference.trim(),
    status: form.status,
    notes: form.notes.trim(),
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :closable="false"
    :style="{ width: '840px', maxWidth: '96vw' }"
    class="add-expected-arrival-modal"
    @update:visible="value => !value && onClose()"
  >
    <template #container>
      <div class="add-expected-arrival-modal__shell">
        <div class="add-expected-arrival-modal__header">
          <h2 class="add-expected-arrival-modal__title">Add Expected Arrival</h2>

          <button
            type="button"
            class="add-expected-arrival-modal__close"
            aria-label="Close"
            @click="onClose"
          >
            ×
          </button>
        </div>

        <div class="add-expected-arrival-modal__body">
          <div class="add-expected-arrival-modal__grid add-expected-arrival-modal__grid--2">
            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">
                Customer <span class="add-expected-arrival-modal__req">*</span>
              </label>
              <Dropdown
                v-model="form.customer"
                :options="customerOptions"
                option-label="label"
                option-value="value"
                placeholder="-- Select --"
                class="add-expected-arrival-modal__control"
              />
            </div>

            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">
                Supplier <span class="add-expected-arrival-modal__req">*</span>
              </label>
              <Dropdown
                v-model="form.supplier"
                :options="supplierOptions"
                option-label="label"
                option-value="value"
                placeholder="-- Select --"
                class="add-expected-arrival-modal__control"
              />
            </div>
          </div>

          <div class="add-expected-arrival-modal__grid add-expected-arrival-modal__grid--1">
            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">
                Description <span class="add-expected-arrival-modal__req">*</span>
              </label>
              <InputText
                v-model="form.description"
                placeholder="Brief description"
                class="add-expected-arrival-modal__control"
              />
            </div>
          </div>

          <div class="add-expected-arrival-modal__grid add-expected-arrival-modal__grid--3">
            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">Est. Arrival</label>
              <Calendar
                v-model="form.expectedDate"
                show-icon
                date-format="dd/mm/yy"
                placeholder="Select date"
                class="add-expected-arrival-modal__control"
              />
            </div>

            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">Est. Qty</label>
              <InputNumber
                v-model="form.qty"
                :min="0"
                placeholder="0"
                class="add-expected-arrival-modal__control"
                input-class="add-expected-arrival-modal__input-inner"
              />
            </div>

            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">Status</label>
              <Dropdown
                v-model="form.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="-- Select --"
                class="add-expected-arrival-modal__control"
              />
            </div>
          </div>

          <div class="add-expected-arrival-modal__grid add-expected-arrival-modal__grid--1">
            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">Reference</label>
              <InputText
                v-model="form.reference"
                placeholder="PO / reference"
                class="add-expected-arrival-modal__control"
              />
            </div>
          </div>

          <div class="add-expected-arrival-modal__grid add-expected-arrival-modal__grid--1">
            <div class="add-expected-arrival-modal__field">
              <label class="add-expected-arrival-modal__label">Notes</label>
              <Textarea
                v-model="form.notes"
                rows="3"
                auto-resize
                placeholder="Optional notes..."
                class="add-expected-arrival-modal__control"
              />
            </div>
          </div>
        </div>

        <div class="add-expected-arrival-modal__footer">
          <Button label="Cancel" severity="secondary" outlined @click="onClose" />
          <Button label="Save" :disabled="!isValid" @click="onSave" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.add-expected-arrival-modal__shell {
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.16);
  max-height: min(90vh, 860px);
}

.add-expected-arrival-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.55rem 1.75rem 1.15rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
  background: #ffffff;
  flex-shrink: 0;
}

.add-expected-arrival-modal__title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text, #262626);
}

.add-expected-arrival-modal__close {
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

.add-expected-arrival-modal__close:hover {
  background: #f5f5f5;
  color: var(--text, #262626);
}

.add-expected-arrival-modal__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.35rem 1.75rem 1.45rem;
  overflow-y: auto;
  background: #fbfbfb;
}

.add-expected-arrival-modal__grid {
  display: grid;
  gap: 14px;
}

.add-expected-arrival-modal__grid--1 {
  grid-template-columns: 1fr;
}

.add-expected-arrival-modal__grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.add-expected-arrival-modal__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.add-expected-arrival-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.add-expected-arrival-modal__label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text, #262626);
}

.add-expected-arrival-modal__req {
  color: var(--primary, #ec691a);
}

.add-expected-arrival-modal__control {
  width: 100%;
}

.add-expected-arrival-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.75rem 1.2rem;
  border-top: 1px solid var(--border, #e5e5e5);
  background: #ffffff;
  flex-shrink: 0;
}

:deep(.add-expected-arrival-modal .p-dialog) {
  border-radius: 22px;
  box-shadow: none;
  overflow: visible;
}

:deep(.add-expected-arrival-modal .p-dialog-header),
:deep(.add-expected-arrival-modal .p-dialog-content),
:deep(.add-expected-arrival-modal .p-dialog-footer) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.add-expected-arrival-modal .p-dialog-content) {
  overflow: visible;
}

:deep(.add-expected-arrival-modal .p-inputtext),
:deep(.add-expected-arrival-modal .p-inputnumber-input),
:deep(.add-expected-arrival-modal .p-dropdown),
:deep(.add-expected-arrival-modal .p-calendar),
:deep(.add-expected-arrival-modal .p-inputtextarea) {
  width: 100%;
}

:deep(.add-expected-arrival-modal .p-inputtext),
:deep(.add-expected-arrival-modal .p-inputnumber-input),
:deep(.add-expected-arrival-modal .p-dropdown),
:deep(.add-expected-arrival-modal .p-calendar .p-inputtext),
:deep(.add-expected-arrival-modal .p-inputtextarea) {
  min-height: 46px;
  border-radius: 10px;
  border-color: #cfd6df;
  font-size: 0.98rem;
  color: #334155;
  background: #ffffff;
}

:deep(.add-expected-arrival-modal .p-inputtextarea) {
  min-height: 92px;
  padding-top: 0.8rem;
}

:deep(.add-expected-arrival-modal .p-dropdown .p-dropdown-label) {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding-top: 0;
  padding-bottom: 0;
  color: #334155;
}

:deep(.add-expected-arrival-modal .p-inputtext::placeholder),
:deep(.add-expected-arrival-modal .p-inputnumber-input::placeholder),
:deep(.add-expected-arrival-modal .p-inputtextarea::placeholder),
:deep(.add-expected-arrival-modal .p-dropdown .p-placeholder) {
  color: #94a3b8;
}

:deep(.add-expected-arrival-modal .p-inputtext:enabled:hover),
:deep(.add-expected-arrival-modal .p-inputnumber-input:enabled:hover),
:deep(.add-expected-arrival-modal .p-dropdown:not(.p-disabled):hover),
:deep(.add-expected-arrival-modal .p-calendar:not(.p-calendar-disabled):hover .p-inputtext),
:deep(.add-expected-arrival-modal .p-inputtextarea:enabled:hover) {
  border-color: #b9c4d1;
}

:deep(.add-expected-arrival-modal .p-inputtext:enabled:focus),
:deep(.add-expected-arrival-modal .p-inputnumber-input:enabled:focus),
:deep(.add-expected-arrival-modal .p-inputtextarea:enabled:focus),
:deep(.add-expected-arrival-modal .p-calendar .p-inputtext:enabled:focus) {
  border-color: var(--primary, #ec691a);
  box-shadow: 0 0 0 3px rgba(236, 105, 26, 0.14);
}

:deep(.add-expected-arrival-modal .p-dropdown:not(.p-disabled).p-focus) {
  border-color: var(--primary, #ec691a);
  box-shadow: 0 0 0 3px rgba(236, 105, 26, 0.14);
}

:deep(.add-expected-arrival-modal .p-button) {
  min-height: 44px;
  padding: 0 1.2rem;
  border-radius: 12px;
  font-weight: 600;
}

:deep(.add-expected-arrival-modal .p-button.p-button-outlined) {
  background: #ffffff;
}

:deep(.add-expected-arrival-modal .p-button:disabled) {
  opacity: 1;
  background: #f1a775;
  border-color: #f1a775;
}

@media (max-width: 860px) {
  .add-expected-arrival-modal__grid--2,
  .add-expected-arrival-modal__grid--3 {
    grid-template-columns: 1fr;
  }

  .add-expected-arrival-modal__header,
  .add-expected-arrival-modal__body,
  .add-expected-arrival-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .add-expected-arrival-modal__footer {
    flex-direction: column-reverse;
  }

  :deep(.add-expected-arrival-modal .p-button) {
    width: 100%;
  }
}
</style>
