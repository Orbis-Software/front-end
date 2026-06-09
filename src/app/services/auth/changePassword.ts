import http from "@/api/http"

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export default async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await http.post("/auth/password", payload)
}
