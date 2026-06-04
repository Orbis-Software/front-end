import http from "@/api/http"
import clientBankDetailTransformer from "@/app/transformers/client-bank-detail"
import type { ClientBankDetail, ClientBankDetailPayload } from "@/app/types/client-bank-detail"

export default async function update(
  id: number,
  payload: ClientBankDetailPayload,
): Promise<ClientBankDetail> {
  const response = await http.put(`/client-bank-details/${id}`, payload)

  return clientBankDetailTransformer.fetch(response.data.data)
}
