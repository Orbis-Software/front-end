import http from "@/api/http"
import userSignatureTransformer from "@/app/transformers/user-signature"
import type { UserSignature, UserSignaturePayload } from "@/app/types/user-signature"

function buildFormData(payload: UserSignaturePayload): FormData {
  const formData = new FormData()

  formData.append("name", payload.name)
  formData.append("title", payload.title)
  formData.append("phone", payload.phone)
  formData.append("email", payload.email)
  formData.append("body", payload.body)
  formData.append("styles", JSON.stringify(payload.styles))
  formData.append("clear_image", payload.clearImage ? "1" : "0")

  if (payload.image) {
    formData.append("image", payload.image)
  }

  return formData
}

export default async function update(payload: UserSignaturePayload): Promise<UserSignature> {
  const response = await http.post("/user-signature", buildFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return userSignatureTransformer.fetch(response.data.data) as UserSignature
}
