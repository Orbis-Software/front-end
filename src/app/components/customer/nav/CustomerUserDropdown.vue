<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/app/stores/auth"

const emit = defineEmits<{
  (e: "close"): void
}>()

const router = useRouter()
const auth = useAuthStore()

const customer = computed(() => auth.customer)

const userName = computed(() => {
  return customer.value?.name ?? "Customer User"
})

const userEmail = computed(() => {
  return customer.value?.email ?? customer.value?.contact?.email ?? ""
})

const companyName = computed(() => {
  return (
    customer.value?.contact?.company_name ?? customer.value?.contact?.company?.name ?? "Customer"
  )
})

function go(path: string) {
  emit("close")
  router.push(path)
}

async function logout() {
  await auth.logout()

  emit("close")

  router.push("/customer/login")
}
</script>

<template>
  <div class="customer-user-dropdown" @click.stop>
    <div class="dropdown-user">
      <div class="dropdown-user-name" :title="userName">{{ userName }}</div>
      <div class="dropdown-user-email" :title="userEmail">{{ userEmail }}</div>
      <div class="dropdown-user-company" :title="companyName">{{ companyName }}</div>
    </div>

    <div class="dropdown-divider" />

    <button type="button" class="dropdown-link" @click="go('/customer/settings/profile')">
      <i class="pi pi-user" />

      <span>Account Profile</span>
    </button>

    <button type="button" class="dropdown-link" @click="go('/customer/settings/contacts')">
      <i class="pi pi-users" />

      <span>Contacts</span>
    </button>

    <button type="button" class="dropdown-link" @click="go('/customer/settings/preferences')">
      <i class="pi pi-cog" />

      <span>Preferences</span>
    </button>

    <button type="button" class="dropdown-link" @click="go('/customer/settings/security')">
      <i class="pi pi-shield" />

      <span>Security</span>
    </button>

    <div class="dropdown-divider" />

    <button type="button" class="dropdown-link danger" @click="logout">
      <i class="pi pi-sign-out" />

      <span>Logout</span>
    </button>
  </div>
</template>

<style scoped>
.customer-user-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;

  width: min(320px, calc(100vw - 32px));

  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 14px;

  padding: 10px 0;

  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);

  z-index: 200;
}

.dropdown-user {
  padding: 8px 16px 12px;
}

.dropdown-user-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 0.95rem;
  font-weight: 800;
  color: #262626;
}

.dropdown-user-email,
.dropdown-user-company {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  color: #737373;
}

.dropdown-user-company {
  font-weight: 700;
}

.dropdown-link {
  width: 100%;

  border: none;
  background: transparent;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 13px 16px;

  cursor: pointer;

  text-align: left;

  font-size: 0.92rem;
  font-weight: 600;
  color: #262626;

  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.dropdown-link:hover {
  background: rgba(236, 105, 26, 0.08);
  color: #ec691a;
}

.dropdown-divider {
  height: 1px;
  background: #ececec;
  margin: 8px 0;
}

.dropdown-link.danger {
  color: #b42318;
}

.dropdown-link.danger:hover {
  background: rgba(180, 35, 24, 0.08);
  color: #b42318;
}
</style>
