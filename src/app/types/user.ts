import type { Company } from '@/app/types/company'

/**
 * ============
 * User
 * ============
 * Authenticated user domain model
 */
export interface User {
  id: number
  name: string
  email: string

  role?: string | null

  // ✅ new
  company: Company | null

  created_at: string
  updated_at: string
}
