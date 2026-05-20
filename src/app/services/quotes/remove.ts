import http from "@/api/http"

export default async function remove(id: number): Promise<boolean> {
  await http.delete(`/quotes/${id}`)

  return true
}
