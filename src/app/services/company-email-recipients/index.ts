import http from "@/api/http"
import type {
  CompanyEmailRecipient,
  CompanyEmailRecipientListResponse,
  CompanyEmailRecipientPayload,
} from "@/app/types/company-email-recipient"

async function list(): Promise<CompanyEmailRecipientListResponse> {
  const response = await http.get("/company-email-recipients")

  return response.data
}

async function create(
  payload: Required<Pick<CompanyEmailRecipientPayload, "email">> & CompanyEmailRecipientPayload,
) {
  const response = await http.post("/company-email-recipients", payload)

  return response.data.data as CompanyEmailRecipient
}

async function update(id: number, payload: CompanyEmailRecipientPayload) {
  const response = await http.patch(`/company-email-recipients/${id}`, payload)

  return response.data.data as CompanyEmailRecipient
}

async function remove(id: number) {
  await http.delete(`/company-email-recipients/${id}`)
}

export default {
  list,
  create,
  update,
  remove,
}
