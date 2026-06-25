<script setup lang="ts">
import { computed } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { useAuthStore } from "@/app/stores/auth"

const route = useRoute()
const auth = useAuthStore()

const context = computed(() => String(route.meta.authType ?? "guest"))
const isCustomerContext = computed(() => context.value.includes("customer"))
const isGuestContext = computed(() => !auth.isAuthenticated)

const primaryAction = computed(() => {
  if (!isGuestContext.value) {
    return isCustomerContext.value
      ? { label: "Back to dashboard", to: { name: "customer.dashboard" } }
      : { label: "Back to dashboard", to: { name: "app.dashboard" } }
  }

  return isCustomerContext.value
    ? { label: "Customer login", to: { name: "auth.customer.login" } }
    : { label: "Staff login", to: { name: "auth.login" } }
})

const secondaryAction = computed(() => {
  if (!isGuestContext.value) {
    return isCustomerContext.value
      ? { label: "View shipments", to: { name: "customer.shipments" } }
      : { label: "View jobs", to: { name: "tms.jobs.index" } }
  }

  return isCustomerContext.value
    ? { label: "Staff login", to: { name: "auth.login" } }
    : { label: "Customer login", to: { name: "auth.customer.login" } }
})
</script>

<template>
  <section
    class="not-found-page"
    :class="{ 'not-found-page--guest': isGuestContext }"
    aria-labelledby="not-found-title"
  >
    <div class="not-found-page__shell">
      <div class="not-found-page__brand">
        <img src="/orbis-logo.png" alt="Orbis" />
        <span>{{ isCustomerContext ? "Customer portal" : "Operations workspace" }}</span>
      </div>

      <div class="not-found-page__body">
        <div class="not-found-page__status" aria-hidden="true">
          <span>404</span>
        </div>

        <div class="not-found-page__copy">
          <p class="not-found-page__eyebrow">Page not found</p>
          <h1 id="not-found-title">We could not find that page.</h1>
          <p class="not-found-page__message">
            The link may be out of date, or the page may have moved. You can return to a safe
            starting point and continue working from there.
          </p>

          <div class="not-found-page__actions" aria-label="Page recovery actions">
            <RouterLink
              class="not-found-page__button not-found-page__button--primary"
              :to="primaryAction.to"
            >
              {{ primaryAction.label }}
            </RouterLink>
            <RouterLink
              class="not-found-page__button not-found-page__button--secondary"
              :to="secondaryAction.to"
            >
              {{ secondaryAction.label }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 130px);
  display: grid;
  place-items: center;
  padding: clamp(24px, 4vw, 44px);
  color: #262626;
}

.not-found-page--guest {
  min-height: 100vh;
  background:
    linear-gradient(120deg, rgba(236, 105, 26, 0.1), rgba(255, 255, 255, 0.88) 42%),
    url("/auth-bg.png") center / cover no-repeat;
}

.not-found-page__shell {
  width: min(100%, 820px);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
}

.not-found-page__brand {
  min-height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px clamp(20px, 4vw, 32px);
  border-bottom: 1px solid #e5e5e5;
  background: #ffffff;
}

.not-found-page__brand img {
  width: 112px;
  height: auto;
  display: block;
}

.not-found-page__brand span {
  color: #737373;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.not-found-page__body {
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  gap: clamp(20px, 4vw, 36px);
  align-items: center;
  padding: clamp(28px, 6vw, 52px);
}

.not-found-page__status {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(236, 105, 26, 0.14), rgba(236, 105, 26, 0)), #fafafa;
}

.not-found-page__status span {
  color: #ec691a;
  font-size: clamp(2.6rem, 8vw, 4.5rem);
  font-weight: 900;
  line-height: 1;
}

.not-found-page__copy {
  min-width: 0;
}

.not-found-page__eyebrow {
  margin: 0 0 10px;
  color: #ec691a;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0;
}

.not-found-page h1 {
  margin: 0;
  color: #171717;
  font-size: clamp(1.8rem, 4vw, 2.65rem);
  font-weight: 850;
  line-height: 1.08;
  letter-spacing: 0;
}

.not-found-page__message {
  max-width: 520px;
  margin: 16px 0 0;
  color: #525252;
  font-size: 0.98rem;
  line-height: 1.65;
}

.not-found-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.not-found-page__button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 18px;
  font-size: 0.88rem;
  font-weight: 800;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.not-found-page__button--primary {
  background: #ec691a;
  border: 1px solid #ec691a;
  color: #ffffff;
}

.not-found-page__button--primary:hover {
  background: #d85f17;
  border-color: #d85f17;
  box-shadow: 0 8px 18px rgba(236, 105, 26, 0.22);
}

.not-found-page__button--secondary {
  background: #ffffff;
  border: 1px solid #d4d4d4;
  color: #262626;
}

.not-found-page__button--secondary:hover {
  background: #f5f5f5;
  border-color: #a3a3a3;
}

@media (max-width: 720px) {
  .not-found-page {
    padding: 16px;
  }

  .not-found-page__brand {
    align-items: flex-start;
    flex-direction: column;
  }

  .not-found-page__body {
    grid-template-columns: 1fr;
  }

  .not-found-page__status {
    width: min(100%, 180px);
  }

  .not-found-page__actions {
    flex-direction: column;
  }

  .not-found-page__button {
    width: 100%;
  }
}
</style>
