<script setup lang="ts">
import { computed } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import type { AppArea } from "@/app/stores/ui"
import { useAuthStore } from "@/app/stores/auth"
import { useUiStore } from "@/app/stores/ui"
import { useTopNavItems, type NavItem } from "./topNavItems"

type Props = {
  area: AppArea
  mobileOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: "close-mobile"): void }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const items = useTopNavItems()

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
  if (!auth.isAuthenticated) return false
  if (auth.isAdmin || auth.isDev) return true
  if (auth.hasRole("company-manager")) return true
  return auth.permissions.some(permission => permission.startsWith("mgmt."))
})

const menu = computed(() => {
  if (props.area === "wms") {
    return items.wms
  }

  const tmsMenu = items.tms.filter(canAccess)
  const managementMenu = canSeeManagement.value ? items.management.filter(canAccess) : []

  return [...tmsMenu, ...managementMenu]
})

function matchPath(path?: string) {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + "/")
}

function resolveHref(path?: string) {
  if (!path) return "#"
  return router.resolve(path).href
}
</script>

<template>
  <nav class="top-nav" role="navigation" aria-label="Primary">
    <div class="nav-inner">
      <ul class="nav-list" :class="{ show: mobileOpen }">
        <li v-for="item in menu" :key="item.id" class="nav-item">
          <RouterLink
            class="nav-link"
            :class="{ active: matchPath(item.to) }"
            :to="item.to || '/'"
            :href="resolveHref(item.to)"
            @click="emit('close-mobile')"
          >
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  --shell-side-padding: clamp(40px, 5vw, 80px);
  --shell-content-max: 1400px;

  width: 100%;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  width: 100%;
  max-width: calc(var(--shell-content-max) + (var(--shell-side-padding) * 2));
  margin: 0 auto;
  padding: 0 var(--shell-side-padding);
  box-sizing: border-box;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 10px 0;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow: visible;
}

.nav-item {
  position: relative;
  flex: 0 0 auto;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.nav-link:visited,
.nav-link:active,
.nav-link:hover {
  text-decoration: none;
}

.nav-link:hover {
  background: rgba(236, 105, 26, 0.08);
  color: var(--primary);
}

.nav-link.active {
  background: rgba(236, 105, 26, 0.12);
  color: var(--primary);
  border-color: rgba(236, 105, 26, 0.18);
}

.nav-link.active::after {
  display: none;
}

@media (max-width: 1280px) {
  .nav-link {
    padding: 9px 12px;
    font-size: 0.9rem;
  }
}

@media (max-width: 1024px) {
  .nav-list {
    position: absolute;
    left: 0;
    right: 0;
    top: 70px;
    background: #fff;
    flex-direction: column;
    align-items: stretch;
    display: none;
    z-index: 55;
    overflow: visible;
    white-space: normal;
    padding: 10px;
    gap: 4px;
    border-top: 1px solid var(--border);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
  }

  .nav-list.show {
    display: flex;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 14px 16px;
    border-radius: 10px;
  }
}
</style>
