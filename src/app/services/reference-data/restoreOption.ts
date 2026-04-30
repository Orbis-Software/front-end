import http from "@/api/http"
import transformer from "@/app/transformers/referenceData"
import type { ReferenceDataOption } from "@/app/types/referenceData"

export default async function restoreOption(
  categoryKey: string,
  optionId: number,
): Promise<ReferenceDataOption> {
  const response = await http.patch(`/reference-data/${categoryKey}/options/${optionId}/restore`)

  return transformer.option(response.data.data)
}
