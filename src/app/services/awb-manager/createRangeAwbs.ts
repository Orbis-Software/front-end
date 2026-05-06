// src/app/services/awb-manager/createRangeAwbs.ts

import http from "@/api/http"
import type { RangeAwbPayload } from "@/app/types/awb-manager"

export default async function createRangeAwbs(
  airlineId: number,
  payload: RangeAwbPayload,
): Promise<void> {
  await http.post(`/airlines/${airlineId}/awbs/range`, payload)
}
