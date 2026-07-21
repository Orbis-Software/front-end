import http from "@/api/http"
import contactTypeTransformer from "@/app/transformers/contact-type"
import type { ContactType, ListContactTypesParams } from "@/app/types/contact-type"
import type { PaginatedResponse } from "@/app/types/pagination"

export default async function listContactTypes(
  params: ListContactTypesParams = {},
): Promise<PaginatedResponse<ContactType>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  )

  const response = await http.get("/contact-types", { params: cleanParams })

  return {
    ...response.data,
    data: contactTypeTransformer.fetchCollection(response.data.data),
  }
}
