// src/app/services/awb-manager/createSingleAwb.ts

import http from "@/api/http"
import type { SingleAwbPayload } from "@/app/types/awb-manager"

export default async function createSingleAwb(
  airlineId: number,
  payload: SingleAwbPayload,
): Promise<void> {
  await http.post(`/airlines/${airlineId}/awbs/single`, payload)
}
