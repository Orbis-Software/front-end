import http from "@/api/http"
import transformer from "@/app/transformers/globalReferenceData"
import type { GlobalReferenceDataSet } from "@/app/types/globalReferenceData"

export default async function getAll(): Promise<GlobalReferenceDataSet> {
  const [locationsResponse, airlinesResponse] = await Promise.all([
    http.get("/global-reference-data", {
      params: { category: "locations", page: 1, per_page: 100 },
    }),
    http.get("/global-reference-data", {
      params: { category: "airlines", page: 1, per_page: 100 },
    }),
  ])

  const rows = [
    ...(locationsResponse.data?.data?.rows ?? []),
    ...(airlinesResponse.data?.data?.rows ?? []),
  ]

  return transformer.dataset({ rows })
}
