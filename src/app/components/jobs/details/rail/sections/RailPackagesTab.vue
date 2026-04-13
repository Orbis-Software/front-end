<script setup lang="ts">
import { computed, ref } from "vue"

const props = defineProps<{
  form: any
  disabled?: boolean
}>()

type PackageLine = {
  id: number
  package_type: string
  qty: number
  length_cm: number | null
  width_cm: number | null
  height_cm: number | null
  gross_weight_per_pkg: number | null
  description: string
  mark_ref: string
}

const lines = ref<PackageLine[]>([
  {
    id: 1,
    package_type: "",
    qty: 1,
    length_cm: null,
    width_cm: null,
    height_cm: null,
    gross_weight_per_pkg: null,
    description: "",
    mark_ref: "",
  },
])

const VOL_DIVISOR = 4000

function addLine() {
  lines.value.push({
    id: Date.now(),
    package_type: "",
    qty: 1,
    length_cm: null,
    width_cm: null,
    height_cm: null,
    gross_weight_per_pkg: null,
    description: "",
    mark_ref: "",
  })
}

function removeLine(id: number) {
  lines.value = lines.value.filter(line => line.id !== id)
}

function volumetricWeight(line: PackageLine) {
  const l = Number(line.length_cm || 0)
  const w = Number(line.width_cm || 0)
  const h = Number(line.height_cm || 0)
  return (l * w * h) / VOL_DIVISOR
}

function totalGross(line: PackageLine) {
  return Number(line.qty || 0) * Number(line.gross_weight_per_pkg || 0)
}

function chargeable(line: PackageLine) {
  return (
    Number(line.qty || 0) * Math.max(volumetricWeight(line), Number(line.gross_weight_per_pkg || 0))
  )
}

const totalPkgs = computed(() => lines.value.reduce((sum, line) => sum + Number(line.qty || 0), 0))

const totalVolume = computed(() =>
  lines.value.reduce((sum, line) => {
    const l = Number(line.length_cm || 0)
    const w = Number(line.width_cm || 0)
    const h = Number(line.height_cm || 0)
    return sum + (l * w * h * Number(line.qty || 0)) / 1_000_000
  }, 0),
)

const totalGrossWeight = computed(() =>
  lines.value.reduce((sum, line) => sum + totalGross(line), 0),
)

const totalVolWeight = computed(() =>
  lines.value.reduce((sum, line) => sum + Number(line.qty || 0) * volumetricWeight(line), 0),
)

const totalChargeable = computed(() => lines.value.reduce((sum, line) => sum + chargeable(line), 0))
</script>

<template>
  <section class="rail-card">
    <div class="rail-card__header">
      <h3 class="rail-card__title">Package Lines</h3>
      <Button
        label="Add Line"
        icon="pi pi-plus"
        size="small"
        :disabled="disabled"
        @click="addLine"
      />
    </div>

    <div class="rail-table-wrap">
      <table class="rail-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Package Type</th>
            <th>Qty</th>
            <th>Length cm</th>
            <th>Width cm</th>
            <th>Height cm</th>
            <th>Vol. Wt kg</th>
            <th>Gross Wt/Pkg</th>
            <th>Total Gross</th>
            <th>Chargeable</th>
            <th>Description</th>
            <th>Mark / Ref</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(line, index) in lines" :key="line.id">
            <td class="rail-table__num">{{ index + 1 }}</td>
            <td>
              <select v-model="line.package_type" :disabled="disabled">
                <option value="">Type…</option>
                <option>Pallet</option>
                <option>Box / Carton</option>
                <option>Container 20ft</option>
                <option>Container 40ft</option>
                <option>Case</option>
                <option>Bag</option>
                <option>Drum</option>
                <option>Roll / Coil</option>
                <option>Bundle</option>
                <option>Crate</option>
              </select>
            </td>
            <td><input v-model.number="line.qty" type="number" min="1" :disabled="disabled" /></td>
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
            <td><input :value="volumetricWeight(line).toFixed(2)" type="text" disabled /></td>
            <td>
              <input
                v-model.number="line.gross_weight_per_pkg"
                type="number"
                min="0"
                step="0.01"
                :disabled="disabled"
              />
            </td>
            <td><input :value="totalGross(line).toFixed(2)" type="text" disabled /></td>
            <td><input :value="chargeable(line).toFixed(2)" type="text" disabled /></td>
            <td><input v-model="line.description" type="text" :disabled="disabled" /></td>
            <td><input v-model="line.mark_ref" type="text" :disabled="disabled" /></td>
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

    <div class="rail-summary">
      <div class="rail-summary__item">
        <div class="rail-summary__label">Total Pkgs</div>
        <div class="rail-summary__value">{{ totalPkgs }}</div>
      </div>
      <div class="rail-summary__item">
        <div class="rail-summary__label">Total Volume</div>
        <div class="rail-summary__value">{{ totalVolume.toFixed(3) }} m³</div>
      </div>
      <div class="rail-summary__item">
        <div class="rail-summary__label">Total Gross Weight</div>
        <div class="rail-summary__value">{{ totalGrossWeight.toFixed(2) }} kg</div>
      </div>
      <div class="rail-summary__item">
        <div class="rail-summary__label">Total Vol. Weight</div>
        <div class="rail-summary__value">{{ totalVolWeight.toFixed(2) }} kg</div>
      </div>
      <div class="rail-summary__item">
        <div class="rail-summary__label">Total Chargeable</div>
        <div class="rail-summary__value rail-summary__value--accent">
          {{ totalChargeable.toFixed(2) }} kg
        </div>
      </div>
    </div>

    <div class="rail-card__body">
      <div class="rail-note">
        Volumetric divisor: <strong>4000</strong> — L × W × H (cm³) ÷ 4000 = kg. Chargeable weight =
        MAX(Gross, Volumetric) per line.
      </div>
    </div>
  </section>
</template>
