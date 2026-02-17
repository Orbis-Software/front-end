<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import UserDropdown from "@/app/components/nav/UserDropdown.vue";
import { useAuthStore } from "@/app/stores/auth";
import type { AppArea } from "@/app/stores/ui";

type Props = {
  area: AppArea;
};

defineProps<Props>();

const emit = defineEmits<{
  (e: "switch-area", v: AppArea): void;
  (e: "toggle-mobile-nav"): void;
}>();

const auth = useAuthStore();
const userDropdownOpen = ref(false);

const userName = computed(() => auth.user?.name ?? "User");
const userRole = computed(() => {
  const roles = (auth.user as any)?.roles as string[] | undefined;
  if (roles?.length) return roles.join(", ");
  return "User";
});

const companyLogoSrc = computed(() => {
  const c: any = auth.user?.company;
  return c?.logo_url ?? c?.logo ?? "/orbis-logo.png";
});

const initials = computed(() => {
  const parts = userName.value.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "U";
});

const companyName = computed(() => auth.user?.company?.legal_name ?? "Orbis Software Ltd");

function toggleUserDropdown() {
  userDropdownOpen.value = !userDropdownOpen.value;
}
function closeUserDropdown() {
  userDropdownOpen.value = false;
}

function handleClickOutside(e: MouseEvent) {
  const el = document.querySelector(".user-profile-container");
  if (userDropdownOpen.value && el && !el.contains(e.target as Node)) {
    closeUserDropdown();
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Brand -->
      <div class="brand">
        <img class="brand-logo" :src="companyLogoSrc" alt="Company logo" />
        <div class="brand-text">{{ companyName }}</div>
      </div>

      <!-- Right controls -->
      <div class="controls">
        <!-- TMS / WMS switch -->
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

        <!-- User -->
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

        <!-- Mobile nav toggle -->
        <button class="mobile-toggle" type="button" @click="emit('toggle-mobile-nav')">
          <i class="pi pi-bars" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--pc-bg-card, #fff);
}

.header-inner {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  height: 36px;
  max-width: 120px;
  object-fit: contain;
}

.brand-text {
  font-weight: 900;
  font-size: 1.15rem;
  color: var(--pc-text-main);
  white-space: nowrap;
}

.controls {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Switch */
.area-switch {
  display: flex;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(0,0,0,0.03);
}

.area-btn {
  border: 1px solid transparent;
  background: transparent;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 900;
  color: var(--pc-text-muted);
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.area-btn:hover {
  background: rgba(236, 105, 26, 0.08);
  border-color: rgba(236, 105, 26, 0.20);
  color: var(--pc-primary);
}

.area-btn.active {
  background: #fff;
  border-color: rgba(0,0,0,0.12);
  color: var(--pc-text-main);
}

/* User */
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
  transition: background 0.16s ease, border-color 0.16s ease;
}

.user-profile:hover {
  background: rgba(0,0,0,0.03);
  border-color: rgba(0,0,0,0.08);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.06);
  font-weight: 900;
  color: var(--pc-text-main);
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.user-name {
  font-weight: 900;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  color: var(--pc-text-muted);
}

.caret {
  color: var(--pc-text-muted);
}

/* Mobile button */
.mobile-toggle {
  display: none;
  border: 1px solid rgba(0,0,0,0.10);
  background: #fff;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.mobile-toggle:hover {
  background: rgba(0,0,0,0.03);
}

@media (max-width: 1200px) {
  .header-inner {
    padding: 0 20px;
  }
  .mobile-toggle {
    display: inline-grid;
    place-items: center;
  }
}

@media (max-width: 768px) {
  .area-switch {
    display: none;
  }
}
</style>
