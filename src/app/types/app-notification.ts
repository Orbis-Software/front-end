export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  url: string | null
  read_at: string | null
  created_at: string | null
}
