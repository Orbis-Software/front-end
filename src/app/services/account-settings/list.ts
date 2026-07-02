import http from "@/api/http"
import transformer from "@/app/transformers/account-setting"
import type { AccountSetting } from "@/app/types/account-setting"

export default async function list(): Promise<AccountSetting[]> {
  const response = await http.get("/account-settings")

  return transformer.fetchCollection(response.data.data)
}
