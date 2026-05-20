/**
 * =================
 * Customer Auth Me
 * =================
 *
 * Fetch the currently authenticated customer account.
 */

import http from "@/api/http"
import customerAccountTransformer from "@/app/transformers/customer-account"
import type { CustomerAccount } from "@/app/types/customer"

export default async function customerMe(): Promise<CustomerAccount> {
  const response = await http.get("/auth/customer/me")

  return customerAccountTransformer.fetch(response.data.data ?? response.data)
}
