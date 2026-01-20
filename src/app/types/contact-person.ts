export interface ContactPerson {
  id: number
  contact_id: number
  name: string
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface ContactPersonCreatePayload {
  contact_id: number
  name: string
  email?: string | null
  phone?: string | null
}
