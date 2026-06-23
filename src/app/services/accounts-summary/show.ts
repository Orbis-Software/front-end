import http from "@/api/http"
import accountsSummaryTransformer from "@/app/transformers/accounts-summary"
import type { AccountsSummary } from "@/app/types/accounts-summary"

export default async function show(): Promise<AccountsSummary> {
  const response = await http.get("/accounts/summary")

  return accountsSummaryTransformer.fetch(response.data.data)
}
