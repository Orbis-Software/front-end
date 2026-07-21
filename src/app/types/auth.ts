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

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export type MfaMethod = "email" | "authenticator" | "all"

export type MfaSettings = {
  enabled: boolean
  email_enabled: boolean
  authenticator_enabled: boolean
  confirmed_at: string | null
  last_used_at: string | null
  recovery_codes: string[]
}

export type AuthenticatorSetup = {
  secret: string
  otpauth_url: string
}

export type MfaChallengePayload = {
  challenge_id: string
  method: "authenticator" | "email" | "recovery"
  code: string
}

export type LoginDetailsTab = "account" | "password" | "mfa"
