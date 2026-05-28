import { computed, onMounted } from "vue"
import { useToast } from "primevue/usetoast"
import { useUserShortcutStore } from "@/app/stores/user-shortcuts"
import type { UserShortcut } from "@/app/types/user-shortcut"

export function useUserSettingsShortcutsPage() {
  const store = useUserShortcutStore()
  const toast = useToast()

  const shortcuts = computed(() => store.shortcuts)
  const loading = computed(() => store.loading)
  const saving = computed(() => store.saving)

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

  function onShortcutKeyChange(shortcut: UserShortcut) {
    if (!shortcut.keyBinding) return

    store.setShortcuts(
      shortcuts.value.map(item => ({
        ...item,
        keyBinding:
          item.key !== shortcut.key && item.keyBinding === shortcut.keyBinding
            ? null
            : item.keyBinding,
      })),
    )
  }

  function onShortcutKeyCapture(shortcut: UserShortcut, event: KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()

    const binding = keyBindingFromEvent(event)
    if (!binding) return

    shortcut.keyBinding = binding
    onShortcutKeyChange(shortcut)
  }

  function onClearShortcutKey(shortcut: UserShortcut) {
    shortcut.keyBinding = null
  }

  async function onSaveShortcuts() {
    try {
      await store.save(
        shortcuts.value.map(shortcut => ({
          key: shortcut.key,
          keyBinding: shortcut.keyBinding,
          priority: shortcut.priority,
          isEnabled: shortcut.isEnabled,
        })),
      )

      toast.add({
        severity: "success",
        summary: "Saved",
        detail: "Shortcut keys saved for your user profile.",
        life: 2500,
      })
    } catch (error: any) {
      toast.add({
        severity: "error",
        summary: "Shortcuts not saved",
        detail: error?.response?.data?.message || error?.message || "Unable to save shortcuts.",
        life: 5000,
      })
    }
  }

  onMounted(async () => {
    if (!store.shortcuts.length) {
      await store.fetch()
    }
  })

  return {
    shortcuts,
    loading,
    saving,
    onClearShortcutKey,
    onShortcutKeyCapture,
    onShortcutKeyChange,
    onSaveShortcuts,
  }
}
