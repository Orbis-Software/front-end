import http from "@/api/http"
import type { AppNotification } from "@/app/types/app-notification"

function mapNotification(raw: any): AppNotification {
  return {
    id: String(raw.id),
    type: raw.type ?? "notification",
    title: raw.title ?? "Notification",
    message: raw.message ?? "",
    url: raw.url ?? null,
    read_at: raw.read_at ?? null,
    created_at: raw.created_at ?? null,
  }
}

export async function listNotifications() {
  const response = await http.get("/notifications")

  return {
    data: Array.isArray(response.data?.data)
      ? response.data.data.map(mapNotification)
      : ([] as AppNotification[]),
    unread_count: Number(response.data?.unread_count ?? 0),
  }
}

export async function markNotificationRead(id: string) {
  const response = await http.patch(`/notifications/${id}/read`)

  return {
    data: mapNotification(response.data?.data ?? {}),
    unread_count: Number(response.data?.unread_count ?? 0),
  }
}

export async function markAllNotificationsRead() {
  const response = await http.patch("/notifications/read-all")

  return {
    unread_count: Number(response.data?.unread_count ?? 0),
  }
}
