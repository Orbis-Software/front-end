import http from "@/api/http"
import userTransformer from "@/app/transformers/user"
import type { LoginResult, MfaChallengeResult } from "@/app/types/auth"

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

export async function verifyMfaChallenge(payload: {
  challenge_id: string
  method: "authenticator" | "email" | "recovery"
  code: string
}): Promise<LoginResult> {
  const response = await http.post("/auth/mfa/verify", payload)

  return {
    user: userTransformer.fetch(response.data.user),
    token: response.data.token,
  }
}

export async function resendMfaEmail(challenge_id: string): Promise<Partial<MfaChallengeResult>> {
  const response = await http.post("/auth/mfa/resend-email", { challenge_id })

  return response.data
}

export async function getMfaSettings(): Promise<MfaSettings> {
  const response = await http.get("/auth/mfa/settings")

  return response.data
}

export async function startAuthenticatorSetup(): Promise<AuthenticatorSetup> {
  const response = await http.post("/auth/mfa/authenticator/setup")

  return response.data
}

export async function verifyAuthenticatorSetup(code: string): Promise<MfaSettings> {
  const response = await http.post("/auth/mfa/authenticator/verify", { code })

  return response.data
}

export async function sendEmailMfaSetupCode(): Promise<void> {
  await http.post("/auth/mfa/email/send-code")
}

export async function verifyEmailMfaSetup(code: string): Promise<MfaSettings> {
  const response = await http.post("/auth/mfa/email/verify", { code })

  return response.data
}

export async function disableMfa(method: "email" | "authenticator" | "all"): Promise<MfaSettings> {
  const response = await http.post("/auth/mfa/disable", { method })

  return response.data
}
