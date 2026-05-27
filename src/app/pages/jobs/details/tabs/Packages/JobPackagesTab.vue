<script setup lang="ts">
import "./JobPackagesTab.css"
import { useJobPackagesTab } from "./JobPackagesTab.logic"

const { rows, totals, addRow, removeRow, calculateRow, setStackable, packageTypeOptions } =
  useJobPackagesTab()
</script>

<template>
  <section class="job-packages-tab">
    <div class="job-packages-tab__section">
      <header class="job-packages-tab__section-header">
        <div>
          <h2>Packages</h2>
          <p>Add package lines and calculate CBM / volume weight.</p>
        </div>

        <button type="button" class="job-packages-tab__add-btn" @click="addRow">
          + Add Package
        </button>
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
              <th>Stacking</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td class="job-packages-tab__number">
                {{ index + 1 }}
              </td>

              <td>
                <select v-model="row.package_type">
                  <option
                    v-for="option in packageTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </td>

              <td>
                <input v-model="row.description" type="text" placeholder="Description" />
              </td>

              <td class="job-packages-tab__compact-cell">
                <input
                  v-model.number="row.quantity"
                  class="job-packages-tab__compact-input"
                  type="number"
                  min="1"
                  max="9999"
                  @input="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <input
                  v-model.number="row.lengthCm"
                  class="job-packages-tab__compact-input"
                  type="number"
                  min="0"
                  max="9999"
                  @input="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <input
                  v-model.number="row.widthCm"
                  class="job-packages-tab__compact-input"
                  type="number"
                  min="0"
                  max="9999"
                  @input="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__compact-cell">
                <input
                  v-model.number="row.heightCm"
                  class="job-packages-tab__compact-input"
                  type="number"
                  min="0"
                  max="9999"
                  @input="calculateRow(row)"
                />
              </td>

              <td>
                <input
                  v-model.number="row.grossWeightKg"
                  type="number"
                  min="0"
                  step="0.01"
                  @input="calculateRow(row)"
                />
              </td>

              <td class="job-packages-tab__computed">
                {{ row.volumeWeightKg.toFixed(2) }}
              </td>

              <td class="job-packages-tab__computed">
                {{ row.cbm.toFixed(3) }}
              </td>

              <td>
                <div class="job-packages-tab__stack-choice">
                  <label>
                    <input
                      :checked="row.stackable"
                      type="checkbox"
                      @change="setStackable(row, true)"
                    />
                    <span>Stackable</span>
                  </label>
                  <label>
                    <input
                      :checked="!row.stackable"
                      type="checkbox"
                      @change="setStackable(row, false)"
                    />
                    <span>Non-stack</span>
                  </label>
                  <label>
                    <input v-model="row.atTheTop" type="checkbox" />
                    <span>At the top</span>
                  </label>
                </div>
              </td>

              <td>
                <button
                  type="button"
                  class="job-packages-tab__remove-btn"
                  @click="removeRow(row.id)"
                >
                  ×
                </button>
              </td>
            </tr>

            <tr v-if="!rows.length">
              <td colspan="12" class="job-packages-tab__empty">
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
