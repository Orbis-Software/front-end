import type { User } from "@/app/types/user"
import type { CustomerAccount } from "@/app/types/customer"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  token: string
}

export interface MfaChallengeResult {
  mfa_required: true
  challenge_id: string
  methods: Array<"authenticator" | "email" | "recovery">
  expires_at: string
  email_hint?: string
}

export type LoginResponse = LoginResult | MfaChallengeResult

export interface CustomerLoginResult {
  customer: CustomerAccount
  token: string
}
