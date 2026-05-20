import http from "@/api/http"
import transformer from "@/app/transformers/globalReferenceData"
import type { GlobalReferenceDataSet } from "@/app/types/globalReferenceData"

export default async function getAll(): Promise<GlobalReferenceDataSet> {
  const response = await http.get("/global-reference-data")

  return transformer.dataset(response.data?.data ?? {})
}
