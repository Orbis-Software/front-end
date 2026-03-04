import http from "@/api/http"
import { systemAccessTransformer } from "@/app/transformers/systemAccess"
import type { EmployeeAccessDetails } from "@/app/types/systemAccess"

export default async function syncEmployeeRoles(id: number, roles: string[]): Promise<EmployeeAccessDetails> {
  const res = await http.put(`/system-access/employees/${id}/roles`, { roles })
  return systemAccessTransformer.details(res.data?.data)
}