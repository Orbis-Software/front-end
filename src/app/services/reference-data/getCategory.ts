import http from "@/api/http"
import transformer from "@/app/transformers/referenceData"
import type { ReferenceDataCategory } from "@/app/types/referenceData"

export default async function getCategory(key: string): Promise<ReferenceDataCategory> {
  const response = await http.get(`/reference-data/${key}`)

  return transformer.category(response.data.data)
}
