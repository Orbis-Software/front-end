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
  collection,

  dataset(data: any): GlobalReferenceDataSet {
    if (Array.isArray(data?.rows)) {
      return collection(data.rows).reduce<GlobalReferenceDataSet>(
        (result, item) => {
          if (
            item.category === "locations" ||
            item.category === "terminals" ||
            item.category === "airlines" ||
            item.category === "cities"
          ) {
            result[item.category].push(item)
          }

          return result
        },
        {
          locations: [],
          terminals: [],
          airlines: [],
          cities: [],
        },
      )
    }

    return {
      locations: collection(data?.locations),
      terminals: collection(data?.terminals),
      airlines: collection(data?.airlines),
      cities: collection(data?.cities),
    }
  },
}
