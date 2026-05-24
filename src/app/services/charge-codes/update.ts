import http from "@/api/http"
import chargeCodeTransformer from "@/app/transformers/charge-code"
import type { ChargeCode, ChargeCodePayload } from "@/app/types/charge-code"

export default async function update(id: number, payload: ChargeCodePayload): Promise<ChargeCode> {
  const response = await http.put(`/charge-codes/${id}`, payload)

  return chargeCodeTransformer.fetch(response.data.data)
}
