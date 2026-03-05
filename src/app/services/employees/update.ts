import http from "@/api/http"
import employeeTransformer from "@/app/transformers/employee"
import type { Employee, EmployeeUpdatePayload } from "@/app/types/employee"

/**
 * PUT /employees/{id}
 */
export default async function updateEmployee(
  id: number,
  payload: EmployeeUpdatePayload,
): Promise<Employee> {
  const response = await http.put(`/employees/${id}`, payload)
  return employeeTransformer.fetch(response.data?.data)
}
