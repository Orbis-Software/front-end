import http from "@/api/http"
import transformer from "@/app/transformers/account-setting"
import type { AccountSetting } from "@/app/types/account-setting"

export default async function reset(): Promise<AccountSetting[]> {
  const response = await http.post("/account-settings/reset")

  return transformer.fetchCollection(response.data.data)
}
