import http from "@/api/http"
import contactChargeTableTransformer from "@/app/transformers/contact-charge-table"
import type { ContactChargeTable, ContactChargeTableListParams } from "@/app/types/contact"
import type { PaginatedResponse } from "@/app/types/pagination"

export default async function listContactChargeTables(
  contactId: number,
  params: ContactChargeTableListParams = {},
): Promise<PaginatedResponse<ContactChargeTable>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  )

  const response = await http.get(`/contacts/${contactId}/charge-tables`, {
    params: cleanParams,
  })

  return {
    ...response.data,
    data: contactChargeTableTransformer.fetchCollection(response.data.data ?? []),
  }
}
