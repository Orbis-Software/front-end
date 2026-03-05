/**
 * ============
 * Login
 * ============
 *
 * Authenticate user and receive token.
 */

import http from "@/api/http"
import userTransformer from "@/app/transformers/user"
import type { LoginPayload, LoginResult } from "@/app/types/auth"

export default async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await http.post("/auth/login", payload)

  return {
    user: userTransformer.fetch(response.data.user),
    token: response.data.token,
  }
}
