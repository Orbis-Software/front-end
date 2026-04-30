import http from "@/api/http"
import transformer from "@/app/transformers/referenceData"
import type { ReferenceDataOption } from "@/app/types/referenceData"

export default async function createOption(
  categoryKey: string,
  payload: {
    name: string
    is_default?: boolean
  },
): Promise<ReferenceDataOption> {
  const response = await http.post(`/reference-data/${categoryKey}/options`, payload)

  return transformer.option(response.data.data)
}
