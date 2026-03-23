<script setup lang="ts">
import { computed } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import type { AppArea } from "@/app/stores/ui"
import { useUiStore } from "@/app/stores/ui"
import { useAuthStore } from "@/app/stores/auth"
import { useTopNavItems, type NavItem } from "./topNavItems"

type Props = {
  area: AppArea
  mobileOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: "close-mobile"): void }>()

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const items = useTopNavItems()

function canAccess(item: NavItem): boolean {
  if (item.devOnly && !auth.isDev) return false
  if (item.adminOnly && !auth.isAdmin) return false

  if (item.roles?.length && item.roles.some(role => auth.hasRole(role))) {
    return true
  }

  if (item.permission) return auth.hasPermission(item.permission)

  if (item.anyPermissions?.length) {
    return item.anyPermissions.some(permission => auth.hasPermission(permission))
  }

  return true
}

function filterNav(list: NavItem[]): NavItem[] {
  return list.filter(canAccess)
}

const canSeeManagement = computed(() => {
  return auth.permissions.some(permission => permission.startsWith("mgmt."))
})

const menu = computed(() => {
  const base = props.area === "tms" ? items.tms : items.wms
  const combined =
    ui.canSeeManagement || canSeeManagement.value ? [...base, ...items.management] : base

  return filterNav(combined)
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
  --shell-side-padding: clamp(36px, 4vw, 72px);
  --shell-content-max: 1400px;

  width: 100%;
  background: #fff;
  border-bottom: none;
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
  padding: 0;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
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
  padding: 16px 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1f2937;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-link:visited,
.nav-link:active,
.nav-link:hover {
  text-decoration: none;
}

.nav-link:hover {
  background-color: #f5f5f5;
  color: var(--primary);
}

.nav-link.active {
  background: rgba(0, 0, 0, 0.04);
  color: var(--primary);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -1px;
  height: 3px;
  background-color: var(--primary);
  border-radius: 2px;
}

@media (max-width: 1400px) {
  .nav-link {
    padding: 14px 14px;
    font-size: 0.92rem;
  }
}

@media (max-width: 1280px) {
  .nav-link {
    padding: 12px 10px;
    font-size: 0.88rem;
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
  }

  .nav-list.show {
    display: flex;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 16px 18px;
    border-radius: 0;
  }
}
</style>
