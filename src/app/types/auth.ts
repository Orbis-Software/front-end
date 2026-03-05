import type { User } from "./user"

/**
 * ============
 * Auth Payloads
 * ============
 */

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  token: string
}
