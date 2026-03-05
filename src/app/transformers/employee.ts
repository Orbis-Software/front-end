import type { Employee } from "@/app/types/employee"

const employeeTransformer = {
  fetch(raw: any): Employee {
    return {
      id: Number(raw.id),
      company_id: Number(raw.company_id),

      name: raw.name ?? "",
      email: raw.email ?? "",

      roles: Array.isArray(raw.roles) ? raw.roles.filter(Boolean) : [],

      last_login_at: raw.last_login_at ?? null,
      created_at: raw.created_at ?? "",
      updated_at: raw.updated_at ?? "",
    }
  },

  fetchCollection(rawList: any[]): Employee[] {
    return (rawList ?? []).map(this.fetch)
  },
}

export default employeeTransformer
