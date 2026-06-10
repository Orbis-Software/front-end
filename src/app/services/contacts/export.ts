import http from "@/api/http"

export interface ExportContactsParams {
  q?: string
  contact_type_id?: number | null
  status?: string
}

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
