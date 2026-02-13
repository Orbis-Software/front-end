import type { Company } from '@/app/types/company'

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

  company: Company | null

  created_at: string
  updated_at: string
}
