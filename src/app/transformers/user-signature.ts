import type { UserSignature } from "@/app/types/user-signature"

function fetch(data: any): UserSignature | null {
  if (!data) return null

  return {
    id: data.id ?? null,
    name: data.name ?? "",
    title: data.title ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    body: data.body ?? "",
    imageUrl: data.imageUrl ?? null,
    styles: data.styles ?? {},
    updatedAt: data.updatedAt ?? null,
  }
}

export default { fetch }
