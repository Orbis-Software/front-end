import http from "@/api/http"
import employeeTransformer from "@/app/transformers/employee"
import type { Employee, EmployeeListParams } from "@/app/types/employee"

/**
 * GET /employees
 */
export default async function listEmployees(params: EmployeeListParams = {}): Promise<Employee[]> {
  const response = await http.get("/employees", { params })

  // Laravel Resource Collection => { data: [...] , meta?, links? }
  return employeeTransformer.fetchCollection(response.data?.data ?? [])
}