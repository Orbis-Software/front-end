import http from "@/api/http"
import chargeCodeTransformer from "@/app/transformers/charge-code"
import type { ChargeCode, ChargeCodePayload } from "@/app/types/charge-code"

export default async function create(payload: ChargeCodePayload): Promise<ChargeCode> {
  const response = await http.post("/charge-codes", payload)

  return chargeCodeTransformer.fetch(response.data.data)
}
