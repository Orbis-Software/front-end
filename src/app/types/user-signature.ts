export type SignatureFieldKey = "body" | "name" | "title" | "phone" | "email"

export type SignatureStyle = {
  fontFamily: string
  fontSize: string
  color: string
}

export type UserSignature = {
  id: number | null
  name: string
  title: string
  phone: string
  email: string
  body: string
  imageUrl: string | null
  styles: Record<SignatureFieldKey, SignatureStyle>
  updatedAt: string | null
}

export type UserSignaturePayload = {
  name: string
  title: string
  phone: string
  email: string
  body: string
  styles: Record<SignatureFieldKey, SignatureStyle>
  image?: File | null
  clearImage?: boolean
}
