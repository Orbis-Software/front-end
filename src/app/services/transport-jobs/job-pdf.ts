import http from "@/api/http"

export default async function jobPdf(id: number): Promise<Blob> {
  const response = await http.get(`/transport-jobs/${id}/collection-note-pdf`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  return response.data
}
