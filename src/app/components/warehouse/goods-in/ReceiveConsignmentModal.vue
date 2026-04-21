<script setup lang="ts">
import { computed, reactive, watch } from "vue"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import Textarea from "primevue/textarea"
import InputNumber from "primevue/inputnumber"
import Dropdown from "primevue/dropdown"
import Button from "primevue/button"

type Option = {
  label: string
  value: string
}

type BreakdownLine = {
  description: string
  qty: number | null
  unit: string
}

export type ReceiveConsignmentPayload = {
  customer: string
  supplier: string
  reference: string
  description: string
  goodsType: string
  packagingType: string
  qty: number | null
  unit: string
  weight: number | null
  cbm: number | null
  location: string
  receivedBy: string
  notes: string
  lines: BreakdownLine[]
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "saved", payload: ReceiveConsignmentPayload): void
}>()

const customerOptions: Option[] = [
  { label: "Greenfield Imports", value: "Greenfield Imports" },
  { label: "NovaTech Solutions", value: "NovaTech Solutions" },
]

const supplierOptions: Option[] = [
  { label: "TechSource Ltd", value: "TechSource Ltd" },
  { label: "Global Imports Co", value: "Global Imports Co" },
]

const goodsTypeOptions: Option[] = [
  { label: "Electronics", value: "Electronics" },
  { label: "Textiles", value: "Textiles" },
  { label: "Food & Beverage", value: "Food & Beverage" },
  { label: "Chemicals", value: "Chemicals" },
]

