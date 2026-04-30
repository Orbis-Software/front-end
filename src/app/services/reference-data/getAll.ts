import http from "@/api/http"
import transformer from "@/app/transformers/referenceData"
import type { ReferenceDataCategory } from "@/app/types/referenceData"

export default async function getAll(): Promise<ReferenceDataCategory[]> {
  const response = await http.get("/reference-data")

  return transformer.collection(response.data.data)
}
