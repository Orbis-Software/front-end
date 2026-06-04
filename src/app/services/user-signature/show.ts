import http from "@/api/http"
import userSignatureTransformer from "@/app/transformers/user-signature"
import type { UserSignature } from "@/app/types/user-signature"

export default async function show(): Promise<UserSignature | null> {
  const response = await http.get("/user-signature")

  return userSignatureTransformer.fetch(response.data.data)
}
