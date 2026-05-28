<template>
  <Toast />
  <ConfirmDialog />

  <!-- Wait for auth hydration -->
  <router-view v-if="ready" />

  <!-- Optional loading state -->
  <div v-else class="app-loading">Loading...</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import Toast from "primevue/toast"
import ConfirmDialog from "primevue/confirmdialog"
import { useAuthStore } from "@/app/stores/auth"
import { useUserShortcutStore } from "@/app/stores/user-shortcuts"
import { useInteractionRecovery } from "@/app/composables/useInteractionRecovery"

const auth = useAuthStore()
const router = useRouter()
const shortcutStore = useUserShortcutStore()
const ready = computed(() => auth.ready)

useInteractionRecovery()

const shortcutKeyMap = computed(() => {
  return shortcutStore.enabledShortcuts.reduce(
    (map, shortcut) => {
      if (shortcut.keyBinding && shortcut.routeName) {
        map[shortcut.keyBinding.toUpperCase()] = shortcut
      }

      return map
    },
    {} as Record<string, (typeof shortcutStore.enabledShortcuts)[number]>,
  )
})

function isEditableTarget(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null
  if (!element) return false

  return Boolean(
    element.closest(
      "input, textarea, select, [contenteditable='true'], .user-shortcuts-page__capture",
    ),
  )
}

function keyBindingFromEvent(event: KeyboardEvent) {
  const baseKey = event.key.length === 1 ? event.key.toUpperCase() : event.key
  if (["Control", "Alt", "Shift", "Meta", "Tab", "Escape"].includes(baseKey)) return null

  const parts = [
    event.ctrlKey ? "CTRL" : "",
    event.altKey ? "ALT" : "",
    event.shiftKey ? "SHIFT" : "",
    event.metaKey ? "META" : "",
    baseKey.toUpperCase(),
  ].filter(Boolean)

  return parts.join("+")
}

function onShortcutKeydown(event: KeyboardEvent) {
  if (isEditableTarget(event.target)) return

  const key = keyBindingFromEvent(event)
  if (!key) return

  const shortcut = shortcutKeyMap.value[key]

  if (!shortcut) return
  if (shortcut.permission && !auth.hasPermission(shortcut.permission)) return
  const routeName = shortcut.routeName
  if (!routeName) return

  event.preventDefault()
  router.push({ name: routeName })
}

onMounted(() => {
  auth.hydrate()
  window.addEventListener("keydown", onShortcutKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onShortcutKeydown)
})

watch(
  () => [auth.ready, auth.isUser, auth.user?.id] as const,
  ([isReady, isUser]) => {
    if (!isReady || !isUser) return
    shortcutStore.fetch().catch(() => undefined)
  },
  { immediate: true },
)
</script>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 14px;
  color: var(--text-muted);
}
</style>
