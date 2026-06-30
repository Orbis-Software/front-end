<template>
  <Toast />
  <Toast group="invoice-progress" position="top-right" />
  <InvoiceGenerationToast />
  <ConfirmDialog />
  <OrbisLoader />

  <!-- Wait for auth hydration -->
  <router-view v-if="ready" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import Toast from "primevue/toast"
import ConfirmDialog from "primevue/confirmdialog"
import InvoiceGenerationToast from "@/app/components/invoices/InvoiceGenerationToast.vue"
import OrbisLoader from "@/app/components/common/OrbisLoader/OrbisLoader.vue"
import { useAppLoaderStore } from "@/app/stores/app-loader"
import { useAuthStore } from "@/app/stores/auth"
import { useUserShortcutStore } from "@/app/stores/user-shortcuts"
import { useInteractionRecovery } from "@/app/composables/useInteractionRecovery"

const auth = useAuthStore()
const appLoader = useAppLoaderStore()
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
  window.addEventListener("keydown", onShortcutKeydown)
  void appLoader.withLoader(
    {
      title: "Preparing your workspace",
      message: "Checking your secure session...",
      messages: [
        "Checking your secure session...",
        "Loading company settings...",
        "Preparing your Orbis workspace...",
        "Almost ready...",
      ],
      iconClass: "pi pi-lock",
      footer: "Securely loading your logistics workspace",
    },
    () => auth.hydrate(),
  )
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onShortcutKeydown)
  appLoader.clearTimers()
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
