<template>
  <aside class="pc-sidebar sidebar-container" role="navigation" aria-label="Main navigation">
    <!-- Header -->
    <header class="sidebar-header">
      <div class="brand-wrapper">
        <div class="brand-logo-wrapper">
          <img src="/orbis-logo.png" alt="PC Cargo" class="brand-logo" />
        </div>
        <span class="brand-text">Transport Programme</span>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="sidebar-menu">
      <ul class="menu-list">
        <template v-for="group in groups" :key="group.key">
          <!-- Group header -->
          <li class="group-title">
            <button class="group-toggle" type="button" @click="toggleGroup(group.key)">
              <span>{{ group.label }}</span>
              <i class="pi pi-chevron-down" :class="{ rotated: !groupOpen[group.key] }" />
            </button>
          </li>

          <!-- Group items -->
          <template v-if="groupOpen[group.key]">
            <template v-for="item in group.items" :key="itemKey(group.key, item)">
              <!-- Leaf -->
              <li v-if="item.type === 'leaf'" class="menu-item">
                <button
                  class="menu-link"
                  :class="{ active: isActive(item.to) }"
                  :disabled="!!item.disabled"
                  type="button"
                  @click="go(item.to)"
                >
                  <i v-if="item.icon" :class="[item.icon, 'menu-icon']" />
                  <span v-else class="menu-icon-spacer" />
                  <span class="menu-text">{{ item.label }}</span>
                </button>
              </li>

              <!-- Submenu -->
              <li v-else class="menu-item">
                <button
                  class="menu-link submenu-trigger"
                  :class="{ active: isActiveSubmenu(item) }"
                  type="button"
                  @click="toggleSubmenu(item.key)"
                >
                  <i v-if="item.icon" :class="[item.icon, 'menu-icon']" />
                  <span v-else class="menu-icon-spacer" />
                  <span class="menu-text">{{ item.label }}</span>

                  <i class="pi pi-angle-right submenu-chevron" :class="{ open: submenuOpen[item.key] }" />
                </button>

                <ul v-show="submenuOpen[item.key]" class="submenu-list">
                  <li v-for="child in item.children" :key="child.to" class="submenu-item">
                    <button
                      class="submenu-link"
                      :class="{ active: isActive(child.to) }"
                      :disabled="!!child.disabled"
                      type="button"
                      @click="go(child.to)"
                    >
                      <span class="submenu-bullet" />
                      <span class="submenu-text">{{ child.label }}</span>
                    </button>
                  </li>
                </ul>
              </li>
            </template>
          </template>
        </template>

        <!-- Push to bottom -->
        <li class="menu-spacer"></li>

        <!-- Logout -->
        <li class="menu-item">
          <button class="menu-link logout-link" type="button" @click="logout">
            <i class="pi pi-sign-out menu-icon" />
            <span class="menu-text">Logout</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <footer class="sidebar-footer">
      <div class="user-avatar">{{ initials }}</div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">Administrator</span>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/app/stores/auth";
import { SIDEBAR_GROUPS, type SidebarGroup, type SidebarLeaf, type SidebarSubmenu } from "./routes";
import "./AppSidebar.css";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const groups = computed<SidebarGroup[]>(() => SIDEBAR_GROUPS);

// open state
const groupOpen = reactive<Record<string, boolean>>({
  tms: true,
  wms: true,
  mgmt: true,
});

const submenuOpen = reactive<Record<string, boolean>>({
  contacts: false,
});

function toggleGroup(key: string) {
  groupOpen[key] = !groupOpen[key];
}

function toggleSubmenu(key: string) {
  submenuOpen[key] = !submenuOpen[key];
}

function go(path: string) {
  router.push(path);
}

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + "/");
}

function isActiveSubmenu(item: SidebarSubmenu) {
  return item.children.some((c) => isActive(c.to));
}

function itemKey(groupKey: string, item: SidebarLeaf | SidebarSubmenu) {
  return item.type === "leaf" ? `${groupKey}:${item.to}` : `${groupKey}:submenu:${item.key}`;
}

async function logout() {
  await authStore.logout();
  router.push("/login");
}

const userName = computed(() => authStore.user?.name ?? "User");

const initials = computed(() => {
  const parts = userName.value.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] ?? "U").toUpperCase();
});
</script>


