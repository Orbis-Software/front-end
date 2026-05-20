import type {
  GlobalReferenceDataRow,
  GlobalReferenceDataSet,
} from "@/app/types/globalReferenceData"

function row(data: unknown): GlobalReferenceDataRow {
  return Object.entries(data as Record<string, unknown>).reduce<GlobalReferenceDataRow>(
    (result, [key, value]) => {
      result[key] = value === null || value === undefined ? "" : String(value)

      return result
    },
    {},
  )
}

function collection(rows: unknown): GlobalReferenceDataRow[] {
  if (!Array.isArray(rows)) return []

  return rows.map(item => row(item))
}

export default {
  dataset(data: any): GlobalReferenceDataSet {
    return {
      terminals: collection(data?.terminals),
      airlines: collection(data?.airlines),
      cities: collection(data?.cities),
    }
  },
}
