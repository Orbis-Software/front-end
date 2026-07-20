import http from "@/api/http"

export default async function removeExpectedArrival(id: number): Promise<void> {
  await http.delete(`/wms/expected-arrivals/${id}`)
}
