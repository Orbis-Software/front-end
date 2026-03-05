import type { EmployeeAccessDetails, EmployeeAccessRow } from "@/app/types/systemAccess"

function asStringArray(v: any): string[] {
  return Array.isArray(v) ? v.filter(Boolean) : []
}

export const systemAccessTransformer = {
  row(raw: any): EmployeeAccessRow {
    return {
      id: Number(raw.id),
      name: raw.name ?? "",
      email: raw.email ?? "",
      roles: asStringArray(raw.roles),
      direct_permissions: asStringArray(raw.direct_permissions),
    }
  },

  rows(list: any[]): EmployeeAccessRow[] {
    return (list ?? []).map(this.row)
  },

  details(raw: any): EmployeeAccessDetails {
    return {
      id: Number(raw.id),
      company_id: Number(raw.company_id),
      name: raw.name ?? "",
      email: raw.email ?? "",
      roles: asStringArray(raw.roles),
      direct_permissions: asStringArray(raw.direct_permissions),
      effective_permissions: asStringArray(raw.effective_permissions),
    }
  },
}
