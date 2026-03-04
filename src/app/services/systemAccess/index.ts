import listEmployees from "./listEmployees"
import showEmployee from "./showEmployee"
import syncEmployeeRoles from "./syncEmployeeRoles"
import syncEmployeePermissions from "./syncEmployeePermissions"
import { listRoles, listPermissions } from "./roles"

const systemAccessService = {
  listEmployees,
  showEmployee,
  syncEmployeeRoles,
  syncEmployeePermissions,
  listRoles,
  listPermissions,
}

export default systemAccessService