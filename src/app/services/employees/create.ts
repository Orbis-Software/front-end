import http from "@/api/http"
import employeeTransformer from "@/app/transformers/employee"
import type { Employee, EmployeeCreatePayload } from "@/app/types/employee"

/**
 * POST /employees
 */
export default async function createEmployee(payload: EmployeeCreatePayload): Promise<Employee> {
  const response = await http.post("/employees", payload)
  return employeeTransformer.fetch(response.data?.data)
}