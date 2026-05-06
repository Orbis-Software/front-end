// src/app/services/awb-manager/deleteAirline.ts

import http from "@/api/http"

export default async function deleteAirline(id: number): Promise<void> {
  await http.delete(`/airlines/${id}`)
}
