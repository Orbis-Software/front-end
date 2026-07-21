import type { EmployeeListParams } from "@/app/types/employee"

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

export type EmployeeAccessListParams = EmployeeListParams

export type PermissionRow = {
  key: string
  label: string
  permission: string
  title: string
  action: string
}

export type PermissionGroup = {
  id: string
  label: string
  items: PermissionRow[]
}
