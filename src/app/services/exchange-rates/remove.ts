import http from "@/api/http"

export default async function remove(id: number): Promise<void> {
  await http.delete(`/exchange-rates/${id}`)
}
