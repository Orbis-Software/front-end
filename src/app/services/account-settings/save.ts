import http from "@/api/http"
import transformer from "@/app/transformers/account-setting"
import type { AccountSetting, AccountSettingPayload } from "@/app/types/account-setting"

export default async function save(
  payload: AccountSettingPayload,
  id?: number | null,
): Promise<AccountSetting> {
  const body = transformer.payload(payload)
  const response = id
    ? await http.put(`/account-settings/${id}`, body)
    : await http.post("/account-settings", body)

  return transformer.fetch(response.data.data)
}
