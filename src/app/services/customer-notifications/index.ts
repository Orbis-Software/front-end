import http from "@/api/http"
import type { CustomerNotification } from "@/app/types/customer-notification"

function mapNotification(raw: any): CustomerNotification {
  return {
    id: String(raw.id),
    type: raw.type ?? "notification",
    title: raw.title ?? "Notification",
    message: raw.message ?? "",
    url: raw.url ?? null,
    quote_id: raw.quote_id ?? null,
    quote_ref: raw.quote_ref ?? null,
    invoice_id: raw.invoice_id ?? null,
    invoice_type: raw.invoice_type ?? null,
    transport_job_id: raw.transport_job_id ?? null,
    read_at: raw.read_at ?? null,
    created_at: raw.created_at ?? null,
  }
}

export async function listCustomerNotifications() {
  const response = await http.get("/customer/notifications")

  return {
    data: Array.isArray(response.data?.data)
      ? response.data.data.map(mapNotification)
      : ([] as CustomerNotification[]),
    unread_count: Number(response.data?.unread_count ?? 0),
  }
}

export async function markCustomerNotificationRead(id: string) {
  const response = await http.patch(`/customer/notifications/${id}/read`)

  return {
    data: mapNotification(response.data?.data ?? {}),
    unread_count: Number(response.data?.unread_count ?? 0),
  }
}

export async function markAllCustomerNotificationsRead() {
  const response = await http.patch("/customer/notifications/read-all")

  return {
    unread_count: Number(response.data?.unread_count ?? 0),
  }
}
