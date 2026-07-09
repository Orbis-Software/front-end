import http from "@/api/http"

export default async function pdf(id: number): Promise<Blob> {
  const response = await http.get(`/quotes/${id}/pdf`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  return response.data
}