const packagingTypeOptions: Option[] = [
  { label: "Pallets", value: "Pallets" },
  { label: "Cartons", value: "Cartons" },
  { label: "Pieces", value: "Pieces" },
  { label: "Rolls", value: "Rolls" },
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

function createInitialForm() {
  return {
    customer: "",
    supplier: "",
    reference: "",
    description: "",
    goodsType: "",
    packagingType: "",
    qty: null as number | null,
    unit: "",
    weight: null as number | null,
    cbm: null as number | null,
    location: "",
    receivedBy: "Ian H",
    notes: "",
    lines: [] as BreakdownLine[],
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
  return !!(form.customer && form.supplier && form.description.trim() && form.qty && form.qty > 0)
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
    customer: form.customer,
    supplier: form.supplier,
    reference: form.reference.trim(),
    description: form.description.trim(),
    goodsType: form.goodsType,
    packagingType: form.packagingType,
    qty: form.qty,
    unit: form.unit,
    weight: form.weight,
    cbm: form.cbm,
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
    :style="{ width: '1120px', maxWidth: '96vw' }"
    class="receive-consignment-modal"
    @update:visible="value => !value && onClose()"
  >
    <template #container>
      <div class="receive-consignment-modal__shell">
        <div class="receive-consignment-modal__header">
          <div class="receive-consignment-modal__header-left">
            <h2 class="receive-consignment-modal__title">Receive Consignment</h2>
          </div>

          <button
            type="button"
            class="receive-consignment-modal__close"
            aria-label="Close"
            @click="onClose"
          >
            ×
          </button>
        </div>

        <div class="receive-consignment-modal__body">
          <div class="receive-consignment-modal__section">
            <div class="receive-consignment-modal__grid receive-consignment-modal__grid--3">
              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">
                  Customer <span class="receive-consignment-modal__req">*</span>
                </label>
                <Dropdown
                  v-model="form.customer"
                  :options="customerOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="receive-consignment-modal__control"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">
                  Supplier <span class="receive-consignment-modal__req">*</span>
                </label>
                <Dropdown
                  v-model="form.supplier"
                  :options="supplierOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="receive-consignment-modal__control"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Customer Ref / PO</label>
                <InputText
                  v-model="form.reference"
                  placeholder="e.g. PO-2026-441"
                  class="receive-consignment-modal__control"
                />
              </div>
            </div>

            <div class="receive-consignment-modal__grid receive-consignment-modal__grid--1">
              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">
                  Goods Description <span class="receive-consignment-modal__req">*</span>
                </label>
                <InputText
                  v-model="form.description"
                  placeholder="Brief description of contents"
                  class="receive-consignment-modal__control"
                />
              </div>
            </div>

            <div class="receive-consignment-modal__grid receive-consignment-modal__grid--4">
              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Goods Type</label>
                <Dropdown
                  v-model="form.goodsType"
                  :options="goodsTypeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="receive-consignment-modal__control"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Packaging Type</label>
                <Dropdown
                  v-model="form.packagingType"
                  :options="packagingTypeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="receive-consignment-modal__control"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">
                  Qty <span class="receive-consignment-modal__req">*</span>
                </label>
                <InputNumber
                  v-model="form.qty"
                  :min="1"
                  placeholder="0"
                  class="receive-consignment-modal__control"
                  input-class="receive-consignment-modal__input-inner"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Unit</label>
                <Dropdown
                  v-model="form.unit"
                  :options="unitOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="receive-consignment-modal__control"
                />
              </div>
            </div>

            <div class="receive-consignment-modal__grid receive-consignment-modal__grid--4">
              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Weight (kg)</label>
                <InputNumber
                  v-model="form.weight"
                  :min="0"
                  :min-fraction-digits="0"
                  :max-fraction-digits="2"
                  placeholder="0.0"
                  class="receive-consignment-modal__control"
                  input-class="receive-consignment-modal__input-inner"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">CBM</label>
                <InputNumber
                  v-model="form.cbm"
                  :min="0"
                  :min-fraction-digits="0"
                  :max-fraction-digits="2"
                  placeholder="0.00"
                  class="receive-consignment-modal__control"
                  input-class="receive-consignment-modal__input-inner"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Storage Location</label>
                <Dropdown
                  v-model="form.location"
                  :options="locationOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="-- Select --"
                  class="receive-consignment-modal__control"
                />
              </div>

              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Received By</label>
                <InputText v-model="form.receivedBy" class="receive-consignment-modal__control" />
              </div>
            </div>

            <div class="receive-consignment-modal__grid receive-consignment-modal__grid--1">
              <div class="receive-consignment-modal__field">
                <label class="receive-consignment-modal__label">Notes</label>
                <Textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Any special handling notes..."
                  class="receive-consignment-modal__control"
                  auto-resize
                />
              </div>
            </div>
          </div>

          <div class="receive-consignment-modal__breakdown">
            <div class="receive-consignment-modal__breakdown-header">
              <div class="receive-consignment-modal__breakdown-title-wrap">
                <p class="receive-consignment-modal__breakdown-title">Contents Breakdown</p>
                <span class="receive-consignment-modal__breakdown-subtitle">(optional)</span>
              </div>
            </div>

            <div v-if="form.lines.length" class="receive-consignment-modal__lines">
              <div
                v-for="(line, index) in form.lines"
                :key="index"
                class="receive-consignment-modal__line-row"
              >
                <div
                  class="receive-consignment-modal__line-col receive-consignment-modal__line-col--desc"
                >
                  <InputText
                    v-model="line.description"
                    placeholder="Description"
                    class="receive-consignment-modal__line-control"
                  />
                </div>

                <div
                  class="receive-consignment-modal__line-col receive-consignment-modal__line-col--qty"
                >
                  <InputNumber
                    v-model="line.qty"
                    :min="0"
                    placeholder="Qty"
                    class="receive-consignment-modal__line-control"
                    input-class="receive-consignment-modal__input-inner"
                  />
                </div>

                <div
                  class="receive-consignment-modal__line-col receive-consignment-modal__line-col--unit"
                >
                  <Dropdown
                    v-model="line.unit"
                    :options="unitOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Unit"
                    class="receive-consignment-modal__line-control"
                  />
                </div>

                <div
                  class="receive-consignment-modal__line-col receive-consignment-modal__line-col--remove"
                >
                  <button
                    type="button"
                    class="receive-consignment-modal__remove-btn"
                    @click="removeLine(index)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <button type="button" class="receive-consignment-modal__ghost-btn" @click="addLine">
              + Add Line
            </button>
          </div>
        </div>

        <div class="receive-consignment-modal__footer">
          <Button label="Cancel" severity="secondary" outlined @click="onClose" />
          <Button label="Receive Consignment" :disabled="!isValid" @click="onSave" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.receive-consignment-modal__shell {
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #d9d9d9);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.16);
  max-height: min(90vh, 920px);
}

.receive-consignment-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.6rem 1.9rem 1.15rem;
  border-bottom: 1px solid var(--border, #e5e5e5);
  background: #ffffff;
  flex-shrink: 0;
}

.receive-consignment-modal__title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--text, #262626);
}

.receive-consignment-modal__close {
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

.receive-consignment-modal__close:hover {
  background: #f5f5f5;
  color: var(--text, #262626);
}

.receive-consignment-modal__body {
  padding: 1.35rem 1.9rem 1.5rem;
  overflow-y: auto;
  background: #fbfbfb;
}

.receive-consignment-modal__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.receive-consignment-modal__grid {
  display: grid;
  gap: 14px;
}

.receive-consignment-modal__grid--1 {
  grid-template-columns: 1fr;
}

.receive-consignment-modal__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.receive-consignment-modal__grid--4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.receive-consignment-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}

.receive-consignment-modal__label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text, #262626);
}

.receive-consignment-modal__req {
  color: var(--primary, #ec691a);
}

.receive-consignment-modal__control {
  width: 100%;
}

.receive-consignment-modal__breakdown {
  margin-top: 1.2rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--border, #e5e5e5);
}

.receive-consignment-modal__breakdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.receive-consignment-modal__breakdown-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.receive-consignment-modal__breakdown-title {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted, #737373);
}

.receive-consignment-modal__breakdown-subtitle {
  font-size: 0.84rem;
  color: var(--text-muted, #737373);
}

.receive-consignment-modal__lines {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.receive-consignment-modal__line-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px 180px 52px;
  gap: 12px;
  align-items: center;
}

.receive-consignment-modal__line-col {
  min-width: 0;
}

.receive-consignment-modal__line-col--desc {
  min-width: 0;
}

.receive-consignment-modal__line-col--qty {
  min-width: 140px;
}

.receive-consignment-modal__line-col--unit {
  min-width: 170px;
}

.receive-consignment-modal__line-col--remove {
  display: flex;
  justify-content: center;
}

.receive-consignment-modal__line-control {
  width: 100%;
}

.receive-consignment-modal__remove-btn {
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

.receive-consignment-modal__remove-btn:hover {
  background: #fff5f5;
  border-color: #efcaca;
  transform: translateY(-1px);
}

.receive-consignment-modal__ghost-btn {
  margin-top: 0.7rem;
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

.receive-consignment-modal__ghost-btn:hover {
  background: #f7f7f7;
  border-color: #cfcfcf;
  color: var(--text, #262626);
}

.receive-consignment-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.9rem 1.25rem;
  border-top: 1px solid var(--border, #e5e5e5);
  background: #ffffff;
  flex-shrink: 0;
}

:deep(.receive-consignment-modal .p-dialog) {
  border-radius: 22px;
  box-shadow: none;
  overflow: visible;
}

:deep(.receive-consignment-modal .p-dialog-header),
:deep(.receive-consignment-modal .p-dialog-content),
:deep(.receive-consignment-modal .p-dialog-footer) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.receive-consignment-modal .p-dialog-content) {
  overflow: visible;
}

:deep(.receive-consignment-modal .p-inputtext),
:deep(.receive-consignment-modal .p-inputnumber-input),
:deep(.receive-consignment-modal .p-dropdown),
:deep(.receive-consignment-modal .p-inputtextarea) {
  width: 100%;
  min-height: 46px;
  border-radius: 10px;
  border-color: #cfd6df;
  font-size: 0.98rem;
  color: #334155;
  background: #ffffff;
}

:deep(.receive-consignment-modal .p-inputtextarea) {
  min-height: 92px;
  padding-top: 0.8rem;
}

:deep(.receive-consignment-modal .p-dropdown .p-dropdown-label) {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding-top: 0;
  padding-bottom: 0;
  color: #334155;
}

:deep(.receive-consignment-modal .p-inputtext::placeholder),
:deep(.receive-consignment-modal .p-inputnumber-input::placeholder),
:deep(.receive-consignment-modal .p-inputtextarea::placeholder),
:deep(.receive-consignment-modal .p-dropdown .p-placeholder) {
  color: #94a3b8;
}

:deep(.receive-consignment-modal .p-inputtext:enabled:hover),
:deep(.receive-consignment-modal .p-inputnumber-input:enabled:hover),
:deep(.receive-consignment-modal .p-dropdown:not(.p-disabled):hover),
:deep(.receive-consignment-modal .p-inputtextarea:enabled:hover) {
  border-color: #b9c4d1;
}

:deep(.receive-consignment-modal .p-inputtext:enabled:focus),
:deep(.receive-consignment-modal .p-inputnumber-input:enabled:focus),
:deep(.receive-consignment-modal .p-inputtextarea:enabled:focus) {
  border-color: var(--primary, #ec691a);
  box-shadow: 0 0 0 3px rgba(236, 105, 26, 0.14);
}

:deep(.receive-consignment-modal .p-dropdown:not(.p-disabled).p-focus) {
  border-color: var(--primary, #ec691a);
  box-shadow: 0 0 0 3px rgba(236, 105, 26, 0.14);
}

:deep(.receive-consignment-modal .p-inputnumber),
:deep(.receive-consignment-modal .p-dropdown) {
  width: 100%;
}

:deep(.receive-consignment-modal .p-button) {
  min-height: 44px;
  padding: 0 1.2rem;
  border-radius: 12px;
  font-weight: 600;
}

:deep(.receive-consignment-modal .p-button.p-button-outlined) {
  background: #ffffff;
}

:deep(.receive-consignment-modal .p-button:disabled) {
  opacity: 1;
  background: #f1a775;
  border-color: #f1a775;
}

@media (max-width: 1100px) {
  .receive-consignment-modal__grid--4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .receive-consignment-modal__header,
  .receive-consignment-modal__body,
  .receive-consignment-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .receive-consignment-modal__grid--3,
  .receive-consignment-modal__grid--4 {
    grid-template-columns: 1fr;
  }

  .receive-consignment-modal__line-row {
    grid-template-columns: 1fr;
  }

  .receive-consignment-modal__remove-btn {
    width: 100%;
  }

  .receive-consignment-modal__footer {
    flex-direction: column-reverse;
  }

  :deep(.receive-consignment-modal .p-button) {
    width: 100%;
  }
}

@media (max-width: 820px) {
  .receive-consignment-modal__header,
  .receive-consignment-modal__body,
  .receive-consignment-modal__footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .receive-consignment-modal__grid--3,
  .receive-consignment-modal__grid--4 {
    grid-template-columns: 1fr;
  }

  .receive-consignment-modal__line-row {
    grid-template-columns: 1fr;
  }

  .receive-consignment-modal__line-col--qty,
  .receive-consignment-modal__line-col--unit {
    min-width: 0;
  }

  .receive-consignment-modal__line-col--remove {
    justify-content: stretch;
  }

  .receive-consignment-modal__remove-btn {
    width: 100%;
  }

  .receive-consignment-modal__footer {
    flex-direction: column-reverse;
  }

  :deep(.receive-consignment-modal .p-button) {
    width: 100%;
  }
}
</style>
