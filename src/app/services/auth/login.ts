/**
 * ============
 * Login
 * ============
 *
 * Authenticate user and receive token.
 */

import http from "@/api/http"
import userTransformer from "@/app/transformers/user"
import type { LoginPayload, LoginResponse } from "@/app/types/auth"

export default async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await http.post("/auth/login", payload)

  if (response.data?.mfa_required) {
    return response.data
  }

  return {
    user: userTransformer.fetch(response.data.user),
    token: response.data.token,
  }
}
