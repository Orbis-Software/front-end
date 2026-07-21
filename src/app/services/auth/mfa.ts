import http from "@/api/http"
import userTransformer from "@/app/transformers/user"
import type {
  AuthenticatorSetup,
  LoginResult,
  MfaChallengePayload,
  MfaChallengeResult,
  MfaMethod,
  MfaSettings,
} from "@/app/types/auth"

export async function verifyMfaChallenge(payload: MfaChallengePayload): Promise<LoginResult> {
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

export async function disableMfa(method: MfaMethod): Promise<MfaSettings> {
  const response = await http.post("/auth/mfa/disable", { method })

  return response.data
}
