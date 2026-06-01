<script setup lang="ts">
import "./JobPackagesTab.css"
import Button from "primevue/button"
import Checkbox from "primevue/checkbox"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import { useJobPackagesTab } from "./JobPackagesTab.logic"

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
              <th>Description</th>
              <th class="job-packages-tab__compact-heading">Qty</th>
              <th class="job-packages-tab__compact-heading">Length</th>
              <th class="job-packages-tab__compact-heading">Width</th>
              <th class="job-packages-tab__compact-heading">Height</th>
              <th>Gross kg</th>
              <th>Vol kg</th>
              <th>CBM</th>
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

              <td>
                <InputText v-model="row.description" placeholder="Description" />
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
                  icon="pi pi-times"
                  text
                  rounded
                  aria-label="Remove package"
                  @click="removeRow(row.id)"
                />
              </td>
            </tr>

            <tr v-if="!rows.length">
              <td colspan="14" class="job-packages-tab__empty">
                No packages yet. Click “Add Package” to create one.
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
  </section>
</template>
