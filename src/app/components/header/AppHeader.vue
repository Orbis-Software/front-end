<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue"
import { RouterLink, useRoute } from "vue-router"
import UserDropdown from "@/app/components/nav/UserDropdown.vue"
import { useAuthStore } from "@/app/stores/auth"
import { useUiStore } from "@/app/stores/ui"
import type { AppArea } from "@/app/stores/ui"
import { useTopNavItems, type NavItem } from "@/app/components/nav/topNavItems"

type Props = {
  area: AppArea
  mobileOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: "switch-area", v: AppArea): void
  (e: "toggle-mobile-nav"): void
  (e: "close-mobile"): void
}>()

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const items = useTopNavItems()

const userDropdownOpen = ref(false)

const userName = computed(() => auth.user?.name ?? "User")
const userRole = computed(() => {
  const roles = (auth.user as any)?.roles as string[] | undefined
  if (roles?.length) return roles.join(", ")
  return "User"
})

const companyLogoSrc = computed(() => {
  const company: any = auth.user?.company
  return company?.logo_url ?? company?.logo ?? "/orbis-logo.png"
})

const initials = computed(() => {
  const parts = userName.value.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? ""
  return (first + second).toUpperCase() || "U"
})

function toggleUserDropdown() {
  userDropdownOpen.value = !userDropdownOpen.value
}

function closeUserDropdown() {
  userDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const element = document.querySelector(".user-profile-container")
  if (userDropdownOpen.value && element && !element.contains(event.target as Node)) {
    closeUserDropdown()
  }
}

function canAccess(item: NavItem): boolean {
  if (item.devOnly && !auth.isDev) return false
  if (item.adminOnly && !auth.isAdmin) return false

  if (item.roles?.length) {
    return item.roles.some(role => auth.hasRole(role))
  }

  if (item.permission) {
    return auth.hasPermission(item.permission)
  }

  if (item.anyPermissions?.length) {
    return item.anyPermissions.some(permission => auth.hasPermission(permission))
  }

  return true
}

const canSeeManagement = computed(() => {
  return auth.permissions.some(permission => permission.startsWith("mgmt."))
})

const menu = computed(() => {
  if (props.area === "wms") {
    return items.wms.filter(canAccess)
  }

  const tmsMenu = items.tms
  const managementMenu = ui.canSeeManagement || canSeeManagement.value ? items.management : []

  return [...tmsMenu, ...managementMenu].filter(canAccess)
})

function matchPath(path?: string) {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + "/")
}

onMounted(() => document.addEventListener("click", handleClickOutside))
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside))
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="brand">
          <img class="brand-logo" :src="companyLogoSrc" alt="Company logo" />
        </div>

        <nav class="top-nav" role="navigation" aria-label="Primary">
          <ul class="nav-list" :class="{ show: mobileOpen }">
            <li v-for="item in menu" :key="item.id" class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: matchPath(item.to) }"
                :to="item.to || '/'"
                @click="emit('close-mobile')"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="controls">
        <div class="area-switch">
          <button
            class="area-btn"
            :class="{ active: area === 'tms' }"
            type="button"
            @click="emit('switch-area', 'tms')"
          >
            TMS
          </button>

          <button
            class="area-btn"
            :class="{ active: area === 'wms' }"
            type="button"
            @click="emit('switch-area', 'wms')"
          >
            WMS
          </button>
        </div>

        <div class="user-profile-container">
          <button class="user-profile" type="button" @click="toggleUserDropdown">
            <div class="user-avatar">{{ initials }}</div>

            <div class="user-meta">
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>

            <i class="pi caret" :class="userDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'" />
          </button>

          <UserDropdown v-if="userDropdownOpen" @close="closeUserDropdown" />
        </div>

        <button class="mobile-toggle" type="button" @click="emit('toggle-mobile-nav')">
          <i class="pi pi-bars" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  --shell-side-padding: clamp(20px, 2.4vw, 32px);
  --shell-content-max: 1400px;

  width: 100%;
  background: #fff;
}

.header-inner {
  width: 100%;
  max-width: calc(var(--shell-content-max) + (var(--shell-side-padding) * 2));
  margin: 0 auto;
  padding: 0 var(--shell-side-padding);
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 26px;
  min-width: 0;
  flex: 1;
}

.brand {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.brand-logo {
  display: block;
  height: 38px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
}

.top-nav {
  min-width: 0;
  flex: 1;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 0;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item {
  flex: 0 0 auto;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  border: 1px solid transparent;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease;
}

.nav-link:hover {
  background: rgba(236, 105, 26, 0.08);
  color: var(--primary);
}

.nav-link.active {
  background: rgba(236, 105, 26, 0.12);
  color: var(--primary);
  border-color: rgba(236, 105, 26, 0.2);
}

.controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
}

.area-switch {
  display: flex;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #f7f7f7;
}

.area-btn {
  border: 1px solid transparent;
  background: transparent;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  color: var(--text-muted);
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.area-btn:hover {
  background: rgba(236, 105, 26, 0.08);
  color: var(--primary);
}

.area-btn.active {
  background: #fff;
  border-color: rgba(236, 105, 26, 0.18);
  color: var(--primary);
}

.user-profile-container {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
}

.user-profile:hover {
  background: #f8f8f8;
  border-color: var(--border);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(236, 105, 26, 0.12);
  font-weight: 800;
  color: var(--primary);
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.user-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text);
}

.user-role {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.caret {
  color: var(--text-muted);
}

.mobile-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
}

.mobile-toggle:hover {
  background: #f8f8f8;
}

@media (max-width: 1200px) {
  .nav-list {
    display: none;
  }

  .mobile-toggle {
    display: inline-grid;
    place-items: center;
  }
}

@media (max-width: 768px) {
  .area-switch,
  .user-meta {
    display: none;
  }
}
</style>
