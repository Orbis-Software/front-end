import http from "@/api/http"
import clientBankDetailTransformer from "@/app/transformers/client-bank-detail"
import type {
  ClientBankDetail,
  ClientBankDetailFilters,
  ClientBankDetailMeta,
} from "@/app/types/client-bank-detail"

export default async function list(params: ClientBankDetailFilters = {}): Promise<{
  bankDetails: ClientBankDetail[]
  meta: ClientBankDetailMeta
}> {
  const response = await http.get("/client-bank-details", {
    params: {
      search: params.search || undefined,
      contact_id: params.contactId || undefined,
      sort: params.sort || undefined,
      direction: params.direction || undefined,
      page: params.page || undefined,
      per_page: params.perPage || undefined,
    },
  })

  return {
    bankDetails: clientBankDetailTransformer.fetchCollection(response.data.data),
    meta: {
      total: Number(response.data.meta?.total ?? 0),
      filtered: Number(response.data.meta?.filtered ?? 0),
      currentPage: Number(response.data.meta?.currentPage ?? 1),
      lastPage: Number(response.data.meta?.lastPage ?? 1),
      perPage: Number(response.data.meta?.perPage ?? 15),
      from: response.data.meta?.from ?? null,
      to: response.data.meta?.to ?? null,
    },
  }
}
