export interface CustomerContact {
  id: number
  company_name: string
  account_number: string | null
  email: string | null
  phone: string | null
  status: string | null
}

export interface CustomerAccount {
  id: number
  contact_id: number

  name: string
  email: string
  role: string

  is_primary: boolean
  is_active: boolean

  contact: CustomerContact | null

  created_at: string
  updated_at: string
}
