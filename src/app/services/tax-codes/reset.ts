import http from "@/api/http"
import taxCodeTransformer from "@/app/transformers/tax-code"
import type { TaxCode } from "@/app/types/tax-code"

export default async function reset(): Promise<TaxCode[]> {
  const response = await http.post("/tax-codes/reset")

  return taxCodeTransformer.fetchCollection(response.data.data)
}
