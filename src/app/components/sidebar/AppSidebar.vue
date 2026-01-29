<!-- AppSidebar.vue -->
<template>
  <aside
    class="pc-sidebar sidebar-container"
    :class="[{ embedded }, { collapsed: collapsedLocal }]"
    role="navigation"
    aria-label="Main navigation"
  >
    <!-- Header -->
    <header class="sidebar-header" :class="{ collapsed: collapsedLocal }">
      <div class="brand-wrapper">
        <div class="brand-logo-wrapper">
          <img src="/orbis-logo.png" alt="PC Cargo" class="brand-logo" />
        </div>

        <!-- Hide text when collapsed -->
        <span v-if="!collapsedLocal" class="brand-text">Transport Programme</span>
      </div>

      <!-- Expanded: toggle on the right -->
      <button
        v-if="embedded && !collapsedLocal"
        class="collapse-toggle"
        type="button"
        aria-label="Collapse sidebar"
        @click="toggleCollapsed"
      >
        <i class="pi pi-angle-double-left"></i>
      </button>

      <!-- Collapsed: toggle on its own row (no gap) -->
      <div v-if="embedded && collapsedLocal" class="collapsed-controls">
        <button
          class="collapse-toggle"
          type="button"
          aria-label="Expand sidebar"
          @click="toggleCollapsed"
        >
          <i class="pi pi-angle-double-right"></i>
        </button>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="sidebar-menu">
      <ul class="menu-list">
        <template v-for="group in groups" :key="group.key">
          <!-- Group header (hide on collapsed) -->
          <li v-if="!collapsedLocal" class="group-title">
            <button class="group-toggle" type="button" @click="toggleGroup(group.key)">
              <span>{{ group.label }}</span>
              <i class="pi pi-chevron-down" :class="{ rotated: !groupOpen[group.key] }" />
            </button>
          </li>

          <!-- If collapsed, we still render items but always "open" groups -->
          <template v-if="collapsedLocal || groupOpen[group.key]">
            <template v-for="item in group.items" :key="itemKey(group.key, item)">
              <!-- Leaf -->
              <li v-if="item.type === 'leaf'" class="menu-item">
                <button
                  class="menu-link"
                  :class="{ active: isActive(item.to), collapsed: collapsedLocal }"
                  :disabled="!!item.disabled"
                  type="button"
                  @click="go(item.to)"
                  :title="collapsedLocal ? item.label : undefined"
                >
                  <i v-if="item.icon" :class="[item.icon, 'menu-icon']" />
                  <span v-else class="menu-icon-spacer" />
                  <span v-if="!collapsedLocal" class="menu-text">{{ item.label }}</span>
                </button>
              </li>

              <!-- Submenu -->
              <li v-else class="menu-item">
                <button
                  class="menu-link submenu-trigger"
                  :class="{ active: isActiveSubmenu(item), collapsed: collapsedLocal }"
                  type="button"
                  @click="onSubmenuClick(item.key)"
                  :title="collapsedLocal ? item.label : undefined"
                >
                  <i v-if="item.icon" :class="[item.icon, 'menu-icon']" />
                  <span v-else class="menu-icon-spacer" />

                  <span v-if="!collapsedLocal" class="menu-text">{{ item.label }}</span>

                  <i
                    v-if="!collapsedLocal"
                    class="pi pi-angle-right submenu-chevron"
                    :class="{ open: submenuOpen[item.key] }"
                  />
                </button>

                <!-- Only show children when expanded -->
                <ul v-show="!collapsedLocal && submenuOpen[item.key]" class="submenu-list">
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
          <button
            class="menu-link logout-link"
            :class="{ collapsed: collapsedLocal }"
            type="button"
            @click="logout"
            :title="collapsedLocal ? 'Logout' : undefined"
          >
            <i class="pi pi-sign-out menu-icon" />
            <span v-if="!collapsedLocal" class="menu-text">Logout</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer (hide info when collapsed) -->
    <footer class="sidebar-footer">
      <div class="user-avatar">{{ initials }}</div>

      <div v-if="!collapsedLocal" class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">Administrator</span>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/app/stores/auth";
import {
  SIDEBAR_GROUPS,
  type SidebarGroup,
  type SidebarLeaf,
  type SidebarSubmenu,
} from "./routes";
import "./AppSidebar.css";

type Props = {
  embedded?: boolean;
  visible?: boolean;
  collapsed?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
  visible: true,
  collapsed: false,
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "update:collapsed", value: boolean): void;
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const groups = computed<SidebarGroup[]>(() => SIDEBAR_GROUPS);

const collapsedLocal = ref<boolean>(props.collapsed);

watch(
  () => props.collapsed,
  (v) => (collapsedLocal.value = v),
);

function toggleCollapsed() {
  collapsedLocal.value = !collapsedLocal.value;
  emit("update:collapsed", collapsedLocal.value);

  if (collapsedLocal.value) {
    Object.keys(submenuOpen).forEach((k) => (submenuOpen[k] = false));
  }
}

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

function onSubmenuClick(key: string) {
  if (collapsedLocal.value) {
    collapsedLocal.value = false;
    emit("update:collapsed", false);
  }
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
  return item.type === "leaf"
    ? `${groupKey}:${item.to}`
    : `${groupKey}:submenu:${item.key}`;
}

async function logout() {
  await authStore.logout();
  router.push("/login");
}

const userName = computed(() => authStore.user?.name ?? "User");

const initials = computed(() => {
  const parts = userName.value.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const second = parts[1]?.charAt(0) ?? "";
  if (first && second) return (first + second).toUpperCase();
  if (first) return first.toUpperCase();
  return "U";
});
</script>
