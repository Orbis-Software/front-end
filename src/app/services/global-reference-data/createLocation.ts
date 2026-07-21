import http from "@/api/http"
import transformer from "@/app/transformers/globalReferenceData"
import type {
  DeliveryLocationPayload,
  GlobalReferenceDataRow,
} from "@/app/types/globalReferenceData"

export default async function createLocation(
  payload: DeliveryLocationPayload,
): Promise<GlobalReferenceDataRow> {
  const response = await http.post("/global-reference-data/locations", payload)

  return transformer.collection([response.data?.data])[0] ?? {}
}
