<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { RouterLink, useRoute } from "vue-router"
import CustomerUserDropdown from "@/app/components/customer/nav/CustomerUserDropdown.vue"
import { useAuthStore } from "@/app/stores/auth"

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

const dropdownOpen = ref(false)

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

const portalName = computed(() => {
  return `${companyName.value} Portal`
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
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const element = document.querySelector(".customer-user")

  if (dropdownOpen.value && element && !element.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
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

          <div class="brand-text">{{ portalName }}</div>
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
        <button class="notif-btn" type="button">
          <i class="pi pi-bell" />

          <span class="notif-dot" />
        </button>

        <!-- User -->
        <div class="customer-user">
          <button class="customer-user-btn" type="button" @click.stop="toggleDropdown">
            <div class="customer-avatar">
              {{ initials }}
            </div>

            <div class="customer-user-meta">
              <div class="customer-company">
                {{ companyName }}
              </div>

              <div class="customer-user-name">
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
  gap: 20px;

  box-sizing: border-box;
}

.customer-left {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
  min-width: 0;
}

.customer-brand {
  display: flex;
  align-items: center;
  gap: 10px;

  text-decoration: none;
  flex-shrink: 0;
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
}

.brand-text {
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
}

.customer-nav-item {
  flex-shrink: 0;
}

.customer-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 10px 14px;

  border-radius: 10px;
  border: 1px solid transparent;

  color: #737373;
  text-decoration: none;

  font-size: 0.92rem;
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
  gap: 12px;
  flex-shrink: 0;
}

.quote-btn {
  border: none;
  outline: none;
  cursor: pointer;

  height: 40px;
  padding: 0 16px;
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

.notif-dot {
  position: absolute;
  top: 7px;
  right: 8px;

  width: 8px;
  height: 8px;

  border-radius: 999px;
  background: #ec691a;
}

.customer-user {
  position: relative;
}

.customer-user-btn {
  display: flex;
  align-items: center;
  gap: 10px;

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
}

.customer-user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.customer-company {
  font-size: 0.8rem;
  font-weight: 700;
  color: #262626;
}

.customer-user-name {
  font-size: 0.72rem;
  color: #737373;
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
