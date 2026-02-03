import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact } from "@/app/types/contact"

export default async function show(id: number): Promise<Contact> {
  const response = await http.get(`/contacts/${id}`)
  return contactTransformer.fetch(response.data)
}
