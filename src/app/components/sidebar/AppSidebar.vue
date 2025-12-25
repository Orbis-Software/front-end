<template>
  <aside
    class="pc-sidebar sidebar-container"
    role="navigation"
    aria-label="Main navigation"
  >
    <!-- Header -->
    <header class="sidebar-header">
      <div class="brand-wrapper">
        <div class="brand-logo-wrapper">
          <img
            src="/logo-pc-cargo.png"
            alt="PC Cargo"
            class="brand-logo"
          />
        </div>

        <span class="brand-text">PC Cargo</span>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="sidebar-menu">
      <ul class="menu-list">
        <!-- Dashboard -->
        <li class="menu-item">
          <button
            class="menu-link"
            :class="{ active: isActive('/dashboard') }"
            @click="go('/dashboard')"
          >
            <i class="pi pi-home menu-icon" />
            <span class="menu-text">Dashboard</span>
          </button>
        </li>

        <!-- Jobs -->
        <li class="menu-item">
          <button
            class="menu-link"
            :class="{ active: isActive('/jobs') }"
            @click="go('/jobs')"
          >
            <i class="pi pi-briefcase menu-icon" />
            <span class="menu-text">Jobs</span>
          </button>
        </li>

        <!-- Clients (NOW ENABLED) -->
        <li class="menu-item">
          <button
            class="menu-link"
            :class="{ active: isActive('/clients') }"
            @click="go('/clients')"
          >
            <i class="pi pi-users menu-icon" />
            <span class="menu-text">Clients</span>
          </button>
        </li>

        <!-- Reports (still disabled) -->
        <li class="menu-item">
          <button class="menu-link" disabled>
            <i class="pi pi-chart-line menu-icon" />
            <span class="menu-text">Reports</span>
          </button>
        </li>

        <!-- PUSH TO BOTTOM -->
        <li class="menu-spacer"></li>

        <!-- Logout -->
        <li class="menu-item">
          <button
            class="menu-link logout-link"
            @click="logout"
          >
            <i class="pi pi-sign-out menu-icon" />
            <span class="menu-text">Logout</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <footer class="sidebar-footer">
      <div class="user-avatar">
        {{ initials }}
      </div>

      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">Administrator</span>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/app/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

function go(path: string) {
  router.push(path)
}

function isActive(path: string) {
  return route.path.startsWith(path)
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}

const userName = computed(() => authStore.user?.name ?? 'User')

const initials = computed(() => {
  const parts = userName.value.split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : parts[0][0]
})
</script>

<style scoped>
/* Root sidebar */
.pc-sidebar {
  width: 280px;
  height: 100vh;

  position: fixed;
  top: 0;
  left: 0;

  border-right: 1px solid var(--pc-border);
  background-color: var(--pc-bg-sidebar);

  z-index: 100;
}

/* Container */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--pc-bg-sidebar);
  color: var(--pc-text-main);
}

/* ===============================
   Header / Brand
   =============================== */

.sidebar-header {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--pc-border);
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.4px;
}

/* ===============================
   Menu
   =============================== */

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding-top: 0.5rem;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem;
}

.menu-item {
  margin-bottom: 0.5rem;
}

.menu-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;

  padding: 0.9rem 1rem;

  background: transparent;
  border: none;
  border-radius: 10px;

  color: var(--pc-text-main);
  font-size: 1rem;
  font-weight: 600;
  text-align: left;

  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menu-icon {
  font-size: 1.1rem;
  opacity: 0.85;
}

/* Hover */
.menu-link:hover:not(:disabled) {
  background-color: var(--pc-surface-2);
}

/* Active (FIXED) */
.menu-link.active {
  background-color: var(--pc-surface-2);
}

.menu-link.active .menu-icon {
  opacity: 1;
}

/* Disabled */
.menu-link:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Spacer */
.menu-spacer {
  flex: 1;
}

/* ===============================
   Footer / User
   =============================== */

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--pc-border);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--pc-primary);
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.user-name {
  font-weight: 600;
}

.user-role {
  font-size: 0.75rem;
  color: var(--pc-text-muted);
}
</style>
