import http from "@/api/http"

/**
 * GET /roles
 * Expected => { data: string[] }
 */
export default async function listRoles(): Promise<string[]> {
  const response = await http.get("/roles")
  return Array.isArray(response.data?.data) ? response.data.data.filter(Boolean) : []
}