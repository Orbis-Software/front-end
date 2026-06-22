import http from "@/api/http"
import accountsCreditControlTransformer from "@/app/transformers/accounts-credit-control"
import type { AccountsCreditMeta, AccountsCreditRow } from "@/app/types/accounts-credit-control"

export default async function list(): Promise<{
  rows: AccountsCreditRow[]
  meta: AccountsCreditMeta
}> {
  const response = await http.get("/accounts/credit-control")

  return {
    rows: accountsCreditControlTransformer.fetchCollection(response.data.data),
    meta: {
      totalCustomers: Number(response.data.meta?.totalCustomers ?? 0),
      onHoldCustomers: Number(response.data.meta?.onHoldCustomers ?? 0),
      overdueCustomers: Number(response.data.meta?.overdueCustomers ?? 0),
      totalOutstanding: Number(response.data.meta?.totalOutstanding ?? 0),
    },
  }
}
