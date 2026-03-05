import http from "@/api/http"

export async function listRoles(): Promise<string[]> {
  const res = await http.get("/roles")
  // If your /roles returns objects, change this accordingly.
  // With our earlier controller, /roles returns list of objects. We'll extract names safely:
  const data = res.data?.data
  if (Array.isArray(data) && typeof data[0] === "string") return data.filter(Boolean)
  if (Array.isArray(data)) return data.map((r: any) => r?.name).filter(Boolean)
  return []
}

export async function listPermissions(): Promise<string[]> {
  const res = await http.get("/permissions")
  return Array.isArray(res.data?.data) ? res.data.data.filter(Boolean) : []
}
