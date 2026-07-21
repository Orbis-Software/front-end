import http from "@/api/http"
import type { ChangePasswordPayload } from "@/app/types/auth"

export default async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await http.post("/auth/password", payload)
}
