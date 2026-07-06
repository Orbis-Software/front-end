<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import CustomerUserDropdown from "@/app/components/customer/nav/CustomerUserDropdown.vue"
import { useAuthStore } from "@/app/stores/auth"
import { useCustomerNotificationStore } from "@/app/stores/customer-notification"
import type { CustomerNotification } from "@/app/types/customer-notification"

type Props = {
  mobileOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: "toggle-mobile-nav"): void
  (e: "close-mobile"): void
}>()

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const notificationStore = useCustomerNotificationStore()

const dropdownOpen = ref(false)
const notificationsOpen = ref(false)

const navItems = [
  {
    label: "Dashboard",
    to: "/customer/dashboard",
  },
  {
    label: "Shipments",
    to: "/customer/shipments",
  },
  {
    label: "Stock",
    to: "/customer/stock",
  },
  {
    label: "Quotes",
    to: "/customer/quotes",
  },
  {
    label: "Documents",
    to: "/customer/documents",
  },
  {
    label: "Reports",
    to: "/customer/reports",
  },
  {
    label: "Settings",
    to: "/customer/settings",
  },
]

const companyName = computed(() => {
  return auth.customer?.contact?.company_name ?? auth.customer?.contact?.company?.name ?? "Customer"
})

function shortenCompanyName(name: string): string {
  const clean = name.trim().replace(/\s+/g, " ")
  if (clean.length <= 22) return clean

  const suffixMatch = clean.match(/\b(Ltd|Limited|Inc|Incorporated|Corp|Corporation|LLC|PLC)\.?$/i)
  const suffix = suffixMatch?.[0]?.replace(/\.$/, ".") ?? ""
  const nameWithoutSuffix = suffix ? clean.slice(0, suffixMatch!.index).trim() : clean
  const words = nameWithoutSuffix.split(" ").filter(Boolean)
  const initials = words
    .filter(word => !["and", "&", "the", "of", "for"].includes(word.toLowerCase()))
    .map(word => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase()

  if (initials.length >= 2) {
    return suffix ? `${initials} ${suffix}` : initials
  }

  return `${clean.slice(0, 19).trim()}...`
}

const shortCompanyName = computed(() => shortenCompanyName(companyName.value))

const portalName = computed(() => {
  return `${shortCompanyName.value} Portal`
})

const userName = computed(() => {
  return auth.customer?.name ?? "Customer User"
})

const initials = computed(() => {
  const parts = userName.value.split(" ")

  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? ""

  return (first + second).toUpperCase()
})

function matchPath(path: string) {
  return route.path === path || route.path.startsWith(path + "/")
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  notificationsOpen.value = false
}

function closeDropdown() {
  dropdownOpen.value = false
}

function toggleNotifications() {
  notificationsOpen.value = !notificationsOpen.value
  dropdownOpen.value = false
}

async function openNotification(notification: CustomerNotification) {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id)
  }

  notificationsOpen.value = false

  if (notification.url) {
    router.push(notification.url)
  }
}

async function markAllNotificationsRead() {
  await notificationStore.markAllAsRead()
}

