export type CompanyNotificationType = {
  key: string
  label: string
}

export type CompanyEmailRecipient = {
  id: number
  user_id: number | null
  source: "employee" | "custom"
  is_managed_user: boolean
  name: string | null
  email: string
  notification_types: string[]
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export type CompanyEmailRecipientPayload = {
  name?: string | null
  email?: string
  notification_types?: string[]
  is_active?: boolean
}

export type NotificationProfile = {
  key: string
  label: string
  types: string[]
}

export type CompanyEmailRecipientListResponse = {
  data: CompanyEmailRecipient[]
  notification_types: CompanyNotificationType[]
}
