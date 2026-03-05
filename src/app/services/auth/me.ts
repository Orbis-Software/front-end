/**
 * ============
 * Auth Me
 * ============
 *
 * Fetch the currently authenticated user.
 */

import http from "@/api/http"
import userTransformer from "@/app/transformers/user"
import type { User } from "@/app/types/user"

export default async function me(): Promise<User> {
  const response = await http.get("/auth/me")

  // Laravel JsonResource → data
  return userTransformer.fetch(response.data)
}
