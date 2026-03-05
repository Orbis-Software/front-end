/**
 * ============
 * Logout
 * ============
 *
 * Revoke the current authentication token.
 */

import http from "@/api/http"

export default async function logout(): Promise<void> {
  await http.post("/auth/logout")
}
