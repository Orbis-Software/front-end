<script setup lang="ts">
import Button from "primevue/button"
import { computed, ref } from "vue"

defineProps<{
  form: any
  disabled?: boolean
}>()

type PackageLine = {
  id: number
  description: string
  package_type: string
  qty: number
  length_cm: number | null
  width_cm: number | null
  height_cm: number | null
  gross_weight: number | null
}

const lines = ref<PackageLine[]>([
  {
    id: 1,
    description: "",
    package_type: "Carton",
    qty: 1,
    length_cm: null,
    width_cm: null,
    height_cm: null,
    gross_weight: null,
  },
])

const divisor = ref(6000)

function addLine() {
  lines.value.push({
    id: Date.now(),
    description: "",
    package_type: "Carton",
    qty: 1,
    length_cm: null,
    width_cm: null,
    height_cm: null,
    gross_weight: null,
  })
}

function removeLine(id: number) {
  lines.value = lines.value.filter(line => line.id !== id)
}

function volWeight(line: PackageLine) {
  const l = Number(line.length_cm || 0)
  const w = Number(line.width_cm || 0)
  const h = Number(line.height_cm || 0)
  return (l * w * h) / divisor.value
}

function chargeable(line: PackageLine) {
  return Math.max(Number(line.gross_weight || 0), volWeight(line))
}

const totalQty = computed(() => lines.value.reduce((sum, line) => sum + Number(line.qty || 0), 0))
const totalGross = computed(() =>
  lines.value.reduce(
    (sum, line) => sum + Number(line.gross_weight || 0) * Number(line.qty || 0),
    0,
  ),
)
const totalVol = computed(() =>
  lines.value.reduce((sum, line) => sum + volWeight(line) * Number(line.qty || 0), 0),
)
const totalChargeable = computed(() => Math.max(totalGross.value, totalVol.value))
const totalVolumeCbm = computed(() =>
  lines.value.reduce((sum, line) => {
    const l = Number(line.length_cm || 0)
    const w = Number(line.width_cm || 0)
    const h = Number(line.height_cm || 0)
    return sum + ((l * w * h) / 1_000_000) * Number(line.qty || 0)
  }, 0),
)
</script>

<template>
  <section class="air-card">
    <div class="air-card__head">
      <h3 class="air-card__title">Package Lines</h3>

      <Button
        label="Add Package"
        icon="pi pi-plus"
        size="small"
        :disabled="disabled"
        @click="addLine"
      />
    </div>

    <div class="air-card__body">
      <div class="air-field" style="max-width: 220px; margin-bottom: 12px">
        <label>Vol. Weight Divisor</label>
        <select v-model.number="divisor" class="air-select" :disabled="disabled">
          <option :value="6000">6000 (Air standard)</option>
          <option :value="5000">5000 (Air alt.)</option>
          <option :value="4000">4000 (Premium air)</option>
        </select>
      </div>

      <div class="air-table-wrap">
        <table class="air-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Pkg Type</th>
              <th>Qty</th>
              <th>L (cm)</th>
              <th>W (cm)</th>
              <th>H (cm)</th>
              <th>Gross Wt (kg)</th>
              <th>Vol Wt (kg)</th>
              <th>Chg Wt (kg)</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(line, index) in lines" :key="line.id">
              <td class="air-table__num">{{ index + 1 }}</td>
              <td><input v-model="line.description" type="text" :disabled="disabled" /></td>
              <td>
                <select v-model="line.package_type" :disabled="disabled">
                  <option>Carton</option>
                  <option>Pallet</option>
                  <option>Box</option>
                  <option>Crate</option>
                  <option>Drum</option>
                  <option>Bag</option>
                  <option>Roll</option>
                  <option>Case</option>
                  <option>Tube</option>
                  <option>Other</option>
                </select>
              </td>
              <td>
                <input v-model.number="line.qty" type="number" min="1" :disabled="disabled" />
              </td>
              <td>
                <input
                  v-model.number="line.length_cm"
                  type="number"
                  min="0"
                  step="0.1"
                  :disabled="disabled"
                />
              </td>
              <td>
                <input
                  v-model.number="line.width_cm"
                  type="number"
                  min="0"
                  step="0.1"
                  :disabled="disabled"
                />
              </td>
              <td>
                <input
                  v-model.number="line.height_cm"
                  type="number"
                  min="0"
                  step="0.1"
                  :disabled="disabled"
                />
              </td>
              <td>
                <input
                  v-model.number="line.gross_weight"
                  type="number"
                  min="0"
                  step="0.001"
                  :disabled="disabled"
                />
              </td>
              <td><input :value="volWeight(line).toFixed(3)" type="text" disabled /></td>
              <td><input :value="chargeable(line).toFixed(3)" type="text" disabled /></td>
              <td>
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  :disabled="disabled"
                  @click="removeLine(line.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="air-summary" style="margin-top: 14px">
        <div class="air-summary__item">
          <div class="air-summary__label">Total Pieces</div>
          <div class="air-summary__value">{{ totalQty }}</div>
        </div>
        <div class="air-summary__item">
          <div class="air-summary__label">Gross Weight</div>
          <div class="air-summary__value">{{ totalGross.toFixed(3) }}</div>
        </div>
        <div class="air-summary__item">
          <div class="air-summary__label">Volume Weight</div>
          <div class="air-summary__value">{{ totalVol.toFixed(3) }}</div>
        </div>
        <div class="air-summary__item">
          <div class="air-summary__label">Chargeable Weight</div>
          <div class="air-summary__value air-summary__value--accent">
            {{ totalChargeable.toFixed(3) }}
          </div>
        </div>
        <div class="air-summary__item">
          <div class="air-summary__label">Total Volume</div>
          <div class="air-summary__value">{{ totalVolumeCbm.toFixed(3) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
