import http from "@/api/http"
import transformer from "@/app/transformers/referenceData"
import type { ReferenceDataOption } from "@/app/types/referenceData"

export default async function updateOption(
  categoryKey: string,
  optionId: number,
  payload: Partial<ReferenceDataOption>,
): Promise<ReferenceDataOption> {
  const response = await http.put(`/reference-data/${categoryKey}/options/${optionId}`, payload)

  return transformer.option(response.data.data)
}
