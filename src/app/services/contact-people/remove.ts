/**
 * =====================
 * Remove Contact Person
 * =====================
 */
import http from "@/api/http"

export default async function remove(id: number): Promise<void> {
  await http.delete(`/contact-people/${id}`)
}
