// src/app/services/awb-manager/createBulkAwbs.ts

import http from "@/api/http"
import type { BulkAwbPayload } from "@/app/types/awb-manager"

export default async function createBulkAwbs(
  airlineId: number,
  payload: BulkAwbPayload,
): Promise<void> {
  await http.post(`/airlines/${airlineId}/awbs/bulk`, payload)
}
