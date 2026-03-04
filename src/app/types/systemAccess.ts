export type EmployeeAccessRow = {
  id: number
  name: string
  email: string
  roles: string[]
  direct_permissions: string[]
}

export type EmployeeAccessDetails = {
  id: number
  company_id: number
  name: string
  email: string
  roles: string[]
  direct_permissions: string[]
  effective_permissions: string[]
}

export type EmployeeAccessListParams = {
  search?: string
  per_page?: number
  page?: number
}