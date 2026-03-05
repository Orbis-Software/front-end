import http from "@/api/http"
import { systemAccessTransformer } from "@/app/transformers/systemAccess"
import type { EmployeeAccessDetails } from "@/app/types/systemAccess"

export default async function showAccessEmployee(id: number): Promise<EmployeeAccessDetails> {
  const res = await http.get(`/system-access/employees/${id}`)
  return systemAccessTransformer.details(res.data?.data)
}
