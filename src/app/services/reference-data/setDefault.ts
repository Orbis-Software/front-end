import http from "@/api/http"
import transformer from "@/app/transformers/referenceData"
import type { ReferenceDataOption } from "@/app/types/referenceData"

export default async function setDefault(
  categoryKey: string,
  optionId: number,
): Promise<ReferenceDataOption> {
  const response = await http.patch(`/reference-data/${categoryKey}/options/${optionId}/default`)

  return transformer.option(response.data.data)
}
