import http from "@/api/http"
import taxCodeTransformer from "@/app/transformers/tax-code"
import type { TaxCode, TaxCodePayload } from "@/app/types/tax-code"

export default async function create(payload: TaxCodePayload): Promise<TaxCode> {
  const response = await http.post("/tax-codes", payload)

  return taxCodeTransformer.fetch(response.data.data)
}
