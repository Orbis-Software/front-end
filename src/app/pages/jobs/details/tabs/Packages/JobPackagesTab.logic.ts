import { computed, ref } from "vue"

export type PackageRow = {
  id: number
  type: string
  description: string
  quantity: number
  lengthCm: number
  widthCm: number
  heightCm: number
  grossWeightKg: number
  volumeWeightKg: number
  cbm: number
}

let nextId = 1

function createRow(): PackageRow {
  return {
    id: nextId++,
    type: "Pallet",
    description: "",
    quantity: 1,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    grossWeightKg: 0,
    volumeWeightKg: 0,
    cbm: 0,
  }
}

export function useJobPackagesTab() {
  const rows = ref<PackageRow[]>([createRow()])

  function calculateRow(row: PackageRow) {
    const quantity = Number(row.quantity || 0)
    const length = Number(row.lengthCm || 0)
    const width = Number(row.widthCm || 0)
    const height = Number(row.heightCm || 0)

    row.volumeWeightKg = ((length * width * height) / 5000) * quantity
    row.cbm = ((length * width * height) / 1000000) * quantity
  }

  function addRow() {
    rows.value.push(createRow())
  }

  function removeRow(id: number) {
    rows.value = rows.value.filter(row => row.id !== id)
  }

  const totals = computed(() => {
    return rows.value.reduce(
      (carry, row) => {
        const quantity = Number(row.quantity || 0)

        return {
          totalPieces: carry.totalPieces + quantity,
          totalGrossWeightKg: carry.totalGrossWeightKg + Number(row.grossWeightKg || 0) * quantity,
          totalVolumeWeightKg: carry.totalVolumeWeightKg + Number(row.volumeWeightKg || 0),
          totalCbm: carry.totalCbm + Number(row.cbm || 0),
        }
      },
      {
        totalPieces: 0,
        totalGrossWeightKg: 0,
        totalVolumeWeightKg: 0,
        totalCbm: 0,
      },
    )
  })

  return {
    rows,
    totals,
    addRow,
    removeRow,
    calculateRow,
  }
}
