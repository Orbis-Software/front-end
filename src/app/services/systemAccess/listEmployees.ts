import http from "@/api/http"
import { systemAccessTransformer } from "@/app/transformers/systemAccess"
import type { EmployeeAccessListParams, EmployeeAccessRow } from "@/app/types/systemAccess"

export default async function listAccessEmployees(
  params: EmployeeAccessListParams = {},
): Promise<{ data: EmployeeAccessRow[]; meta?: any }> {
  const res = await http.get("/system-access/employees", { params })
  return {
    data: systemAccessTransformer.rows(res.data?.data ?? []),
    meta: res.data?.meta ?? null,
  }
}
