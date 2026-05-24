import http from "@/api/http"
import chargeCodeTransformer from "@/app/transformers/charge-code"
import type { ChargeCode } from "@/app/types/charge-code"

export default async function reset(): Promise<ChargeCode[]> {
  const response = await http.post("/charge-codes/reset")

  return chargeCodeTransformer.fetchCollection(response.data.data)
}
