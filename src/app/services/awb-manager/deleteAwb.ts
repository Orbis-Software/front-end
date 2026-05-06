// src/app/services/awb-manager/deleteAwb.ts

import http from "@/api/http"

export default async function deleteAwb(awbId: number): Promise<void> {
  await http.delete(`/awbs/${awbId}`)
}
