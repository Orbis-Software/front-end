<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { AppArea } from "@/app/stores/ui";
import { useTopNavItems, type NavItem } from "./topNavItems";

type Props = {
  area: AppArea;
  managementMode: boolean;
  mobileOpen: boolean;
};

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "close-mobile"): void }>();

const router = useRouter();
const route = useRoute();

const items = useTopNavItems();

const menu = computed(() => {
  if (props.managementMode) return items.management;
  return props.area === "tms" ? items.tms : items.wms;
});

const openMobile = reactive<Record<string, boolean>>({});

watch(
  () => props.mobileOpen,
  (v) => {
    if (!v) Object.keys(openMobile).forEach((k) => (openMobile[k] = false));
  },
);

function matchPath(path: string) {
  return route.path === path || route.path.startsWith(path + "/");
}

function getActiveChildId(children?: NavItem[]) {
  if (!children?.length) return null;

  let best: NavItem | null = null;

  for (const c of children) {
    if (!c.to) continue;
    if (matchPath(c.to)) {
      if (!best || c.to.length > (best.to?.length ?? 0)) best = c;
    }
  }

  return best?.id ?? null;
}

function isGroupActive(item: NavItem) {
  if (item.to && matchPath(item.to)) return true;
  return !!getActiveChildId(item.children);
}

function go(path?: string) {
  if (!path) return;
  router.push(path);
  emit("close-mobile");
}

function toggleMobileDropdown(id: string) {
  openMobile[id] = !openMobile[id];
}
</script>

<template>
  <nav class="top-nav" role="navigation" aria-label="Primary">
    <div class="nav-inner">
      <ul class="nav-list" :class="{ show: mobileOpen }">
        <li
          v-for="item in menu"
          :key="item.id"
          class="nav-item"
          :class="{
            hasDropdown: !!item.children?.length,
            activeItem: isGroupActive(item),
          }"
        >
          <button
            class="nav-link"
            :class="{
              active: isGroupActive(item),
              expanded: mobileOpen && openMobile[item.id],
            }"
            type="button"
            @click="
              mobileOpen && item.children?.length
                ? toggleMobileDropdown(item.id)
                : go(item.to)
            "
          >
            <i v-if="item.icon" :class="item.icon" />
            <span>{{ item.label }}</span>

            <i
              v-if="item.children?.length"
              class="pi pi-chevron-down chevron"
              :class="{ open: mobileOpen && openMobile[item.id] }"
            />
          </button>

          <div
            v-if="item.children?.length"
            class="dropdown"
            :class="{ show: mobileOpen && openMobile[item.id] }"
          >
            <button
              v-for="child in item.children"
              :key="child.id"
              class="dropdown-link"
              :class="{ active: child.id === getActiveChildId(item.children) }"
              type="button"
              @click="go(child.to)"
            >
              <i v-if="child.icon" :class="child.icon" />
              <span>{{ child.label }}</span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
/* =========================
   TransportPro tab bar style
   ========================= */
.top-nav {
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.10);
}

.nav-inner {
  padding: 0 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
  flex-wrap: wrap;
}

.nav-item {
  position: relative;
}

/* optional separators */
.nav-item + .nav-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 1px;
  background: rgba(0, 0, 0, 0.10);
  pointer-events: none;
}

/* ✅ Tab button */
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 18px 22px;
  background: transparent;
  border: none;
  cursor: pointer;

  font-weight: 700;
  font-size: 0.95rem;
  color: #1f2937;

  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link i {
  font-size: 1.05rem;
  opacity: 0.95;
}

.chevron {
  margin-left: 6px;
  font-size: 0.85rem;
  opacity: 0.7;
}

.nav-link:hover {
  background-color: #f5f5f5;
  color: var(--primary);
}

.nav-link:hover i {
  color: var(--primary);
}

/* ✅ active underline like TransportPro */
.nav-link.active {
  background: rgba(0, 0, 0, 0.04);
  color: var(--primary);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -1px;
  height: 3px;
  background-color: var(--primary);
  border-radius: 2px;
}

/* =========================
   Dropdown hover fix
   ========================= */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 240px;

  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.10);
  border-radius: 12px;

  padding: 8px 0;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.14);

  display: none;
  z-index: 60;
}

.dropdown::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 10px;
}

.nav-item.hasDropdown:hover > .dropdown,
.nav-item.hasDropdown:focus-within > .dropdown {
  display: block;
}

/* Dropdown items */
.dropdown-link {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px 16px;
  text-align: left;

  font-weight: 800;
  color: #1f2937;
  transition: background 0.15s ease, color 0.15s ease;
}

.dropdown-link:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--primary);
}

/* ✅ Only the selected child will be active (via best-match logic) */
.dropdown-link.active {
  background: rgba(236, 105, 26, 0.10);
  color: var(--primary);
}

/* =========================
   Mobile dropdown behavior
   ========================= */
@media (max-width: 1200px) {
  .nav-inner {
    padding: 0 20px;
  }

  .nav-list {
    position: absolute;
    left: 0;
    right: 0;
    top: 70px;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.10);
    flex-direction: column;
    align-items: stretch;
    display: none;
    z-index: 55;
  }

  .nav-list.show {
    display: flex;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
  }

  .nav-item + .nav-item::before {
    display: none;
  }

  .nav-link {
    width: 100%;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .nav-item.hasDropdown:hover > .dropdown {
    display: none;
  }

  .dropdown {
    position: static;
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
    display: none;
  }

  .dropdown::before {
    display: none;
  }

  .dropdown.show {
    display: block;
  }

  .dropdown-link {
    padding: 14px 18px 14px 36px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
}
</style>
