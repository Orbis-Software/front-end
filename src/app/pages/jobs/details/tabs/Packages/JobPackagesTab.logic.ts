import { computed, inject } from "vue"

import { useReferenceDataStore } from "@/app/stores/reference-data"
import { getPackageStackOption, setPackageStackOption } from "@/app/utils/packageStacking"

import type { JobDetailsContext } from "../../JobDetailsPage.logic"

export type PackageRow = {
  id: number | string
  package_type: string | null
  description: string | null
  stackable: boolean
  atTheTop: boolean
  quantity: number
  lengthCm: number
  widthCm: number
  heightCm: number
  grossWeightKg: number
  volumeWeightKg: number
  cbm: number
}

function createRow(defaultPackageType: string | null = "Pallet"): PackageRow {
  return {
    id: `new-${Date.now()}-${Math.random()}`,
    package_type: defaultPackageType,
    description: "",
    stackable: true,
    atTheTop: false,
    quantity: 1,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    grossWeightKg: 0,
    volumeWeightKg: 0,
    cbm: 0,
  }
}

function cleanReferenceName(value: string): string {
  return String(value ?? "")
    .replace(/\*$/, "")
    .trim()
}

export function useJobPackagesTab() {
  const context = inject<JobDetailsContext>("jobDetails")

  if (!context) {
    throw new Error("JobPackagesTab must be used inside JobDetailsPage.")
  }

  const referenceDataStore = useReferenceDataStore()
  const { form } = context

  const packageTypeOptions = computed(() => {
    const category =
      referenceDataStore.getByKey("package_types") ?? referenceDataStore.getByKey("packaging_types")

    return (category?.options ?? []).map((option: any) => ({
      label: cleanReferenceName(option.name),
      value: cleanReferenceName(option.name),
    }))
  })

  const rows = computed<PackageRow[]>({
    get() {
      return form.packages as PackageRow[]
    },
    set(value) {
      form.packages = value
    },
  })

  function calculateRow(row: PackageRow) {
    const qty = Number(row.quantity || 0)
    const length = Number(row.lengthCm || 0)
    const width = Number(row.widthCm || 0)
    const height = Number(row.heightCm || 0)

    const cbmPerPiece = (length * width * height) / 1_000_000

    row.cbm = cbmPerPiece * qty
    row.volumeWeightKg = ((length * width * height) / 6000) * qty
  }

  function addRow() {
    const firstType = packageTypeOptions.value[0]?.value ?? "Pallet"
    const row = createRow(firstType)

    calculateRow(row)

    rows.value = [...rows.value, row]
  }

  function removeRow(id: number | string) {
    rows.value = rows.value.filter(row => row.id !== id)
  }

  const totals = computed(() => {
    return rows.value.reduce(
      (total, row) => {
        total.totalPieces += Number(row.quantity || 0)
        total.totalGrossWeightKg += Number(row.grossWeightKg || 0) * Number(row.quantity || 0)
        total.totalVolumeWeightKg += Number(row.volumeWeightKg || 0)
        total.totalCbm += Number(row.cbm || 0)

        return total
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
    getPackageStackOption,
    setPackageStackOption,
    packageTypeOptions,
  }
}
