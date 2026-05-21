import { defineStore } from "pinia"
import {
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "@/app/services/customer-notifications"
import type { CustomerNotification } from "@/app/types/customer-notification"

export const useCustomerNotificationStore = defineStore("customerNotification", {
  state: () => ({
    items: [] as CustomerNotification[],
    unreadCount: 0,
    loading: false,
  }),

  actions: {
    async fetchNotifications() {
      this.loading = true

      try {
        const result = await listCustomerNotifications()

        this.items = result.data
        this.unreadCount = result.unread_count

        return result
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id: string) {
      const result = await markCustomerNotificationRead(id)
      const index = this.items.findIndex(item => item.id === id)

      if (index !== -1) {
        this.items[index] = result.data
      }

      this.unreadCount = result.unread_count

      return result.data
    },

    async markAllAsRead() {
      const result = await markAllCustomerNotificationsRead()

      this.items = this.items.map(item => ({
        ...item,
        read_at: item.read_at ?? new Date().toISOString(),
      }))
      this.unreadCount = result.unread_count
    },
  },
})