function formatNotificationDate(value: string | null) {
  if (!value) return ""

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function handleClickOutside(event: MouseEvent) {
  const userElement = document.querySelector(".customer-user")
  const notificationElement = document.querySelector(".customer-notifications")

  if (dropdownOpen.value && userElement && !userElement.contains(event.target as Node)) {
    closeDropdown()
  }

  if (
    notificationsOpen.value &&
    notificationElement &&
    !notificationElement.contains(event.target as Node)
  ) {
    notificationsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
  notificationStore.fetchNotifications().catch(() => undefined)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>

<template>
  <header class="customer-header">
    <div class="customer-header-inner">
      <!-- Left -->
      <div class="customer-left">
        <!-- Brand -->
        <RouterLink class="customer-brand" to="/customer/dashboard">
          <div class="brand-mark">
            <i class="pi pi-box" />
          </div>

          <div class="brand-text" :title="`${companyName} Portal`">{{ portalName }}</div>
        </RouterLink>

        <!-- Nav -->
        <nav class="customer-nav">
          <ul class="customer-nav-list" :class="{ show: mobileOpen }">
            <li v-for="item in navItems" :key="item.to" class="customer-nav-item">
              <RouterLink
                :to="item.to"
                class="customer-nav-link"
                :class="{ active: matchPath(item.to) }"
                @click="emit('close-mobile')"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Right -->
      <div class="customer-right">
        <!-- Request Quote -->
        <button class="quote-btn" type="button">
          <i class="pi pi-plus" />
          <span>Request Quote</span>
        </button>

        <!-- Notification -->
        <div class="customer-notifications">
          <button class="notif-btn" type="button" @click.stop="toggleNotifications">
            <i class="pi pi-bell" />

            <span v-if="notificationStore.unreadCount" class="notif-dot" />
          </button>

          <div v-if="notificationsOpen" class="notifications-panel" @click.stop>
            <div class="notifications-panel__header">
              <strong>Notifications</strong>

              <button
                type="button"
                :disabled="!notificationStore.unreadCount"
                @click="markAllNotificationsRead"
              >
                Mark all read
              </button>
            </div>

            <div v-if="notificationStore.loading" class="notifications-panel__empty">
              Loading...
            </div>

            <div v-else-if="!notificationStore.items.length" class="notifications-panel__empty">
              No notifications.
            </div>

            <template v-else>
              <button
                v-for="notification in notificationStore.items"
                :key="notification.id"
                type="button"
                class="notification-item"
                :class="{ 'notification-item--unread': !notification.read_at }"
                @click="openNotification(notification)"
              >
                <span class="notification-item__title">{{ notification.title }}</span>
                <span class="notification-item__message">{{ notification.message }}</span>
                <span class="notification-item__date">
                  {{ formatNotificationDate(notification.created_at) }}
                </span>
              </button>
            </template>
          </div>
        </div>

        <!-- User -->
        <div class="customer-user">
          <button class="customer-user-btn" type="button" @click.stop="toggleDropdown">
            <div class="customer-avatar">
              {{ initials }}
            </div>

            <div class="customer-user-meta">
              <div class="customer-company" :title="companyName">
                {{ shortCompanyName }}
              </div>

              <div class="customer-user-name" :title="userName">
                {{ userName }}
              </div>
            </div>

            <i class="pi" :class="dropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
          </button>

          <CustomerUserDropdown v-if="dropdownOpen" @close="closeDropdown" />
        </div>

        <!-- Mobile -->
        <button class="mobile-toggle" type="button" @click="emit('toggle-mobile-nav')">
          <i class="pi pi-bars" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.customer-header {
  position: sticky;
  top: 0;
  z-index: 300;

  width: 100%;
  background: #fff;
  border-bottom: 1px solid #c7c7c7;
}

.customer-header-inner {
  width: 100%;
  max-width: calc(1400px + (32px * 2));
  height: 72px;

  margin: 0 auto;
  padding: 0 32px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  box-sizing: border-box;
}

.customer-left {
  display: flex;
  align-items: center;
  gap: 22px;
  flex: 1;
  min-width: 0;
}

.customer-brand {
  display: flex;
  align-items: center;
  gap: 10px;

  text-decoration: none;
  flex: 0 0 auto;
  min-width: 0;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;

  background: #ec691a;
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  flex-shrink: 0;
}

.brand-text {
  min-width: 0;
  max-width: clamp(150px, 18vw, 280px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 700;
  color: #262626;
}

.customer-nav {
  flex: 1;
  min-width: 0;
}

.customer-nav-list {
  display: flex;
  align-items: center;
  gap: 6px;

  list-style: none;
  margin: 0;
  padding: 0;

  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.customer-nav-list::-webkit-scrollbar {
  display: none;
}

.customer-nav-item {
  flex-shrink: 0;
}

.customer-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 10px 12px;

  border-radius: 10px;
  border: 1px solid transparent;

  color: #737373;
  text-decoration: none;

  font-size: 15px;
  font-weight: 600;

  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;
}

.customer-nav-link:hover {
  background: rgba(236, 105, 26, 0.08);
  color: #ec691a;
}

.customer-nav-link.active {
  background: rgba(236, 105, 26, 0.12);
  border-color: rgba(236, 105, 26, 0.15);
  color: #ec691a;
}

.customer-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.quote-btn {
  border: none;
  outline: none;
  cursor: pointer;

  height: 40px;
  padding: 0 14px;
  border-radius: 10px;

  background: #ec691a;
  color: #fff;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  font-size: 0.9rem;
  font-weight: 700;

  transition: background 0.16s ease;
}

.quote-btn:hover {
  background: #d85f17;
}

.notif-btn {
  position: relative;

  width: 40px;
  height: 40px;

  border-radius: 10px;
  border: 1px solid #d9d9d9;

  background: #fff;
  color: #737373;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.notif-btn:hover {
  background: #f8f8f8;
}

.customer-notifications {
  position: relative;
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 8px;

  width: 8px;
  height: 8px;

  border-radius: 999px;
  background: #ec691a;
}

.notifications-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(360px, calc(100vw - 24px));
  max-height: 420px;
  overflow: auto;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  z-index: 500;
}

.notifications-panel__header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border-bottom: 1px solid #ededed;
}

.notifications-panel__header strong {
  font-size: 0.95rem;
  color: #262626;
}

.notifications-panel__header button {
  border: 0;
  background: transparent;
  color: #ec691a;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 800;
}

.notifications-panel__header button:disabled {
  color: #a3a3a3;
  cursor: not-allowed;
}

.notifications-panel__empty {
  padding: 22px 14px;
  color: #737373;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
}

.notification-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid #ededed;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item--unread {
  background: #fff7ed;
}

.notification-item__title {
  color: #262626;
  font-size: 0.88rem;
  font-weight: 800;
}

.notification-item__message {
  color: #525252;
  font-size: 0.82rem;
  line-height: 1.35;
}

.notification-item__date {
  color: #8a8a8a;
  font-size: 0.74rem;
  font-weight: 700;
}

.customer-user {
  position: relative;
  min-width: 0;
}

.customer-user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: clamp(180px, 20vw, 300px);

  padding: 6px 10px 6px 6px;

  border-radius: 999px;
  border: 1px solid #d9d9d9;

  background: #f5f5f5;

  cursor: pointer;
}

.customer-avatar {
  width: 34px;
  height: 34px;

  border-radius: 999px;

  background: #ec691a;
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
}

.customer-user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
  min-width: 0;
}

.customer-company {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8rem;
  font-weight: 700;
  color: #262626;
}

.customer-user-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.72rem;
  color: #737373;
}

.customer-user-btn > .pi {
  flex-shrink: 0;
}

.mobile-toggle {
  display: none;

  width: 40px;
  height: 40px;

  border-radius: 10px;
  border: 1px solid #d9d9d9;

  background: #fff;

  cursor: pointer;
}

@media (max-width: 1320px) {
  .customer-user-meta {
    display: none;
  }

  .customer-user-btn {
    padding-right: 8px;
  }
}

@media (max-width: 1200px) {
  .customer-nav-list {
    display: none;
  }

  .mobile-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .quote-btn span,
  .customer-user-meta {
    display: none;
  }

  .customer-header-inner {
    padding: 0 18px;
  }
}
</style>
