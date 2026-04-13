<script setup lang="ts">
import "./ManagementUsersPage.css"
import { RouterLink, RouterView } from "vue-router"
import { useManagementUsersPage } from "./ManagementUsersPage"
import { useAuthStore } from "@/app/stores/auth"

const auth = useAuthStore()
const { tabs, isActive } = useManagementUsersPage()
</script>

<template>
  <section class="management-users-page">
    <header class="management-users-page__header">
      <div class="management-users-page__title-wrap">
        <h1 class="management-users-page__title">User Management</h1>
      </div>
    </header>

    <div class="management-users-page__card">
      <nav class="management-users-page__tabs">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          class="management-users-page__tab"
          :class="{ 'management-users-page__tab--active': isActive(tab.name) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <div class="management-users-page__content">
        <RouterView />
      </div>
    </div>
  </section>
</template>
