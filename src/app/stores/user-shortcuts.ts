import { defineStore } from "pinia"
import userShortcutService from "@/app/services/user-shortcuts"
import type { UserShortcut, UserShortcutPayload } from "@/app/types/user-shortcut"

type State = {
  shortcuts: UserShortcut[]
  loading: boolean
  saving: boolean
  error: string | null
}

function sortShortcuts(shortcuts: UserShortcut[]) {
  return [...shortcuts].sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label))
}

export const useUserShortcutStore = defineStore("user-shortcuts", {
  state: (): State => ({
    shortcuts: [],
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    enabledShortcuts: state =>
      sortShortcuts(state.shortcuts.filter(shortcut => shortcut.isEnabled)),
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null

      try {
        this.shortcuts = sortShortcuts(await userShortcutService.list())
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || "Failed to load shortcuts."
        throw error
      } finally {
        this.loading = false
      }
    },

    setShortcuts(shortcuts: UserShortcut[]) {
      this.shortcuts = sortShortcuts(shortcuts)
    },

    async save(payload: UserShortcutPayload[]) {
      this.saving = true
      this.error = null

      try {
        this.shortcuts = sortShortcuts(await userShortcutService.update(payload))
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || "Failed to save shortcuts."
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
