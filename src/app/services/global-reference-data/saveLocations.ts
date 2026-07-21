import http from "@/api/http"
import type { DeliveryLocationUpdate } from "@/app/types/globalReferenceData"

export default async function saveLocations(updates: DeliveryLocationUpdate[]): Promise<number> {
  const response = await http.put("/global-reference-data/locations", { updates })

  return Number(response.data?.data?.updated ?? 0)
}
