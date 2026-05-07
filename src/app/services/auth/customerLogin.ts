/**
 * ==================
 * Customer Login
 * ==================
 *
 * Authenticate contact account / customer and receive token.
 */

import http from "@/api/http"
import customerAccountTransformer from "@/app/transformers/customer-account"
import type { CustomerLoginResult, LoginPayload } from "@/app/types/auth"

export default async function customerLogin(payload: LoginPayload): Promise<CustomerLoginResult> {
  const response = await http.post("/auth/customer/login", payload)

  return {
    customer: customerAccountTransformer.fetch(response.data.customer),
    token: response.data.token,
  }
}
