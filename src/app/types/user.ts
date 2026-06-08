import type { Company } from "@/app/types/company"

/**
 * ============
 * User
 * ============
 */
export interface User {
  id: number
  name: string
  email: string

  // 🔥 NEW
  roles: string[]
  permissions: string[]

  // convenience flags
  is_admin: boolean
  is_dev: boolean

  mfa: {
    enabled: boolean
    email_enabled: boolean
    authenticator_enabled: boolean
    confirmed_at: string | null
    last_used_at: string | null
  }

  company: Company | null

  created_at: string
  updated_at: string
}
