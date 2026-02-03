<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/app/stores/auth";

const emit = defineEmits<{ (e: "close"): void }>();

const router = useRouter();
const auth = useAuthStore();

function go(path: string) {
  router.push(path);
  emit("close");
}

async function logout() {
  await auth.logout();
  emit("close");
  router.push("/login");
}
</script>

<template>
  <div class="user-dd" @click.stop>
    <button class="dd-link" type="button" @click="go('/settings/login')">
      <i class="pi pi-key" />
      <span>Login Details</span>
    </button>

    <button class="dd-link" type="button" @click="go('/settings')">
      <i class="pi pi-cog" />
      <span>General Settings</span>
    </button>

    <div class="dd-divider" />

    <button class="dd-link danger" type="button" @click="logout">
      <i class="pi pi-sign-out" />
      <span>Logout</span>
    </button>
  </div>
</template>

<style scoped>
.user-dd {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 250px;

  background: var(--pc-bg-card, #fff);
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 12px;

  box-shadow: 0 18px 45px rgba(0,0,0,0.14);
  padding: 10px 0;
  z-index: 80;
}

.dd-link {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px 16px;
  text-align: left;

  font-weight: 900;
  color: var(--pc-text-main);
  transition: background 0.16s ease, color 0.16s ease;
}

.dd-link:hover {
  background: rgba(236, 105, 26, 0.08);
  color: var(--pc-primary);
}

.dd-divider {
  height: 1px;
  background: rgba(0,0,0,0.10);
  margin: 8px 0;
}

.danger {
  color: #b42318;
}

.danger:hover {
  background: rgba(180, 35, 24, 0.08);
  color: #b42318;
}
</style>
