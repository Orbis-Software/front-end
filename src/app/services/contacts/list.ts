import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ListContactsParams } from "@/app/types/contact"
import type { PaginatedResponse } from "@/app/types/pagination"

export default async function listContacts(
  params: ListContactsParams = {},
): Promise<PaginatedResponse<Contact>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  )

  const response = await http.get("/contacts", { params: cleanParams })

  return {
    ...response.data,
    data: contactTransformer.fetchCollection(response.data.data),
  }
}
