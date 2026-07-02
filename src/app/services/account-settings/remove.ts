import http from "@/api/http"
import transformer from "@/app/transformers/account-setting"
import type { AccountSetting } from "@/app/types/account-setting"

export default async function remove(id: number): Promise<AccountSetting> {
  const response = await http.delete(`/account-settings/${id}`)

  return transformer.fetch(response.data.data)
}
