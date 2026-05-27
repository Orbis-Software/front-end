import { defineStore } from "pinia"
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/services/notifications"
import type { AppNotification } from "@/app/types/app-notification"

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    items: [] as AppNotification[],
    unreadCount: 0,
    loading: false,
  }),

  actions: {
    async fetchNotifications() {
      this.loading = true

      try {
        const result = await listNotifications()

        this.items = result.data
        this.unreadCount = result.unread_count

        return result
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id: string) {
      const result = await markNotificationRead(id)
      const index = this.items.findIndex(item => item.id === id)

      if (index !== -1) {
        this.items[index] = result.data
      }

      this.unreadCount = result.unread_count

      return result.data
    },

    async markAllAsRead() {
      const result = await markAllNotificationsRead()

      this.items = this.items.map(item => ({
        ...item,
        read_at: item.read_at ?? new Date().toISOString(),
      }))
      this.unreadCount = result.unread_count
    },
  },
})
