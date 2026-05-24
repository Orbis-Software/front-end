import http from "@/api/http"
import taxCodeTransformer from "@/app/transformers/tax-code"
import type { TaxCode, TaxCodePayload } from "@/app/types/tax-code"

export default async function update(id: number, payload: TaxCodePayload): Promise<TaxCode> {
  const response = await http.put(`/tax-codes/${id}`, payload)

  return taxCodeTransformer.fetch(response.data.data)
}
