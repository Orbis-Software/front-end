import http from "@/api/http"
import type { ExportContactsParams } from "@/app/types/contact"

export default async function exportContacts(params: ExportContactsParams = {}): Promise<Blob> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  )

  const response = await http.get("/contacts/export", {
    params: cleanParams,
    responseType: "blob",
  })

  return response.data
}
