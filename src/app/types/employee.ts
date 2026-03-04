export type Employee = {
  id: number
  company_id: number

  name: string
  email: string

  roles: string[]

  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type EmployeeListParams = {
  search?: string
  per_page?: number
  page?: number
}

export type EmployeeCreatePayload = {
  name: string
  email: string
  password: string
  roles?: string[]
}

export type EmployeeUpdatePayload = {
  name?: string
  email?: string
  password?: string | null
  roles?: string[]
}