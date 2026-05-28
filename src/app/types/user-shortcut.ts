export type UserShortcutKey =
  | "create_job"
  | "create_quote"
  | "view_jobs"
  | "view_quotes"
  | "create_contact"
  | "view_contacts"

export type UserShortcut = {
  id: number
  key: UserShortcutKey
  keyBinding: string | null
  label: string
  description: string
  routeName: string | null
  permission: string | null
  icon: string
  priority: number
  isEnabled: boolean
}

export type UserShortcutPayload = {
  key: UserShortcutKey
  keyBinding: string | null
  priority: number
  isEnabled: boolean
}
