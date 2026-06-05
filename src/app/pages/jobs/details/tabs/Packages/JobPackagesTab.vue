<script setup lang="ts">
import { computed, ref } from "vue"
import "./JobPackagesTab.css"
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dialog from "primevue/dialog"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import { useJobPackagesTab, type PackageRow } from "./JobPackagesTab.logic"

const {
  rows,
  totals,
  addRow,
  removeRow,
  calculateRow,
  getPackageStackOption,
  setPackageStackOption,
  packageTypeOptions,
} = useJobPackagesTab()

const showRemoveDialog = ref(false)
const pendingRemoveRow = ref<PackageRow | null>(null)
const pendingRemoveLabel = computed(() => {
  const row = pendingRemoveRow.value
  if (!row) return "this package"

  return `${row.package_type || "Package"} x ${Number(row.quantity || 1)}`
})

function requestRemoveRow(row: PackageRow) {
  pendingRemoveRow.value = row
  showRemoveDialog.value = true
}

function cancelRemoveRow() {
  showRemoveDialog.value = false
  pendingRemoveRow.value = null
}

function confirmRemoveRow() {
  if (!pendingRemoveRow.value) return

  removeRow(pendingRemoveRow.value)
  cancelRemoveRow()
}
</script>

<template>
  <section class="job-packages-tab">
    <div class="job-packages-tab__section">
      <header class="job-packages-tab__section-header">
        <div>
          <h2>Packages</h2>
          <p>Add package lines and calculate CBM / volume weight.</p>
        </div>

        <Button
          type="button"
          class="job-packages-tab__add-btn"
          label="Add Package"
          icon="pi pi-plus"
          @click="addRow"
        />
      </header>

      <div class="job-packages-tab__table-wrap">
        <table class="job-packages-tab__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Packaging</th>
              <th class="job-packages-tab__compact-heading">Qty</th>
              <th class="job-packages-tab__compact-heading">Length</th>
              <th class="job-packages-tab__compact-heading">Width</th>
              <th class="job-packages-tab__compact-heading">Height</th>
              <th>Gross kg</th>
              <th>Vol kg</th>
              <th>CBM</th>
              <th class="job-packages-tab__check-heading">ADR</th>
              <th class="job-packages-tab__check-heading">Stackable</th>
              <th class="job-packages-tab__check-heading">Non-Stack</th>
              <th class="job-packages-tab__check-heading">Top-Loadable</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td class="job-packages-tab__number">
                {{ index + 1 }}
              </td>

              <td>
                <Dropdown
                  v-model="row.package_type"
                  :options="packageTypeOptions"
                  option-label="label"
                  option-value="value"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <InputNumber
                  v-model="row.quantity"
                  class="job-packages-tab__compact-control"
                  input-class="job-packages-tab__compact-input"
                  :min="1"
                  :max="9999"
                  @update:model-value="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <InputNumber
                  v-model="row.lengthCm"
                  class="job-packages-tab__compact-control"
                  input-class="job-packages-tab__compact-input"
                  :min="0"
                  :max="9999"
                  @update:model-value="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <InputNumber
                  v-model="row.widthCm"
                  class="job-packages-tab__compact-control"
                  input-class="job-packages-tab__compact-input"
                  :min="0"
                  :max="9999"
                  @update:model-value="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <InputNumber
                  v-model="row.heightCm"
                  class="job-packages-tab__compact-control"
                  input-class="job-packages-tab__compact-input"
                  :min="0"
                  :max="9999"
                  @update:model-value="calculateRow(row)"
                />
              </td>

              <td>
                <InputNumber
                  v-model="row.grossWeightKg"
                  :min="0"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  @update:model-value="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__computed">
                {{ row.volumeWeightKg.toFixed(2) }}
              </td>

              <td class="job-packages-tab__computed">
                {{ row.cbm.toFixed(3) }}
              </td>

              <td class="job-packages-tab__check-cell">
                <Checkbox v-model="row.adr" class="job-packages-tab__check-input" binary />
              </td>

              <td class="job-packages-tab__check-cell">
                <Checkbox
                  class="job-packages-tab__check-input"
                  :model-value="getPackageStackOption(row) === 'stackable'"
                  binary
                  @update:model-value="setPackageStackOption(row, 'stackable')"
                />
              </td>
              <td class="job-packages-tab__check-cell">
                <Checkbox
                  class="job-packages-tab__check-input"
                  :model-value="getPackageStackOption(row) === 'non_stack'"
                  binary
                  @update:model-value="setPackageStackOption(row, 'non_stack')"
                />
              </td>
              <td class="job-packages-tab__check-cell">
                <Checkbox
                  class="job-packages-tab__check-input"
                  :model-value="getPackageStackOption(row) === 'top_loadable'"
                  binary
                  @update:model-value="setPackageStackOption(row, 'top_loadable')"
                />
              </td>

              <td>
                <Button
                  type="button"
                  class="job-packages-tab__remove-btn"
                  icon="pi pi-trash"
                  text
                  rounded
                  aria-label="Remove package"
                  @click="requestRemoveRow(row)"
                />
              </td>
            </tr>

            <tr v-if="!rows.length">
              <td colspan="14" class="job-packages-tab__empty">
                No packages yet. Click Add Package to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="job-packages-tab__totals">
      <div class="job-packages-tab__total-card">
        <span>Total Pieces</span>
        <strong>{{ totals.totalPieces }}</strong>
      </div>

      <div class="job-packages-tab__total-card">
        <span>Gross Weight</span>
        <strong>{{ totals.totalGrossWeightKg.toFixed(2) }}</strong>
        <small>kg</small>
      </div>

      <div class="job-packages-tab__total-card">
        <span>Volume Weight</span>
        <strong>{{ totals.totalVolumeWeightKg.toFixed(2) }}</strong>
        <small>kg</small>
      </div>

      <div class="job-packages-tab__total-card">
        <span>Total CBM</span>
        <strong>{{ totals.totalCbm.toFixed(3) }}</strong>
        <small>m³</small>
      </div>
    </div>

    <Dialog
      v-model:visible="showRemoveDialog"
      header="Remove package"
      modal
      class="job-packages-tab__confirm-dialog"
      :style="{ width: '420px' }"
      @hide="pendingRemoveRow = null"
    >
      <p class="job-packages-tab__confirm-copy">
        Remove {{ pendingRemoveLabel }} from this job?
      </p>

      <template #footer>
        <Button type="button" label="Cancel" text @click="cancelRemoveRow" />
        <Button
          type="button"
          label="Remove"
          icon="pi pi-trash"
          severity="danger"
          @click="confirmRemoveRow"
        />
      </template>
    </Dialog>
  </section>
</template>
