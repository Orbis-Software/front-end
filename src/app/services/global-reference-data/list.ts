import http from "@/api/http"
import transformer from "@/app/transformers/globalReferenceData"
import type {
  GlobalReferenceDataListParams,
  GlobalReferenceDataListResponse,
} from "@/app/types/globalReferenceData"

export default async function list(
  params: GlobalReferenceDataListParams,
): Promise<GlobalReferenceDataListResponse> {
  const response = await http.get("/global-reference-data", { params })
  const data = response.data?.data ?? {}

  return {
    rows: transformer.collection(data.rows),
    meta: {
      current_page: Number(data.meta?.current_page ?? 1),
      from: data.meta?.from === null ? null : Number(data.meta?.from ?? 0),
      last_page: Number(data.meta?.last_page ?? 1),
      per_page: Number(data.meta?.per_page ?? params.per_page ?? 25),
      to: data.meta?.to === null ? null : Number(data.meta?.to ?? 0),
      total: Number(data.meta?.total ?? 0),
    },
    counts: Object.entries(data.counts ?? {}).reduce<Record<string, number>>(
      (result, [key, value]) => {
        result[key] = Number(value ?? 0)

        return result
      },
      {},
    ),
    filters: {
      types: arrayOfStrings(data.filters?.types),
      countries: arrayOfStrings(data.filters?.countries),
      regions: arrayOfStrings(data.filters?.regions),
      statuses: arrayOfStrings(data.filters?.statuses),
    },
  }
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.map(item => String(item)).filter(Boolean)
}
