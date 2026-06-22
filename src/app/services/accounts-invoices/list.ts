import http from "@/api/http"
import accountsInvoiceTransformer from "@/app/transformers/accounts-invoice"
import type {
  AccountsInvoice,
  AccountsInvoiceFilters,
  AccountsInvoiceMeta,
} from "@/app/types/accounts-invoice"

export default async function list(params: AccountsInvoiceFilters = {}): Promise<{
  invoices: AccountsInvoice[]
  meta: AccountsInvoiceMeta
}> {
  const response = await http.get("/accounts/invoices", {
    params: {
      search: params.search || undefined,
      status: params.status === "all" ? undefined : params.status || undefined,
      page: params.page || undefined,
      per_page: params.perPage || undefined,
    },
  })

  return {
    invoices: accountsInvoiceTransformer.fetchCollection(response.data.data),
    meta: accountsInvoiceTransformer.meta(response.data.meta),
  }
}
