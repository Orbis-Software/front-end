import http from "@/api/http"
import { systemAccessTransformer } from "@/app/transformers/systemAccess"
import type { EmployeeAccessDetails } from "@/app/types/systemAccess"

export default async function syncEmployeePermissions(
  id: number,
  permissions: string[],
): Promise<EmployeeAccessDetails> {
  const res = await http.put(`/system-access/employees/${id}/permissions`, { permissions })
  return systemAccessTransformer.details(res.data?.data)
}
